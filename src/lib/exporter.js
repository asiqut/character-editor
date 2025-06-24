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

export const exportPSD = (psdData, character) => {
  // Правильный порядок групп (сверху вниз)
  const groupOrder = [
    'Уши',
    'Глаза',
    'Щёки', 
    'Голова',
    'Грудь Шея Грива',
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
    'mane': 'Грудь Шея Грива',
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
    const partConfig = PARTS_STRUCTURE[groupName];
    if (!partConfig) return;
    
    // Пропускаем щёки если они отключены
    if (groupName === 'cheeks' && character.cheeks === 'нет') return;
    
    // Определяем вариант
    let variantName;
    switch(groupName) {
      case 'eyes': variantName = character.eyes.type; break;
      case 'cheeks': variantName = character.cheeks; break;
      case 'mane': variantName = character.mane; break;
      case 'body': variantName = character.body; break;
      case 'tail': variantName = character.tail; break;
      case 'ears': variantName = character.ears; break;
      default: variantName = 'default';
    }
    
    // Получаем слои для варианта
    const layers = [];
    if (partConfig.isSingleVariant) {
      partConfig.layers.forEach(layerPath => {
        const layer = findLayerByPath(psdData, layerPath);
        if (layer) layers.push(layer);
      });
    } else {
      const variant = partConfig.variants[variantName];
      if (variant) {
        variant.layers.forEach(layerPath => {
          const layer = findLayerByPath(psdData, layerPath);
          if (layer) layers.push(layer);
        });
      }
    }
    
    // Обработка подтипов для глаз
    if (groupName === 'eyes' && variantName === 'обычные') {
      const subtype = character.eyes.subtype;
      const subtypeLayerPath = partConfig.variants.обычные.subtypes[subtype][0];
      const subtypeLayer = findLayerByPath(psdData, subtypeLayerPath);
      
      if (subtypeLayer) {
        layers.push(subtypeLayer);
      }
    }
    
    // Добавляем группу в PSD
    if (layers.length > 0) {
      newPsd.children.unshift({
        name: groupName,
        children: layers.map(layer => ({
          name: layer.name,
          canvas: applyColorToLayer(layer, groupName, character).canvas,
          left: layer.left,
          top: layer.top,
          opacity: layer.opacity,
          blendMode: layer.blendMode,
          clipping: layer.clipping,
          hidden: false
        }))
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

// Добавляем вспомогательную функцию
function findLayerByPath(psdData, path) {
  const parts = path.split('/');
  let current = psdData;
  
  for (const part of parts) {
    if (!current[part]) return null;
    current = current[part];
  }
  
  return current;
}
