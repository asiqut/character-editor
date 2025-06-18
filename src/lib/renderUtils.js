// Соответствие blend-режимов Photoshop и Canvas
const BLEND_MODES = {
  'normal': 'source-over',
  'multiply': 'multiply',
  'screen': 'screen',
  'overlay': 'overlay',
  'darken': 'darken',
  'lighten': 'lighten',
  'color-dodge': 'color-dodge',
  'color-burn': 'color-burn',
  'hard-light': 'hard-light',
  'soft-light': 'soft-light',
  'difference': 'difference',
  'exclusion': 'exclusion',
  'hue': 'hue',
  'saturation': 'saturation',
  'color': 'color',
  'luminosity': 'luminosity'
};

export function renderCharacter(canvas, psdData, character, renderOrder) {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    console.error('Canvas context не доступен');
    return;
  }

  // Очистка canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Рендерим части в указанном порядке
  renderOrder.forEach(partId => {
    if (shouldRenderPart(partId, character)) {
      renderPart(ctx, psdData, character, partId);
    }
  });
}

/**
 * Проверяет, нужно ли рендерить часть
 */
function shouldRenderPart(partId, character) {
  // Всегда рендерим голову и зависмые элементы (ресницы)
  if (partId === 'head' || partId === 'lashes') return true;
  
  // Не рендерим отключенные щеки
  if (partId === 'cheeks' && character.cheeks === 'нет') return false;
  
  return true;
}

/**
 * Рендерит конкретную часть персонажа
 */
function renderPart(ctx, psdData, character, partId) {
  const partData = psdData[partId];
  if (!partData) {
    console.warn(`Часть ${partId} не найдена в PSD данных`);
    return;
  }

  // Специальная обработка головы
  if (partId === 'head') {
    renderLayers(ctx, partData, 'head');
    return;
  }

  // Специальная обработка глаз (с подтипами)
  if (partId === 'eyes') {
    renderEyes(ctx, psdData, character);
    return;
  }

  // Специальная обработка ресниц
  if (partId === 'lashes') {
    renderLashes(ctx, psdData, character);
    return;
  }

  // Стандартная обработка частей
  const variant = getCurrentVariant(partId, character);
  if (partData[variant]) {
    renderLayers(ctx, partData[variant], partId, character);
  }
}

/**
 * Рендерит слои с учетом цветов и режимов наложения
 */
function renderLayers(ctx, layers, partId, character) {
  if (!layers?.length) return;

  layers.forEach(layer => {
    if (!layer.visible || !layer.canvas) return;

    ctx.save();
    
    // Позиционирование
    ctx.translate(layer.left, layer.top);

    // Blend mode
    if (layer.blendMode && BLEND_MODES[layer.blendMode]) {
      ctx.globalCompositeOperation = BLEND_MODES[layer.blendMode];
    }

    // Прозрачность
    if (layer.opacity < 1) {
      ctx.globalAlpha = layer.opacity;
    }

    // Обработка клиппинг-масок
    if (layer.clipping) {
      renderClippedLayer(ctx, layer, layers, partId, character);
    } else {
      renderStandardLayer(ctx, layer, partId, character);
    }

    ctx.restore();
  });
}

/**
 * Рендерит обычный слой (без клиппинга)
 */
function renderStandardLayer(ctx, layer, partId, character) {
  // Если слой помечен для покраски
  if (layer.tags?.includes('красить')) {
    const color = getColorForPart(partId, character);
    renderColoredLayer(ctx, layer, color);
  } 
  // Особый случай для белков глаз
  else if (layer.tags?.includes('белок красить')) {
    renderColoredLayer(ctx, layer, character.colors.eyesWhite);
  } 
  // Обычный слой
  else {
    ctx.drawImage(layer.canvas, 0, 0);
  }
}

/**
 * Рендерит слой с клиппинг-маской
 */
function renderClippedLayer(ctx, layer, allLayers, partId, character) {
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = layer.canvas.width;
  tempCanvas.height = layer.canvas.height;
  const tempCtx = tempCanvas.getContext('2d');

  // 1. Находим базовый слой для клиппинга (обычно [красить])
  const baseLayer = allLayers.find(l => l.tags?.includes('красить'));
  
  // 2. Рендерим базовый слой
  if (baseLayer?.canvas) {
    const color = getColorForPart(partId, character);
    renderColoredLayer(tempCtx, baseLayer, color);
  }

  // 3. Применяем клиппинг
  tempCtx.globalCompositeOperation = 'source-in';
  tempCtx.drawImage(layer.canvas, 0, 
