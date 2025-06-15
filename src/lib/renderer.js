export function renderCharacter(canvas, psdData, character) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Центрируем персонажа
  ctx.save();
  ctx.translate(canvas.width/2 - 400, canvas.height/2 - 400);
  
  // Отрисовываем слои в правильном порядке
  renderBodyParts(ctx, psdData, character);
  
  ctx.restore();
}

function renderBodyParts(ctx, psdData, character) {
  // Порядок отрисовки частей тела
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
    const layers = findLayersForPart(psdData, part, character);
    layers.forEach(layer => {
      if (layer.canvas) {
        ctx.drawImage(layer.canvas, 0, 0);
      }
    });
  });
}

function findLayersForPart(psdData, part, character) {
  // Здесь должна быть логика поиска нужных слоев в PSD
  // Пока возвращаем пустой массив
  return [];
}

function shouldRenderLayer(layer, character) {
  // Пример для ушей
  if (layer.name.includes('Уши')) {
    return layer.name.includes(character.ears);
  }
  
  // Пример для глаз
  if (layer.name.includes('Глаза')) {
    const eyeType = character.eyes.type;
    if (!layer.name.includes(eyeType)) return false;
    
    if (eyeType === 'обычные') {
      return layer.name.includes(character.eyes.subtype);
    }
    return true;
  }
  
  // Аналогично для других частей тела
  return true;
}
