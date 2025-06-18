import * as PSD from 'ag-psd';

// Основная функция рендеринга
export function renderCharacter(canvas, psdData, character) {
  if (!psdData || !character) return;

  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const partsOrder = [
    'tail',
    'body', 
    'mane',
    'head',
    'cheeks',
    'eyes',
    'ears'
  ];

  partsOrder.forEach(part => {
    if (part === 'cheeks' && character.cheeks === 'нет') return;
    renderPart(part, ctx, psdData, character);
  });
}

// Вспомогательные функции
function renderPart(currentPartName, ctx, psdData, character) {
  const partGroup = psdData[currentPartName];
  if (!partGroup) return;

  let variantName;
  let variantLayers;
  
  if (currentPartName === 'head') {
    variantLayers = Array.isArray(partGroup) ? partGroup : [];
  } else {
    switch (currentPartName) {
      case 'ears': variantName = character.ears || 'торчком обычные'; break;
      case 'eyes': variantName = character.eyes?.type || 'обычные'; break;
      case 'mane': variantName = character.mane || 'обычная'; break;
      case 'body': variantName = character.body || 'v1'; break;
      case 'tail': variantName = character.tail || 'обычный'; break;
      case 'cheeks': variantName = 'пушистые'; break;
      default: variantName = 'default';
    }
    
    if (currentPartName === 'eyes') {
      const eyeData = partGroup[variantName];
      if (eyeData?.base) {
        eyeData.base.forEach(layer => renderLayer(ctx, layer, currentPartName, character));
        
        if (variantName === 'обычные' && eyeData.subtypes) {
          const subtype = character.eyes?.subtype;
          const subtypeKey = subtype === 'с ресницами' ? 'с ресницами' : 'без ресниц';
          const subtypeLayer = eyeData.subtypes[subtypeKey];
          if (subtypeLayer) renderLayer(ctx, subtypeLayer, currentPartName, character);
        }
      }
      return;
    }
    
    variantLayers = partGroup[variantName] || [];
  }

  variantLayers.forEach(layer => renderLayer(ctx, layer, currentPartName, character));
}

function renderLayer(ctx, layer, partName, character) {
  if (!layer.canvas) return;
  
  ctx.save();
  ctx.translate(layer.left, layer.top);
  
  if (layer.blendMode) {
    ctx.globalCompositeOperation = convertBlendMode(layer.blendMode);
  }
  
  if (layer.name.includes('[белок красить]')) {
    renderColorLayer(ctx, layer, character.colors?.eyesWhite || '#ffffff');
  } 
  else if (layer.name.includes('[красить]')) {
    const color = character.partColors?.[partName] || character.colors?.main || '#f1ece4';
    renderColorLayer(ctx, layer, color);
  }
  else if (shouldClipLayer(layer.name)) {
    const colorLayer = variantLayers?.find(l => l.name.includes('[красить]'));
    if (colorLayer) renderClippedLayer(ctx, layer, colorLayer);
    else ctx.drawImage(layer.canvas, 0, 0);
  }
  else {
    ctx.drawImage(layer.canvas, 0, 0);
  }
  
  ctx.restore();
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
  
  if (layer.opacity !== undefined && layer.opacity < 1) {
    tempCtx.globalAlpha = layer.opacity;
  }
  
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
