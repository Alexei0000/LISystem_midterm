const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'midterm',
    password: '040207',
});

module.exports = pool;
