import * as PSD from 'ag-psd';
import { renderCharacter } from './renderer';

export const exportPNG = (character, psdData) => {
  const canvas = document.createElement('canvas');
  canvas.width = 315; // Точный размер PSD
  canvas.height = 315;
  
  // Рендерим без каких-либо трансформаций
  renderCharacter(canvas, psdData, character);

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

  // Функция для применения цвета к слою
  const applyColorToLayer = (layer, partName, character) => {
    if (!layer.canvas) return layer;
    
    // Создаем временный canvas
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = layer.canvas.width;
    tempCanvas.height = layer.canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    
    // Определяем цвет
    let color;
    if (layer.name.includes('[белок красить]')) {
      color = character.colors?.eyesWhite || '#ffffff';
    } else if (layer.name.includes('[красить]')) {
      color = character.partColors?.[partName] || character.colors?.main || '#f1ece4';
    } else {
      return layer; // Не меняем слои без покраски
    }
    
    // Применяем цвет
    tempCtx.drawImage(layer.canvas, 0, 0);
    tempCtx.globalCompositeOperation = 'source-atop';
    tempCtx.fillStyle = color;
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    
    // Возвращаем обновленный слой
    return {
      ...layer,
      canvas: tempCanvas
    };
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

    // Копируем слои с сохранением всех свойств и применяем цвета
    const groupLayers = layers.map(layer => {
      const coloredLayer = applyColorToLayer(layer, partName, character);
      return {
        name: layer.name,
        canvas: coloredLayer.canvas,
        left: layer.left,
        top: layer.top,
        opacity: layer.opacity,
        blendMode: layer.blendMode,
        clipping: layer.clipping,
        hidden: false
      };
    });

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
      newPsd.children.unshift({
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
