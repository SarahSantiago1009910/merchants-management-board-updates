const { getDb, cors } = require('./_db');

module.exports = async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const sql = getDb();
  const { mid } = req.query;

  try {
    if (req.method === 'GET') {
      if (!mid) return res.status(400).json({ error: 'mid required' });
      const rows = await sql`SELECT * FROM demands WHERE merchant_id = ${mid} ORDER BY id`;
      const demands = rows.map(d => ({
        id: d.id, title: d.title, desc: d.description, status: d.status,
        prioridade: d.prioridade, inicio: d.inicio, prazo: d.prazo,
        followup: d.followup, updates: d.updates || []
      }));
      return res.status(200).json(demands);
    }

    if (req.method === 'PUT') {
      // Bulk replace demands for a merchant
      if (!mid) return res.status(400).json({ error: 'mid required' });
      const list = req.body;
      if (!Array.isArray(list)) return res.status(400).json({ error: 'Array expected' });

      await sql`DELETE FROM demands WHERE merchant_id = ${mid}`;
      for (const d of list) {
        await sql`INSERT INTO demands (id, merchant_id, title, description, status, prioridade, inicio, prazo, followup, updates)
          VALUES (${d.id}, ${mid}, ${d.title}, ${d.desc||''}, ${d.status||'novo'}, ${d.prioridade||'media'}, ${d.inicio||null}, ${d.prazo||null}, ${d.followup ? JSON.stringify(d.followup) : null}, ${JSON.stringify(d.updates||[])})`;
      }
      return res.status(200).json({ ok: true });
    }

    if (req.method === 'POST') {
      if (!mid) return res.status(400).json({ error: 'mid required' });
      const d = req.body;
      const result = await sql`INSERT INTO demands (merchant_id, title, description, status, prioridade, inicio, prazo, followup, updates)
        VALUES (${mid}, ${d.title}, ${d.desc||''}, ${d.status||'novo'}, ${d.prioridade||'media'}, ${d.inicio||null}, ${d.prazo||null}, ${d.followup ? JSON.stringify(d.followup) : null}, ${JSON.stringify(d.updates||[])})
        RETURNING id`;
      return res.status(200).json({ ok: true, id: result[0].id });
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'id required' });
      await sql`DELETE FROM demands WHERE id = ${parseInt(id)}`;
      return res.status(200).json({ ok: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
