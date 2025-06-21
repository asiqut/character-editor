import * as PSD from 'ag-psd';
import { renderCharacter } from './renderer';
import { CHARACTER_CONFIG } from './characterConfig';

export const exportPNG = (character, psdData) => {
  const canvas = document.createElement('canvas');
  canvas.width = 315;
  canvas.height = 315;
  
  renderCharacter(canvas, psdData, character);

  const link = document.createElement('a');
  link.download = `character_${Date.now()}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
};

export const exportPSD = (originalPsd, character) => {
  console.log('Starting PSD export:', { originalPsd, character });
  
  try {
    const groupOrder = [
      'Уши',
      'Глаза',
      'Щёки', 
      'Голова',
      'Грудь Шея Грива',
      'Тело',
      'Хвосты'
    ];

    const partToGroupName = {
      'ears': 'Уши',
      'eyes': 'Глаза',
      'cheeks': 'Щёки',
      'head': 'Голова',
      'mane': 'Грудь Шея Грива',
      'body': 'Тело',
      'tail': 'Хвосты'
    };

    const newPsd = {
      width: 315,
      height: 315,
      children: []
    };

    groupOrder.forEach(groupName => {
      const partName = Object.keys(partToGroupName).find(
        key => partToGroupName[key] === groupName
      );
      
      if (!partName) return;

      const partConfig = CHARACTER_CONFIG.parts[partName];
      if (!partConfig || !partConfig.enabled) return;

      if (partName === 'cheeks' && character.cheeks === 'нет') return;

      let variant;
      if (partConfig.isSingleVariant) {
        variant = partConfig;
      } else {
        const variantName = partName === 'eyes' 
          ? character.eyes.type 
          : character[partName];
        variant = partConfig.variants[variantName];
      }

      if (!variant) return;

      const layers = variant.layers.map(layerPath => {
        const layer = findLayerInPSD(layerPath, originalPsd);
        if (!layer) return null;
        return applyColorToLayer(layer, partName, character);
      }).filter(Boolean);

      if (partName === 'eyes' && character.eyes?.type === 'обычные' && character.eyes?.subtype) {
        const subtypeLayerPath = `Глаза/обычные/${character.eyes.subtype}`;
        const subtypeLayer = findLayerInPSD(subtypeLayerPath, originalPsd);
        if (subtypeLayer) {
          layers.push({
            name: subtypeLayer.name,
            canvas: subtypeLayer.canvas,
            left: subtypeLayer.left,
            top: subtypeLayer.top,
            opacity: subtypeLayer.opacity,
            blendMode: subtypeLayer.blendMode,
            clipping: subtypeLayer.clipping,
            hidden: false
          });
        }
      }

      if (layers.length > 0) {
        newPsd.children.unshift({
          name: groupName,
          children: layers
        });
      }
    });

    const psdBytes = PSD.writePsd(newPsd);
    console.log('PSD bytes generated:', psdBytes.length);
    
    const blob = new Blob([psdBytes], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `character_${Date.now()}.psd`;
    a.click();
    
    URL.revokeObjectURL(url);
    console.log('PSD export completed');
  } catch (error) {
    console.error('PSD export error:', error);
    throw error;
  }
};

function findLayerInPSD(layerPath, psdData) {
  if (!layerPath || !psdData) return null;
  
  const parts = layerPath.split('/');
  let current = psdData;

  for (const part of parts) {
    if (!current[part]) return null;
    current = current[part];
  }

  return current;
}

function applyColorToLayer(layer, partName, character) {
  if (!layer.canvas) return layer;
  
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = layer.canvas.width;
  tempCanvas.height = layer.canvas.height;
  const tempCtx = tempCanvas.getContext('2d');
  
  let color;
  if (layer.name.includes('[белок красить]')) {
    color = character.colors?.eyesWhite || '#ffffff';
  } 
  else if (layer.name.includes('[красить]')) {
    color = character.partColors?.[partName] || character.colors?.main || '#f1ece4';
  } 
  else {
    return { ...layer, hidden: false };
  }
  
  tempCtx.drawImage(layer.canvas, 0, 0);
  tempCtx.globalCompositeOperation = 'source-atop';
  tempCtx.fillStyle = color;
  tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
  
  return {
    name: layer.name,
    canvas: tempCanvas,
    left: layer.left,
    top: layer.top,
    opacity: layer.opacity,
    blendMode: layer.blendMode,
    clipping: layer.clipping,
    hidden: false
  };
}
