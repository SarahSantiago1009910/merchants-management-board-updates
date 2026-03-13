const { neon } = require('@neondatabase/serverless');

function getDb() {
  const sql = neon(process.env.DATABASE_URL);
  return sql;
}

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
}

module.exports = { getDb, cors };
