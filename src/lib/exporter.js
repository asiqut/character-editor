import * as PSD from 'ag-psd';

// Общая функция для подготовки canvas
const prepareCharacterCanvas = (character, psdData) => {
  const canvas = document.createElement('canvas');
  canvas.width = 315;
  canvas.height = 315;
  const ctx = canvas.getContext('2d');

  const scale = 1.15;
  const offsetX = (315 - 315 * scale) / 2;
  const offsetY = (315 - 315 * scale) / 2;

  ctx.save();
  ctx.translate(offsetX, offsetY);
  ctx.scale(scale, scale);
  renderCharacter(canvas, psdData, character);
  ctx.restore();

  return canvas;
};

export const exportPNG = (character, psdData) => {
  // Создаем canvas для рендеринга
  const canvas = document.createElement('canvas');
  canvas.width = 315;
  canvas.height = 315;
  const ctx = canvas.getContext('2d');

  // Настройки масштабирования (такие же как в превью)
  const scale = 1.15;
  const offsetX = (315 - 315 * scale) / 2;
  const offsetY = (315 - 315 * scale) / 2;

  ctx.save();
  ctx.translate(offsetX, offsetY);
  ctx.scale(scale, scale);

  // Рендерим персонажа
  renderCharacter(canvas, psdData, character);
  ctx.restore();

  // Экспортируем
  const link = document.createElement('a');
  link.download = `character_${Date.now()}.png`;
  link.href = canvas.toDataURL('image/png');
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
