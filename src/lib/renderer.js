export function renderCharacter(canvas, psdData, character) {
  if (!psdData || !character) return;

  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const partsOrder = [
    'tail',    // Хвост (самый нижний)
    'body',    // Тело
    'mane',    // Грива/шея
    'head',    // Голова
    'cheeks',  // Щёки
    'eyes',    // Глаза
    'ears'     // Уши (самый верхний)
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
  
  // Сортируем слои для правильного порядка рендеринга
  const sortedLayers = [...variantLayers].sort((a, b) => {
    // Сначала [красить], затем остальные
    if (a.name.includes('[красить]')) return -1;
    if (b.name.includes('[красить]')) return 1;
    return 0;
  });

  sortedLayers.forEach(layer => {
    if (!layer.canvas) return;
    
    ctx.save();
    ctx.translate(layer.left, layer.top);
    
    // Устанавливаем прозрачность
    if (layer.opacity !== undefined) {
      ctx.globalAlpha = layer.opacity;
    }
    
    // Устанавливаем режим наложения
    if (layer.blendMode) {
      ctx.globalCompositeOperation = convertBlendMode(layer.blendMode);
    }
    
    // Обработка слоя покраски
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
    // Обработка слоёв, требующих клиппинга (тень, свет и т.д.)
    else if (shouldClipLayer(layer.name) && colorLayer) {
      renderClippedLayer(ctx, layer, colorLayer);
    }
    // Обычные слои (лайн и другие)
    else {
      ctx.drawImage(layer.canvas, 0, 0);
    }
    
    ctx.restore();
  });

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
      
      // Для подтипов глаз также применяем клиппинг если нужно
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
  const clipLayers = ['свет', 'тень', 'свет2', 'блики', 'с ресницами', 'без ресниц'];
  return clipLayers.includes(layerName);
}

function renderClippedLayer(ctx, layer, clipLayer) {
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = Math.max(layer.canvas.width, clipLayer.canvas.width);
  tempCanvas.height = Math.max(layer.canvas.height, clipLayer.canvas.height);
  const tempCtx = tempCanvas.getContext('2d');
  
  // Сохраняем прозрачность
  if (layer.opacity !== undefined) {
    tempCtx.globalAlpha = layer.opacity;
  }
  
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
    'lighten': 'lighten',
    'linear dodge': 'lighter',
    'color dodge': 'color-dodge',
    'linear burn': 'darken',
    'color burn': 'color-burn',
    'hard light': 'hard-light',
    'soft light': 'soft-light'
  };
  return modes[psdBlendMode.toLowerCase()] || 'source-over';
}
