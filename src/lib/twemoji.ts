import { Twemoji } from "@svgmoji/twemoji";
import type { MinifiedEmoji } from "svgmoji";
import data from "svgmoji/emoji.json";

const emojiData = data as unknown as MinifiedEmoji[];

export const twemoji = new Twemoji({
  data: emojiData,
  type: "all",
});
