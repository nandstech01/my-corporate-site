'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

type PostImageProps = {
  src?: string | null;
  alt: string;
};

export default function PostImage({ src, alt }: PostImageProps) {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
    if (src) {
      // Check if the src is already a full URL
      if (src.startsWith('http')) {
        setImgSrc(src);
      } else {
        // If it's a relative path, construct the full Supabase storage URL
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const fullUrl = `${supabaseUrl}/storage/v1/object/public/${src}`;
        setImgSrc(fullUrl);
      }
    } else {
      setImgSrc(null);
    }
  }, [src]);

  const handleError = () => {
    console.log('Image load error, showing placeholder');
    setHasError(true);
    setImgSrc(null);
  };

  // プレースホルダー（画像がない場合）
  if (!imgSrc || hasError) {
    return (
      <div 
        className="relative w-full h-full flex items-center justify-center"
        style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}
      >
        <div className="text-center text-white">
          <svg 
            className="w-16 h-16 mx-auto mb-2 opacity-50" 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path 
              fillRule="evenodd" 
              d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" 
              clipRule="evenodd" 
            />
          </svg>
          <p className="text-sm font-medium opacity-75">No Image</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-gray-100" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
      <Image
        src={imgSrc}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className="object-cover"
        onError={handleError}
        priority={false}
        quality={75}
        unoptimized={imgSrc.includes('supabase') ? true : false}
      />
    </div>
  );
} 