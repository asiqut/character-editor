import { Editor } from './render-engine.js';
import { ExportManager } from './export-engine.js';
import config from './config.js';

class CharacterEditorApp {
  constructor() {
    this.editor = new Editor('#preview-canvas', config);
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Кнопки выбора частей
    document.querySelectorAll('[data-part]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.editor.setPart(
          btn.dataset.part, 
          btn.dataset.variant
        );
      });
    });

    // Кнопки экспорта
    document.getElementById('export-png').addEventListener('click', () => {
      ExportManager.exportPNG(this.editor.character);
    });
  }
}

// Запуск приложения
new CharacterEditorApp();
