import React, { useMemo, useState } from 'react';

type SafeImageProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  fallbackSrc?: string;
};

const DEFAULT_FALLBACK_SRC = 'https://picsum.photos/seed/travel-fallback/1200/800';

const SafeImage: React.FC<SafeImageProps> = ({ src, fallbackSrc = DEFAULT_FALLBACK_SRC, alt = '', ...props }) => {
  const normalizedSrc = useMemo(
    () => (typeof src === 'string' && src.trim().length > 0 ? src : fallbackSrc),
    [fallbackSrc, src],
  );
  const [currentSrc, setCurrentSrc] = useState(normalizedSrc);

  return (
    <img
      {...props}
      src={currentSrc}
      alt={alt}
      onError={() => {
        if (currentSrc !== fallbackSrc) {
          setCurrentSrc(fallbackSrc);
        }
      }}
    />
  );
};

export default SafeImage;
