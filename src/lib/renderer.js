export function renderCharacter(canvas, psdData, character) {
  if (!psdData || !character) return;

  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Масштабирование (315px → 800px)
  const scale = 800 / 315;
  ctx.save();
  ctx.scale(scale, scale);

  // Порядок отрисовки (от задних к передним)
  const partsOrder = [
    'body', 'tail', 'mane', 'head', 'ears', 'cheeks', 'eyes'
  ];

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
  const group = psdData.children.find(g => g.name === partConfig.group);
  if (!group) {
    console.warn(`Group not found: ${partConfig.group}`);
    return;
  }

  // Обработка глаз (особый случай)
  if (part === 'eyes') {
    renderEyes(ctx, group, partConfig, character);
    return;
  }

  // Для остальных частей
  const variantGroup = partConfig.variant ? 
    group.children?.find(g => g.name === partConfig.variant) : 
    group;

  if (!variantGroup) {
    console.warn(`Variant not found: ${partConfig.group}/${partConfig.variant}`);
    return;
  }

  partConfig.layers.forEach(layerName => {
    const layer = variantGroup.children?.find(l => l.name === layerName);
    if (layer?.canvas) {
      ctx.save();
      // Применяем цвет только к слоям с маркерами
      if (layerName.includes('[красить]') || layerName.includes('[белок красить]')) {
        applyColorFilter(ctx, layer, character);
      } else {
        // Для обычных слоев сохраняем оригинальные режимы наложения
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

  // Сначала рисуем основные слои глаз
  config.layers.forEach(layerName => {
    if (layerName === 'с ресницами' || layerName === 'без ресниц') return;
    
    const layer = variantGroup.children?.find(l => l.name === layerName);
    if (layer?.canvas) {
      ctx.save();
      // Для слоев окраски применяем цвет
      if (layerName.includes('[красить]') || layerName.includes('[белок красить]')) {
        applyColorFilter(ctx, layer, character);
      } else {
        // Сохраняем оригинальный режим наложения
        ctx.globalCompositeOperation = layer.blendMode?.toLowerCase() || 'source-over';
      }
      ctx.drawImage(layer.canvas, 0, 0);
      ctx.restore();
    }
  });

  // Затем рисуем выбранный подтип (ресницы)
  const subtypeLayer = variantGroup.children?.find(l => l.name === config.subtype);
  if (subtypeLayer?.canvas) {
    ctx.save();
    ctx.globalCompositeOperation = subtypeLayer.blendMode?.toLowerCase() || 'source-over';
    ctx.drawImage(subtypeLayer.canvas, 0, 0);
    ctx.restore();
  }
}

function applyColorFilter(ctx, layer, character) {
  if (!character.colors) return;
  
  if (layer.name.includes('[красить]')) {
    ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = character.colors.main || '#f1ece4';
    ctx.fillRect(0, 0, 315, 315);
  } 
  else if (layer.name.includes('[белок красить]')) {
    ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = character.colors.eyesWhite || '#ffffff';
    ctx.fillRect(0, 0, 315, 315);
  }
  ctx.globalCompositeOperation = 'source-over';
}
