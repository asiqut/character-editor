import { CHARACTER_CONFIG } from './characterConfig';

export function renderCharacter(canvas, psdData, character) {
  if (!psdData || !character) {
    console.error('Missing data for rendering:', { psdData, character });
    return;
  }

  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

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
    if (part === 'cheeks' && character.cheeks === 'нет') return;
    renderPart(part, ctx, psdData, character);
  });
}

function renderPart(partName, ctx, psdData, character) {
  const partConfig = CHARACTER_CONFIG.parts[partName];
  if (!partConfig) {
    console.warn(`Missing config for part: ${partName}`);
    return;
  }

  let variant;
  if (partConfig.isSingleVariant) {
    variant = partConfig;
  } else {
    const variantName = partName === 'eyes' 
      ? character.eyes.type 
      : character[partName];
    variant = partConfig.variants[variantName];
  }

  if (!variant) {
    console.warn(`Missing variant for ${partName}`);
    return;
  }

  variant.layers.forEach(layerPath => {
    const layer = findLayerInPSD(layerPath, psdData);
    if (!layer?.canvas) {
      console.warn(`Missing layer: ${layerPath}`);
      return;
    }

    ctx.save();
    ctx.translate(layer.left, layer.top);
    
    if (layer.blendMode) {
      ctx.globalCompositeOperation = convertBlendMode(layer.blendMode);
    }

    if (layerPath.includes('[белок красить]')) {
      renderColorLayer(ctx, layer, character.colors.eyesWhite);
    } 
    else if (layerPath.includes('[красить]')) {
      const color = character.partColors[partName] || character.colors.main;
      renderColorLayer(ctx, layer, color);
    } 
    else if (shouldClipLayer(layer.name)) {
      const colorLayer = variant.layers.find(l => l.includes('[красить]'));
      if (colorLayer) {
        const clipLayer = findLayerInPSD(colorLayer, psdData);
        if (clipLayer) renderClippedLayer(ctx, layer, clipLayer);
      } else {
        ctx.drawImage(layer.canvas, 0, 0);
      }
    } 
    else {
      ctx.drawImage(layer.canvas, 0, 0);
    }
    
    ctx.restore();
  });

  // Обработка подтипов глаз
  if (partName === 'eyes' && character.eyes?.type === 'обычные' && character.eyes?.subtype) {
    const subtypeLayerPath = `Глаза/обычные/${character.eyes.subtype}`;
    const subtypeLayer = findLayerInPSD(subtypeLayerPath, psdData);
    
    if (subtypeLayer?.canvas) {
      ctx.save();
      ctx.translate(subtypeLayer.left, subtypeLayer.top);
      
      if (shouldClipLayer(subtypeLayer.name)) {
        const colorLayerPath = variant.layers.find(l => l.includes('[красить]'));
        if (colorLayerPath) {
          const colorLayer = findLayerInPSD(colorLayerPath, psdData);
          if (colorLayer) renderClippedLayer(ctx, subtypeLayer, colorLayer);
        } else {
          ctx.drawImage(subtypeLayer.canvas, 0, 0);
        }
      } else {
        ctx.drawImage(subtypeLayer.canvas, 0, 0);
      }
      
      ctx.restore();
    }
  }
}

// Остальные вспомогательные функции остаются без изменений
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

function shouldClipLayer(layerName) {
  return ['свет', 'тень', 'свет2', 'блики'].includes(layerName);
}

function renderClippedLayer(ctx, layer, clipLayer) {
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = Math.max(layer.canvas.width, clipLayer.canvas.width);
  tempCanvas.height = Math.max(layer.canvas.height, clipLayer.canvas.height);
  const tempCtx = tempCanvas.getContext('2d');
  
  tempCtx.drawImage(clipLayer.canvas, clipLayer.left - layer.left, clipLayer.top - layer.top);
  tempCtx.globalCompositeOperation = 'source-in';
  tempCtx.globalAlpha = layer.opacity !== undefined ? layer.opacity : 1;
  tempCtx.drawImage(layer.canvas, 0, 0);
  ctx.drawImage(tempCanvas, 0, 0);
}

function renderColorLayer(ctx, layer, color) {
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = layer.canvas.width;
  tempCanvas.height = layer.canvas.height;
  const tempCtx = tempCanvas.getContext('2d');
  
  tempCtx.drawImage(layer.canvas, 0, 0);
  tempCtx.globalCompositeOperation = 'source-atop';
  tempCtx.fillStyle = color;
  tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
  ctx.drawImage(tempCanvas, 0, 0);
}

function convertBlendMode(psdBlendMode) {
  const modes = {
    'normal': 'source-over',
    'multiply': 'multiply',
    'screen': 'screen',
    'overlay': 'overlay',
    'darken': 'darken',
    'lighten': 'lighten'
  };
  return modes[psdBlendMode.toLowerCase()] || 'source-over';
}

function findLayerInPSD(layerPath, psdData) {
  if (!layerPath || !psdData) {
    console.warn('Invalid parameters:', { layerPath, psdData });
    return null;
  }
  
  const parts = layerPath.split('/');
  let current = psdData;

  console.log('Searching for layer:', layerPath); // Добавлено
  
  for (const part of parts) {
    if (!current[part]) {
      console.warn('Missing part in path:', { 
        part, 
        current: Object.keys(current),
        fullPath: layerPath 
      });
      return null;
    }
    current = current[part];
  }

  if (!current.canvas) {
    console.warn('Found layer but missing canvas:', current);
  }

  return current;
}
