import React, { useEffect, useRef } from 'react';
import { renderCharacter } from '../lib/renderer';

function CharacterPreview({ psdData, character }) {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    if (psdData && canvasRef.current) {
      console.log('Rendering character with data:', psdData); // Добавим лог
      try {
        canvasRef.current.width = 630;
        canvasRef.current.height = 630;
        renderCharacter(canvasRef.current, psdData, character);
      } catch (error) {
        console.error('Error rendering character:', error);
      }
    }
  }, [psdData, character]);
  
  return (
    <div style={{
      width: '315px',
      height: '315px',
      position: 'relative',
      border: '1px solid #ddd',
      overflow: 'hidden'
    }}>
      {psdData ? (
        <canvas 
          ref={canvasRef} 
          width={315}
          height={315}
          style={{ display: 'block' }}
        />
      ) : (
        <div>Загрузка модели...</div>
      )}
    </div>
  );
}

export default CharacterPreview;
