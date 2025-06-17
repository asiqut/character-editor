// app.js - Главный модуль приложения
import { RenderEngine } from './render-engine.js';
import { ExportEngine } from './export-engine.js';
import config from './config.js';

class CharacterEditor {
  constructor() {
    // Состояние персонажа
    this.state = {
      activeParts: {}, // Выбранные варианты частей
      colors: {}, // Текущие цвета
      psdData: null // Загруженные данные PSD
    };

    // Инициализация движков
    this.renderEngine = new RenderEngine(config);
    this.exportEngine = new ExportEngine(config);

    // UI элементы
    this.ui = {
      previewCanvas: document.getElementById('preview-canvas'),
      partsContainer: document.getElementById('parts-container'),
      colorPickers: {}
    };

    this.init();
  }

  async init() {
    // 1. Загрузка PSD
    await this.loadPSD();

    // 2. Инициализация состояния по умолчанию
    this.initDefaultState();

    // 3. Первый рендер
    this.render();

    // 4. Инициализация UI
    this.initUI();
  }

  async loadPSD() {
    // Здесь будет загрузка и парсинг PSD
    // Пока заглушка:
    this.state.psdData = await this.renderEngine.loadPSD('assets/model.psd');
  }

  initDefaultState() {
    // Устанавливаем дефолтные варианты частей и цвета из config
    Object.keys(config.parts).forEach(partId => {
      const part = config.parts[partId];
      
      if (part.isSingleVariant) {
        this.state.activeParts[partId] = part.variant;
      } else {
        const firstVariant = Object.keys(part.variants)[0];
        this.state.activeParts[partId] = part.variants[firstVariant];
      }
    });

    // Инициализация цветов
    Object.keys(config.colors).forEach(colorId => {
      this.state.colors[colorId] = config.colors[colorId].default;
    });
  }

  render() {
    this.renderEngine.render(
      this.ui.previewCanvas, 
      this.state.psdData, 
      this.state.activeParts, 
      this.state.colors
    );
  }

  initUI() {
    this.initPartsUI();
    this.initColorPickers();
    this.initExportButtons();
  }

  initPartsUI() {
    Object.keys(this.config.parts).forEach(partId => {
      const part = this.config.parts[partId];
      
      // Пропускаем скрытые элементы
      if (part.hideInUI) return;
      
      // Проверяем зависимости (например, ресницы только для обычных глаз)
      if (part.dependsOn) {
        const dependsOnPart = this.state.activeParts[part.dependsOn.part];
        if (!dependsOnPart || dependsOnPart.label !== part.dependsOn.variant) {
          return;
        }
      }

      // Создаем контейнер для части
      const partContainer = document.createElement('div');
      partContainer.className = 'part-container';
      
      // Заголовок
      const title = document.createElement('h3');
      title.textContent = part.title;
      partContainer.appendChild(title);

      // Кнопки вариантов
      const variantsContainer = document.createElement('div');
      variantsContainer.className = 'variants-container';
      
      Object.keys(part.variants).forEach(variantId => {
        const variant = part.variants[variantId];
        const button = document.createElement('button');
        
        button.textContent = variant.label;
        button.className = 'variant-button';
        button.dataset.partId = partId;
        button.dataset.variantId = variantId;
        
        button.addEventListener('click', () => {
          this.setPartVariant(partId, variantId);
          this.updateActiveButton(partId, variantId);
        });
        
        variantsContainer.appendChild(button);
      });
      
      partContainer.appendChild(variantsContainer);
      this.ui.partsContainer.appendChild(partContainer);
      
      // Помечаем активную кнопку
      this.updateActiveButton(partId, this.state.activeParts[partId]);
    });
  }

  initColorPickers() {
    // Главный цвет (для всего тела)
    this.createColorPicker('main', 'Основной цвет');
    
    // Цвета для отдельных частей
    Object.keys(this.config.colors).forEach(colorId => {
      if (colorId !== 'main') {
        this.createColorPicker(colorId, this.getColorLabel(colorId));
      }
    });
  }

  createColorPicker(colorId, label) {
    const container = document.createElement('div');
    container.className = 'color-picker-container';
    
    const labelEl = document.createElement('span');
    labelEl.textContent = label;
    container.appendChild(labelEl);
    
    const input = document.createElement('input');
    input.type = 'color';
    input.value = this.state.colors[colorId];
    input.dataset.colorId = colorId;
    
    input.addEventListener('input', (e) => {
      this.setColor(colorId, e.target.value);
    });
    
    container.appendChild(input);
    this.ui.partsContainer.appendChild(container);
    this.ui.colorPickers[colorId] = input;
  }

  initExportButtons() {
    document.getElementById('export-png').addEventListener('click', () => {
      this.exportPNG().then(blob => {
        this.downloadFile(blob, 'character.png');
      });
    });
    
    document.getElementById('export-psd').addEventListener('click', () => {
      this.exportPSD().then(blob => {
        this.downloadFile(blob, 'character.psd');
      });
    });
  }

  updateActiveButton(partId, variantId) {
    // Удаляем активный класс у всех кнопок этой части
    document.querySelectorAll(`button[data-part-id="${partId}"]`).forEach(btn => {
      btn.classList.remove('active');
    });
    
    // Добавляем активный класс выбранной кнопке
    const activeBtn = document.querySelector(
      `button[data-part-id="${partId}"][data-variant-id="${variantId}"]`
    );
    
    if (activeBtn) {
      activeBtn.classList.add('active');
    }
  }

  downloadFile(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  getColorLabel(colorId) {
    // Можно расширить конфиг подписями для цветов
    const labels = {
      ears: 'Цвет ушей',
      eyes: 'Цвет глаз',
      eyesWhite: 'Цвет белков',
      cheeks: 'Цвет щёк',
      head: 'Цвет головы',
      mane: 'Цвет гривы',
      body: 'Цвет тела',
      tail: 'Цвет хвоста'
    };
    
    return labels[colorId] || colorId;
  }
}

  // Методы для работы с состоянием
  setPartVariant(partId, variantId) {
    // Обновляем выбранный вариант части
    this.state.activeParts[partId] = config.parts[partId].variants[variantId];
    this.render();
  }

  setColor(colorId, colorValue) {
    // Устанавливаем новый цвет
    this.state.colors[colorId] = colorValue;
    
    // Если это main цвет - обновляем все связанные части
    if (colorId === 'main') {
      config.colors.main.affects.forEach(affectedPart => {
        this.state.colors[affectedPart] = colorValue;
      });
    }
    
    this.render();
  }

  // Методы экспорта
  async exportPNG() {
    return this.exportEngine.exportToPNG(
      this.ui.previewCanvas,
      config.canvasSettings.width,
      config.canvasSettings.height
    );
  }

  async exportPSD() {
    return this.exportEngine.exportToPSD(
      this.state.psdData,
      this.state.activeParts,
      this.state.colors,
      config.canvasSettings.width,
      config.canvasSettings.height
    );
  }
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
  const editor = new CharacterEditor();
  window.editor = editor; // Делаем доступным глобально для тестов
});
