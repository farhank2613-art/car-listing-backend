import { useState } from 'react';
import { placeholderUrl } from '../api';

interface Props {
  src?: string;
  alt: string;
  className?: string;
  text?: string;
  hue?: number;
}

export default function ImageWithFallback({ src, alt, className, text, hue = 220 }: Props) {
  const [failed, setFailed] = useState(false);

  const effective = failed || !src ? placeholderUrl(text || alt, hue) : src;

  return (
    <img
      src={effective}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}
