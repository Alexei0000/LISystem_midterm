const express = require('express');
const pool = require('../db/db');
const router = express.Router();

const validAttributes = {
    suitable_age: { type: 'string', table: 'boardgames' },
    name: { type: 'string', table: 'boardgames' },
    theme_scenario: { type: 'string', table: 'boardgames', join: 'boardgames_theme_scenario', joinKey: 'game_id' },
    language: { type: 'string', table: 'boardgames' },
    playtime: { type: 'string', table: 'boardgames' },
    player_number: { type: 'number', table: 'boardgames', join: 'boardgames_player_number', joinKey: 'game_id' }
    // Add more attributes with their tables and join conditions as needed
};

router.get('/search', async (req, res) => {
    const { attribute, value } = req.query;
    if (!attribute || !value) {
        return res.status(400).send('Attribute and value are required.');
    }

    const attributeConfig = validAttributes[attribute];
    if (!attributeConfig) {
        return res.status(400).send('Invalid attribute selected.');
    }

    const { type: dataType, table, join, joinKey } = attributeConfig;
    let query;
    let params = [];

    if (attribute === 'playtime') {
        const [start, end] = value.split('～').map(Number);
        if (isNaN(start) || isNaN(end)) {
            console.log('Invalid start or end:', start, end);
            return res.status(400).send('Invalid playtime range.');
        }
        query = `SELECT * FROM ${table} WHERE playtime BETWEEN $1 AND $2`;
        params = [start, end];
    } else if (attribute === 'suitable_age') {
        console.log('Received age value:', value);
        const [start, end] = value.split('～').map(Number);
        if (isNaN(start) || isNaN(end)) {
            console.log('Invalid start or end:', start, end);
            return res.status(400).send('Invalid age range.');
        }
        console.log('Querying with start:', start, 'end:', end);
        query = `SELECT * FROM ${table} WHERE suitable_age BETWEEN $1 AND $2`;
        params = [start, end];
    } else if (join) {
        query = `
            SELECT b.*, p.*
            FROM ${table} b
                     JOIN ${join} p ON b.${joinKey} = p.${joinKey}
            WHERE ${attribute} ${dataType === 'string' ? 'ILIKE' : '='} $1`;
        params = [dataType === 'string' ? `%${value}%` : value];
    } else {
        query = `SELECT * FROM ${table} WHERE ${attribute} ${dataType === 'string' ? 'ILIKE' : '='} $1`;
        params = [dataType === 'string' ? `%${value}%` : value];
    }

    if (dataType === 'number' && isNaN(params[0])) {
        return res.status(400).send('Invalid value for numeric attribute.');
    }

    try {
        const result = await pool.query(query, params);

        const formattedResult = result.rows.map(row => ({
            id: row.id,
            name: row.name ? row.name.toUpperCase() : null,
            language: row.language ? row.language.toUpperCase() : null,
            age: row.suitable_age,
            description: row.description,
            policy: row.policy,
            location: row.location,
        }));

        res.json(formattedResult);
    } catch (err) {
        console.error('Query error:', err);
        res.status(500).send('Error querying the database');
    }
});

module.exports = router;
