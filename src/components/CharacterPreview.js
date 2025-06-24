import React, { useEffect, useRef } from 'react';
import { renderCharacter } from '../lib/renderer';

function CharacterPreview({ psdData, character }) {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    if (psdData && canvasRef.current) {
      // Для превью используем увеличенный размер для лучшего качества
      canvasRef.current.width = 630;
      canvasRef.current.height = 630;
      
      // Рендерим персонажа с выбранными настройками
      renderCharacter(canvasRef.current, psdData, character);
    }
  }, [psdData, character]);
  
  return (
    <div className="preview-container">
      <canvas 
        ref={canvasRef} 
        width={315}
        height={315}
        style={{ 
          width: '315px',
          height: '315px',
          display: 'block'
        }}
      />
    </div>
  );
}

export default CharacterPreview;
