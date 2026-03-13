const { getDb, cors } = require('./_db');

module.exports = async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const sql = getDb();
  const { type, mid } = req.query;

  try {
    if (req.method === 'GET') {
      if (type === 'gerais') {
        const rows = await sql`SELECT * FROM metas_gerais ORDER BY id`;
        return res.status(200).json(rows.map(m => ({ id: m.id, text: m.text, status: m.status })));
      }
      if (mid) {
        const rows = await sql`SELECT * FROM metas WHERE merchant_id = ${mid}`;
        return res.status(200).json(rows.length > 0 ? rows[0].data : {});
      }
      // Return all metas
      const rows = await sql`SELECT * FROM metas`;
      const metas = {};
      rows.forEach(m => { metas[m.merchant_id] = m.data || {}; });
      return res.status(200).json(metas);
    }

    if (req.method === 'PUT') {
      if (type === 'gerais') {
        const list = req.body;
        if (!Array.isArray(list)) return res.status(400).json({ error: 'Array expected' });
        for (const m of list) {
          await sql`INSERT INTO metas_gerais (id, text, status) VALUES (${m.id}, ${m.text}, ${m.status||'pending'})
            ON CONFLICT (id) DO UPDATE SET text=EXCLUDED.text, status=EXCLUDED.status`;
        }
        return res.status(200).json({ ok: true });
      }
      if (mid) {
        const data = req.body;
        await sql`INSERT INTO metas (merchant_id, data) VALUES (${mid}, ${JSON.stringify(data)})
          ON CONFLICT (merchant_id) DO UPDATE SET data=EXCLUDED.data`;
        return res.status(200).json({ ok: true });
      }
      return res.status(400).json({ error: 'type=gerais or mid required' });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
