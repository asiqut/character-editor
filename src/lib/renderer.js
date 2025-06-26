import { PSD_CONFIG, DEFAULT_CHARACTER } from './defaultConfig';

// Основная функция рендеринга персонажа
// Принимает: canvas элемент, psdData (структурированные данные PSD), character (текущие настройки)
// Возвращает: ничего, рисует непосредственно на canvas
export function renderCharacter(canvas, psdData, character) {
  if (!psdData || !character) return;

  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Рендерим части в заданном порядке
  PSD_CONFIG.renderOrder.forEach(part => {
    if (part === 'cheeks' && character.cheeks === 'нет') return;
    renderPart(part, ctx, psdData, character);
  });
}

// Рендерит конкретную часть персонажа
// Принимает: 
//   - partCode (код части из PSD_CONFIG.groups)
//   - ctx (контекст canvas)
//   - psdData (данные PSD)
//   - character (текущие настройки персонажа)
function renderPart(partCode, ctx, psdData, character) {
  // Находим конфиг для текущей части
  const partConfig = Object.values(PSD_CONFIG.groups).find(
    group => group.code === partCode
  );
  
  if (!partConfig) {
    console.warn(`Missing config for part: ${partCode}`);
    return;
  }

  // Получаем данные части из PSD
  const partData = psdData[partCode];
  if (!partData) {
    console.warn(`No data for part: ${partCode}`);
    return;
  }

  let variantName;
  let variantLayers = [];

  // Обработка частей с единственным вариантом (например, голова)
  if (partConfig.isSingleVariant) {
    variantLayers = Array.isArray(partData) ? partData : [];
  } else {
    // Получаем текущий выбранный вариант
    variantName = partCode === 'eyes' ? character.eyes?.type : character[partCode];
    
    if (variantName && partData && partData[variantName]) {
      variantLayers = partData[variantName];
    } else {
      console.warn(`No variant '${variantName}' found for ${partCode}`);
      variantLayers = [];
    }
  }

  // Специальная обработка глаз
  if (partCode === 'eyes') {
    const eyeVariant = character.eyes?.type;
    renderEyes(ctx, variantLayers, character, eyeVariant);
    return;
  }

  // Получаем цвет для текущей части
  const partColor = character.partColors[partCode];
  if (!partColor) {
    console.warn(`No color defined for ${partCode}`);
    return;
  }

  // Рендерим каждый слой варианта
  variantLayers.forEach(layer => {
    if (!layer.canvas) return;
    
    ctx.save();
    if (typeof layer.left === 'number' && typeof layer.top === 'number') {
      ctx.translate(layer.left, layer.top);
    }
    
    if (layer.blendMode) {
      ctx.globalCompositeOperation = convertBlendMode(layer.blendMode);
    }

    // Обработка слоев для покраски
    if (layer.name.includes('[красить]')) {
      renderColorLayer(ctx, layer, partColor);
    } else if (shouldClipLayer(layer.name)) {
      // Обработка обтравочных масок
      const colorLayer = variantLayers.find(l => l.name.includes('[красить]'));
      if (colorLayer) renderClippedLayer(ctx, layer, colorLayer);
      else ctx.drawImage(layer.canvas, 0, 0);
    } else {
      // Обычный слой
      ctx.drawImage(layer.canvas, 0, 0);
    }
    
    ctx.restore();
  });
}

// Специальная функция рендеринга глаз
// Обрабатывает: 
//   - Основной цвет глаз
//   - Цвет белков
//   - Варианты ресниц
function renderEyes(ctx, layers, character, variantName) {
  if (!layers || !layers.length) return;

  if (!character.partColors?.eyes) {
    console.error('Eye color not defined!');
    return;
  }

  layers.forEach(layer => {
    if (!layer.canvas || layer.name === 'с ресницами' || layer.name === 'без ресниц') return;

    ctx.save();
    ctx.translate(layer.left || 0, layer.top || 0);
    
    if (layer.blendMode) {
      ctx.globalCompositeOperation = convertBlendMode(layer.blendMode);
    }

    // Обработка разных типов слоев глаз
    if (layer.name.includes('[белок красить]')) {
      renderColorLayer(ctx, layer, character.colors.eyesWhite);
    } 
    else if (layer.name.includes('[красить]')) {
      renderColorLayer(ctx, layer, character.partColors.eyes);
    }
    else if (shouldClipLayer(layer.name)) {
      const colorLayer = layers.find(l => l.name.includes('[красить]'));
      if (colorLayer) renderClippedLayer(ctx, layer, colorLayer);
      else ctx.drawImage(layer.canvas, 0, 0);
    } else {
      ctx.drawImage(layer.canvas, 0, 0);
    }
    
    ctx.restore();
  });

  // Обработка подтипов (ресниц)
  if (variantName === 'обычные') {
    const subtype = character.eyes?.subtype || 'с ресницами';
    const subtypeLayer = layers.find(l => l.name === subtype);
    
    if (subtypeLayer?.canvas) {
      ctx.save();
      ctx.translate(subtypeLayer.left || 0, subtypeLayer.top || 0);
      ctx.drawImage(subtypeLayer.canvas, 0, 0);
      ctx.restore();
    }
  }
}

// Проверяет, нужно ли применять обтравочную маску к слою
function shouldClipLayer(layerName) {
  return PSD_CONFIG.clippedLayers.includes(layerName);
}

// Рендерит слой с обтравочной маской
function renderClippedLayer(ctx, layer, clipLayer) {
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = Math.max(layer.canvas.width, clipLayer.canvas.width);
  tempCanvas.height = Math.max(layer.canvas.height, clipLayer.canvas.height);
  const tempCtx = tempCanvas.getContext('2d');
  
  tempCtx.drawImage(clipLayer.canvas, 
    (clipLayer.left || 0) - (layer.left || 0), 
    (clipLayer.top || 0) - (layer.top || 0)
  );
  
  tempCtx.globalCompositeOperation = 'source-in';

  if (layer.opacity !== undefined && layer.opacity < 1) {
    tempCtx.globalAlpha = layer.opacity;
  }
  
  tempCtx.drawImage(layer.canvas, 0, 0);
  ctx.drawImage(tempCanvas, 0, 0);
}

// Рендерит цветной слой (применяет выбранный цвет)
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

// Конвертирует blend mode из PSD в canvas
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
