export function renderCharacter(canvas, psdData, character) {
  if (!psdData || !character) return;

  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Порядок рендеринга частей (от задних к передним)
  const partsOrder = [
    'tail',    // Хвост
    'body',    // Тело
    'mane',    // Грива
    'head',    // Голова
    'cheeks',  // Щёки
    'eyes',    // Глаза
    'ears'     // Уши
  ];

  partsOrder.forEach(partName => {
    if (partName === 'cheeks' && character.cheeks === 'нет') return;
    renderPart(partName, ctx, psdData, character);
  });
}

function findLayerInPsd(layerPath, psdData) {
  if (!layerPath) return null;
  
  const parts = layerPath.split('/');
  let current = psdData;
  
  for (const part of parts) {
    if (!current[part]) return null;
    current = current[part];
  }
  
  return current;
}

function renderPart(partName, ctx, psdData, character) {
  const partConfig = PARTS_STRUCTURE[partName];
  if (!partConfig) {
    console.warn(`Missing config for part: ${partName}`);
    return;
  }

  // Для головы (single variant)
  if (partConfig.isSingleVariant) {
    partConfig.layers.forEach(layerPath => {
      const layer = findLayerInPsd(layerPath, psdData);
      if (layer) renderLayer(ctx, layer, partName, character);
    });
    return;
  }

  // Для частей с вариантами
  const variantName = getCharacterVariant(partName, character);
  const variantConfig = partConfig.variants[variantName];
  if (!variantConfig) {
    console.warn(`Missing variant ${variantName} for part ${partName}`);
    return;
  }

  // Рендерим основные слои варианта
  variantConfig.layers.forEach(layerPath => {
    const layer = findLayerInPsd(layerPath, psdData);
    if (layer) renderLayer(ctx, layer, partName, character);
  });

  // Обработка подтипов (для глаз)
  if (partName === 'eyes' && variantName === 'обычные') {
    const subtype = character.eyes.subtype;
    const subtypeLayerPath = variantConfig.subtypes[subtype][0];
    const subtypeLayer = findLayerInPsd(subtypeLayerPath, psdData);
    if (subtypeLayer) renderLayer(ctx, subtypeLayer, partName, character);
  }
}

function getCharacterVariant(partName, character) {
  switch(partName) {
    case 'eyes': return character.eyes.type;
    default: return character[partName];
  }
}

function renderLayer(ctx, layer, partName, character) {
  if (!layer.canvas) return;
  
  ctx.save();
  ctx.translate(layer.left, layer.top);
  
  if (layer.blendMode) {
    ctx.globalCompositeOperation = convertBlendMode(layer.blendMode);
  }

  // Определяем цвет для слоёв с маркерами
  if (layer.name.includes('[белок красить]')) {
    const color = character.colors?.eyesWhite || '#ffffff';
    renderColorLayer(ctx, layer, color);
  }
  else if (layer.name.includes('[красить]')) {
    const color = character.partColors?.[partName] || character.colors?.main || '#f1ece4';
    renderColorLayer(ctx, layer, color);
  }
  // Слои с клиппингом
  else if (shouldClipLayer(layer.name)) {
    const colorLayer = findColorLayerForClipping(layer, partName, psdData);
    if (colorLayer) {
      renderClippedLayer(ctx, layer, colorLayer);
    } else {
      ctx.drawImage(layer.canvas, 0, 0);
    }
  }
  // Обычные слои
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
