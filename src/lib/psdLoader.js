import * as PSD from 'ag-psd';

export async function loadPSD() {
  try {
    const response = await fetch(`${window.publicPath || ''}/assets/model_kinwoods.psd`);
    if (!response.ok) throw new Error(`Failed to fetch PSD: ${response.status}`);
    
    const arrayBuffer = await response.arrayBuffer();
    const psd = PSD.readPsd(arrayBuffer);
    
    if (!psd || !psd.children) throw new Error('Invalid PSD structure');
    
    // Преобразуем слои PSD в удобную структуру
    return organizePSDLayers(psd);
  } catch (error) {
    console.error('Error loading PSD:', error);
    throw error;
  }
}

function organizePSDLayers(psd) {
  const parts = {
    ears: {},
    eyes: {},
    cheeks: {},
    head: {},
    mane: {},
    body: {},
    tail: {}
  };

  // Рекурсивно обрабатываем слои PSD
  function processLayers(layers, path = []) {
    layers.forEach(layer => {
      const currentPath = [...path, layer.name];
      
      if (layer.children) {
        processLayers(layer.children, currentPath);
      } else if (layer.canvas) {
        // Определяем к какой части относится слой
        const part = determinePart(layer.name);
        if (part) {
          const partName = extractPartName(layer.name, part);
          if (!parts[part][partName]) {
            parts[part][partName] = [];
          }
          parts[part][partName].push(layer);
        }
      }
    });
  }

  processLayers(psd.children);
  return parts;
}

function determinePart(layerName) {
  if (!layerName) return null;
  
  // Проверяем сначала более специфичные случаи
  if (/(^|\/|\\)уши($|\/|\\)/i.test(layerName)) return 'ears';
  if (/(^|\/|\\)глаза($|\/|\\)/i.test(layerName)) return 'eyes';
  if (/(^|\/|\\)щёки($|\/|\\)/i.test(layerName)) return 'cheeks';
  if (/(^|\/|\\)голова($|\/|\\)/i.test(layerName)) return 'head';
  if (/(^|\/|\\)(грива|шея|грудь)($|\/|\\)/i.test(layerName)) return 'mane';
  if (/(^|\/|\\)тело($|\/|\\)/i.test(layerName)) return 'body';
  if (/(^|\/|\\)хвост($|\/|\\)/i.test(layerName)) return 'tail';
  
  // Дополнительные проверки для слоев с маркерами покраски
  if (/\[красить\]/i.test(layerName)) {
    if (/уши/i.test(layerName)) return 'ears';
    if /(грива|шея|грудь)/i.test(layerName)) return 'mane';
    // ... аналогично для других частей
  }
  
  return null;
}

function extractPartName(layerName, part) {
  // Регулярные выражения для извлечения названий вариантов каждой части
  const regexMap = {
    ears: /уши[\/\\]?(длинные|торчком пушистые|торчком обычные|повисшие)(\/|\\|$)/i,
    eyes: /глаза[\/\\]?(лисьи|обычные)(?:\/(с ресницами|без ресниц))?(\/|\\|$)/i,
    cheeks: /щёки[\/\\]?(пушистые)(\/|\\|$)/i,
    head: /голова[\/\\]?(default)(\/|\\|$)/i,
    mane: /(?:грудь|шея|грива)[\/\\]?(пышная|обычная|короткошерстная)(\/|\\|$)/i,
    body: /тело[\/\\]?(v3|v2|v1)(\/|\\|$)/i,
    tail: /хвост[\/\\]?(длинный тонкий|куцый|пышный|обычный)(\/|\\|$)/i
  };
  
  const match = layerName.match(regexMap[part]);
  
  // Для глаз особый случай - объединяем тип и подтип
  if (part === 'eyes' && match) {
    const type = match[1];
    const subtype = match[2] || (type === 'обычные' ? 'с ресницами' : '');
    return subtype ? `${type}/${subtype}` : type;
  }
  
  return match ? match[1].trim() : 'default';
}
