import { PSD_CONFIG } from './defaultConfig';

export function renderCharacter(canvas, psdData, character) {
  if (!psdData || !character) return;

  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  PSD_CONFIG.renderOrder.forEach(part => {
    if (part === 'cheeks' && character.cheeks === 'нет') return;
    renderPart(part, ctx, psdData, character);
  });
}

function renderPart(partCode, ctx, psdData, character) {
  const partConfig = PSD_CONFIG.groups[Object.keys(PSD_CONFIG.groups).find(
    key => PSD_CONFIG.groups[key].code === partCode
  )];
  
  if (!partConfig) {
    console.warn(`Missing config for part: ${partCode}`);
    return;
  }

  const partData = psdData[partCode];
  if (!partData) return;

  let variantName;
  let variantLayers = [];

  if (partConfig.isSingleVariant) {
    variantLayers = Array.isArray(partData) ? partData : [];
  } else {
    variantName = character[partCode];
    if (variantName) {
      variantLayers = partData[variantName] || [];
    }
  }

  // Рендерим основные слои
  variantLayers.forEach(layer => {
    if (!layer.canvas) return;
    
    ctx.save();
    ctx.translate(layer.left || 0, layer.top || 0);
    
    if (layer.blendMode) {
      ctx.globalCompositeOperation = convertBlendMode(layer.blendMode);
    }
    
    if (partConfig.colorTargets?.eyesWhite && layer.name.includes('[белок красить]')) {
      renderColorLayer(ctx, layer, character.colors.eyesWhite || '#ffffff');
    } 
    else if (layer.name.includes('[красить]')) {
      const color = character.partColors?.[partCode] || character.colors?.main || '#f1ece4';
      renderColorLayer(ctx, layer, color);
    }
    else if (shouldClipLayer(layer.name)) {
      const colorLayer = variantLayers.find(l => l.name.includes('[красить]'));
      if (colorLayer) renderClippedLayer(ctx, layer, colorLayer);
      else ctx.drawImage(layer.canvas, 0, 0);
    }
    else {
      ctx.drawImage(layer.canvas, 0, 0);
    }
    
    ctx.restore();
  });

  // Обработка подтипов глаз
  if (partCode === 'eyes' && variantName === 'обычные') {
    const subtype = character.eyes?.subtype || 'с ресницами';
    const subtypeLayer = variantLayers.find(l => l.name === subtype);
    
    if (subtypeLayer?.canvas) {
      ctx.save();
      ctx.translate(subtypeLayer.left || 0, subtypeLayer.top || 0);
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
