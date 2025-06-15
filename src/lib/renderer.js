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

// Основная функция рендеринга
export function renderCharacter(canvas, psdData, character) {
  if (!psdData || !character) return;

  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Центрируем персонажа
  ctx.save();
  ctx.translate(canvas.width/2 - 400, canvas.height/2 - 400);

  // Порядок отрисовки частей (задние -> передние)
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
      variant: character.ears,
      layers: ['лайн', 'свет', 'тень', '[красить]']
    },
    eyes: {
      group: 'Глаза',
      variant: character.eyes.type === 'обычные' ? 
        `обычные/${character.eyes.subtype}` : 
        character.eyes.type,
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
      variant: character.mane,
      layers: ['лайн', 'свет', 'тень', '[красить]']
    },
    body: {
      group: 'Тело',
      variant: character.body,
      layers: ['лайн', 'тень', 'свет', 'свет2', '[красить]']
    },
    tail: {
      group: 'Хвосты',
      variant: character.tail,
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
    }
  });
}

function applyColorFilter(ctx, layer, character) {
  if (layer.name.includes('[красить]')) {
    ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = character.colors.main;
    ctx.fillRect(0, 0, 800, 800);
  } 
  else if (layer.name.includes('[белок красить]')) {
    ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = character.colors.eyesWhite;
    ctx.fillRect(0, 0, 800, 800);
  }
  ctx.globalCompositeOperation = 'source-over';
}
