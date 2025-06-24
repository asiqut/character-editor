export function renderCharacter(canvas, psdData, character) {
  if (!psdData || !character) return;

  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Без масштабирования и смещения - точь-в-точь как в PSD
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
    
    // Получаем структуру части из конфига
    const partConfig = PARTS_STRUCTURE[part];
    if (!partConfig) return;
    
    // Определяем вариант
    let variantName;
    switch(part) {
      case 'eyes': variantName = character.eyes.type; break;
      case 'cheeks': variantName = character.cheeks; break;
      case 'mane': variantName = character.mane; break;
      case 'body': variantName = character.body; break;
      case 'tail': variantName = character.tail; break;
      case 'ears': variantName = character.ears; break;
      default: variantName = 'default';
    }
    
    // Получаем слои для варианта
    let layers = [];
    if (partConfig.isSingleVariant) {
      layers = partConfig.layers;
    } else {
      const variant = partConfig.variants[variantName];
      if (variant) layers = variant.layers;
    }
    
    // Рендерим каждый слой
    layers.forEach(layerPath => {
      const layer = findLayerByPath(psdData, layerPath);
      if (!layer) return;
      
      renderLayer(ctx, layer, character, part);
    });
    
    // Обработка подтипов для глаз
    if (part === 'eyes' && variantName === 'обычные') {
      const subtype = character.eyes.subtype;
      const subtypeLayerPath = partConfig.variants.обычные.subtypes[subtype][0];
      const subtypeLayer = findLayerByPath(psdData, subtypeLayerPath);
      
      if (subtypeLayer) {
        renderLayer(ctx, subtypeLayer, character, part);
      }
    }
  });
}

// Вспомогательная функция для поиска слоя по пути
function findLayerByPath(psdData, path) {
  const parts = path.split('/');
  let current = psdData;
  
  for (const part of parts) {
    if (!current[part]) return null;
    current = current[part];
  }
  
  return current;
}

// Универсальная функция рендеринга слоя
function renderLayer(ctx, layer, character, part) {
  ctx.save();
  ctx.translate(layer.left, layer.top);
  
  if (layer.blendMode) {
    ctx.globalCompositeOperation = convertBlendMode(layer.blendMode);
  }
  
  // Определяем цвет для слоя
  let color = null;
  if (layer.name.includes('[красить]')) {
    color = character.partColors?.[part] || character.colors?.main || '#f1ece4';
  } else if (layer.name.includes('[белок красить]')) {
    color = character.colors?.eyesWhite || '#ffffff';
  }
  
  // Рендерим слой с цветом если нужно
  if (color) {
    renderColorLayer(ctx, layer, color);
  } else {
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
