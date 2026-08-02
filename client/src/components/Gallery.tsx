import { useCallback, useEffect, useState } from 'react';
import ImageWithFallback from './ImageWithFallback';

interface Props {
  images: string[];
  alt: string;
  text: string;
  hue?: number;
}

export default function Gallery({ images, alt, text, hue = 220 }: Props) {
  const list = images.length ? images : [''];
  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const prev = useCallback(() => setIndex((i) => (i - 1 + list.length) % list.length), [list.length]);
  const next = useCallback(() => setIndex((i) => (i + 1) % list.length), [list.length]);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(false);
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox, prev, next]);

  return (
    <div className="gallery">
      <div className="gallery-main" onClick={() => setLightbox(true)}>
        <ImageWithFallback key={index} src={list[index]} alt={`${alt} — photo ${index + 1}`} text={text} hue={hue} />
      </div>
      {list.length > 1 && (
        <div className="gallery-thumbs">
          {list.map((src, i) => (
            <button key={i} className={i === index ? 'active' : ''} onClick={() => setIndex(i)}>
              <ImageWithFallback src={src} alt={`Thumbnail ${i + 1}`} text={text} hue={hue} />
            </button>
          ))}
        </div>
      )}

      {lightbox && (
        <div className="lightbox" onClick={() => setLightbox(false)}>
          <button className="lightbox-close" onClick={() => setLightbox(false)}>✕</button>
          <button className="lightbox-nav prev" onClick={(e) => { e.stopPropagation(); prev(); }}>‹</button>
          <img src={list[index]} alt={alt} onClick={(e) => e.stopPropagation()} />
          <button className="lightbox-nav next" onClick={(e) => { e.stopPropagation(); next(); }}>›</button>
          <div className="lightbox-counter">{index + 1} / {list.length}</div>
        </div>
      )}
    </div>
  );
}
