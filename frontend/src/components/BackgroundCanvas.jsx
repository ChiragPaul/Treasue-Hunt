import React, { useEffect, useRef } from 'react';

const BackgroundCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    let animationFrameId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    // Generate static noise array once so it doesn't flicker
    const noiseMap = Array.from({ length: 500 }, () =>
      Array.from({ length: 500 }, () => Math.random())
    );

    // Render a structurally solid halftone background that moves with scroll
    const render = () => {
      // Clear with dark teal background
      ctx.fillStyle = '#002729';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Gold/Champagne for the stroke lines
      ctx.fillStyle = '#9BA8A8';

      const spacing = 12; // Column width
      const cols = Math.floor(canvas.width / spacing) + 1;
      const rowHeight = 15;
      const rows = Math.floor(canvas.height / rowHeight) + 1;

      const centerX = cols / 2;

      // Get scroll position for parallax effect
      const scrollY = window.scrollY || 0;
      // As we scroll down, we want to sample lower parts of the shape to make it appear to move up
      const scrollOffset = scrollY * 0.03;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = i * spacing;
          const y = j * rowHeight;

          // Add scroll offset to our Y sampling coordinate
          const sampleJ = j + scrollOffset;

          const distFromCenter = Math.abs(i - centerX);

          // Base shape: A triangle/mountain that is wider at the bottom
          let shapeValue = 0;
          const mountainSlope = (rows - sampleJ) * 1.2;

          if (distFromCenter < mountainSlope && sampleJ > rows * 0.2) {
            shapeValue = 1 - (distFromCenter / mountainSlope);
          }

          // Add static noise from our pre-generated map to give it the dithered look
          const noise = noiseMap[i % 500][j % 500];

          // Combine shape and noise
          const finalVal = shapeValue * 0.8 + noise * 0.4;

          if (finalVal > 0.4) {
            // Map the value to line thickness and length
            const thickness = Math.max(1, (finalVal - 0.4) * 5);
            const length = Math.min(rowHeight, finalVal * rowHeight * 0.8);

            // Add a subtle opacity gradient towards the top
            ctx.globalAlpha = Math.min(0.8, finalVal * (sampleJ / rows + 0.2));

            ctx.fillRect(
              x + (spacing - thickness) / 2,
              y + (rowHeight - length) / 2,
              thickness,
              length
            );
          }
        }
      }
      ctx.globalAlpha = 1.0;

      // Request next frame continuously so it updates instantly on scroll
      animationFrameId = requestAnimationFrame(render);
    };
    render();

    // Re-render on resize
    window.addEventListener('resize', render);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('resize', render);
    };
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: 1,
      pointerEvents: 'none'
    }}>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
    </div>
  );
};

export default BackgroundCanvas;
