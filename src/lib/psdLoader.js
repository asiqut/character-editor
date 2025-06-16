import * as PSD from 'ag-psd';

export async function loadPSD() {
  try {
    const response = await fetch(`${window.publicPath || ''}/assets/model_kinwoods.psd`);
    const arrayBuffer = await response.arrayBuffer();
    const psd = PSD.readPsd(arrayBuffer, {
      parseLayerBlendingModes: true, // Важно!
      useImageData: true,
      preserveLayerPositions: true
    });
    
    // Добавим логирование для отладки
    console.log('Loaded PSD structure:', psd);
    return psd;
  } catch (error) {
    console.error('Error loading PSD:', error);
    throw error;
  }
}
    
    // Нормализация данных
    psd.children.forEach(group => {
      if (group.children) {
        group.children.forEach(layer => {
          // Убедимся, что позиции есть
          layer.left = layer.left || 0;
          layer.top = layer.top || 0;
        });
      }
    });
    
    return psd;
  } catch (error) {
    console.error('Error loading PSD:', error);
    throw error;
  }
}
