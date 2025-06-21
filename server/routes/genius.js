const express = require('express');
const axios = require('axios');

const router = express.Router();

// ⚠️ Replace this with your actual Genius API client access token
const GENIUS_ACCESS_TOKEN = '2d7R2z7lRtM2y-uWPoKJ6VKrbnCW6Wlw5TYWgQkah8wYTd6LOEo9kJaFl8YqBeeD';

router.get('/', async (req, res) => {
    const { song, artist } = req.query;

    if (!song || !artist) {
        return res.status(400).json({ error: 'Missing song or artist name.' });
    }

    try {
        const query = encodeURIComponent(`${song} ${artist}`);
        const response = await axios.get(`https://api.genius.com/search?q=${query}`, {
            headers: {
                Authorization: `Bearer ${GENIUS_ACCESS_TOKEN}`
            }
        });

        const hits = response.data.response.hits;
        const match = hits.find(hit =>
            hit.result.primary_artist.name.toLowerCase().includes(artist.toLowerCase())
        );

        if (!match) {
            return res.status(404).json({ error: 'No matching lyrics found.' });
        }

        return res.json({ url: match.result.url });
    } catch (err) {
        console.error('Genius API error:', err.message);
        return res.status(500).json({ error: 'Failed to fetch data from Genius API.' });
    }
});

module.exports = router;
