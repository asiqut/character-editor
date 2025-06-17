import { RenderEngine } from './render-engine.js';
import { ExportEngine } from './export-engine.js';
import config from './config.js';

class CharacterEditor {
  constructor() {
    this.state = {
      activeParts: {},
      colors: {},
      psdData: null
    };

    this.renderEngine = new RenderEngine(config);
    this.exportEngine = new ExportEngine(config);

    this.ui = {
      previewCanvas: document.getElementById('preview-canvas'),
      partsContainer: document.getElementById('parts-container'),
      colorPickers: {}
    };

    this.init();
  }

  async init() {
    await this.loadPSD();
    this.initDefaultState();
    this.render();
    this.initUI();
  }

  async loadPSD() {
    this.state.psdData = await this.renderEngine.loadPSD('assets/model.psd');
  }

  initDefaultState() {
    Object.keys(config.parts).forEach(partId => {
      const part = config.parts[partId];
      
      if (part.isSingleVariant) {
        this.state.activeParts[partId] = part.variant;
      } else {
        const firstVariant = Object.keys(part.variants)[0];
        this.state.activeParts[partId] = part.variants[firstVariant];
      }
    });

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

  setPartVariant(partId, variantId) {
    this.state.activeParts[partId] = config.parts[partId].variants[variantId];
    this.render();
  }

  setColor(colorId, colorValue) {
    this.state.colors[colorId] = colorValue;
    
    if (colorId === 'main') {
      config.colors.main.affects.forEach(affectedPart => {
        this.state.colors[affectedPart] = colorValue;
      });
    }
    
    this.render();
  }

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

document.addEventListener('DOMContentLoaded', () => {
  new CharacterEditor();
});
