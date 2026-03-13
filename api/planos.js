const { getDb, cors } = require('./_db');

module.exports = async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const sql = getDb();
  const { mid } = req.query;

  try {
    if (req.method === 'GET') {
      if (!mid) return res.status(400).json({ error: 'mid required' });
      const rows = await sql`SELECT * FROM planos WHERE merchant_id = ${mid} ORDER BY id`;
      return res.status(200).json(rows.map(p => p.data));
    }

    if (req.method === 'PUT') {
      // Bulk replace planos for a merchant
      if (!mid) return res.status(400).json({ error: 'mid required' });
      const list = req.body;
      if (!Array.isArray(list)) return res.status(400).json({ error: 'Array expected' });
      await sql`DELETE FROM planos WHERE merchant_id = ${mid}`;
      for (const p of list) {
        await sql`INSERT INTO planos (merchant_id, data) VALUES (${mid}, ${JSON.stringify(p)})`;
      }
      return res.status(200).json({ ok: true });
    }

    if (req.method === 'POST') {
      if (!mid) return res.status(400).json({ error: 'mid required' });
      const data = req.body;
      await sql`INSERT INTO planos (merchant_id, data) VALUES (${mid}, ${JSON.stringify(data)})`;
      return res.status(200).json({ ok: true });
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (id) {
        await sql`DELETE FROM planos WHERE id = ${parseInt(id)}`;
      } else if (mid) {
        await sql`DELETE FROM planos WHERE merchant_id = ${mid}`;
      }
      return res.status(200).json({ ok: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
