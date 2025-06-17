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
    // Здесь будет инициализация интерфейса
    // Пока заглушка:
    console.log('UI will be initialized here');
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
