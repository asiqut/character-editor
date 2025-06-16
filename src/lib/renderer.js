export function renderCharacter(canvas, psdData, character) {
  if (!psdData || !character) return;

  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Используем сохраненный порядок из PSD или стандартный, если его нет
  const partsOrder = psdData._order || [
    'ears', 'eyes', 'cheeks', 'head', 'mane', 'body', 'tail'
  ];

  partsOrder.forEach(partName => {
    if (partName.startsWith('_')) return;
    if (partName === 'cheeks' && character.cheeks === 'нет') return;
    
    renderPart(partName, ctx, psdData, character);
  });
}

function renderPart(partName, ctx, psdData, character) {
  const partGroup = psdData[partName];
  if (!partGroup) {
    console.warn(`Part group not found: ${partName}`);
    return;
  }

  let variantName;
  switch (partName) {
    case 'ears':
      variantName = character.ears || 'торчком обычные';
      break;
    case 'eyes':
      variantName = character.eyes?.type || 'обычные';
      break;
    case 'mane':
      variantName = character.mane || 'обычная';
      break;
    case 'body':
      variantName = character.body || 'v1';
      break;
    case 'tail':
      variantName = character.tail || 'обычный';
      break;
    case 'cheeks':
      variantName = character.cheeks === 'нет' ? null : 'пушистые';
      break;
    case 'head':
      variantName = 'default';
      break;
    default:
      variantName = 'default';
  }

  if (!variantName) return;

  const variantLayers = partGroup[variantName] || [];
  
  // Обработка слоя покраски
  const colorLayer = variantLayers.find(l => l.name.includes('[красить]'));
  
  variantLayers.forEach(layer => {
    if (!layer.canvas) return;
    
    ctx.save();
    ctx.translate(layer.left, layer.top);
    
    if (layer.blendMode) {
      ctx.globalCompositeOperation = convertBlendMode(layer.blendMode);
    }
    
    // Если это слой покраски
    if (layer.name.includes('[красить]')) {
      renderColorLayer(ctx, layer, character.colors?.main || '#f1ece4');
    } 
    // Обычный слой
    else {
      ctx.drawImage(layer.canvas, 0, 0);
    }
    
    ctx.restore();
  });

  // Особый случай для глаз (подтипы)
  if (partName === 'eyes' && variantName === 'обычные') {
    const subtype = character.eyes?.subtype || 'с ресницами';
    const subtypeLayer = variantLayers.find(l => l.name === subtype);
    
    if (subtypeLayer?.canvas) {
      ctx.save();
      ctx.translate(subtypeLayer.left, subtypeLayer.top);
      ctx.drawImage(subtypeLayer.canvas, 0, 0);
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
