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
  width = 900,
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

    // Draw background gradient (blue to purple)
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#2563eb'); // Blue
    gradient.addColorStop(1, '#9333ea'); // Purple
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Set text properties (white color, bold, large font)
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Calculate max font size for multiline text
    const maxWidth = width * 0.85;
    let currentFontSize = fontSize;
    let lines: string[] = [];
    let fits = false;
    while (!fits && currentFontSize > 24) {
      ctx.font = `bold ${currentFontSize}px system-ui, -apple-system, sans-serif`;
      // Try to wrap text
      const words = title.split(' ');
      const tempLines: string[] = [];
      let currentLine = '';
      for (const word of words) {
        const testLine = currentLine ? currentLine + ' ' + word : word;
        if (ctx.measureText(testLine).width <= maxWidth) {
          currentLine = testLine;
        } else {
          if (currentLine) tempLines.push(currentLine);
          currentLine = word;
        }
      }
      if (currentLine) tempLines.push(currentLine);
      // Check if all lines fit vertically
      const lineHeight = currentFontSize * 1.2;
      const totalTextHeight = tempLines.length * lineHeight;
      if (totalTextHeight <= height * 0.8) {
        fits = true;
        lines = tempLines;
      } else {
        currentFontSize -= 2;
      }
    }
    ctx.font = `bold ${currentFontSize}px system-ui, -apple-system, sans-serif`;
    const lineHeight = currentFontSize * 1.2;
    const totalTextHeight = lines.length * lineHeight;
    const startY = (height - totalTextHeight) / 2 + lineHeight / 2;
    lines.forEach((line, index) => {
      const y = startY + (index * lineHeight);
      ctx.fillText(line, width / 2, y);
    });

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
