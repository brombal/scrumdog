import { DeckCollection } from "./types";

export const decks: DeckCollection = {
  scrum: [
    ["0", false],
    ["½", false],
    ["1", true],
    ["2", true],
    ["3", true],
    ["5", true],
    ["8", true],
    ["13", true],
    ["20", true],
    ["40", false],
    ["100", false],
    ["?", true],
    ["☕️", true],
  ],
};

export function defaultDeck() {
  return decks.scrum
    .filter(([, defaultEnabled]) => defaultEnabled)
    .map(([value]) => value);
}
