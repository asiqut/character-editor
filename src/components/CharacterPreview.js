import React, { useEffect, useRef } from 'react';
import { renderCharacter } from '../lib/renderer';

function CharacterPreview({ psdData, character }) {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    if (psdData && canvasRef.current) {
      // Большой канвас для превью
      canvasRef.current.width = 800;
      canvasRef.current.height = 800;
      renderCharacter(canvasRef.current, psdData, character, {
        forExport: false,
        scale: 1.8 // Масштаб для превью
      });
    }
  }, [psdData, character]);
  
  return (
    <div style={{ width: '800px', height: '800px', position: 'relative' }}>
      <canvas ref={canvasRef} width={800} height={800} />
    </div>
  );
}

export default CharacterPreview;
