
import mysql from 'mysql2/promise';

// Create the connection pool. The pool-specific settings are the defaults
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root', // Replace with your DB user
  password: process.env.DB_PASSWORD || '', // Replace with your DB password
  database: process.env.DB_NAME || 'kalanow_db', // Replace with your DB name
  waitForConnections: true,
  connectionLimit: 10, // Adjust as needed
  queueLimit: 0, // Unlimited queueing
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

// Verify connection (optional, useful for debugging)
pool.getConnection()
  .then(connection => {
    console.log('Successfully connected to MySQL database pool.');
    connection.release();
  })
  .catch(error => {
    console.error('Error connecting to MySQL database pool:', error);
    // Consider exiting the application if the DB connection is critical
    // process.exit(1);
  });

export default pool;
