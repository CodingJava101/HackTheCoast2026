import express from 'express';
import { scrapeCardsByBank } from './bankScraper';

const app = express();

app.get('/api/cards', async (req, res) => {
    const bank = req.query.bank as string;
    if (!bank) return res.status(400).json({ error: 'Bank parameter is required' });

    const data = await scrapeCardsByBank(bank);
    res.json(data);
});

app.listen(3001, () => console.log('Server running on port 3001'));