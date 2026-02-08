import fs from "fs/promises";
import path from "path";

export interface Card{
    id: string;
    name: string;
    fee: number;
    benefit: string[];
    
    //imageurl: string;
    links: {
		self: string;
	};
}

export class CardModel {
    dataCards: {cards: Card[]} = {cards: []};

    public getCards(): Card[] {
        return this.dataCards.cards;
    }

    public getCardById(_id: string): Card | undefined {
        return this.dataCards.cards.find((card) => card.id === _id);
    }

    public setCard(_id: string, _name: string, _fee: number, _benefit: string[], selflink: string): Card {
		let card = this.getCardById(_id);
		if (card) {
			card.name = _name; // update
		} else {
			card = {
				id: _id,
				name: _name,
                fee: _fee,
                benefit: _benefit,
                links: { self: selflink}
			};
			this.dataCards.cards.push(card);
		}
		// TODO write updated model to disk

		return { id: card.id, name: card.name, fee: card.fee, benefit: card.benefit, links: card.links };
	}

	public setCards(cardsNew: Card[]): Card[] {
		this.dataCards.cards = cardsNew;
		return this.dataCards.cards;
	}

	public removeCardById(_id: string): Card | undefined {
		const card = this.getCardById(_id);
		if (card === undefined) {
			return undefined;
		} else {
			const cards = this.getCards();
			this.setCards(cards.filter((item) => item.id !== card.id)); // change data directly
			return card;
		}
	}
}