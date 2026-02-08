import type { Request, Response } from "express";
//import { cardModel } from "../models/card";
import { cardModel } from "../App";

export async function listCards(req: Request, res: Response) {
	const cards = cardModel.getCards();
	//res.json(pets);
	res.status(200).send(cards);
}

export async function createCard(req: Request, res: Response) {
	
}

export async function setCard(req: Request, res: Response) {
    const cardId = Number(req.params.cardId);
    if (cardId === undefined) {
        res.status(404).send({
			error: "Not found",
			message: "no card with id \'" + req.params.cardId + "'",
		}); // created
    }

	if (
		!("name" in req.body) ||
		typeof req.body.name !== "string" ||
		!("issuer" in req.body) ||
		typeof req.body.issuer !== "string" ||
		!("annualFee" in req.body) ||
		typeof req.body.annualFee !== "number" ||
		!("earnRate" in req.body) ||
		typeof req.body.earnRate !== "string" ||
		!("welcomeBonus" in req.body) ||
		typeof req.body.welcomeBonus !== "string" ||
		!("minIncome" in req.body) ||
		typeof req.body.minIncome !== "number" ||
		!("tier" in req.body) ||
		typeof req.body.tier !== "string" ||
		!("category" in req.body) ||
		typeof req.body.category !== "string" ||
		!("studentFriendly" in req.body) ||
		typeof req.body.studentFriendly !== "boolean" ||
		!("typicalCPP" in req.body) ||
		typeof req.body.typicalCPP !== "number" ||
		!("foreignFee" in req.body) ||
		typeof req.body.foreignFee !== "number" 
	) {
		const thefields: { name?: string; issuer?: string; annualFee?: string; earnRate?: string; welcomeBonus?: string
            ; minIncome?: string; tier?: string; category?: string; studentFriendly?: string; typicalCPP?: string; foreignFee?: string
         } = {}; // optional properties
		if (!("name" in req.body)) {
			thefields.name = "required but missing";
		} else if (typeof req.body.name !== "string") {
			thefields.name = "expected a string";
		}
		if (!("issuer" in req.body)) {
			thefields.issuer = "required but missing";
		} else if (typeof req.body.issuer !== "string") {
			thefields.issuer = "expected a string";
		}
        if (!("annualFee" in req.body)) {
			thefields.annualFee = "required but missing";
		} else if (typeof req.body.annualFee !== "number") {
			thefields.annualFee = "expected a number";
		}
		if (!("earnRate" in req.body)) {
			thefields.earnRate = "required but missing";
		} else if (typeof req.body.earnRate !== "string") {
			thefields.earnRate = "expected a string";
		}
        if (!("welcomeBonus" in req.body)) {
			thefields.welcomeBonus = "required but missing";
		} else if (typeof req.body.welcomeBonus !== "string") {
			thefields.welcomeBonus = "expected a string";
		}
		if (!("minIncome" in req.body)) {
			thefields.minIncome = "required but missing";
		} else if (typeof req.body.minIncome !== "number") {
			thefields.minIncome = "expected a number";
		}
        if (!("tier" in req.body)) {
			thefields.tier= "required but missing";
		} else if (typeof req.body.tier !== "string") {
			thefields.tier = "expected a string";
		}
		if (!("category" in req.body)) {
			thefields.category = "required but missing";
		} else if (typeof req.body.category !== "string") {
			thefields.category = "expected a string";
		}
        if (!("studentFriendly" in req.body)) {
			thefields.studentFriendly = "required but missing";
		} else if (typeof req.body.studentFriendly !== "boolean") {
			thefields.studentFriendly = "expected a boolean";
		}
        if (!("typicalCPP" in req.body)) {
			thefields.typicalCPP= "required but missing";
		} else if (typeof req.body.typicalCPP !== "number") {
			thefields.typicalCPP = "expected a number";
		}
		if (!("foreignFee" in req.body)) {
			thefields.foreignFee = "required but missing";
		} else if (typeof req.body.foreignFee !== "number") {
			thefields.foreignFee = "expected a number";
		}
		res.status(422).send({
			error: "Validation failed",
			fields: thefields,
		});
		return;
	}
	//const {id, name} = req.body;
	if (!("name" in req.body) || typeof req.body.name !== "string") {
		res.status(422).send({
			error: "Validation failed",
			fields: {
				name: !("name" in req.body)
					? "required but missing"
					: "expected a string",
			},
		}); // removed a return here
		return;
	}
    
	const card = cardModel.getCardById(cardId);
	const newCard = cardModel.setCard(
            req.body.id,
            req.body.name,
            req.body.issuer,
            req.body.annualFee,
            req.body.earnRate,
            req.body.welcomeBonus,
            req.body.minIncome,
            req.body.tier,
            req.body.category,
            req.body.studentFriendly,
            req.body.typicalCPP,
            req.body.foreignFee,
            req.originalUrl
    );
	if (card === undefined) {
		// creation of new card
		res.status(201).send(newCard); // created
	} else {
		res.sendStatus(204); // updated, no content
	}
}

export async function listCard(req: Request, res: Response) {
    const cardId = Number(req.params.cardId);
    if (cardId === undefined) {
        res.status(404).send({
			error: "Not found",
			message: "no card with id \'" + req.params.cardId + "'",
		}); // created
    }
	const card = cardModel.getCardById(cardId); // a cards
	if (card === undefined) {
		res.status(404).send({
			error: "Not found",
			message: "no card with id \'" + req.params.cardId + "'",
		}); // created
	} else {
		res.status(200).send(card); // updated, no content
	}
}

export async function removeCard(req: Request, res: Response) {
    const cardId = Number(req.params.cardId);
    if (cardId === undefined) {
        res.status(404).send({
			error: "Not found",
			message: "no card with id \'" + req.params.cardId + "'",
		}); // created
    }
	const card = cardModel.removeCardById(cardId); // a cards
	if (card === undefined) {
		res.status(404).send({
			error: "Not found",
			message: "no card with id \'" + req.params.cardId + "'",
		}); // created
	} else {
		res.status(200).send({
			id: card.id,
			name: card.name,
		}); // deleted
	}
}
