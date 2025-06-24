import { getLayersForPart, resolveLayerPath } from './layerResolver';
import { RENDER_ORDER } from './defaultConfig';

export function renderCharacter(canvas, psdData, character) {
  if (!psdData || !character) return;

  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  RENDER_ORDER.forEach(part => {
    if (part === 'cheeks' && character.cheeks === 'нет') return;
    renderPart(part, ctx, psdData, character);
  });
}

function renderPart(part, ctx, psdData, character) {
  // Получаем вариант и подтип
  let variant, subtype;
  switch (part) {
    case 'ears': variant = character.ears; break;
    case 'eyes': 
      variant = character.eyes?.type;
      subtype = character.eyes?.subtype;
      break;
    case 'cheeks': variant = character.cheeks; break;
    case 'mane': variant = character.mane; break;
    case 'body': variant = character.body; break;
    case 'tail': variant = character.tail; break;
    default: variant = 'default';
  }

  // Получаем слои из КОНФИГУРАЦИИ
  const layerNames = getLayersForPart(part, variant, subtype);
  
  // Рендерим каждый слой в правильном порядке
  layerNames.forEach(layerName => {
    // Получаем полный путь к слою
    const fullPath = resolveLayerPath(part, variant, layerName);
    
    // Находим слой в PSD данных
    const layer = findLayerByPath(psdData, fullPath);
    if (!layer || !layer.canvas) return;
    
    ctx.save();
    ctx.translate(layer.left, layer.top);
    
    if (layer.blendMode) {
      ctx.globalCompositeOperation = convertBlendMode(layer.blendMode);
    }
    
    // Обработка цвета
    if (layerName.includes('[белок красить]')) {
      const eyeWhiteColor = character.colors?.eyesWhite || '#ffffff';
      renderColorLayer(ctx, layer, eyeWhiteColor);
    } else if (layerName.includes('[красить]')) {
      const partColor = character.partColors?.[part] || character.colors?.main || '#f1ece4';
      renderColorLayer(ctx, layer, partColor);
    } else if (shouldClipLayer(layerName)) {
      // Находим базовый слой для клиппинга
      const baseLayerName = layerNames.find(name => 
        name.includes('[красить]') || name.includes('[белок красить]')
      );
      
      if (baseLayerName) {
        const basePath = resolveLayerPath(part, variant, baseLayerName);
        const baseLayer = findLayerByPath(psdData, basePath);
        if (baseLayer) renderClippedLayer(ctx, layer, baseLayer);
        else ctx.drawImage(layer.canvas, 0, 0);
      } else {
        ctx.drawImage(layer.canvas, 0, 0);
      }
    } else {
      ctx.drawImage(layer.canvas, 0, 0);
    }
    
    ctx.restore();
  });
}

// Вспомогательная функция для поиска слоя по пути
function findLayerByPath(psdData, fullPath) {
  for (const part in psdData) {
    if (part === 'head') {
      const layer = psdData[part].find(l => `${l.name}` === fullPath);
      if (layer) return layer;
    } else {
      for (const variant in psdData[part]) {
        const layer = psdData[part][variant].find(l => `${l.name}` === fullPath);
        if (layer) return layer;
      }
    }
  }
  return null;
}

// Остальные функции без изменений
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
