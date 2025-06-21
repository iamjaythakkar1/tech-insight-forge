
import { useState, useEffect } from 'react';
import { getImageForBlog } from '@/utils/imageGenerator';

interface BlogImageProps {
  blog: {
    title: string;
    featured_image?: string;
  };
  dummyImages: string[];
  index?: number;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
}

export const BlogImage = ({ 
  blog, 
  dummyImages, 
  index = 0, 
  alt, 
  className = "",
  loading = "lazy" 
}: BlogImageProps) => {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    try {
      const src = getImageForBlog(blog, dummyImages, index);
      setImageSrc(src);
      setImageError(false);
    } catch (error) {
      console.error('Error getting image for blog:', error);
      setImageSrc(dummyImages[index % dummyImages.length]);
      setImageError(true);
    }
  }, [blog.title, blog.featured_image, dummyImages, index]);

  const handleImageError = () => {
    if (!imageError) {
      setImageError(true);
      setImageSrc(dummyImages[index % dummyImages.length]);
    }
  };

  return (
    <img 
      src={imageSrc}
      alt={alt}
      className={className}
      loading={loading}
      onError={handleImageError}
    />
  );
};
