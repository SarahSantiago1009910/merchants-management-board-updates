const { getDb, cors } = require('./_db');

module.exports = async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const sql = getDb();

  try {
    if (req.method === 'GET') {
      const { mid } = req.query;
      const rows = mid
        ? await sql`SELECT * FROM nps_forms WHERE merchant_id = ${mid} ORDER BY created_at DESC`
        : await sql`SELECT * FROM nps_forms ORDER BY created_at DESC`;
      const forms = rows.map(n => ({
        id: n.id, merchantId: n.merchant_id, title: n.title, email: n.email||'',
        fields: n.fields||[], responses: n.responses||[],
        sentToMerchant: n.sent_to_merchant, sentAt: n.sent_at, createdAt: n.created_at
      }));
      return res.status(200).json(forms);
    }

    if (req.method === 'POST') {
      const f = req.body;
      if (!f.id || !f.merchantId) return res.status(400).json({ error: 'id and merchantId required' });
      await sql`INSERT INTO nps_forms (id, merchant_id, title, email, fields, responses, sent_to_merchant, sent_at)
        VALUES (${f.id}, ${f.merchantId}, ${f.title}, ${f.email||''}, ${JSON.stringify(f.fields||[])}, ${JSON.stringify(f.responses||[])}, ${f.sentToMerchant||false}, ${f.sentAt||null})
        ON CONFLICT (id) DO UPDATE SET
          title=EXCLUDED.title, email=EXCLUDED.email, fields=EXCLUDED.fields,
          responses=EXCLUDED.responses, sent_to_merchant=EXCLUDED.sent_to_merchant, sent_at=EXCLUDED.sent_at`;
      return res.status(200).json({ ok: true });
    }

    if (req.method === 'PUT') {
      // Update a single form (e.g., add response, mark sent)
      const f = req.body;
      if (!f.id) return res.status(400).json({ error: 'id required' });
      await sql`UPDATE nps_forms SET
        title=COALESCE(${f.title}, title), email=COALESCE(${f.email}, email),
        fields=COALESCE(${f.fields ? JSON.stringify(f.fields) : null}, fields),
        responses=COALESCE(${f.responses ? JSON.stringify(f.responses) : null}, responses),
        sent_to_merchant=COALESCE(${f.sentToMerchant}, sent_to_merchant),
        sent_at=COALESCE(${f.sentAt||null}, sent_at)
        WHERE id = ${f.id}`;
      return res.status(200).json({ ok: true });
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'id required' });
      await sql`DELETE FROM nps_forms WHERE id = ${id}`;
      return res.status(200).json({ ok: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
