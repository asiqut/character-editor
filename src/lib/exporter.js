import * as PSD from 'ag-psd';
import { renderCharacter } from './renderer';
import { PARTS, RENDER_ORDER } from './defaultConfig';

export const exportPNG = (character, psdData) => {
  const canvas = document.createElement('canvas');
  canvas.width = 315;
  canvas.height = 315;
  renderCharacter(canvas, psdData, character);

  const link = document.createElement('a');
  link.download = `character_${Date.now()}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
};

export const exportPSD = (originalPsd, character) => {
  const newPsd = {
    width: 315,
    height: 315,
    children: []
  };

  // Обратный порядок для PSD (верхние слои идут первыми)
  const reverseOrder = [...RENDER_ORDER].reverse();

  reverseOrder.forEach(partName => {
    // Пропускаем щёки если они отключены
    if (partName === 'cheeks' && character.cheeks === 'нет') return;
    
    const partConfig = PARTS[partName];
    if (!partConfig) return;

    let variantName;
    switch (partName) {
      case 'ears': variantName = character.ears; break;
      case 'eyes': variantName = character.eyes?.type; break;
      case 'cheeks': variantName = character.cheeks; break;
      case 'mane': variantName = character.mane; break;
      case 'body': variantName = character.body; break;
      case 'tail': variantName = character.tail; break;
      default: variantName = 'default';
    }

    // Получаем слои для этой части
    let layers = [];
    if (partConfig.isSingleVariant) {
      layers = Array.isArray(originalPsd[partName]) ? originalPsd[partName] : [];
    } else {
      layers = originalPsd[partName]?.[variantName] || [];
    }

    // Применяем цвета к слоям
    const coloredLayers = layers.map(layer => {
      return applyColorToLayer(layer, partName, character);
    });

    // Добавляем подтипы для глаз
    if (partName === 'eyes' && variantName === 'обычные') {
      const subtype = character.eyes?.subtype;
      if (subtype) {
        const subtypeLayer = layers.find(l => l.name.includes(subtype));
        if (subtypeLayer) {
          coloredLayers.push(applyColorToLayer(subtypeLayer, partName, character));
        }
      }
    }

    // Добавляем группу в PSD
    if (coloredLayers.length > 0) {
      newPsd.children.push({
        name: getGroupName(partName),
        children: coloredLayers.map(layer => ({
          name: layer.name,
          canvas: layer.canvas,
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

// Преобразует имя части в имя группы PSD
function getGroupName(partName) {
  const groupNames = {
    'ears': 'Уши',
    'eyes': 'Глаза',
    'cheeks': 'Щёки',
    'head': 'Голова',
    'mane': 'Грудь Шея Грива',
    'body': 'Тело',
    'tail': 'Хвосты'
  };
  return groupNames[partName] || partName;
}

// Применяет цвет к слою
function applyColorToLayer(layer, partName, character) {
  if (!layer.canvas) return layer;
  
  let color = null;
  
  // Определяем цвет в зависимости от маркера слоя
  if (layer.name.includes('[белок красить]')) {
    color = character.colors?.eyesWhite || '#ffffff';
  } else if (layer.name.includes('[красить]')) {
    color = character.partColors?.[partName] || character.colors?.main || '#f1ece4';
  }
  
  // Если цвет не нужно применять, возвращаем оригинальный слой
  if (!color) return layer;
  
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = layer.canvas.width;
  tempCanvas.height = layer.canvas.height;
  const tempCtx = tempCanvas.getContext('2d');
  
  tempCtx.drawImage(layer.canvas, 0, 0);
  tempCtx.globalCompositeOperation = 'source-atop';
  tempCtx.fillStyle = color;
  tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
  
  return {
    ...layer,
    canvas: tempCanvas
  };
}
