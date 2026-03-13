const { getDb, cors } = require('./_db');

module.exports = async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const sql = getDb();

  try {
    if (req.method === 'GET') {
      const email = req.query?.email || (req.url.split('email=')[1] || '').split('&')[0];
      if (!email) return res.status(400).json({ error: 'Email obrigatório' });

      const rows = await sql`
        SELECT name, email, phone, type, merchant_id FROM users
        WHERE LOWER(email) = ${decodeURIComponent(email).trim().toLowerCase()}
      `;

      if (rows.length === 0) return res.status(404).json({ error: 'Usuário não encontrado' });

      return res.status(200).json({ user: rows[0] });
    }

    if (req.method === 'PUT') {
      const { email, name, phone, newPassword, currentPassword } = req.body;
      if (!email || !currentPassword) {
        return res.status(400).json({ error: 'Email e senha atual obrigatórios' });
      }

      const e = email.trim().toLowerCase();

      // Validar senha atual
      const rows = await sql`
        SELECT * FROM users WHERE LOWER(email) = ${e} AND password_hash = ${currentPassword.trim()}
      `;
      if (rows.length === 0) {
        return res.status(401).json({ error: 'Senha atual incorreta' });
      }

      const userId = rows[0].id;

      // Atualizar campos
      if (name) {
        await sql`UPDATE users SET name = ${name.trim()} WHERE id = ${userId}`;
      }
      if (phone !== undefined) {
        await sql`UPDATE users SET phone = ${(phone || '').trim()} WHERE id = ${userId}`;
      }
      if (newPassword) {
        const np = newPassword.trim();
        if (np.length < 4) return res.status(400).json({ error: 'Nova senha deve ter no mínimo 4 caracteres' });
        await sql`UPDATE users SET password_hash = ${np} WHERE id = ${userId}`;
      }

      // Retornar user atualizado
      const updated = await sql`SELECT name, email, phone, type, merchant_id FROM users WHERE id = ${userId}`;

      return res.status(200).json({
        ok: true,
        user: {
          type: updated[0].type,
          name: updated[0].name,
          email: updated[0].email,
          phone: updated[0].phone || '',
          initial: updated[0].name.charAt(0).toUpperCase(),
          ...(updated[0].merchant_id ? { merchantId: updated[0].merchant_id } : {})
        }
      });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
