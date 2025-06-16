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

  // Обработка глаз - особый случай для подтипов
  if (currentPartName === 'eyes' && variantName === 'обычные') {
    const eyesSubtype = character.eyes?.subtype || 'с ресницами';
    const colorLayer = variantLayers.find(l => l.name.includes('[красить]'));
    
    variantLayers.forEach(layer => {
      if (!layer.canvas) return;
      
      // Пропускаем слои ресниц в зависимости от выбранного подтипа
      if ((layer.name === 'с ресницами' && eyesSubtype === 'без ресниц') || 
          (layer.name === 'без ресниц' && eyesSubtype === 'с ресницами')) {
        return;
      }
      
      // Пропускаем технические слои ([красить], [белок красить]) - они обрабатываются отдельно
      if (layer.name.includes('[красить]') || layer.name.includes('[белок красить]')) {
        return;
      }
      
      ctx.save();
      ctx.translate(layer.left, layer.top);
      
      if (layer.opacity !== undefined && layer.opacity < 1) {
        ctx.globalAlpha = layer.opacity;
      }
      
      if (layer.blendMode) {
        ctx.globalCompositeOperation = convertBlendMode(layer.blendMode);
      }
      
      // Для обычных слоев глаз применяем клиппинг если нужно
      if (colorLayer && shouldClipLayer(layer.name)) {
        renderClippedLayer(ctx, layer, colorLayer);
      } else {
        ctx.drawImage(layer.canvas, 0, 0);
      }
      
      ctx.restore();
    });
    
    // Обрабатываем слои покраски отдельно
    variantLayers.forEach(layer => {
      if (!layer.canvas || 
          (!layer.name.includes('[красить]') && !layer.name.includes('[белок красить]'))) {
        return;
      }
      
      ctx.save();
      ctx.translate(layer.left, layer.top);
      
      if (layer.opacity !== undefined && layer.opacity < 1) {
        ctx.globalAlpha = layer.opacity;
      }
      
      let colorToUse;
      if (layer.name.includes('[белок красить]')) {
        colorToUse = character.colors?.eyesWhite || '#ffffff';
      } else if (character.partColors?.[currentPartName]) {
        colorToUse = character.partColors[currentPartName];
      } else {
        colorToUse = character.colors?.main || '#f1ece4';
      }
      
      renderColorLayer(ctx, layer, colorToUse);
      ctx.restore();
    });
    
    return;
  }

  // Остальной код для других частей остается без изменений
  const colorLayer = variantLayers.find(l => l.name.includes('[красить]'));
  
  variantLayers.forEach(layer => {
    if (!layer.canvas) return;
    
    ctx.save();
    ctx.translate(layer.left, layer.top);
    
    if (layer.opacity !== undefined && layer.opacity < 1) {
      ctx.globalAlpha = layer.opacity;
    }
    
    if (layer.blendMode) {
      ctx.globalCompositeOperation = convertBlendMode(layer.blendMode);
    }
    
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
    else if (colorLayer && shouldClipLayer(layer.name)) {
      renderClippedLayer(ctx, layer, colorLayer);
    }
    else {
      ctx.drawImage(layer.canvas, 0, 0);
    }
    
    ctx.restore();
  });
}

  // Особый случай для глаз (подтипы)
  if (currentPartName === 'eyes' && variantName === 'обычные') {
    const subtype = character.eyes?.subtype || 'с ресницами';
    const subtypeLayer = variantLayers.find(l => l.name === subtype);
    const colorLayer = variantLayers.find(l => l.name.includes('[красить]'));
  
    if (subtypeLayer?.canvas) {
      ctx.save();
      ctx.translate(subtypeLayer.left, subtypeLayer.top);
      
      // Для подтипов глаз также применяем клиппинг если нужно
      if (colorLayer && shouldClipLayer(subtypeLayer.name)) {
        renderClippedLayer(ctx, subtypeLayer, colorLayer);
      } else {
        ctx.drawImage(subtypeLayer.canvas, 0, 0);
      }
      
      ctx.restore();
    }
  }
}

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

  if (layer.opacity !== undefined && layer.opacity < 1) {
  tempCtx.globalAlpha = layer.opacity;
  }
  
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
