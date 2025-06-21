
interface GenerateImageOptions {
  title: string;
  width?: number;
  height?: number;
  backgroundColor?: string;
  textColor?: string;
  fontSize?: number;
}

export const generateTitleImage = ({
  title,
  width = 800,
  height = 400,
  backgroundColor = '#1e293b',
  textColor = '#ffffff',
  fontSize = 48
}: GenerateImageOptions): string => {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Canvas context not available');
    }

    canvas.width = width;
    canvas.height = height;

    // Set background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

    // Set text properties
    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Calculate font size based on title length and canvas size
    const maxWidth = width * 0.9;
    let currentFontSize = fontSize;
    
    // Start with the given font size and decrease if text is too wide
    do {
      ctx.font = `bold ${currentFontSize}px system-ui, -apple-system, sans-serif`;
      const textMetrics = ctx.measureText(title);
      if (textMetrics.width <= maxWidth) {
        break;
      }
      currentFontSize -= 2;
    } while (currentFontSize > 16);

    // Handle long titles by wrapping text
    const words = title.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const testMetrics = ctx.measureText(testLine);
      
      if (testMetrics.width <= maxWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          // Single word is too long, add it anyway
          lines.push(word);
        }
      }
    }
    
    if (currentLine) {
      lines.push(currentLine);
    }

    // Calculate starting Y position for centered text
    const lineHeight = currentFontSize * 1.2;
    const totalTextHeight = lines.length * lineHeight;
    const startY = (height - totalTextHeight) / 2 + lineHeight / 2;

    // Draw each line
    lines.forEach((line, index) => {
      const y = startY + (index * lineHeight);
      ctx.fillText(line, width / 2, y);
    });

    // Add subtle gradient overlay for better visual appeal
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.1)');
    gradient.addColorStop(1, 'rgba(147, 51, 234, 0.1)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    return canvas.toDataURL('image/png', 0.9);
  } catch (error) {
    console.error('Error generating title image:', error);
    throw error;
  }
};

export const getImageForBlog = (blog: { title: string; featured_image?: string }, dummyImages: string[], index: number = 0): string => {
  if (blog.featured_image) {
    return blog.featured_image;
  }

  try {
    return generateTitleImage({ 
      title: blog.title,
      backgroundColor: '#0f172a',
      textColor: '#f1f5f9'
    });
  } catch (error) {
    console.error('Error generating image for blog:', error);
    return dummyImages[index % dummyImages.length];
  }
};
