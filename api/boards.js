const { getDb, cors } = require('./_db');

module.exports = async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const sql = getDb();
  const { mid, key } = req.query;

  try {
    if (req.method === 'GET') {
      if (!mid || !key) return res.status(400).json({ error: 'mid and key required' });
      const rows = await sql`SELECT * FROM boards WHERE merchant_id = ${mid} AND board_key = ${key}`;
      if (rows.length === 0) return res.status(200).json({ columns: [], cards: [] });
      return res.status(200).json({ columns: rows[0].columns_data || [], cards: rows[0].cards || [] });
    }

    if (req.method === 'PUT') {
      if (!mid || !key) return res.status(400).json({ error: 'mid and key required' });
      const { columns, cards } = req.body;
      await sql`INSERT INTO boards (merchant_id, board_key, columns_data, cards)
        VALUES (${mid}, ${key}, ${JSON.stringify(columns||[])}, ${JSON.stringify(cards||[])})
        ON CONFLICT (merchant_id, board_key) DO UPDATE SET
          columns_data = EXCLUDED.columns_data, cards = EXCLUDED.cards`;
      return res.status(200).json({ ok: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
