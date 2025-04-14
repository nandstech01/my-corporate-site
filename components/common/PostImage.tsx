'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

type PostImageProps = {
  src?: string | null;
  alt: string;
};

export default function PostImage({ src, alt }: PostImageProps) {
  const defaultImage = '/images/default-post.jpg';
  const [imgSrc, setImgSrc] = useState<string>(defaultImage);

  useEffect(() => {
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
      setImgSrc(defaultImage);
    }
  }, [src]);

  const handleError = () => {
    console.log('Image load error, falling back to default image');
    setImgSrc(defaultImage);
  };

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
      />
    </div>
  );
} 