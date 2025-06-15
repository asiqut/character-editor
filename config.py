import os
from dataclasses import dataclass

@dataclass
class Config:
    ASSETS_DIR = "assets"
    PRESETS_DIR = "presets"
    OUTPUT_DIR = "output"
    TEMP_DIR = os.path.join(OUTPUT_DIR, "temp")
    
    PSD_FILE = os.path.join(ASSETS_DIR, "character.psd")
    
    # Цвета интерфейса
    BACKGROUND_COLOR = (240, 240, 240)
    BUTTON_COLOR = (70, 130, 180)
    TEXT_COLOR = (255, 255, 255)

config = Config()
