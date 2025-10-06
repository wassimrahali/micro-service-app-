const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(express.json());
app.use(cors());

const pool = new Pool({
    user: 'postgres',
    host: 'db-user',
    database: 'usersdb',
    password: 'password',
    port: 5432,
});

// Ensure the users table exists when the service starts. This prevents
// "relation \"users\" does not exist" errors if requests arrive before
// the DB has that table.
async function ensureUsersTable() {
    const createSql = `
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL
    )`;
    await pool.query(createSql);
}

app.get('/users', async (req, res) => {
    const { rows } = await pool.query('SELECT * FROM users');
    res.json(rows);
});

app.post('/users', async (req, res) => {
    const { name, email } = req.body;
    const { rows } = await pool.query(
        'INSERT INTO users(name,email) VALUES($1,$2) RETURNING *',
        [name, email]
    );
    res.status(201).json(rows[0]);
});

// Run DB initialization then start the server.
(async () => {
    try {
        await ensureUsersTable();
        console.log('Ensured users table exists');
    } catch (err) {
        console.error('Failed to ensure users table:', err);
        // If the migration fails, exit so Docker/compose can report a crash.
        process.exit(1);
    }

    app.listen(3001, () => console.log('User Service running on 3001'));
})();
