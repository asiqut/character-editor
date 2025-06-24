import React, { useEffect, useRef } from 'react';
import { renderCharacter } from '../lib/renderer';

function CharacterPreview({ psdData, character }) {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    if (psdData && canvasRef.current) {
      // Для превью используем увеличенный размер
      canvasRef.current.width = 315;
      canvasRef.current.height = 315;
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
        width={315}
        height={315}
        style={{ 
          display: 'block'
        }}
      />
    </div>
  );
}

export default CharacterPreview;
