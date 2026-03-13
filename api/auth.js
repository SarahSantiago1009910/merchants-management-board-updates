const { getDb, cors } = require('./_db');
const crypto = require('crypto');

async function verifyCaptcha(token) {
  if (!process.env.TURNSTILE_SECRET) return true;
  const resp = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `secret=${process.env.TURNSTILE_SECRET}&response=${token}`
  });
  const data = await resp.json();
  return data.success === true;
}

// ===== LOGIN =====
async function handleLogin(req, res) {
  const { email, password, captchaToken } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  const e = email.trim().toLowerCase();
  const p = password.trim();

  if (captchaToken) {
    const valid = await verifyCaptcha(captchaToken);
    if (!valid) return res.status(400).json({ error: 'Captcha inválido' });
  }

  const sql = getDb();
  const rows = await sql`SELECT * FROM users WHERE LOWER(email) = ${e} AND password_hash = ${p}`;
  if (rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

  const u = rows[0];
  res.status(200).json({ user: {
    type: u.type, name: u.name, email: u.email, phone: u.phone || '',
    initial: u.name.charAt(0),
    ...(u.merchant_id ? { merchantId: u.merchant_id } : {})
  }});
}

// ===== REGISTER =====
async function handleRegister(req, res) {
  const { name, email, password, phone, code, type, captchaToken } = req.body;
  if (!name || !email || !password || !code || !type) {
    return res.status(400).json({ error: 'Campos obrigatórios: nome, email, senha, código, tipo' });
  }

  const e = email.trim().toLowerCase();
  const n = name.trim();
  const p = password.trim();
  const ph = (phone || '').trim();

  if (captchaToken) {
    const valid = await verifyCaptcha(captchaToken);
    if (!valid) return res.status(400).json({ error: 'Captcha inválido' });
  }

  const sql = getDb();

  const codes = await sql`
    SELECT * FROM access_codes WHERE code = ${code.trim()} AND type = ${type} AND used = FALSE AND expires_at > NOW()
  `;
  if (codes.length === 0) return res.status(400).json({ error: 'Código de acesso inválido ou expirado' });

  const existing = await sql`SELECT id FROM users WHERE LOWER(email) = ${e}`;
  if (existing.length > 0) return res.status(400).json({ error: 'Este email já está cadastrado' });

  const merchantId = type === 'merchant' ? e.split('@')[0].replace(/[^a-z0-9]/g, '') : null;
  await sql`INSERT INTO users (email, password_hash, type, name, merchant_id, phone) VALUES (${e}, ${p}, ${type}, ${n}, ${merchantId}, ${ph})`;
  await sql`UPDATE access_codes SET used = TRUE, used_by_email = ${e} WHERE id = ${codes[0].id}`;

  res.status(200).json({ user: {
    type, name: n, email: e, phone: ph,
    initial: n.charAt(0).toUpperCase(),
    ...(merchantId ? { merchantId } : {})
  }});
}

// ===== FORGOT PASSWORD =====
async function handleForgot(req, res) {
  const { email, captchaToken } = req.body;
  if (!email) return res.status(400).json({ error: 'Email obrigatório' });

  const e = email.trim().toLowerCase();

  if (captchaToken) {
    const valid = await verifyCaptcha(captchaToken);
    if (!valid) return res.status(400).json({ error: 'Captcha inválido' });
  }

  const sql = getDb();
  const users = await sql`SELECT id FROM users WHERE LOWER(email) = ${e}`;

  if (users.length > 0) {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    await sql`DELETE FROM password_resets WHERE user_id = ${users[0].id}`;
    await sql`INSERT INTO password_resets (user_id, token, expires_at) VALUES (${users[0].id}, ${token}, ${expiresAt.toISOString()})`;

    if (process.env.RESEND_API_KEY) {
      try {
        const { Resend } = require('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);
        const baseUrl = req.headers.host?.includes('localhost')
          ? `http://${req.headers.host}`
          : 'https://gestao-merchants.vercel.app';

        await resend.emails.send({
          from: 'Gestão Merchants <onboarding@resend.dev>',
          to: e,
          subject: 'Redefinir sua senha - Gestão Merchants',
          html: `<div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px">
            <h2 style="color:#111827;margin-bottom:16px">Redefinir senha</h2>
            <p style="color:#374151;line-height:1.6">Você solicitou a redefinição de senha. Clique no botão abaixo:</p>
            <a href="${baseUrl}?reset=${token}" style="display:inline-block;background:#3B39F5;color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;margin:20px 0">Redefinir Senha</a>
            <p style="color:#9CA3AF;font-size:13px;margin-top:20px">Este link expira em 30 minutos.</p>
          </div>`
        });
      } catch (emailErr) { console.error('Erro email:', emailErr); }
    }
  }

  res.status(200).json({ ok: true, message: 'Se o email existir, um link de redefinição foi enviado.' });
}

// ===== RESET PASSWORD =====
async function handleReset(req, res) {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) return res.status(400).json({ error: 'Token e nova senha obrigatórios' });

  const p = newPassword.trim();
  if (p.length < 4) return res.status(400).json({ error: 'Senha deve ter no mínimo 4 caracteres' });

  const sql = getDb();
  const resets = await sql`SELECT * FROM password_resets WHERE token = ${token} AND expires_at > NOW()`;
  if (resets.length === 0) return res.status(400).json({ error: 'Token inválido ou expirado' });

  await sql`UPDATE users SET password_hash = ${p} WHERE id = ${resets[0].user_id}`;
  await sql`DELETE FROM password_resets WHERE id = ${resets[0].id}`;

  res.status(200).json({ ok: true, message: 'Senha alterada com sucesso' });
}

// ===== ROUTER =====
module.exports = async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const action = (req.query?.action || req.url.split('action=')[1]?.split('&')[0] || 'login');

  try {
    if (action === 'register') return handleRegister(req, res);
    if (action === 'forgot') return handleForgot(req, res);
    if (action === 'reset') return handleReset(req, res);
    return handleLogin(req, res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
