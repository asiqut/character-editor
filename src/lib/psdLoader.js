import * as PSD from 'ag-psd';

export async function loadPSD() {
  try {
    const response = await fetch(`${window.publicPath || ''}/assets/model_kinwoods.psd`);
    if (!response.ok) throw new Error(`Failed to fetch PSD: ${response.status}`);
    
    const arrayBuffer = await response.arrayBuffer();
    const psd = PSD.readPsd(arrayBuffer);
    
    if (!psd || !psd.children) throw new Error('Invalid PSD structure');
    
    // Просто возвращаем данные PSD без сложной обработки
    return psd;
  } catch (error) {
    console.error('Error loading PSD:', error);
    throw error;
  }
}
