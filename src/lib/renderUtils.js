/**
 * Рендерит персонажа на canvas
 * @param {HTMLCanvasElement} canvas - Целевой canvas
 * @param {Object} psdData - Данные PSD
 * @param {Object} character - Текущий персонаж
 * @param {Array} renderOrder - Порядок рендеринга частей
 */
export function renderCharacter(canvas, psdData, character, renderOrder) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Очистка canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Рендерим части в указанном порядке
    renderOrder.forEach(partId => {
        renderPart(ctx, psdData, character, partId);
    });
}

/**
 * Рендерит конкретную часть персонажа
 * @param {CanvasRenderingContext2D} ctx - Контекст canvas
 * @param {Object} psdData - Данные PSD
 * @param {Object} character - Текущий персонаж
 * @param {string} partId - ID части (ears, eyes и т.д.)
 */
function renderPart(ctx, psdData, character, partId) {
    // Пропускаем отключенные части (кроме зависмых, которые обрабатываются отдельно)
    if (character[partId] === 'нет' && !['lashes'].includes(partId)) return;

    // Особый случай для ресниц
    if (partId === 'lashes') {
        if (character.eyes.type !== 'обычные') return;
        renderLayers(ctx, psdData.lashes[character.lashes]);
        return;
    }

    // Особый случай для глаз (подтипы)
    if (partId === 'eyes') {
        const eyeType = character.eyes.type;
        const layers = psdData.eyes[eyeType];
        renderLayers(ctx, layers);

        // Рендерим подтип, если есть
        if (eyeType === 'обычные' && character.eyes.subtype) {
            const subtypeLayer = psdData.lashes[character.eyes.subtype];
            if (subtypeLayer) renderLayers(ctx, subtypeLayer);
        }
        return;
    }

    // Стандартный рендеринг части
    const variant = character[partId];
    if (psdData[partId] && psdData[partId][variant]) {
        renderLayers(ctx, psdData[partId][variant]);
    }
}

/**
 * Рендерит набор слоев
 * @param {CanvasRenderingContext2D} ctx - Контекст canvas
 * @param {Array} layers - Массив слоев для рендеринга
 */
function renderLayers(ctx, layers) {
    if (!layers) return;

    layers.forEach(layer => {
        if (!layer.canvas || !layer.visible) return;

        ctx.save();
        ctx.translate(layer.left, layer.top);

        // Применяем blending mode, если указан
        if (layer.blendMode) {
            ctx.globalCompositeOperation = convertBlendMode(layer.blendMode);
        }

        // Применяем opacity
        if (layer.opacity !== undefined && layer.opacity < 1) {
            ctx.globalAlpha = layer.opacity;
        }

        // Рендерим слой
        ctx.drawImage(layer.canvas, 0, 0);
        ctx.restore();
    });
}

/**
 * Конвертирует blend mode из PSD в canvas
 * @param {string} psdBlendMode - Blend mode из PSD
 * @returns {string} - Blend mode для canvas
 */
function convertBlendMode(psdBlendMode) {
    const blendModes = {
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
        'exclusion': 'exclusion'
    };
    return blendModes[psdBlendMode.toLowerCase()] || 'source-over';
}

/**
 * Применяет цвет к слою
 * @param {CanvasRenderingContext2D} ctx - Контекст canvas
 * @param {Object} layer - Слой для покраски
 * @param {string} color - Цвет в формате HEX
 */
export function applyColorToLayer(ctx, layer, color) {
    if (!layer.canvas) return;

    ctx.save();
    ctx.translate(layer.left, layer.top);

    // Создаем временный canvas для покраски
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = layer.canvas.width;
    tempCanvas.height = layer.canvas.height;
    const tempCtx = tempCanvas.getContext('2d');

    // Рендерим оригинальный слой
    tempCtx.drawImage(layer.canvas, 0, 0);

    // Применяем цвет
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, layer.canvas.width, layer.canvas.height);
    ctx.globalCompositeOperation = 'source-atop';
    ctx.drawImage(tempCanvas, 0, 0);

    ctx.restore();
}
