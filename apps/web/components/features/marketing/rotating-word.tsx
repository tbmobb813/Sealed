"use client";

import { useEffect, useState } from "react";

const DEFAULT_INTERVAL_MS = 2200;

export function RotatingWord({
  words,
  intervalMs = DEFAULT_INTERVAL_MS,
}: {
  words: string[];
  intervalMs?: number;
}) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (words.length <= 1) return;

    const rotate = setInterval(() => {
      setVisible(false);
      const fadeOut = setTimeout(() => {
        setIndex((prev) => (prev + 1) % words.length);
        setVisible(true);
      }, 150);
      return () => clearTimeout(fadeOut);
    }, intervalMs);

    return () => clearInterval(rotate);
  }, [words, intervalMs]);

  return (
    <span
      className="inline-block text-primary transition-opacity duration-150"
      style={{ opacity: visible ? 1 : 0 }}
    >
      {words[index]}
    </span>
  );
}
