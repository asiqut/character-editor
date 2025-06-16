export function renderCharacter(canvas, psdData, character) {
  if (!psdData || !character) return;

  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Порядок отрисовки частей (снизу вверх)
  const partsOrder = [
    'Тело', 'Хвосты', 'Грудь/шея/грива', 
    'Голова', 'Уши', 'Щёки', 'Глаза'
  ];

  partsOrder.forEach(partName => {
    renderPart(partName, ctx, psdData, character);
  });
}

function renderPart(partName, ctx, psdData, character) {
  const partGroup = psdData[partName];
  if (!partGroup) {
    console.warn(`Part group not found: ${partName}`);
    return;
  }

  // Определяем вариант для каждой части
  let variantName;
  switch (partName) {
    case 'Уши':
      variantName = character.ears || 'торчком обычные';
      break;
    case 'Глаза':
      variantName = character.eyes?.type || 'обычные';
      break;
    case 'Грудь/шея/грива':
      variantName = character.mane || 'обычная';
      break;
    case 'Тело':
      variantName = character.body || 'v1';
      break;
    case 'Хвосты':
      variantName = character.tail || 'обычный';
      break;
    case 'Щёки':
      variantName = 'пушистые'; // Единственный вариант
      break;
    case 'Голова':
      variantName = 'default'; // Нет вариантов
      break;
    default:
      variantName = 'default';
  }

  const variantLayers = partGroup[variantName] || [];
  
  // Сначала находим слой для покраски (он будет маской)
  const paintLayer = variantLayers.find(l => l.name.includes('[красить]') || l.name.includes('[белок красить]'));
  
  variantLayers.forEach(layer => {
    if (!layer.canvas) return;
    
    ctx.save();
    ctx.translate(layer.left, layer.top);
    
    if (layer.blendMode) {
      ctx.globalCompositeOperation = convertBlendMode(layer.blendMode);
    }
    
    // Если слой требует клиппинга и есть слой для покраски
    if (layer.clipping && paintLayer) {
      renderClippedLayer(ctx, layer, paintLayer, character);
    } 
    // Особые случаи для слоев покраски
    else if (layer.name.includes('[красить]')) {
      renderColorLayer(ctx, layer, character.colors?.main || '#f1ece4');
    } else if (layer.name.includes('[белок красить]')) {
      renderColorLayer(ctx, layer, character.colors?.eyesWhite || '#ffffff');
    } else {
      ctx.drawImage(layer.canvas, 0, 0);
    }
    
    ctx.restore();
  });

  // Особый случай для глаз (подтипы)
  if (partName === 'Глаза' && variantName === 'обычные') {
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

function renderClippedLayer(ctx, layer, maskLayer, character) {
  // Создаем временный canvas для клиппинга
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = maskLayer.canvas.width;
  tempCanvas.height = maskLayer.canvas.height;
  const tempCtx = tempCanvas.getContext('2d');
  
  // 1. Рисуем маску (слой покраски)
  if (maskLayer.name.includes('[красить]')) {
    tempCtx.fillStyle = character.colors?.main || '#f1ece4';
  } else if (maskLayer.name.includes('[белок красить]')) {
    tempCtx.fillStyle = character.colors?.eyesWhite || '#ffffff';
  }
  tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
  
  // 2. Применяем compositing для обрезки
  tempCtx.globalCompositeOperation = 'source-in';
  
  // 3. Рисуем слой, который нужно обрезать
  tempCtx.drawImage(
    layer.canvas, 
    layer.left - maskLayer.left, 
    layer.top - maskLayer.top
  );
  
  // 4. Рисуем результат на основном canvas
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
    'colorDodge': 'color-dodge',
    'colorBurn': 'color-burn',
    'hardLight': 'hard-light',
    'softLight': 'soft-light',
    'difference': 'difference',
    'exclusion': 'exclusion'
  };
  return modes[psdBlendMode.toLowerCase()] || 'source-over';
}
