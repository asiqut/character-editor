export function renderCharacter(canvas, psdData, character) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Здесь должна быть логика отрисовки слоев PSD
  // на основе выбранных параметров character
  renderLayers(ctx, psdData.children, character);
}

function shouldRenderLayer(layer, character) {
  // Здесь должна быть логика определения, нужно ли рендерить слой
  // на основе выбранных параметров персонажа
  // Пока просто возвращаем true для всех слоев
  return true;
}

function renderLayers(ctx, layers, character) {
  layers.forEach(layer => {
    // Пропускаем невидимые слои
    if (!shouldRenderLayer(layer, character)) return;
    
    // Отрисовка слоя
    if (layer.canvas) {
      ctx.drawImage(layer.canvas, 0, 0);
    }
    
    // Рекурсивная отрисовка дочерних слоев
    if (layer.children) {
      renderLayers(ctx, layer.children, character);
    }
  });
}
