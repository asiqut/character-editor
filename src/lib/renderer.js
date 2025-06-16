// src/lib/renderer.js
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

  partsOrder.forEach(currentPartName => {
    if (currentPartName === 'cheeks' && character.cheeks === 'нет') return;
    renderPart(currentPartName, ctx, psdData, character);
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
    variantLayers = partGroup[variantName] || [];
  }

  // Находим слой для клиппинга ([красить])
  const colorLayer = variantLayers.find(l => l.name.includes('[красить]'));

  // Сначала рендерим все обычные слои (кроме подтипов глаз)
  variantLayers.forEach(layer => {
    if (!layer.canvas || 
        layer.name.includes('[красить]') || 
        (currentPartName === 'eyes' && (layer.name === 'с ресницами' || layer.name === 'без ресниц'))) {
      return;
    }
    
    ctx.save();
    ctx.translate(layer.left, layer.top);
    
    if (layer.opacity !== undefined) {
      ctx.globalAlpha = layer.opacity;
    }
    
    if (layer.blendMode) {
      ctx.globalCompositeOperation = convertBlendMode(layer.blendMode);
    }
    
    if (shouldClipLayer(layer.name) && colorLayer) {
      renderClippedLayer(ctx, layer, colorLayer);
    } else {
      ctx.drawImage(layer.canvas, 0, 0);
    }
    
    ctx.restore();
  });

  // Затем рендерим слой покраски
  const paintLayer = variantLayers.find(l => l.name.includes('[красить]'));
  if (paintLayer?.canvas) {
    ctx.save();
    ctx.translate(paintLayer.left, paintLayer.top);
    
    let colorToUse;
    if (paintLayer.name.includes('[белок красить]')) {
      colorToUse = character.colors?.eyesWhite || '#ffffff';
    } else if (character.partColors?.[currentPartName]) {
      colorToUse = character.partColors[currentPartName];
    } else {
      colorToUse = character.colors?.main || '#f1ece4';
    }
    
    renderColorLayer(ctx, paintLayer, colorToUse);
    ctx.restore();
  }

  // Особый случай для глаз (подтипы)
  if (currentPartName === 'eyes' && variantName === 'обычные') {
    const subtype = character.eyes?.subtype || 'с ресницами';
    const subtypeLayer = variantLayers.find(l => l.name === subtype);
    
    if (subtypeLayer?.canvas) {
      ctx.save();
      ctx.translate(subtypeLayer.left, subtypeLayer.top);
      
      if (subtypeLayer.opacity !== undefined) {
        ctx.globalAlpha = subtypeLayer.opacity;
      }
      
      if (shouldClipLayer(subtypeLayer.name) && colorLayer) {
        renderClippedLayer(ctx, subtypeLayer, colorLayer);
      } else {
        ctx.drawImage(subtypeLayer.canvas, 0, 0);
      }
      
      ctx.restore();
    }
  }
}

function shouldClipLayer(layerName) {
  const clipLayers = ['свет', 'тень', 'свет2', 'блики'];
  return clipLayers.some(name => layerName.includes(name));
}

function renderClippedLayer(ctx, layer, clipLayer) {
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = Math.max(layer.canvas.width, clipLayer.canvas.width);
  tempCanvas.height = Math.max(layer.canvas.height, clipLayer.canvas.height);
  const tempCtx = tempCanvas.getContext('2d');
  
  // Рендерим слой клиппинга
  tempCtx.drawImage(clipLayer.canvas, 
    clipLayer.left - layer.left, 
    clipLayer.top - layer.top
  );
  
  // Применяем клиппинг
  tempCtx.globalCompositeOperation = 'source-in';
  
  // Сохраняем прозрачность исходного слоя
  if (layer.opacity !== undefined) {
    tempCtx.globalAlpha = layer.opacity;
  }
  
  tempCtx.drawImage(layer.canvas, 0, 0);
  
  // Рендерим результат
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
    'lighten': 'lighten',
    'linear dodge': 'lighter'
  };
  return modes[psdBlendMode.toLowerCase()] || 'source-over';
}
