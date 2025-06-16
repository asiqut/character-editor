export function renderCharacter(canvas, psdData, character) {
  if (!psdData || !character) return;

  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  const psdWidth = psdData.width;
  const psdHeight = psdData.height;
  const scale = Math.min(canvas.width / psdWidth, canvas.height / psdHeight);
  
  ctx.save();
  const offsetX = (canvas.width - psdWidth * scale) / 2;
  const offsetY = (canvas.height - psdHeight * scale) / 2;
  ctx.translate(offsetX, offsetY);
  ctx.scale(scale, scale);

  const partsOrder = ['body', 'tail', 'mane', 'head', 'ears', 'cheeks', 'eyes'];

  partsOrder.forEach(part => {
    renderPart(part, ctx, psdData, character);
  });

  ctx.restore();
}

function renderPart(part, ctx, psdData, character) {
  const config = {
    ears: {
      group: 'Уши',
      variant: character.ears || 'торчком обычные',
      layers: ['лайн', 'свет', 'тень', '[красить]']
    },
    eyes: {
      group: 'Глаза',
      variant: character.eyes?.type || 'обычные',
      layers: ['блики', 'лайн', 'свет', 'тень', '[красить]', '[белок красить]'],
      subtype: character.eyes?.subtype || 'с ресницами'
    },
    cheeks: {
      group: 'Щёки',
      variant: 'пушистые',
      layers: ['лайн', 'тень', 'свет', '[красить]']
    },
    head: {
      group: 'Голова',
      layers: ['лайн', 'свет', 'тень', '[красить]']
    },
    mane: {
      group: 'Грудь/шея/грива',
      variant: character.mane || 'обычная',
      layers: ['лайн', 'свет', 'тень', '[красить]']
    },
    body: {
      group: 'Тело',
      variant: character.body || 'v1',
      layers: ['лайн', 'тень', 'свет', 'свет2', '[красить]']
    },
    tail: {
      group: 'Хвосты',
      variant: character.tail || 'обычный',
      layers: ['лайн', 'свет', 'тень', '[красить]']
    }
  };

  const partConfig = config[part];
  if (!partConfig) return;

  const group = psdData.children?.find(g => g.name === partConfig.group);
  if (!group) {
    console.warn(`Group not found: ${partConfig.group}`);
    return;
  }

  if (part === 'eyes') {
    renderEyes(ctx, group, partConfig, character);
    return;
  }

  let variantGroup;
  if (partConfig.variant) {
    variantGroup = group.children?.find(g => g.name === partConfig.variant);
    if (!variantGroup) {
      console.warn(`Variant group not found: ${partConfig.group}/${partConfig.variant}`);
      return;
    }
  } else {
    variantGroup = group;
  }

  partConfig.layers.forEach(layerName => {
    const layer = variantGroup.children?.find(l => l.name === layerName);
    if (layer?.canvas) {
      ctx.save();
      ctx.translate(layer.left || 0, layer.top || 0);
      
      if (layer.blendMode) {
        ctx.globalCompositeOperation = convertBlendMode(layer.blendMode);
      }

      ctx.drawImage(layer.canvas, 0, 0);
      
      if (layerName.includes('[красить]') || layerName.includes('[белок красить]')) {
        ctx.save();
        ctx.globalCompositeOperation = 'source-atop';
        ctx.fillStyle = layerName.includes('[белок красить]') 
          ? character.colors.eyesWhite 
          : character.colors.main;
        ctx.fillRect(0, 0, layer.canvas.width, layer.canvas.height);
        ctx.restore();
      }
      
      ctx.restore();
    }
  });
}

function renderEyes(ctx, eyesGroup, config, character) {
  const variantGroup = eyesGroup.children?.find(g => g.name === config.variant);
  if (!variantGroup) return;

  config.layers.forEach(layerName => {
    if (layerName === 'с ресницами' || layerName === 'без ресниц') return;
    
    const layer = variantGroup.children?.find(l => l.name === layerName);
    if (layer?.canvas) {
      ctx.save();
      ctx.translate(layer.left || 0, layer.top || 0);
      
      if (layerName.includes('[красить]')) {
        applyColorFilter(ctx, layer, character, layerName);
      } else if (layerName.includes('[белок красить]')) {
        applyColorFilter(ctx, layer, character, layerName);
      } else {
        if (layer.blendMode) {
          ctx.globalCompositeOperation = convertBlendMode(layer.blendMode);
        }
      }
      
      ctx.drawImage(layer.canvas, 0, 0);
      ctx.restore();
    }
  });

  if (config.variant === 'обычные' && config.subtype) {
    const subtypeLayer = variantGroup.children?.find(l => l.name === config.subtype);
    if (subtypeLayer?.canvas) {
      ctx.save();
      ctx.translate(subtypeLayer.left || 0, subtypeLayer.top || 0);
      if (subtypeLayer.blendMode) {
        ctx.globalCompositeOperation = convertBlendMode(subtypeLayer.blendMode);
      }
      ctx.drawImage(subtypeLayer.canvas, 0, 0);
      ctx.restore();
    }
  }
}

function applyColorFilter(ctx, layer, character, layerName) {
  if (!character.colors) return;
  
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = layer.canvas.width;
  tempCanvas.height = layer.canvas.height;
  const tempCtx = tempCanvas.getContext('2d');
  
  tempCtx.drawImage(layer.canvas, 0, 0);
  
  tempCtx.globalCompositeOperation = 'source-atop';
  tempCtx.fillStyle = layerName.includes('[белок красить]') 
    ? character.colors.eyesWhite 
    : character.colors.main;
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
    'exclusion': 'exclusion',
    'hue': 'hue',
    'saturation': 'saturation',
    'color': 'color',
    'luminosity': 'luminosity'
  };
  return modes[psdBlendMode.toLowerCase()] || 'source-over';
}
