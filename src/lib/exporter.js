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
  // Правильный порядок групп (сверху вниз)
  const groupOrder = [
    'Уши',
    'Глаза',
    'Щёки', 
    'Голова',
    'Грудь/шея/грива',
    'Тело',
    'Хвосты'
  ];

  // Создаем новый PSD
  const newPsd = {
    width: 315,
    height: 315,
    children: []
  };

  // Соответствие между английскими и русскими названиями
  const partToGroupName = {
    'ears': 'Уши',
    'eyes': 'Глаза',
    'cheeks': 'Щёки',
    'head': 'Голова',
    'mane': 'Грудь/шея/грива',
    'body': 'Тело',
    'tail': 'Хвосты'
  };

  // Создаем группы в правильном порядке
  groupOrder.forEach(groupName => {
    const partName = Object.keys(partToGroupName).find(
      key => partToGroupName[key] === groupName
    );
    
    if (!partName) return;

    // Пропускаем щёки если они отключены
    if (partName === 'cheeks' && character.cheeks === 'нет') return;

    // Получаем вариант для текущей части
    let variantName;
    if (partName === 'head') {
      variantName = 'default';
    } else if (partName === 'eyes') {
      variantName = character.eyes.type;
    } else {
      variantName = character[partName];
    }

    // Получаем слои для этой части
    let layers = [];
    if (partName === 'head') {
      layers = originalPsd[partName] || [];
    } else {
      layers = originalPsd[partName]?.[variantName] || [];
    }

    // Копируем слои с сохранением всех свойств
    const groupLayers = layers.map(layer => ({
      name: layer.name,
      canvas: layer.canvas,
      left: layer.left,
      top: layer.top,
      opacity: layer.opacity,
      blendMode: layer.blendMode,
      clipping: layer.clipping,
      hidden: false
    }));

    // Добавляем подтип для глаз
    if (partName === 'eyes' && variantName === 'обычные') {
      const subtypeLayer = layers.find(l => l.name === character.eyes.subtype);
      if (subtypeLayer) {
        groupLayers.push({
          name: subtypeLayer.name,
          canvas: subtypeLayer.canvas,
          left: subtypeLayer.left,
          top: subtypeLayer.top,
          opacity: subtypeLayer.opacity,
          blendMode: subtypeLayer.blendMode,
          clipping: subtypeLayer.clipping,
          hidden: false
        });
      }
    }

    // Добавляем группу в PSD
    if (groupLayers.length > 0) {
      newPsd.children.unshift({ // Используем unshift для правильного порядка
        name: groupName,
        children: groupLayers
      });
    }
  });

  // Экспортируем PSD
  const psdBytes = PSD.writePsd(newPsd);
  const blob = new Blob([psdBytes], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `character_${Date.now()}.psd`;
  a.click();
  
  URL.revokeObjectURL(url);
};
