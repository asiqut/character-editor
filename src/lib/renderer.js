import { PARTS, RENDER_ORDER, DEFAULT_CHARACTER } from './defaultConfig';

export function renderCharacter(canvas, psdData, character) {
  if (!psdData || !character) return;

  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Используем порядок рендеринга из конфига
  RENDER_ORDER.forEach(part => {
    if (part === 'cheeks' && character.cheeks === 'нет') return;
    renderPart(part, ctx, psdData, character);
  });
}

function renderPart(currentPartName, ctx, psdData, character) {
  const partGroup = psdData[currentPartName];
  if (!partGroup) {
    console.warn(`Missing part group: ${currentPartName}`);
    return;
  }

  const partConfig = PARTS[currentPartName];
  if (!partConfig) {
    console.warn(`No config for part: ${currentPartName}`);
    return;
  }

  let variantName;
  let variantLayers = [];
  
  if (partConfig.isSingleVariant) {
    // Обработка частей с одним вариантом (голова)
    variantLayers = Array.isArray(partGroup) ? partGroup : [];
  } else {
    // Определяем выбранный вариант
    switch (currentPartName) {
      case 'ears': variantName = character.ears; break;
      case 'eyes': variantName = character.eyes?.type; break;
      case 'cheeks': variantName = character.cheeks; break;
      case 'mane': variantName = character.mane; break;
      case 'body': variantName = character.body; break;
      case 'tail': variantName = character.tail; break;
      default: variantName = 'default';
    }
    
    // Получаем слои для выбранного варианта
    if (variantName && partGroup[variantName]) {
      variantLayers = partGroup[variantName];
    }
  }

  // Рендерим основные слои варианта
  variantLayers.forEach(layer => {
    if (!layer.canvas) return;
    
    // Пропускаем слои подтипов - они будут обработаны отдельно
    if (currentPartName === 'eyes' && variantName === 'обычные') {
      const subtypeLayerNames = Object.values(partConfig.variants['обычные'].subtypes)
        .flatMap(st => st.layers);
      
      if (subtypeLayerNames.includes(layer.name)) {
        return; // Пропускаем слой подтипа
      }
    }
    
    ctx.save();
    ctx.translate(layer.left, layer.top);
    
    if (layer.blendMode) {
      ctx.globalCompositeOperation = convertBlendMode(layer.blendMode);
    }
    
    // Обработка цвета
    if (layer.name.includes('[белок красить]')) {
      const eyeWhiteColor = character.colors?.eyesWhite || '#ffffff';
      renderColorLayer(ctx, layer, eyeWhiteColor);
    } else if (layer.name.includes('[красить]')) {
      const partColor = character.partColors?.[currentPartName] || character.colors?.main || '#f1ece4';
      renderColorLayer(ctx, layer, partColor);
    } else if (shouldClipLayer(layer.name)) {
      const colorLayer = variantLayers.find(l => 
        l.name.includes('[красить]') || l.name.includes('[белок красить]')
      );
      if (colorLayer) {
        renderClippedLayer(ctx, layer, colorLayer);
      } else {
        ctx.drawImage(layer.canvas, 0, 0);
      }
    } else {
      ctx.drawImage(layer.canvas, 0, 0);
    }
    
    ctx.restore();
  });

  // Обработка подтипов глаз
  if (currentPartName === 'eyes' && variantName === 'обычные') {
    const subtype = character.eyes?.subtype;
    if (subtype) {
      const subtypeLayers = partConfig.variants['обычные'].subtypes[subtype]?.layers || [];
      
      subtypeLayers.forEach(layerName => {
        const subtypeLayer = variantLayers.find(l => l.name === layerName);
        
        if (subtypeLayer?.canvas) {
          ctx.save();
          ctx.translate(subtypeLayer.left, subtypeLayer.top);
          
          if (shouldClipLayer(subtypeLayer.name)) {
            const colorLayer = variantLayers.find(l => 
              l.name.includes('[красить]') || l.name.includes('[белок красить]')
            );
            if (colorLayer) {
              renderClippedLayer(ctx, subtypeLayer, colorLayer);
            } else {
              ctx.drawImage(subtypeLayer.canvas, 0, 0);
            }
          } else {
            ctx.drawImage(subtypeLayer.canvas, 0, 0);
          }
          
          ctx.restore();
        }
      });
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
