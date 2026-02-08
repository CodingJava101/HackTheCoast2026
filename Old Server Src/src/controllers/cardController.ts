import type { Request, Response } from "express";
//import { cardModel } from "../models/card";
import { cardModel } from "../index";

export async function listCards(req: Request, res: Response) {
	const cards = cardModel.getCards();
	//res.json(pets);
	res.status(200).send(cards);
}

export async function createCard(req: Request, res: Response) {
	
}

export async function setCard(req: Request, res: Response) {
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
	const card = cardModel.getCardById(req.params.cardId as string);
	const newCard = cardModel.setCard(
		req.params.cardId as string,
		req.body.name,
        req.body.fee,
        req.body.benefit,
		req.originalUrl,
	);
	if (card === undefined) {
		// creation of new card
		res.status(201).send(newCard); // created
	} else {
		res.sendStatus(204); // updated, no content
	}
}

export async function listCard(req: Request, res: Response) {
	const card = cardModel.getCardById(req.params.cardId as string); // a cards
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
	const card = cardModel.removeCardById(req.params.cardId as string); // a cards
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
