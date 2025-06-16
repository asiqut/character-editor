export function renderCharacter(canvas, psdData, character) {
  if (!psdData || !character) return;

  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Получаем размеры PSD и рассчитываем масштаб
  const psdWidth = psdData.width;
  const psdHeight = psdData.height;
  const scale = Math.min(canvas.width / psdWidth, canvas.height / psdHeight);
  
  // Центрируем изображение
  ctx.save();
  const offsetX = (canvas.width - psdWidth * scale) / 2;
  const offsetY = (canvas.height - psdHeight * scale) / 2;
  ctx.translate(offsetX, offsetY);
  ctx.scale(scale, scale);

  // Порядок отрисовки (от задних слоев к передним)
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

  // Находим основную группу
  const group = psdData.children?.find(g => g.name === partConfig.group);
  if (!group) {
    console.warn(`Group not found: ${partConfig.group}`);
    return;
  }

  // Для глаз особая обработка
  if (part === 'eyes') {
    renderEyes(ctx, group, partConfig, character);
    return;
  }

  // Находим вариант (подгруппу)
  const variantGroup = partConfig.variant ? 
    group.children?.find(g => g.name === partConfig.variant) : 
    group;

  if (!variantGroup) {
    console.warn(`Variant not found: ${partConfig.group}/${partConfig.variant}`);
    return;
  }

  // Рисуем все слои варианта
  partConfig.layers.forEach(layerName => {
    const layer = variantGroup.children?.find(l => l.name === layerName);
    if (layer?.canvas) {
      ctx.save();
      // Учитываем позицию слоя из PSD
      ctx.translate(layer.left || 0, layer.top || 0);
      
      if (layerName.includes('[красить]') || layerName.includes('[белок красить]')) {
        applyColorFilter(ctx, layer, character);
      } else {
        ctx.globalCompositeOperation = layer.blendMode?.toLowerCase() || 'source-over';
      }
      
      ctx.drawImage(layer.canvas, 0, 0);
      ctx.restore();
    }
  });
}

function renderEyes(ctx, eyesGroup, config, character) {
  const variantGroup = eyesGroup.children?.find(g => g.name === config.variant);
  if (!variantGroup) return;

  // Основные слои глаз
  config.layers.forEach(layerName => {
    if (layerName === 'с ресницами' || layerName === 'без ресниц') return;
    
    const layer = variantGroup.children?.find(l => l.name === layerName);
    if (layer?.canvas) {
      ctx.save();
      ctx.translate(layer.left || 0, layer.top || 0);
      
      if (layerName.includes('[красить]') || layerName.includes('[белок красить]')) {
        applyColorFilter(ctx, layer, character);
      } else {
        ctx.globalCompositeOperation = layer.blendMode?.toLowerCase() || 'source-over';
      }
      
      ctx.drawImage(layer.canvas, 0, 0);
      ctx.restore();
    }
  });

  // Слой с ресницами (только для обычных глаз)
  if (config.variant === 'обычные') {
    const subtypeLayer = variantGroup.children?.find(l => l.name === config.subtype);
    if (subtypeLayer?.canvas) {
      ctx.save();
      ctx.translate(subtypeLayer.left || 0, subtypeLayer.top || 0);
      ctx.globalCompositeOperation = subtypeLayer.blendMode?.toLowerCase() || 'source-over';
      ctx.drawImage(subtypeLayer.canvas, 0, 0);
      ctx.restore();
    }
  }
}

function applyColorFilter(ctx, layer, character) {
  if (!character.colors) return;
  
  ctx.save();
  if (layer.name.includes('[красить]')) {
    ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = character.colors.main || '#f1ece4';
    ctx.fillRect(0, 0, layer.canvas.width, layer.canvas.height);
  } 
  else if (layer.name.includes('[белок красить]')) {
    ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = character.colors.eyesWhite || '#ffffff';
    ctx.fillRect(0, 0, layer.canvas.width, layer.canvas.height);
  }
  ctx.restore();
}
