import type { Deck } from "./types";
import { geral } from "./content/geral";
import { publicos } from "./content/publicos";
import { whiteboard } from "./content/whiteboard";

/** Ordered drawer. Add a deck here and it appears at /decks. */
export const decks: Deck[] = [geral, publicos, whiteboard];
