import * as PSD from 'ag-psd';

export const exportPNG = (canvas, character, psdData) => {
  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = 315;
  exportCanvas.height = 315;
  const ctx = exportCanvas.getContext('2d');
  
  // Рендерим с тем же масштабом, что и в превью
  const scale = 1.15;
  const offsetX = (315 - 315 * scale) / 2;
  const offsetY = (315 - 315 * scale) / 2;
  
  ctx.save();
  ctx.translate(offsetX, offsetY);
  ctx.scale(scale, scale);
  
  // Порядок рендеринга
  const partsOrder = ['tail', 'body', 'mane', 'head', 'cheeks', 'eyes', 'ears'];
  
  partsOrder.forEach(part => {
    if (part === 'cheeks' && character.cheeks === 'нет') return;
    renderPart(part, ctx, psdData, character);
  });
  
  ctx.restore();
  
  const link = document.createElement('a');
  link.download = `character_${Date.now()}.png`;
  link.href = exportCanvas.toDataURL('image/png');
  link.click();
};

export const exportPSD = (originalPsd, character) => {
  // Создаем новый PSD с оригинальными размерами
  const newPsd = {
    width: 315,
    height: 315,
    children: []
  };

  // Функция для копирования слоя со всеми свойствами
  const copyLayer = (layer) => {
    return {
      ...layer,
      canvas: layer.canvas,
      left: layer.left,
      top: layer.top,
      opacity: layer.opacity,
      blendMode: layer.blendMode,
      clipping: layer.clipping,
      hidden: false
    };
  };

  // Обрабатываем каждую часть персонажа
  const processPart = (partName, variantName) => {
    const partGroup = originalPsd[partName];
    if (!partGroup) return;
    
    const variantLayers = partGroup[variantName];
    if (!variantLayers) return;
    
    // Создаем группу для этой части
    const group = {
      name: getOriginalGroupName(partName),
      children: []
    };
    
    // Копируем нужные слои
    variantLayers.forEach(layer => {
      group.children.push(copyLayer(layer));
    });
    
    // Особые случаи (например, подтипы глаз)
    if (partName === 'eyes' && variantName === 'обычные') {
      const subtype = character.eyes.subtype;
      const subtypeLayer = variantLayers.find(l => l.name === subtype);
      if (subtypeLayer) {
        group.children.push(copyLayer(subtypeLayer));
      }
    }
    
    newPsd.children.push(group);
  };

  // Оригинальные названия групп
  const getOriginalGroupName = (part) => {
    switch(part) {
      case 'ears': return 'Уши';
      case 'eyes': return 'Глаза';
      case 'cheeks': return 'Щёки';
      case 'head': return 'Голова';
      case 'mane': return 'Грудь/шея/грива';
      case 'body': return 'Тело';
      case 'tail': return 'Хвосты';
      default: return part;
    }
  };

  // Обрабатываем все выбранные части
  processPart('ears', character.ears);
  processPart('eyes', character.eyes.type);
  if (character.cheeks !== 'нет') processPart('cheeks', character.cheeks);
  processPart('head', 'default');
  processPart('mane', character.mane);
  processPart('body', character.body);
  processPart('tail', character.tail);

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
