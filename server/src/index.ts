import fs from "fs/promises";
import express from "express";
import bodyParser from "body-parser";
//import cors from "cors";
//import { checkError } from "./middleware/middleware";
import { CardModel, } from "./models/card";
import { scrapeCardsByBank } from './bankScraper';
import routerCards from "./routes/cards";

export type AppConfig = {
	readonly datadir: string;
};

var cardModel: CardModel;
export { cardModel }; // the initial cardmodel

export async function createApp(config: AppConfig): Promise<ReturnType<typeof express>> {
    const app = express();
    app.use(bodyParser.json());

    // Make files in ../frontend/public accessible at http://localhost:<port>/
    app.use(express.static("frontend/public"));

    // Register middleware to parse request before passing them to request handlers
    // Note: JSON parser must be place before raw parser because of wildcard matching done by raw parser below
    app.use(express.json());
    app.use(express.raw({ type: "application/*", limit: "10mb" }));
    //app.use(cors());
    //app.use(checkError);
    app.use("/api/cards", routerCards); //use the router for all urls starting with this part



    app.get('/api/cards', async (req, res) => {
        const bank = req.query.bank as string;
        if (!bank) return res.status(400).json({ error: 'Bank parameter is required' });

        const data = await scrapeCardsByBank(bank);
        res.json(data);
    });

    app.listen(3001, () => console.log('Server running on port 3001'));

    // 1. Initialize the class instance first
    cardModel = new CardModel();

    // 2. Use 'await' because readCards() returns a Promise
    // 3. Ensure dataCards object exists before assigning properties to it
    if (!cardModel.dataCards) {
        // If your CardModel definition doesn't initialize this, you must do it here
        // casting as any or your specific type to avoid TS errors if strict
        cardModel.dataCards = { cards: [] } as any;
    }

    try {
        const loadedCards = await cardModel.readCards();
        cardModel.dataCards.cards = loadedCards;
    } catch (error) {
        console.error("Failed to load cards:", error);
    }
    // --- FIX END ---

    // Note: Usually app.listen is called in index.ts, not inside createApp.
    // However, if keeping it here, ensure it runs AFTER data is loaded.
    app.listen(3001, () => console.log('Server running on port 3001'));

    return app;
}