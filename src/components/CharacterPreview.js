// src/components/CharacterPreview.js
import React, { useEffect, useRef } from 'react';
import { CHARACTER_CONFIG } from '../lib/characterConfig';

const blendModeMap = {
  'normal': 'source-over',
  'multiply': 'multiply',
  'overlay': 'overlay',
  'screen': 'screen',
  'darken': 'darken',
  'lighten': 'lighten'
};

function renderLayer(ctx, layer, clipContext = null) {
  if (!layer?.canvas || layer.hidden) return;

  const targetCtx = clipContext || ctx;
  
  targetCtx.save();
  targetCtx.globalAlpha = layer.opacity;
  targetCtx.translate(layer.left, layer.top);
  
  if (layer.blendMode) {
    targetCtx.globalCompositeOperation = blendModeMap[layer.blendMode.toLowerCase()] || 'source-over';
  }

  if (layer.clipTo) {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = layer.canvas.width;
    tempCanvas.height = layer.canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    
    renderLayer(tempCtx, layer);
    
    targetCtx.save();
    targetCtx.globalCompositeOperation = 'destination-in';
    if (clipContext) {
      targetCtx.drawImage(clipContext.canvas, 0, 0);
    }
    targetCtx.restore();
    
    targetCtx.drawImage(tempCanvas, 0, 0);
  } else {
    targetCtx.drawImage(layer.canvas, 0, 0);
  }

  targetCtx.restore();
}

function findSubtypeLayer(psdData, eyes) {
  if (!psdData['Глаза'] || !eyes?.subtype) return null;
  
  const eyeGroup = psdData['Глаза'][eyes.type];
  if (!eyeGroup) return null;

  return eyeGroup.layers?.find(l => 
    l.name.toLowerCase().includes(eyes.subtype.toLowerCase())
  );
}

function CharacterPreview({ psdData, character }) {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    if (!psdData || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    try {
      // Проверяем наличие CHARACTER_CONFIG
      if (!CHARACTER_CONFIG?.parts) {
        throw new Error('Character configuration not loaded');
      }

      // Используем порядок рендеринга из конфига
      const renderOrder = [
        'tail',
        'body',
        'mane',
        'head',
        'cheeks',
        'eyes',
        'ears'
      ];

      renderOrder.forEach(part => {
        const partConfig = CHARACTER_CONFIG.parts[part];
        if (!partConfig || !partConfig.enabled) return;
        if (part === 'cheeks' && character.cheeks === 'нет') return;

        const partName = partConfig.title;
        const variant = character[part];
        
        const partData = psdData[partName]?.[variant];
        if (!partData) {
          console.warn(`Missing data for ${partName}/${variant}`);
          return;
        }

        partData.layers?.forEach(layer => {
          renderLayer(ctx, layer);
        });

        // Особый случай для глаз
        if (part === 'eyes' && character.eyes?.subtype) {
          const subtypeLayer = findSubtypeLayer(psdData, character.eyes);
          if (subtypeLayer) renderLayer(ctx, subtypeLayer);
        }
      });

    } catch (error) {
      console.error('Rendering error:', error);
      ctx.fillStyle = '#ff0000';
      ctx.font = '14px Arial';
      ctx.fillText(`Render Error: ${error.message}`, 10, 20);
    }
  }, [psdData, character]);

  return (
    <div style={{ 
      width: '315px', 
      height: '315px',
      border: '1px solid #ddd',
      backgroundColor: '#fff',
      position: 'relative'
    }}>
      <canvas
        ref={canvasRef}
        width={315}
        height={315}
        style={{ display: 'block' }}
      />
      {!psdData && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: '#999'
        }}>
          Загрузка персонажа...
        </div>
      )}
    </div>
  );
}

export default CharacterPreview;
