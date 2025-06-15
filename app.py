import os
import json
from dataclasses import asdict
from typing import Dict, List, Optional

import pygame
from psd_tools import PSDImage
from PIL import Image
from pygame import Surface, Rect

from config import config


class CharacterEditor:
    def __init__(self):
        pygame.init()
        self.screen = pygame.display.set_mode((800, 600))
        pygame.display.set_caption("Character Editor")
        
        self.clock = pygame.time.Clock()
        self.running = True
        
        # Загрузка PSD файла
        self.psd = self.load_psd()
        
        # Загрузка пресетов
        self.presets = self.load_presets()
        
        # Текущие настройки персонажа
        self.current_settings = {
            "ears": "normal",
            "tail": "long",
            "color": "default"
        }
        
        # Кэш изображений
        self.image_cache = {}
        
        # Элементы интерфейса
        self.buttons = self.create_ui_elements()
        
    def load_psd(self) -> Optional[PSDImage]:
        """Загружает PSD файл."""
        if not os.path.exists(config.PSD_FILE):
            print(f"PSD файл не найден: {config.PSD_FILE}")
            return None
        return PSDImage.open(config.PSD_FILE)
    
    def load_presets(self) -> Dict:
        """Загружает все пресеты из папки."""
        presets = {}
        for preset_file in os.listdir(config.PRESETS_DIR):
            if preset_file.endswith('.json'):
                preset_name = preset_file.split('.')[0]
                with open(os.path.join(config.PRESETS_DIR, preset_file), 'r') as f:
                    presets[preset_name] = json.load(f)
        return presets
    
    def create_ui_elements(self) -> List[Dict]:
        """Создает элементы интерфейса."""
        buttons = []
        
        # Кнопки для ушей
        buttons.append({
            "rect": pygame.Rect(50, 100, 200, 40),
            "text": "Нормальные уши",
            "action": lambda: self.update_setting("ears", "normal"),
            "active": self.current_settings["ears"] == "normal"
        })
        
        buttons.append({
            "rect": pygame.Rect(50, 150, 200, 40),
            "text": "Приплюснутые уши",
            "action": lambda: self.update_setting("ears", "flattened"),
            "active": self.current_settings["ears"] == "flattened"
        })
        
        # Кнопки для хвоста
        buttons.append({
            "rect": pygame.Rect(50, 250, 200, 40),
            "text": "Длинный хвост",
            "action": lambda: self.update_setting("tail", "long"),
            "active": self.current_settings["tail"] == "long"
        })
        
        buttons.append({
            "rect": pygame.Rect(50, 300, 200, 40),
            "text": "Короткий хвост",
            "action": lambda: self.update_setting("tail", "short"),
            "active": self.current_settings["tail"] == "short"
        })
        
        # Кнопка сохранения
        buttons.append({
            "rect": pygame.Rect(50, 450, 200, 50),
            "text": "Сохранить персонажа",
            "action": self.save_character,
            "active": False
        })
        
        return buttons
    
    def update_setting(self, setting: str, value: str):
        """Обновляет настройку персонажа."""
        self.current_settings[setting] = value
        self.update_ui_active_states()
    
    def update_ui_active_states(self):
        """Обновляет состояние кнопок."""
        for button in self.buttons:
            if "update_setting" in button["text"].lower():
                setting = button["text"].split()[0].lower()
                value = button["text"].split()[1].lower()
                button["active"] = self.current_settings.get(setting) == value
    
    def render_character(self) -> Optional[Surface]:
        """Рендерит персонажа с текущими настройками."""
        if not self.psd:
            return None
            
        # Генерируем ключ кэша на основе текущих настроек
        cache_key = json.dumps(self.current_settings, sort_keys=True)
        
        # Если изображение уже в кэше, возвращаем его
        if cache_key in self.image_cache:
            return self.image_cache[cache_key]
        
        try:
            # Создаем временное изображение для рендера
            temp_image = Image.new("RGBA", self.psd.size, (0, 0, 0, 0))
            
            # Применяем пресеты к слоям
            for layer in self.psd:
                layer_visible = self.should_layer_be_visible(layer.name)
                if layer_visible:
                    layer_image = layer.compose()
                    temp_image = Image.alpha_composite(temp_image, layer_image)
            
            # Конвертируем PIL Image в pygame Surface
            mode = temp_image.mode
            size = temp_image.size
            data = temp_image.tobytes()
            
            pygame_image = pygame.image.fromstring(data, size, mode)
            self.image_cache[cache_key] = pygame_image
            
            return pygame_image
        except Exception as e:
            print(f"Ошибка при рендеринге персонажа: {e}")
            return None
    
    def should_layer_be_visible(self, layer_name: str) -> bool:
        """Определяет, должен ли слой быть видимым с текущими настройками."""
        # Здесь должна быть ваша логика для определения видимости слоев
        # на основе текущих настроек и ваших пресетов
        
        # Пример простой логики:
        if "ears" in layer_name.lower():
            return self.current_settings["ears"] in layer_name.lower()
        elif "tail" in layer_name.lower():
            return self.current_settings["tail"] in layer_name.lower()
        
        return True  # По умолчанию показываем слой
    
    def save_character(self):
        """Сохраняет персонажа в PSD и PNG."""
        if not self.psd:
            return
            
        # Создаем папки для сохранения, если их нет
        os.makedirs(config.OUTPUT_DIR, exist_ok=True)
        os.makedirs(config.TEMP_DIR, exist_ok=True)
        
        # Генерируем имя файла на основе настроек
        filename = "_".join(f"{k}-{v}" for k, v in self.current_settings.items())
        
        # Сохраняем как PNG
        png_path = os.path.join(config.OUTPUT_DIR, f"{filename}.png")
        character_image = self.render_character()
        if character_image:
            pygame.image.save(character_image, png_path)
            print(f"Персонаж сохранен как PNG: {png_path}")
        
        # Сохраняем как PSD (упрощенный вариант)
        # В реальном проекте нужно правильно обновлять видимость слоев в PSD
        psd_path = os.path.join(config.OUTPUT_DIR, f"{filename}.psd")
        self.psd.save(psd_path)
        print(f"Персонаж сохранен как PSD: {psd_path}")
    
    def handle_events(self):
        """Обрабатывает события."""
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                self.running = False
            
            if event.type == pygame.MOUSEBUTTONDOWN:
                if event.button == 1:  # Левая кнопка мыши
                    for button in self.buttons:
                        if button["rect"].collidepoint(event.pos):
                            button["action"]()
    
    def render_ui(self):
        """Рендерит интерфейс."""
        self.screen.fill(config.BACKGROUND_COLOR)
        
        # Рендер кнопок
        for button in self.buttons:
            color = config.BUTTON_COLOR if button["active"] else (200, 200, 200)
            pygame.draw.rect(self.screen, color, button["rect"])
            pygame.draw.rect(self.screen, (0, 0, 0), button["rect"], 2)
            
            font = pygame.font.SysFont(None, 24)
            text = font.render(button["text"], True, config.TEXT_COLOR)
            text_rect = text.get_rect(center=button["rect"].center)
            self.screen.blit(text, text_rect)
        
        # Рендер персонажа
        character = self.render_character()
        if character:
            char_rect = character.get_rect(center=(550, 300))
            self.screen.blit(character, char_rect)
    
    def run(self):
        """Главный цикл приложения."""
        while self.running:
            self.handle_events()
            self.render_ui()
            pygame.display.flip()
            self.clock.tick(60)
        
        pygame.quit()


if __name__ == "__main__":
    editor = CharacterEditor()
    editor.run()
