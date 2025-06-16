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
    variantLayers = partGroup[variantName] || [];
  }

  const colorLayer = variantLayers.find(l => l.name.includes('[красить]'));

  variantLayers.forEach(layer => {
    if (!layer.canvas) return;
    
    ctx.save();
    ctx.translate(layer.left, layer.top);
    
    if (layer.blendMode) {
      ctx.globalCompositeOperation = convertBlendMode(layer.blendMode);
    }
    
    // Применяем прозрачность
    const defaultOpacity = layer.opacity !== undefined ? layer.opacity / 100 : 1;
    const customOpacity = character.layerOpacities?.[currentPartName]?.[layer.name];
    ctx.globalAlpha = customOpacity !== undefined ? customOpacity : defaultOpacity;

    if (layer.name.includes('[красить]')) {
      let colorToUse;
      if (layer.name.includes('[белок красить]')) {
        colorToUse = character.colors?.eyesWhite || '#ffffff';
      } else if (character.partColors?.[currentPartName]) {
        colorToUse = character.partColors[currentPartName];
      } else {
        colorToUse = character.colors?.main || '#f1ece4';
      }
      renderColorLayer(ctx, layer, colorToUse);
    }
    else if (shouldClipLayer(layer.name) && colorLayer) {
      renderClippedLayer(ctx, layer, colorLayer);
    }
    else {
      ctx.drawImage(layer.canvas, 0, 0);
    }
    
    ctx.restore();
  });

  // Обработка подтипов глаз
  if (currentPartName === 'eyes' && variantName === 'обычные') {
    const subtype = character.eyes?.subtype || 'с ресницами';
    const subtypeLayer = variantLayers.find(l => l.name === subtype);
    
    if (subtypeLayer?.canvas) {
      ctx.save();
      ctx.translate(subtypeLayer.left, subtypeLayer.top);
      
      const defaultOpacity = subtypeLayer.opacity !== undefined ? subtypeLayer.opacity / 100 : 1;
      const customOpacity = character.layerOpacities?.eyes?.[subtypeLayer.name];
      ctx.globalAlpha = customOpacity !== undefined ? customOpacity : defaultOpacity;
      
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
  return ['свет', 'тень', 'свет2', 'блики', 'с ресницами', 'без ресниц'].includes(layerName);
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
    'lighten': 'lighten'
  };
  return modes[psdBlendMode.toLowerCase()] || 'source-over';
}
