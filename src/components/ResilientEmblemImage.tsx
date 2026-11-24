import {useState, type CSSProperties} from 'react';
import {Sparkles} from 'lucide-react';

interface ResilientEmblemImageProps {
  src: string;
  alt: string;
  className?: string;
  style?: CSSProperties;
  fallbackLabel?: string;
  draggable?: boolean;
}

export function ResilientEmblemImage({
  src,
  alt,
  className = '',
  style,
  fallbackLabel,
  draggable = false,
}: ResilientEmblemImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        role="img"
        aria-label={alt}
        style={style}
        className={`flex flex-col items-center justify-center rounded-2xl border border-[#e5d9f8]/15 bg-[#120c21]/80 p-4 text-center ${className}`}
      >
        <Sparkles className="h-6 w-6 text-[#d900ff] mb-2" aria-hidden="true" />
        {fallbackLabel ? (
          <span className="text-xs text-[#b4a6cc] font-medium">{fallbackLabel}</span>
        ) : null}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      draggable={draggable}
      style={style}
      onError={() => setHasError(true)}
      className={className}
    />
  );
}
