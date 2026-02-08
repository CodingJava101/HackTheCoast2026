import fs from "fs/promises";
import express from "express";
import bodyParser from "body-parser";
//import cors from "cors";
//import { checkError } from "./middleware/middleware";
import { CardModel } from "./models/card";
import { scrapeCardsByBank } from './bankScraper';
import routerCards from "./routes/cards";

var cardModel: CardModel;
export { cardModel }; // the initial cardmodel

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

    const data = await scrapeCreditCards();
    res.json(data);
});



app.listen(3001, () => console.log('Server running on port 3001'));