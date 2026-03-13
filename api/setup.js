const { getDb, cors } = require('./_db');

module.exports = async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const sql = getDb();

  try {
    // Create tables
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        type VARCHAR(20) NOT NULL,
        name VARCHAR(255) NOT NULL,
        merchant_id VARCHAR(100),
        created_at TIMESTAMPTZ DEFAULT NOW()
      )`;

    await sql`
      CREATE TABLE IF NOT EXISTS merchants (
        id VARCHAR(100) PRIMARY KEY,
        org_id VARCHAR(255),
        name VARCHAR(255) NOT NULL,
        countries JSONB DEFAULT '[]',
        website VARCHAR(500) DEFAULT '',
        canal JSONB DEFAULT '[]',
        negocio VARCHAR(255) DEFAULT '',
        metodos JSONB DEFAULT '[]',
        provedores JSONB DEFAULT '[]',
        kam VARCHAR(255) DEFAULT '',
        tam VARCHAR(255) DEFAULT '',
        implementation VARCHAR(255) DEFAULT '',
        integracao JSONB DEFAULT '[]',
        cobranca JSONB DEFAULT '[]',
        email VARCHAR(255) DEFAULT '',
        created_at TIMESTAMPTZ DEFAULT NOW()
      )`;

    await sql`
      CREATE TABLE IF NOT EXISTS demands (
        id SERIAL PRIMARY KEY,
        merchant_id VARCHAR(100) REFERENCES merchants(id) ON DELETE CASCADE,
        title VARCHAR(500) NOT NULL,
        description TEXT DEFAULT '',
        status VARCHAR(50) DEFAULT 'novo',
        prioridade VARCHAR(20) DEFAULT 'media',
        inicio VARCHAR(50),
        prazo VARCHAR(50),
        followup JSONB,
        updates JSONB DEFAULT '[]',
        created_at TIMESTAMPTZ DEFAULT NOW()
      )`;

    await sql`
      CREATE TABLE IF NOT EXISTS boards (
        id SERIAL PRIMARY KEY,
        merchant_id VARCHAR(100) REFERENCES merchants(id) ON DELETE CASCADE,
        board_key VARCHAR(20) NOT NULL,
        columns_data JSONB DEFAULT '[]',
        cards JSONB DEFAULT '[]',
        UNIQUE(merchant_id, board_key)
      )`;

    await sql`
      CREATE TABLE IF NOT EXISTS nps_forms (
        id VARCHAR(100) PRIMARY KEY,
        merchant_id VARCHAR(100) REFERENCES merchants(id) ON DELETE CASCADE,
        title VARCHAR(500) NOT NULL,
        email VARCHAR(255) DEFAULT '',
        fields JSONB DEFAULT '[]',
        responses JSONB DEFAULT '[]',
        sent_to_merchant BOOLEAN DEFAULT FALSE,
        sent_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )`;

    await sql`
      CREATE TABLE IF NOT EXISTS metas_gerais (
        id VARCHAR(50) PRIMARY KEY,
        text TEXT NOT NULL,
        status VARCHAR(20) DEFAULT 'pending'
      )`;

    await sql`
      CREATE TABLE IF NOT EXISTS metas (
        merchant_id VARCHAR(100) PRIMARY KEY,
        tam VARCHAR(255) DEFAULT '',
        data JSONB DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT NOW()
      )`;

    await sql`
      CREATE TABLE IF NOT EXISTS planos (
        id SERIAL PRIMARY KEY,
        merchant_id VARCHAR(100) REFERENCES merchants(id) ON DELETE CASCADE,
        data JSONB NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )`;

    await sql`
      CREATE TABLE IF NOT EXISTS access_codes (
        id SERIAL PRIMARY KEY,
        code VARCHAR(6) UNIQUE NOT NULL,
        type VARCHAR(20) NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        used_by_email VARCHAR(255),
        created_at TIMESTAMPTZ DEFAULT NOW()
      )`;

    await sql`
      CREATE TABLE IF NOT EXISTS password_resets (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(128) UNIQUE NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )`;

    // Adicionar coluna phone se não existir
    try {
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50) DEFAULT ''`;
    } catch(e) {}

    // Seed users (if empty)
    const existingUsers = await sql`SELECT COUNT(*) as cnt FROM users`;
    if (parseInt(existingUsers[0].cnt) === 0) {
      await sql`INSERT INTO users (email, password_hash, type, name, merchant_id) VALUES
        ('sarah@y.uno', 'yuno123', 'admin', 'Sarah', NULL),
        ('debora@q2ingressos.com.br', 'q2123', 'merchant', 'Débora', 'q2ingressos')`;
    }

    // Seed merchants (if empty)
    const existingMerchants = await sql`SELECT COUNT(*) as cnt FROM merchants`;
    if (parseInt(existingMerchants[0].cnt) === 0) {
      const seedMerchants = [
        { id:'jusbrasil', org_id:null, name:'JusBrasil', countries:['🇧🇷 Brasil'], website:'jusbrasil.com.br', canal:['WhatsApp'], negocio:'Jurídico', metodos:['Card'], provedores:['Pagarme'], kam:'Felipe Geraldelli', tam:'', implementation:'', integracao:['Headless SDK (Enrollment)'], cobranca:['Subscription'] },
        { id:'tembici', org_id:'095b08fe-bced-4fa5-98ba-3fdf75f6fccb', name:'Tembici', countries:['🇧🇷 Brasil','🇨🇴 Colômbia','🇨🇱 Chile','🇦🇷 Argentina'], website:'tembici.com.br/pt/', canal:['WhatsApp','Google Chat'], negocio:'Aluguel de Bike', metodos:['Card'], provedores:['Adyen','MercadoPago','Pagarme'], kam:'Phillip Kraus', tam:'Sarah Santiago', implementation:'Helio Cantelli', integracao:['Direct WorkFlow','Secure Fields (Payment)'], cobranca:['Subscription','Pagamento único','Recorrência'] },
        { id:'q2ingressos', org_id:null, name:'Q2 Ingressos', countries:['🇧🇷 Brasil','🇺🇸 Estados Unidos'], website:'q2ingressos.com.br/', canal:['E-mail','WhatsApp'], negocio:'Compra de Ingressos', metodos:['ApplePay','GooglePay','Card'], provedores:['ClearSale','MercadoPago','PagBank','Stripe','3DS Yuno'], kam:'Felipe Geraldelli', tam:'Sarah Santiago', implementation:'Helio Cantelli', integracao:['Lite SDK'], cobranca:['Pagamento único'] },
        { id:'perfectpay', org_id:null, name:'PerfectPay/Centerpag', countries:['🇧🇷 Brasil','🇦🇷 Argentina','🇨🇴 Colômbia','🇮🇹 Itália'], website:'perfectpay.com.br/', canal:['WhatsApp'], negocio:'PSP', metodos:['Card','Click To Pay'], provedores:['Adyen','PayPal','Stripe','WorldPay'], kam:'Phillip Kraus', tam:'', implementation:'', integracao:['Direct WorkFlow'], cobranca:[] },
        { id:'goold', org_id:null, name:'Goold/Rockty', countries:['🇧🇷 Brasil'], website:'goold.shop/', canal:['Slack'], negocio:'E-commerce', metodos:['Card','PIX','PIX Parcelado'], provedores:['Cielo','Pagarme'], kam:'Martin Maximillian', tam:'', implementation:'', integracao:['Lite SDK'], cobranca:['Subscription','Pagamento único','Recorrência'] },
        { id:'hubla', org_id:null, name:'Hubla', countries:['🇧🇷 Brasil'], website:'lp.hub.la/', canal:['Slack'], negocio:'Infoproduto', metodos:['Boleto','Card','PIX','PIX Parcelado'], provedores:['Adyen','Koin','PagBank','Stripe','MercadoPago','Transfera','Unlimit','Vindi','3DS Yuno'], kam:'Phillip Kraus', tam:'', implementation:'', integracao:[], cobranca:[] },
        { id:'dux', org_id:null, name:'Dux', countries:['🇧🇷 Brasil'], website:'duxhumanhealth.com/', canal:['Slack','E-mail'], negocio:'Health and Care', metodos:['Card','PIX'], provedores:['ClearSale','MercadoPago'], kam:'Paola Brajao', tam:'', implementation:'', integracao:['Pluging VTEX'], cobranca:['Pagamento único'] }
      ];

      for (const m of seedMerchants) {
        await sql`INSERT INTO merchants (id, org_id, name, countries, website, canal, negocio, metodos, provedores, kam, tam, implementation, integracao, cobranca)
          VALUES (${m.id}, ${m.org_id}, ${m.name}, ${JSON.stringify(m.countries)}, ${m.website}, ${JSON.stringify(m.canal)}, ${m.negocio}, ${JSON.stringify(m.metodos)}, ${JSON.stringify(m.provedores)}, ${m.kam}, ${m.tam}, ${m.implementation}, ${JSON.stringify(m.integracao)}, ${JSON.stringify(m.cobranca)})`;
      }
    }

    // Seed metas_gerais (if empty)
    const existingMG = await sql`SELECT COUNT(*) as cnt FROM metas_gerais`;
    if (parseInt(existingMG[0].cnt) === 0) {
      await sql`INSERT INTO metas_gerais (id, text, status) VALUES
        ('mg1', 'Manter NPS acima de 8.5 para todos os merchants', 'pending'),
        ('mg2', 'Resolver 100% das demandas críticas em até 15 dias', 'pending'),
        ('mg3', 'Onboarding de 3 novos merchants por trimestre', 'pending')`;
    }

    res.status(200).json({ ok: true, message: 'Database setup complete. Tables created and seeded.' });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
};
