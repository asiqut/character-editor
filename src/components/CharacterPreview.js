import React, { useEffect, useRef } from 'react';
import { renderCharacter } from '../lib/renderer';

function CharacterPreview({ psdData, character }) {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    if (psdData && canvasRef.current) {
      canvasRef.current.width = 800;
      canvasRef.current.height = 800;
      renderCharacter(canvasRef.current, psdData, character);
    }
  }, [psdData, character]);
  
  return (
    <div style={{
      width: '800px',
      height: '800px',
      position: 'relative',
      border: '1px solid #ddd'
    }}>
      <canvas 
        ref={canvasRef} 
        width={800}
        height={800}
        style={{ display: 'block' }}
      />
    </div>
  );
}

export default CharacterPreview;
