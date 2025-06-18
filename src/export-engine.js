import * as PSD from 'ag-psd';

export class ExportEngine {
  constructor() {
    this.groupOrder = [
      'Уши',
      'Глаза',
      'Щёки', 
      'Голова',
      'Грудь/шея/грива',
      'Тело',
      'Хвосты'
    ];

    this.partToGroupName = {
      'ears': 'Уши',
      'eyes': 'Глаза',
      'cheeks': 'Щёки',
      'head': 'Голова',
      'mane': 'Грудь/шея/грива',
      'body': 'Тело',
      'tail': 'Хвосты'
    };
  }

  /**
   * Экспортирует PNG текущего персонажа
   * @param {HTMLCanvasElement} canvas - Canvas с отрисованным персонажем
   * @param {string} fileName - Имя файла
   */
  exportToPNG(canvas, fileName = `character_${Date.now()}.png`) {
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        const link = document.createElement('a');
        link.download = fileName;
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(link.href);
        resolve();
      }, 'image/png', 1.0);
    });
  }

  /**
   * Экспортирует PSD с сохранением структуры
   * @param {Object} originalPsd - Исходные данные PSD
   * @param {Object} character - Текущий персонаж
   * @param {Object} config - Конфигурация частей
   */
  exportToPSD(originalPsd, character, config) {
    const newPsd = {
      width: 315,
      height: 315,
      children: []
    };

    // Создаем группы в правильном порядке
    this.groupOrder.forEach(groupName => {
      const partName = Object.keys(this.partToGroupName).find(
        key => this.partToGroupName[key] === groupName
      );
      
      if (!partName) return;

      // Пропускаем отключенные щёки
      if (partName === 'cheeks' && character.cheeks === 'нет') return;

      const variant = this.getVariantName(partName, character);
      const layers = this.getLayersForPart(originalPsd, partName, variant, character);
      
      if (layers.length > 0) {
        newPsd.children.unshift({
          name: groupName,
          children: layers
        });
      }
    });

    // Генерируем и скачиваем PSD
    const psdBytes = PSD.writePsd(newPsd);
    this.downloadFile(psdBytes, `character_${Date.now()}.psd`, 'application/octet-stream');
  }

  /**
   * Получает имя варианта для части
   * @private
   */
  getVariantName(partName, character) {
    switch (partName) {
      case 'eyes': return character.eyes.type;
      case 'head': return 'default';
      default: return character[partName];
    }
  }

  /**
   * Получает слои для части с применением цветов
   * @private
   */
  getLayersForPart(originalPsd, partName, variant, character) {
    let layers = [];
    
    // Получаем базовые слои
    if (partName === 'head') {
      layers = originalPsd[partName] || [];
    } else {
      layers = originalPsd[partName]?.[variant] || [];
    }

    // Применяем цвета и преобразуем слои
    return layers.map(layer => {
      const coloredLayer = this.applyColorToLayer(layer, partName, character);
      
      return {
        name: layer.name,
        canvas: coloredLayer.canvas,
        left: layer.left,
        top: layer.top,
        opacity: layer.opacity,
        blendMode: layer.blendMode,
        hidden: false
      };
    });
  }

  /**
   * Применяет цвет к слою
   * @private
   */
  applyColorToLayer(layer, partName, character) {
    if (!layer.canvas) return layer;
    
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = layer.canvas.width;
    tempCanvas.height = layer.canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    
    // Определяем цвет на основе маркеров
    let color;
    if (layer.name.includes('[белок красить]')) {
      color = character.colors?.eyesWhite || '#ffffff';
    } else if (layer.name.includes('[красить]')) {
      color = character.partColors?.[partName] || character.colors?.main || '#f1ece4';
    } else {
      return layer; // Не меняем слои без маркеров
    }
    
    // Применяем цвет
    tempCtx.drawImage(layer.canvas, 0, 0);
    tempCtx.globalCompositeOperation = 'source-atop';
    tempCtx.fillStyle = color;
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    
    return {
      ...layer,
      canvas: tempCanvas
    };
  }

  /**
   * Добавляет подтипы глаз (ресницы)
   * @private
   */
  addEyeSubtypes(layers, character) {
    if (character.eyes.type === 'обычные' && character.eyes.subtype) {
      const subtypeLayer = layers.find(l => l.name === character.eyes.subtype);
      if (subtypeLayer) {
        layers.push({
          ...subtypeLayer,
          name: subtypeLayer.name,
          canvas: subtypeLayer.canvas,
          left: subtypeLayer.left,
          top: subtypeLayer.top
        });
      }
    }
    return layers;
  }

  /**
   * Инициирует скачивание файла
   * @private
   */
  downloadFile(data, fileName, mimeType) {
    const blob = new Blob([data], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }
}
