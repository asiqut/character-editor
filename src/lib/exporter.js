import * as PSD from 'ag-psd';

export const exportPNG = (canvas, character, psdData) => {
  // Создаем временный canvas для рендеринга
  const renderCanvas = document.createElement('canvas');
  renderCanvas.width = 630; // Рендерим в увеличенном размере
  renderCanvas.height = 630;
  const renderCtx = renderCanvas.getContext('2d');
  
  // Рендерим персонажа с масштабированием
  const scale = 1.15;
  const offsetX = (630 - 315 * scale) / 2;
  const offsetY = (630 - 315 * scale) / 2;
  
  renderCtx.save();
  renderCtx.translate(offsetX, offsetY);
  renderCtx.scale(scale, scale);
  renderCharacter(renderCanvas, psdData, character);
  renderCtx.restore();
  
  // Создаем финальный canvas 315x315
  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = 315;
  exportCanvas.height = 315;
  const exportCtx = exportCanvas.getContext('2d');
  
  // Копируем с масштабированием обратно к оригинальному размеру
  exportCtx.drawImage(renderCanvas, 0, 0, 315, 315);
  
  // Создаем ссылку для скачивания
  const link = document.createElement('a');
  link.download = `character_${Date.now()}.png`;
  link.href = exportCanvas.toDataURL('image/png');
  link.click();
};

export const exportPSD = (originalPsd, character) => {
  const newPsd = {
    width: 315,
    height: 315,
    children: []
  };

  // Правильный порядок слоёв (сверху вниз)
  const partsOrder = [
    'ears',    // Уши (верхний слой)
    'eyes',    // Глаза
    'cheeks',  // Щёки
    'head',    // Голова
    'mane',    // Грудь/шея/грива
    'body',    // Тело
    'tail'     // Хвосты (нижний слой)
  ];

  // Функция для копирования слоя
  const copyLayer = (layer) => ({
    ...layer,
    canvas: layer.canvas,
    left: layer.left,
    top: layer.top,
    opacity: layer.opacity,
    blendMode: layer.blendMode,
    clipping: layer.clipping,
    hidden: false
  });

  // Обрабатываем части в правильном порядке
  partsOrder.forEach(partName => {
    // Пропускаем щёки если они отключены
    if (partName === 'cheeks' && character.cheeks === 'нет') return;

    const variantName = partName === 'head' 
      ? 'default' 
      : character[partName] || 
        (partName === 'eyes' ? character.eyes.type : 'default');

    const partGroup = originalPsd[partName];
    if (!partGroup) return;

    const variantLayers = partName === 'head' 
      ? partGroup 
      : partGroup[variantName];
    if (!variantLayers) return;

    // Создаем группу с оригинальным названием
    const group = {
      name: getOriginalGroupName(partName),
      children: []
    };

    // Копируем слои
    variantLayers.forEach(layer => {
      if (layer.canvas) {
        group.children.push(copyLayer(layer));
      }
    });

    // Добавляем подтипы глаз
    if (partName === 'eyes' && variantName === 'обычные') {
      const subtypeLayer = variantLayers.find(l => l.name === character.eyes.subtype);
      if (subtypeLayer) {
        group.children.push(copyLayer(subtypeLayer));
      }
    }

    newPsd.children.push(group);
  });

  // Экспорт PSD
  const psdBytes = PSD.writePsd(newPsd);
  const blob = new Blob([psdBytes], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `character_${Date.now()}.psd`;
  a.click();
  
  URL.revokeObjectURL(url);
};

// Функция для получения оригинальных названий групп
function getOriginalGroupName(part) {
  const names = {
    'ears': 'Уши',
    'eyes': 'Глаза',
    'cheeks': 'Щёки',
    'head': 'Голова',
    'mane': 'Грудь/шея/грива',
    'body': 'Тело',
    'tail': 'Хвосты'
  };
  return names[part] || part;
}
