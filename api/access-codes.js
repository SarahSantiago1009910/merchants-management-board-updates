const { getDb, cors } = require('./_db');
const crypto = require('crypto');

module.exports = async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const sql = getDb();

  try {
    if (req.method === 'GET') {
      // Listar códigos ativos (não expirados, não usados)
      const codes = await sql`
        SELECT id, code, type, expires_at, created_at
        FROM access_codes
        WHERE used = FALSE AND expires_at > NOW()
        ORDER BY created_at DESC
      `;
      return res.status(200).json({ codes });
    }

    if (req.method === 'POST') {
      const { type } = req.body;
      if (!type || !['admin', 'merchant'].includes(type)) {
        return res.status(400).json({ error: 'Tipo deve ser admin ou merchant' });
      }

      // Gerar código 6 dígitos
      const code = String(crypto.randomInt(100000, 999999));
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

      await sql`
        INSERT INTO access_codes (code, type, expires_at)
        VALUES (${code}, ${type}, ${expiresAt.toISOString()})
      `;

      return res.status(200).json({ code, type, expires_at: expiresAt.toISOString() });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
