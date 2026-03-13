const { getDb, cors } = require('./_db');

module.exports = async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const sql = getDb();
    const rows = await sql`SELECT * FROM users WHERE email = ${email} AND password_hash = ${password}`;

    if (rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

    const u = rows[0];
    const user = {
      type: u.type,
      name: u.name,
      initial: u.name.charAt(0),
      ...(u.merchant_id ? { merchantId: u.merchant_id } : {})
    };

    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
