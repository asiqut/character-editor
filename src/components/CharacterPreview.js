// src/components/CharacterPreview.js
import React, { useEffect, useRef } from 'react';

function CharacterPreview({ psdData, character }) {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    if (!psdData || !canvasRef.current) {
      console.log('Missing data for rendering:', { psdData, canvasRef: canvasRef.current });
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Временный фон для отладки
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#999';
    ctx.font = '14px Arial';
    ctx.fillText('Rendering...', 10, 20);

    try {
      // Проверяем доступность структуры данных
      if (!psdData['Уши'] || !psdData['Уши'][character.ears]) {
        console.warn('Missing ear data:', {
          availableGroups: Object.keys(psdData),
          availableEars: psdData['Уши'] ? Object.keys(psdData['Уши']) : null
        });
        return;
      }

      const earData = psdData['Уши'][character.ears];
      console.log('Rendering ear data:', earData);

      // Рендерим каждый слой
      if (earData.children) {
        earData.children.forEach(layer => {
          if (!layer.canvas) {
            console.warn('Layer missing canvas:', layer.name);
            return;
          }

          ctx.save();
          ctx.globalAlpha = layer.opacity;
          ctx.translate(layer.left, layer.top);
          
          // Простая поддержка режимов наложения
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
      }
    } catch (error) {
      console.error('Rendering error:', error);
      // Отображаем ошибку на холсте
      ctx.fillStyle = '#ff0000';
      ctx.fillText(`Error: ${error.message}`, 10, 40);
    }
  }, [psdData, character]);

  return (
    <div style={{
      width: '315px',
      height: '315px',
      position: 'relative',
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
