import * as PSD from 'ag-psd';

export const PSD_CONFIG = {
  // Основные настройки
  dimensions: { width: 315, height: 315 },

  renderOrder: ['tail', 'body', 'mane', 'head', 'cheeks', 'eyes', 'ears'],

  clippedLayers: ['свет', 'тень', 'свет2', 'блики'],
  
  // Иерархия групп (соответствует структуре PSD)
  groups: {
    'Уши': { code: 'ears', interface_title: "Уши", variants: {
      'длинные': { layers: ['[красить]', 'тень', 'свет', 'лайн'] },
      'торчком пушистые': { layers: ['[красить]', 'тень', 'свет', 'лайн'] },
      'торчком обычные': { layers: ['[красить]', 'тень', 'свет', 'лайн'] },
      'повисшие': { layers: ['[красить]', 'тень', 'свет', 'лайн'] }
    }},
    'Глаза': { code: 'eyes', interface_title: "Глаза", variants: {
        'обычные': { layers: ['[белок красить]', '[красить]', 'тень', 'свет', 'блики'], 
          subtypes: { 'с ресницами': { layers: ['с ресницами'] }, 'без ресниц': { layers: ['без ресниц'] } } 
        },
        'лисьи': { layers: ['[красить]', 'тень', 'свет', 'лайн', 'блики'] } }
    },
    'Щёки': { code: 'cheeks', interface_title: "Щёки", variants: {
      'пушистые': { layers: ['[красить]', 'свет', 'тень', 'лайн'] }, 
      'нет': { },
    }},
    'Голова': { code: 'head', interface_title: "Голова", isSingleVariant: true, layers: ['[красить]', 'тень', 'свет', 'лайн']},
    'Грудь Шея Грива': { code: 'mane', interface_title: "Грива", variants: {
      'пышная': { layers: ['[красить]', 'тень', 'свет', 'лайн'] },
      'обычная': { layers: ['[красить]', 'тень', 'свет', 'лайн'] },
      'короткошерстная': { layers: ['[красить]', 'тень', 'свет', 'лайн'] }
    }},
    'Тело': { code: 'body', interface_title: "Тело", variants: {
      'v3': { layers: ['[красить]', 'свет2', 'свет', 'тень', 'лайн'] },
      'v2': { layers: ['[красить]', 'свет2', 'свет', 'тень', 'лайн'] },
      'v1': { layers: ['[красить]', 'свет2', 'свет', 'тень', 'лайн'] }
    }},
    'Хвосты': { code: 'tail', interface_title: "Хвост", variants: {
      'длинный тонкий': { layers: ['[красить]', 'тень', 'свет', 'лайн'] },
      'куцый': { layers: ['[красить]', 'тень', 'свет', 'лайн'] },
      'пышный': { layers: ['[красить]', 'тень', 'свет', 'лайн'] },
      'обычный': { layers: ['[красить]', 'тень', 'свет', 'лайн'] },
      'завитушкой': { layers: ['[красить]', 'тень', 'свет', 'лайн'] }
    }},
  },

  colorTargets: {
    ears: { 
      interface_color_title: 'Цвет ушей', 
      path: 'Уши/*/[красить]',
      defaultColor: '#f1ece4'
    },
    eyes: { 
      interface_color_title: 'Цвет глаз', 
      path: 'Глаза/*/[красить]', 
      defaultColor: '#f1ece4'
    },
    eyesWhite: { 
      interface_color_title: 'Белки глаз', 
      path: 'Глаза/обычные/[белок красить]',
      defaultColor: '#f1ece4'
    },
    cheeks: { 
      interface_color_title: 'Цвет щёк', 
      path: 'Щёки/*/[красить]',
      defaultColor: '#ffffff'
    },
    mane: { 
      interface_color_title: 'Цвет гривы', 
      path: 'Грудь Шея Грива/*/[красить]',
      defaultColor: '#f1ece4'
    },
    body: { 
      interface_color_title: 'Цвет тела', 
      path: 'Тело/*/[красить]',
      defaultColor: '#f1ece4'
    },
    tail: { 
      interface_color_title: 'Цвет хвоста', 
      path: 'Хвосты/*/[красить]',
      defaultColor: '#f1ece4'
    },
    head: { 
      interface_color_title: 'Цвет головы', 
      path: 'Голова/[красить]',
      defaultColor: '#f1ece4'
    },
    main: {
      interface_color_title: 'Основной цвет', 
      elements: ['ears', 'cheeks', 'mane', 'body', 'tail', 'head'],
      defaultColor: '#f1ece4'
    }
  },
};

export async function loadAndProcessPSD() {
  try {
    // 1. Загрузка PSD
    const response = await fetch(`${window.publicPath || ''}/assets/model_kinwoods.psd`);
    const arrayBuffer = await response.arrayBuffer();
    const psd = PSD.readPsd(arrayBuffer, {
      parseLayerBlendingModes: true,
      preserveLayerPositions: true
    });

    // 2. Преобразование структуры
    const processedData = {};
    for (const [groupName, groupConfig] of Object.entries(PSD_CONFIG.groups)) {
      const psdGroup = psd.children?.find(g => g.name === groupName);
      if (!psdGroup) continue;

      processedData[groupConfig.code] = {};
      
      if (groupConfig.isSingleVariant) {
        // Обработка головы (единственный вариант)
        processedData[groupConfig.code] = psdGroup.children?.map(layer => ({
          name: layer.name,
          canvas: layer.canvas,
          left: layer.left || 0,  // Добавляем координаты
          top: layer.top || 0,    // Добавляем координаты
          blendMode: layer.blendMode,
          opacity: layer.opacity ?? 1
        })) || [];
      } else {
        // Обработка вариантов
        for (const variantName of Object.keys(groupConfig.variants)) {
          const psdVariant = psdGroup.children?.find(v => v.name === variantName);
          if (psdVariant) {
            processedData[groupConfig.code][variantName] = psdVariant.children?.map(layer => ({
              name: layer.name,
              canvas: layer.canvas,
              left: layer.left || 0,  // Добавляем координаты
              top: layer.top || 0,    // Добавляем координаты
              blendMode: layer.blendMode,
              opacity: layer.opacity ?? 1
            })) || [];
          }
        }
      }
    }

    return processedData;
  } catch (error) {
    console.error('PSD processing failed:', error);
    throw error;
  }
}

// Экспорт констант для интерфейса
export const PARTS_STRUCTURE = PSD_CONFIG.groups;
export const COLOR_TARGETS = PSD_CONFIG.colorTargets;
export const DEFAULT_CHARACTER = {
  ears: 'торчком обычные',
  eyes: {
    type: 'обычные',
    subtype: 'с ресницами'
  },
  cheeks: 'пушистые',
  mane: 'обычная',
  body: 'v1',
  tail: 'обычный',
  head: 'default',
  colors: {
    main: '#f1ece4',
    eyesWhite: '#ffffff'
  },
  partColors: {
    ears: '#f1ece4',
    eyes: '#f1ece4',
    cheeks: '#f1ece4',
    mane: '#f1ece4',
    body: '#f1ece4',
    tail: '#f1ece4',
    head: '#f1ece4'
  }
};
