import * as PSD from 'ag-psd';
import { getLayersForPart, resolveLayerPath } from './layerResolver';
import { RENDER_ORDER } from './defaultConfig';

export const exportPNG = (character, psdData) => {export const exportPSD = (psdData, character) => {
  const newPsd = {
    width: 315,
    height: 315,
    children: []
  };

  // Обратный порядок для PSD
  const reverseOrder = [...RENDER_ORDER].reverse();

  reverseOrder.forEach(part => {
    if (part === 'cheeks' && character.cheeks === 'нет') return;
    
    // Получаем вариант и подтип
    let variant, subtype;
    switch (part) {
      case 'ears': variant = character.ears; break;
      case 'eyes': 
        variant = character.eyes?.type;
        subtype = character.eyes?.subtype;
        break;
      case 'cheeks': variant = character.cheeks; break;
      case 'mane': variant = character.mane; break;
      case 'body': variant = character.body; break;
      case 'tail': variant = character.tail; break;
      default: variant = 'default';
    }

    // Получаем слои из КОНФИГУРАЦИИ
    const layerNames = getLayersForPart(part, variant, subtype);
    
    const groupLayers = layerNames.map(layerName => {
      const fullPath = resolveLayerPath(part, variant, layerName);
      const layer = findLayerByPath(psdData, fullPath);
      if (!layer) return null;
      
      return applyColorToLayer(layer, part, character);
    }).filter(Boolean);

    if (groupLayers.length > 0) {
      newPsd.children.push({
        name: getGroupName(part),
        children: groupLayers.map(layer => ({
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
