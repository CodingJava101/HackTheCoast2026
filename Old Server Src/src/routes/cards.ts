import { Router } from "express";
//import { routerCourses } from "./courses"
import {
	listCards,
	listCard,
	setCard,
	removeCard,
} from "../controllers/cardController";

const routerCards: Router = Router();

routerCards.get("", listCards);
routerCards.get("/:cardId", listCard);
routerCards.put("/:cardId", setCard);
routerCards.delete("/:cardId", removeCard);

export default routerCards;
