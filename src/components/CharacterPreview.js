import React, { useEffect, useRef } from 'react';
import { renderCharacter } from '../lib/renderer';

function CharacterPreview({ psdData, character }) {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    if (psdData && canvasRef.current) {
      // Используем размеры из PSD или дефолтные 800x800
      const width = psdData.width || 800;
      const height = psdData.height || 800;
      
      canvasRef.current.width = width;
      canvasRef.current.height = height;
      
      renderCharacter(canvasRef.current, psdData, character);
    }
  }, [psdData, character]);
  
  return (
    <div style={{
      width: '800px',
      height: '800px',
      position: 'relative',
      border: '1px solid #ddd',
      overflow: 'hidden'
    }}>
      <canvas 
        ref={canvasRef} 
        style={{ 
          display: 'block',
          maxWidth: '100%',
          maxHeight: '100%'
        }}
      />
    </div>
  );
}

export default CharacterPreview;
