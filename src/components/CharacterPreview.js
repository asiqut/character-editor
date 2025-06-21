// src/components/CharacterPreview.js
import React, { useEffect, useRef } from 'react';

function CharacterPreview({ psdData, character }) {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    if (!psdData || !canvasRef.current) return;
    
    const renderLayer = (ctx, layer) => {
      if (!layer.canvas) return;
      
      ctx.save();
      ctx.globalAlpha = layer.opacity !== undefined ? layer.opacity : 1;
      ctx.translate(layer.left, layer.top);
      
      if (layer.blendMode) {
        // Конвертируем режимы наложения Photoshop в Canvas
        const blendModes = {
          'multiply': 'multiply',
          'overlay': 'overlay',
          'normal': 'source-over'
        };
        ctx.globalCompositeOperation = blendModes[layer.blendMode.toLowerCase()] || 'source-over';
      }
      
      ctx.drawImage(layer.canvas, 0, 0);
      ctx.restore();
    };

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Рендерим выбранный вариант ушей
    const earVariant = psdData['Уши']?.[character.ears];
    if (earVariant && earVariant.children) {
      earVariant.children.forEach(layer => {
        renderLayer(ctx, layer);
      });
    }

  }, [psdData, character]);

  return (
    <div style={{ width: '315px', height: '315px', border: '1px solid #ddd' }}>
      <canvas 
        ref={canvasRef}
        width={315}
        height={315}
      />
    </div>
  );
}

export default CharacterPreview;
