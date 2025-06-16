import * as PSD from 'ag-psd';

export const exportPNG = async (character, psdData) => {
  try {
    // Создаем временный canvas для рендеринга
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 315;
    tempCanvas.height = 315;
    const tempCtx = tempCanvas.getContext('2d');
    
    // Настройки масштабирования (как в превью)
    const scale = 1.15;
    const offsetX = (315 - 315 * scale) / 2;
    const offsetY = (315 - 315 * scale) / 2;
    
    tempCtx.save();
    tempCtx.translate(offsetX, offsetY);
    tempCtx.scale(scale, scale);
    
    // Рендерим персонажа с текущими настройками
    renderCharacter(tempCanvas, psdData, character);
    tempCtx.restore();
    
    // Создаем ссылку для скачивания
    const link = document.createElement('a');
    link.download = `character_${Date.now()}.png`;
    link.href = tempCanvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('PNG export error:', error);
  }
};

// src/lib/exporter.js
export const exportPSD = (originalPsd, character) => {
  // Создаем новый PSD с правильной структурой
  const newPsd = {
    width: 315,
    height: 315,
    children: []
  };

  // Функция для применения цвета к слою
  const applyColorToLayer = (layer, color) => {
    if (!layer.canvas) return layer;
    
    const coloredCanvas = document.createElement('canvas');
    coloredCanvas.width = layer.canvas.width;
    coloredCanvas.height = layer.canvas.height;
    const ctx = coloredCanvas.getContext('2d');
    
    // Рисуем оригинальный слой
    ctx.drawImage(layer.canvas, 0, 0);
    
    // Применяем цвет
    ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, coloredCanvas.width, coloredCanvas.height);
    
    return {
      ...layer,
      canvas: coloredCanvas
    };
  };

  // Обрабатываем все части персонажа
  const processPart = (partName, variantName) => {
    const partGroup = originalPsd[partName];
    if (!partGroup) return null;
    
    const variantLayers = partName === 'head' 
      ? partGroup 
      : partGroup[variantName];
    if (!variantLayers) return null;
    
    // Получаем цвет для этой части
    const color = partName === 'eyes' && layer.name.includes('[белок красить]')
      ? character.colors.eyesWhite
      : character.partColors[partName] || character.colors.main;
    
    // Копируем и раскрашиваем слои
    const processedLayers = variantLayers.map(layer => {
      if (layer.name.includes('[красить]')) {
        return applyColorToLayer(layer, color);
      }
      return { ...layer };
    });
    
    return processedLayers;
  };

  // Собираем все слои в правильном порядке
  const partsOrder = [
    { name: 'Уши', part: 'ears', variant: character.ears },
    { name: 'Глаза', part: 'eyes', variant: character.eyes.type },
    { name: 'Щёки', part: 'cheeks', variant: character.cheeks },
    { name: 'Голова', part: 'head', variant: 'default' },
    { name: 'Грудь/шея/грива', part: 'mane', variant: character.mane },
    { name: 'Тело', part: 'body', variant: character.body },
    { name: 'Хвосты', part: 'tail', variant: character.tail }
  ];

  partsOrder.forEach(({ name, part, variant }) => {
    if (part === 'cheeks' && variant === 'нет') return;
    
    const layers = processPart(part, variant);
    if (!layers || layers.length === 0) return;
    
    // Добавляем подтип для глаз
    if (part === 'eyes' && variant === 'обычные') {
      const subtypeLayer = layers.find(l => l.name === character.eyes.subtype);
      if (subtypeLayer) {
        layers.push({ ...subtypeLayer });
      }
    }
    
    newPsd.children.unshift({
      name,
      children: layers
    });
  });

  // Экспортируем PSD
  const psdBytes = PSD.writePsd(newPsd);
  const blob = new Blob([psdBytes], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `character_${Date.now()}.psd`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  
  URL.revokeObjectURL(url);
};
