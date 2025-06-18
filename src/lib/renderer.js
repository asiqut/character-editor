export function renderCharacter(canvas, psdData, character) {
  if (!psdData || !character) return;

  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const partsOrder = [
    'tail',    // Хвост (нижний слой)
    'body',    // Тело
    'mane',    // Грива
    'head',    // Голова
    'cheeks',  // Щёки
    'eyes',    // Глаза
    'ears'     // Уши (верхний слой)
  ];

  partsOrder.forEach(part => {
    if (part === 'cheeks' && character.cheeks === 'нет') return;
    renderPart(part, ctx, psdData, character);
  });
}
  
function renderPart(currentPartName, ctx, psdData, character) {
  const partGroup = psdData[currentPartName];
  if (!partGroup) {
    console.warn(`Missing part group: ${currentPartName}`);
    return;
  }

  let variantName;
  let variantLayers;
  
  if (currentPartName === 'head') {
    variantLayers = Array.isArray(partGroup) ? partGroup : [];
  } 
  else {
    switch (currentPartName) {
      case 'ears': variantName = character.ears || 'торчком обычные'; break;
      case 'eyes': variantName = character.eyes?.type || 'обычные'; break;
      case 'mane': variantName = character.mane || 'обычная'; break;
      case 'body': variantName = character.body || 'v1'; break;
      case 'tail': variantName = character.tail || 'обычный'; break;
      case 'cheeks': variantName = 'пушистые'; break;
      default: variantName = 'default';
    }
    variantLayers = partGroup[variantName] || [];
  }

  variantLayers.forEach(layer => {
    if (!layer.canvas || ['с ресницами', 'без ресниц'].includes(layer.name)) return;
    
    ctx.save();
    ctx.translate(layer.left, layer.top);
    
    if (layer.blendMode) {
      ctx.globalCompositeOperation = convertBlendMode(layer.blendMode);
    }
    
    if (layer.name.includes('[белок красить]')) {
      const eyeWhiteColor = character.colors?.eyesWhite || '#ffffff';
      renderColorLayer(ctx, layer, eyeWhiteColor);
    }
    else if (layer.name.includes('[красить]')) {
      const partColor = character.partColors?.[currentPartName] || character.colors?.main || '#f1ece4';
      renderColorLayer(ctx, layer, partColor);
    }
    else if (shouldClipLayer(layer.name)) {
      const colorLayer = variantLayers.find(l => l.name.includes('[красить]'));
      if (colorLayer) {
        renderClippedLayer(ctx, layer, colorLayer);
      } else {
        ctx.drawImage(layer.canvas, 0, 0);
      }
    }
    else {
      ctx.drawImage(layer.canvas, 0, 0);
    }
    
    ctx.restore();
  });

  if (currentPartName === 'eyes' && variantName === 'обычные') {
    const lashesVariant = character.eyes?.subtype;
    const lashesLayer = (psdData.eyes?.ordinary_lashes || []).find(
      l => l.name === lashesVariant
    );
    
    if (lashesLayer?.canvas) {
      ctx.save();
      ctx.translate(lashesLayer.left, lashesLayer.top);
      ctx.drawImage(lashesLayer.canvas, 0, 0);
      ctx.restore();
    }
  }
}

// Move these helper functions outside of renderPart
function shouldClipLayer(layerName) {
  return ['свет', 'тень', 'свет2', 'блики'].includes(layerName);
}

function renderClippedLayer(ctx, layer, clipLayer) {
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = Math.max(layer.canvas.width, clipLayer.canvas.width);
  tempCanvas.height = Math.max(layer.canvas.height, clipLayer.canvas.height);
  const tempCtx = tempCanvas.getContext('2d');
  
  tempCtx.drawImage(clipLayer.canvas, 
    clipLayer.left - layer.left, 
    clipLayer.top - layer.top
  );
  
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
