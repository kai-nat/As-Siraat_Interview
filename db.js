const { Pool } = require('pg');

// Create a new pool instance with your database credentials
const pool = new Pool({
  user: 'dev',
  host: 'localhost',
  database: 'quiz',
  password: '1234',
  port: 5432, // default PostgreSQL port
});

// Test the connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error connecting to the database:', err);
  } else {
    console.log('Connected to the database at:', res.rows[0].now);
  }
});

// Export the pool instance to be used in other parts of your app
module.exports = pool;
