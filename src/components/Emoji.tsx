interface EmojiProps {
  char: string;
  size?: number;
}

export default function Emoji({ char, size = 30 }: EmojiProps) {
  const codePoints = Array.from(char)
    .map((c) => c.codePointAt(0)!.toString(16))
    .join("_") 
    .toLowerCase();

  const src = `https://fonts.gstatic.com/s/e/notoemoji/latest/${codePoints}/emoji.svg`;

  return (
    <img
      src={src}
      width={size}
      height={size}
      alt={char}
      style={{
        display: "inline-block",
        verticalAlign: "middle",
        imageRendering: "auto",
      }}
    />
  );
}
