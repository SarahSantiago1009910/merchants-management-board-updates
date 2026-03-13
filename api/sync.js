const { getDb, cors } = require('./_db');

module.exports = async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const sql = getDb();

    const [merchantRows, demandRows, boardRows, npsRows, metasGeraisRows, metasRows, planosRows] = await Promise.all([
      sql`SELECT * FROM merchants ORDER BY name`,
      sql`SELECT * FROM demands ORDER BY merchant_id, id`,
      sql`SELECT * FROM boards`,
      sql`SELECT * FROM nps_forms ORDER BY created_at DESC`,
      sql`SELECT * FROM metas_gerais ORDER BY id`,
      sql`SELECT * FROM metas`,
      sql`SELECT * FROM planos ORDER BY merchant_id, id`
    ]);

    // Format merchants
    const merchants = merchantRows.map(m => ({
      id: m.id,
      orgId: m.org_id,
      name: m.name,
      countries: m.countries || [],
      website: m.website || '',
      canal: m.canal || [],
      negocio: m.negocio || '',
      metodos: m.metodos || [],
      provedores: m.provedores || [],
      kam: m.kam || '',
      tam: m.tam || '',
      implementation: m.implementation || '',
      integracao: m.integracao || [],
      cobranca: m.cobranca || [],
      email: m.email || ''
    }));

    // Format demands grouped by merchant_id
    const demands = {};
    demandRows.forEach(d => {
      if (!demands[d.merchant_id]) demands[d.merchant_id] = [];
      demands[d.merchant_id].push({
        id: d.id,
        title: d.title,
        desc: d.description,
        status: d.status,
        prioridade: d.prioridade,
        inicio: d.inicio,
        prazo: d.prazo,
        followup: d.followup,
        updates: d.updates || []
      });
    });

    // Format boards grouped by merchant_id
    const boards = {};
    boardRows.forEach(b => {
      if (!boards[b.merchant_id]) boards[b.merchant_id] = {};
      boards[b.merchant_id][b.board_key] = {
        columns: b.columns_data || [],
        cards: b.cards || []
      };
    });

    // Format NPS
    const npsForms = npsRows.map(n => ({
      id: n.id,
      merchantId: n.merchant_id,
      title: n.title,
      email: n.email || '',
      fields: n.fields || [],
      responses: n.responses || [],
      sentToMerchant: n.sent_to_merchant,
      sentAt: n.sent_at,
      createdAt: n.created_at
    }));

    // Format metas gerais
    const metasGerais = metasGeraisRows.map(m => ({
      id: m.id,
      text: m.text,
      status: m.status
    }));

    // Format metas
    const metas = {};
    metasRows.forEach(m => {
      metas[m.merchant_id] = m.data || {};
    });

    // Format planos
    const planos = {};
    planosRows.forEach(p => {
      if (!planos[p.merchant_id]) planos[p.merchant_id] = [];
      planos[p.merchant_id].push(p.data);
    });

    res.status(200).json({ merchants, demands, boards, npsForms, metasGerais, metas, planos });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
