export function renderCharacter(canvas, psdData, character) {
  if (!psdData || !character) {
    console.log('Missing psdData or character');
    return;
  }

  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Для отладки - рисуем красный квадрат, чтобы убедиться что canvas работает
  ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
  ctx.fillRect(0, 0, 100, 100);

  // Если нет данных слоев, прекращаем выполнение
  if (!psdData.children || psdData.children.length === 0) {
    console.log('No layers found in psdData');
    return;
  }

  // Центрируем персонажа
  ctx.save();
  ctx.translate(canvas.width/2 - 400, canvas.height/2 - 400);

  // Рисуем все слои для отладки
  psdData.children.forEach(layer => {
    if (layer.canvas) {
      console.log(`Drawing layer: ${layer.name}`);
      ctx.drawImage(layer.canvas, 0, 0);
    }
  });

  ctx.restore();
}
