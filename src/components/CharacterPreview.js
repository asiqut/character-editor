// src/components/CharacterPreview.js
import React, { useEffect, useRef } from 'react';
import { renderCharacter } from '../lib/renderer';

function CharacterPreview({ psdData, character }) {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    if (psdData && canvasRef.current) {
      renderCharacter(canvasRef.current, psdData, character);
    }
  }, [psdData, character]);
  
  return <canvas ref={canvasRef} width={800} height={800} />;
}

export default CharacterPreview;
