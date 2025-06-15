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
