import React, { useEffect, useRef } from 'react';
import { renderCharacter } from '../lib/renderer';

function CharacterPreview({ psdData, character }) {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    console.log('Preview update:', { psdData, character });
    if (psdData && canvasRef.current) {
      try {
        canvasRef.current.width = 630;
        canvasRef.current.height = 630;
        renderCharacter(canvasRef.current, psdData, character);
      } catch (error) {
        console.error('Rendering error:', error);
      }
    }
  }, [psdData, character]);
  
  return (
    <div style={{ width: '315px', height: '315px', position: 'relative', border: '1px solid #ddd', overflow: 'hidden' }}>
      <canvas 
        ref={canvasRef} 
        width={315}
        height={315}
        style={{ display: 'block' }}
      />
      {!psdData && <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>Загрузка...</div>}
    </div>
  );
}

export default CharacterPreview;
