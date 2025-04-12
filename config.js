// const mysql = require('mysql2/promise');

// const pool = mysql.createPool({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   port: 4000, // Default port for TiDB Cloud
//   ssl: {
//     minVersion: 'TLSv1.2',           // Enforce minimum TLS version
//     rejectUnauthorized: false         // Validates server's SSL cert
//   },
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0
// });

// module.exports = pool;

require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  ssl: {
        minVersion: 'TLSv1.2',           // Enforce minimum TLS version
        rejectUnauthorized: true         // Validates server's SSL cert
      },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
