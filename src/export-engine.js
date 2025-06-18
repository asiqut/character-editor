// export-engine.js - Движок экспорта файлов
import agPsd from 'ag-psd';

export class ExportEngine {
  constructor(config) {
    this.config = config;
  }

  // Экспорт в PNG
  async exportToPNG(canvas, width, height) {
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/png', 1.0);
    });
  }

  // Экспорт в PSD
  async exportToPSD(psdData, activeParts, colors, width, height) {
    // Создаем копию PSD чтобы не менять оригинал
    const exportPsd = this.clonePSD(psdData);
    
    // Очищаем PSD - удаляем скрытые элементы
    this.cleanPSD(exportPsd, activeParts);
    
    // Применяем цвета к слоям
    this.applyColorsToPSD(exportPsd, activeParts, colors);
    
    // Генерируем PSD файл
    const psdBuffer = agPsd.writePsd(exportPsd, { 
      width, 
      height,
      generateThumbnail: true
    });
    
    return new Blob([psdBuffer], { type: 'application/octet-stream' });
  }

  // Клонирование PSD (минимальная реализация)
  clonePSD(psd) {
    return JSON.parse(JSON.stringify(psd));
  }

  // Очистка PSD от скрытых элементов
  cleanPSD(psd, activeParts) {
    const activeLayers = this.getAllActiveLayers(activeParts);
    
    const cleanChildren = (children) => {
      return children.filter(layer => {
        // Если у слоя есть дети - обрабатываем их
        if (layer.children) {
          layer.children = cleanChildren(layer.children);
          return layer.children.length > 0;
        }
        
        // Проверяем, должен ли слой быть видимым
        return activeLayers.some(path => path.includes(layer.name));
      });
    };
    
    psd.children = cleanChildren(psd.children);
  }

  // Получаем все активные слои из выбранных частей
  getAllActiveLayers(activeParts) {
    return Object.values(activeParts)
      .flatMap(part => part.layers)
      .map(path => path.split('/').pop()); // Берем только имя слоя
  }

  // Применение цветов к PSD
  applyColorsToPSD(psd, activeParts, colors) {
    const applyToLayer = (layer, part, colors) => {
      const colorable = part.colorable;
      let shouldColor = false;
      let colorKey = null;

      if (typeof colorable === 'string' && layer.name.includes(colorable)) {
        shouldColor = true;
        colorKey = colorable === '[красить]' ? part.colorable : 'eyesWhite';
      } else if (typeof colorable === 'object') {
        for (const [marker, key] of Object.entries(colorable)) {
          if (layer.name.includes(marker)) {
            shouldColor = true;
            colorKey = key;
            break;
          }
        }
      }

      if (shouldColor && colorKey && colors[colorKey]) {
        this.colorizeLayer(layer, colors[colorKey]);
      }
    };

    const processChildren = (children) => {
      children.forEach(layer => {
        if (layer.children) {
          processChildren(layer.children);
        } else {
          // Находим к какой части принадлежит слой
          for (const part of Object.values(activeParts)) {
            if (part.layers.some(path => path.includes(layer.name))) {
              applyToLayer(layer, part, colors);
              break;
            }
          }
        }
      });
    };

    processChildren(psd.children);
  }

  // Изменение цвета слоя в PSD
  colorizeLayer(layer, color) {
    if (!layer.imageData) return;
    
    // Конвертируем hex в RGB
    const rgb = this.hexToRgb(color);
    if (!rgb) return;
    
    // Проходим по всем пикселям
    const data = layer.imageData;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] > 0) { // Если пиксель не прозрачный
        // Применяем цвет с учетом прозрачности
        const alpha = data[i + 3] / 255;
        data[i] = Math.round(rgb.r * alpha);
        data[i + 1] = Math.round(rgb.g * alpha);
        data[i + 2] = Math.round(rgb.b * alpha);
      }
    }
  }

  // Конвертация HEX в RGB
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }
}
