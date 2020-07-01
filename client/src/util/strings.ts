import emojiRegex from "emoji-regex";
import graphemeSplitter from "grapheme-splitter";

const splitter = new graphemeSplitter();
const emoji = emojiRegex();

export const isEmoji = (s: string) => (s || "").match(emoji);

export function getInitials(name: string) {
  const s = (name || "")
    .split(" ")
    .map((n) => {
      const graphemes = splitter.splitGraphemes(n);
      const result = [];
      if (!isEmoji(graphemes[0])) result.push(graphemes[0]); // Use the first letter if not emoji
      result.push(...graphemes.filter(isEmoji)); // Add all other emojis
      return result.join("");
    })
    .join("")
    .replace(/\s/g, "");
  return splitter.splitGraphemes(s).slice(0, 3).join("");
}

export function stringLength(str: string) {
  return splitter.countGraphemes(str);
}