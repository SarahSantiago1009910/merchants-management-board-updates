const { getDb, cors } = require('./_db');

module.exports = async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const sql = getDb();

  try {
    if (req.method === 'GET') {
      const rows = await sql`SELECT * FROM merchants ORDER BY name`;
      const merchants = rows.map(m => ({
        id: m.id, orgId: m.org_id, name: m.name, countries: m.countries||[], website: m.website||'',
        canal: m.canal||[], negocio: m.negocio||'', metodos: m.metodos||[], provedores: m.provedores||[],
        kam: m.kam||'', tam: m.tam||'', implementation: m.implementation||'',
        integracao: m.integracao||[], cobranca: m.cobranca||[], email: m.email||''
      }));
      return res.status(200).json(merchants);
    }

    if (req.method === 'POST') {
      const m = req.body;
      if (!m.id || !m.name) return res.status(400).json({ error: 'id and name required' });
      await sql`INSERT INTO merchants (id, org_id, name, countries, website, canal, negocio, metodos, provedores, kam, tam, implementation, integracao, cobranca, email)
        VALUES (${m.id}, ${m.orgId||null}, ${m.name}, ${JSON.stringify(m.countries||[])}, ${m.website||''}, ${JSON.stringify(m.canal||[])}, ${m.negocio||''}, ${JSON.stringify(m.metodos||[])}, ${JSON.stringify(m.provedores||[])}, ${m.kam||''}, ${m.tam||''}, ${m.implementation||''}, ${JSON.stringify(m.integracao||[])}, ${JSON.stringify(m.cobranca||[])}, ${m.email||''})
        ON CONFLICT (id) DO UPDATE SET
          org_id=EXCLUDED.org_id, name=EXCLUDED.name, countries=EXCLUDED.countries, website=EXCLUDED.website,
          canal=EXCLUDED.canal, negocio=EXCLUDED.negocio, metodos=EXCLUDED.metodos, provedores=EXCLUDED.provedores,
          kam=EXCLUDED.kam, tam=EXCLUDED.tam, implementation=EXCLUDED.implementation,
          integracao=EXCLUDED.integracao, cobranca=EXCLUDED.cobranca, email=EXCLUDED.email`;
      return res.status(200).json({ ok: true });
    }

    if (req.method === 'PUT') {
      // Bulk update — receives array of merchants
      const list = req.body;
      if (!Array.isArray(list)) return res.status(400).json({ error: 'Array expected' });

      // Delete merchants not in the list, then upsert all
      const ids = list.map(m => m.id);
      if (ids.length > 0) {
        await sql`DELETE FROM merchants WHERE id != ALL(${ids})`;
      }
      for (const m of list) {
        await sql`INSERT INTO merchants (id, org_id, name, countries, website, canal, negocio, metodos, provedores, kam, tam, implementation, integracao, cobranca, email)
          VALUES (${m.id}, ${m.orgId||null}, ${m.name}, ${JSON.stringify(m.countries||[])}, ${m.website||''}, ${JSON.stringify(m.canal||[])}, ${m.negocio||''}, ${JSON.stringify(m.metodos||[])}, ${JSON.stringify(m.provedores||[])}, ${m.kam||''}, ${m.tam||''}, ${m.implementation||''}, ${JSON.stringify(m.integracao||[])}, ${JSON.stringify(m.cobranca||[])}, ${m.email||''})
          ON CONFLICT (id) DO UPDATE SET
            org_id=EXCLUDED.org_id, name=EXCLUDED.name, countries=EXCLUDED.countries, website=EXCLUDED.website,
            canal=EXCLUDED.canal, negocio=EXCLUDED.negocio, metodos=EXCLUDED.metodos, provedores=EXCLUDED.provedores,
            kam=EXCLUDED.kam, tam=EXCLUDED.tam, implementation=EXCLUDED.implementation,
            integracao=EXCLUDED.integracao, cobranca=EXCLUDED.cobranca, email=EXCLUDED.email`;
      }
      return res.status(200).json({ ok: true });
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'id required' });
      await sql`DELETE FROM merchants WHERE id = ${id}`;
      return res.status(200).json({ ok: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
