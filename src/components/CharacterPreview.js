// src/components/CharacterPreview.js
import React, { useEffect, useRef } from 'react';

function CharacterPreview({ psdData, character }) {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    if (!psdData || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Временный фон для визуализации
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    try {
      // Получаем данные для текущего варианта ушей
      const earVariant = psdData['Уши']?.[character.ears];
      if (!earVariant) {
        console.warn('No ear variant found:', character.ears);
        return;
      }

      console.log('Rendering ear variant:', earVariant);

      // Рендерим каждый слой
      earVariant.layers?.forEach(layer => {
        if (!layer.canvas) {
          console.warn('Layer missing canvas:', layer.name);
          return;
        }

        ctx.save();
        ctx.globalAlpha = layer.opacity;
        ctx.translate(layer.left, layer.top);
        
        if (layer.blendMode) {
          const blendMap = {
            'multiply': 'multiply',
            'overlay': 'overlay',
            'screen': 'screen',
            'normal': 'source-over'
          };
          ctx.globalCompositeOperation = blendMap[layer.blendMode.toLowerCase()] || 'source-over';
        }

        ctx.drawImage(layer.canvas, 0, 0);
        ctx.restore();
      });

    } catch (error) {
      console.error('Rendering error:', error);
      ctx.fillStyle = '#ff0000';
      ctx.font = '14px Arial';
      ctx.fillText(`Error: ${error.message}`, 10, 20);
    }
  }, [psdData, character]);

  return (
    <div style={{
      width: '315px',
      height: '315px',
      border: '1px solid #ddd',
      backgroundColor: '#fff'
    }}>
      <canvas 
        ref={canvasRef}
        width={315}
        height={315}
        style={{ display: 'block' }}
      />
    </div>
  );
}

export default CharacterPreview;
