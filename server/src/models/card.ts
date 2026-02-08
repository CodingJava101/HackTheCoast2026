import fs from "fs/promises";

export interface Card{
    id: number
    name: string,
    issuer: string,
    annualFee: number,
    earnRate: string,
    welcomeBonus: string,
    minIncome: number,
    tier: string,
    category: string,
    studentFriendly: boolean,
    typicalCPP: number,
    foreignFee: number,
    links: {
		self: string;
	};
}

export class CardModel {
    dataCards: {cards: Card[]} = {cards: []};
    cardModel: any;

    /*public async readCards(filepath: string): Promise<Card[]> {
		try {
			const data = await fs.readFile(filepath, "utf-8");
			return JSON.parse(data)obj.phaseExecutions.PRE.map(x => x.phaseValue);
		} catch {
			return [];
		}
	}*/

    public getCards(): Card[] {
        return this.dataCards.cards;
    }

    public getCardById(_id: number): Card | undefined {
        return this.dataCards.cards.find((card) => card.id === _id);
    }

    public setCard(_id: number, _name: string, _issuer: string, _annualFee: number, _earnRate: string,
        _welcomeBonus: string, _minIncome: number, _tier: string, _category: string, _studentFriendly: boolean,
        _typicalCPP: number, _foreignFee: number, selflink: string): Card {
		let card = this.getCardById(_id);
		if (card) {
            card.name = _name;
            card.issuer = _issuer;
            card.annualFee = _annualFee;
            card.earnRate = _earnRate,
            card.welcomeBonus = _welcomeBonus;
            card.minIncome = _minIncome;
            card.tier = _tier;
            card.category = _category;
            card.studentFriendly = _studentFriendly;
            card.typicalCPP = _typicalCPP;
            card.foreignFee = _foreignFee; // update
		} else {
			card = {
				id: _id,
				name: _name,
                issuer: _issuer,
                annualFee: _annualFee,
                earnRate: _earnRate,
                welcomeBonus: _welcomeBonus,
                minIncome: _minIncome,
                tier: _tier,
                category: _category,
                studentFriendly: _studentFriendly,
                typicalCPP: _typicalCPP,
                foreignFee: _foreignFee,
                links: { self: selflink}
			};
			this.dataCards.cards.push(card as Card);
		}
		// TODO write updated model to disk
		return card as Card;
	}

	public setCards(cardsNew: Card[]): Card[] {
		this.dataCards.cards = cardsNew;
		return this.dataCards.cards;
	}

	public removeCardById(_id: number): Card | undefined {
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