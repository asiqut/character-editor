export function renderCharacter(canvas, psdData, character) {
  if (!psdData || !character) return;
  
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Центрируем персонажа
  ctx.save();
  ctx.translate(canvas.width/2 - 400, canvas.height/2 - 400);
  
  // Порядок отрисовки частей тела
  const renderOrder = ['body', 'tail', 'mane', 'head', 'ears', 'cheeks', 'eyes'];
  
  renderOrder.forEach(part => {
    const partVariant = character[part];
    if (!partVariant) return;
    
    // Для глаз учитываем подтип
    const variant = part === 'eyes' 
      ? `${character.eyes.type}/${character.eyes.subtype}`
      : partVariant;
    
    const layers = psdData[part]?.[variant] || [];
    
    layers.forEach(layer => {
      if (layer.canvas) {
        ctx.save();
        // Применяем цветовые фильтры
        applyColorFilter(ctx, layer, character);
        // Рисуем слой
        ctx.drawImage(layer.canvas, 0, 0);
        ctx.restore();
      }
    });
  });
  
  ctx.restore();
}

function applyColorFilter(ctx, layer, character) {
  if (!layer.name) return;
  
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
