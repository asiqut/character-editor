// Функция для поиска слоев по пути
function findLayer(group, path) {
  let current = group;
  for (const name of path) {
    if (!current.children) return null;
    current = current.children.find(child => child.name === name);
    if (!current) return null;
  }
  return current;
}

export function renderCharacter(canvas, psdData, character) {
  if (!psdData || !character) return;

  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Для отладки - рисуем фон
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Масштабируем PSD (315px) под размер canvas (800px)
  const scale = 800 / 315;
  ctx.save();
  ctx.scale(scale, scale);
  
  // Порядок отрисовки частей
  const renderOrder = [
    'body',
    'tail',
    'mane',
    'head',
    'ears',
    'cheeks',
    'eyes'
  ];

  renderOrder.forEach(part => {
    renderPart(part, ctx, psdData, character);
  });

  ctx.restore();
}

function renderPart(part, ctx, psdData, character) {
  const partMap = {
    ears: {
      group: 'Уши',
      variant: character.ears || 'торчком обычные',
      layers: ['лайн', 'свет', 'тень', '[красить]']
    },
    eyes: {
      group: 'Глаза',
      variant: character.eyes?.type === 'обычные' ? 
        `обычные/${character.eyes?.subtype || 'с ресницами'}` : 
        (character.eyes?.type || 'лисьи'),
      layers: ['блики', 'лайн', 'свет', 'тень', '[красить]', '[белок красить]']
    },
    cheeks: {
      group: 'Щёки',
      variant: 'пушистые',
      layers: ['лайн', 'тень', 'свет', '[красить]']
    },
    head: {
      group: 'Голова',
      variant: '',
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

  const config = partMap[part];
  if (!config) return;

  // Находим группу для части тела
  const group = findLayer(psdData, [config.group]);
  if (!group) {
    console.warn(`Group not found: ${config.group}`);
    return;
  }

  // Находим вариант (подгруппу)
  const variantPath = config.variant.split('/');
  let variantGroup = group;
  for (const sub of variantPath) {
    if (!variantGroup.children) break;
    variantGroup = variantGroup.children.find(c => c.name === sub) || variantGroup;
  }

  // Рисуем все слои варианта
  config.layers.forEach(layerName => {
    const layer = findLayer(variantGroup, [layerName]);
    if (layer?.canvas) {
      ctx.save();
      applyColorFilter(ctx, layer, character);
      ctx.drawImage(layer.canvas, 0, 0);
      ctx.restore();
    } else {
      console.warn(`Layer not found: ${config.group}/${config.variant}/${layerName}`);
    }
  });
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
