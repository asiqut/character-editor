import React, { useEffect, useRef } from 'react';
import { renderCharacter } from '../lib/renderer';

function CharacterPreview({ psdData, character }) {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    if (psdData && canvasRef.current) {
      // Для превью используем увеличенный размер
      canvasRef.current.width = 630;
      canvasRef.current.height = 630;
      renderCharacter(canvasRef.current, psdData, character);
    }
  }, [psdData, character]);
  
  return (
    <div style={{
      width: '315px', // Отображаем в оригинальном размере
      height: '315px',
      position: 'relative',
      border: '1px solid #ddd',
      overflow: 'hidden' // Обрезаем увеличенное изображение
    }}>
      <canvas 
        ref={canvasRef} 
        width={630}
        height={630}
        style={{ 
          display: 'block',
          transform: 'scale(0.5)',
          transformOrigin: '0 0'
        }}
      />
    </div>
  );
}

export default CharacterPreview;
