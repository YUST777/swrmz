import { memo, useEffect, useState } from 'react';

interface TypewriterProps {
  text: string;
  /** ms per character (1Code uses ~30ms) */
  speed?: number;
  /** delay before typing starts */
  delay?: number;
  /** play the animation; if false, render full text instantly */
  play?: boolean;
  className?: string;
  onDone?: () => void;
}

/**
 * Char-by-char reveal, modeled on 1Code's TypewriterText.
 * Shows a blinking caret while typing.
 */
export const Typewriter = memo(function Typewriter({
  text,
  speed = 16,
  delay = 0,
  play = true,
  className,
  onDone,
}: TypewriterProps) {
  const [n, setN] = useState(play ? 0 : text.length);

  useEffect(() => {
    if (!play) {
      setN(text.length);
      return;
    }
    setN(0);
    let i = 0;
    let timer: ReturnType<typeof setTimeout>;
    const startTimer = setTimeout(function tick() {
      i += 1;
      setN(i);
      if (i < text.length) {
        timer = setTimeout(tick, speed);
      } else {
        onDone?.();
      }
    }, delay);
    return () => {
      clearTimeout(startTimer);
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, play, speed, delay]);

  const typing = play && n < text.length;
  return (
    <span className={`${className ?? ''} ${typing ? 'tw-caret' : ''}`}>
      {text.slice(0, n)}
    </span>
  );
});
