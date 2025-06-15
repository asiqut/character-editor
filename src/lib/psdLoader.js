import * as PSD from 'ag-psd'; // Используем только ag-psd

export async function loadPSD() {
  try {
    const response = await fetch(`${process.env.PUBLIC_URL}/assets/model_kinwoods.psd`);
    if (!response.ok) throw new Error('Failed to fetch PSD file');
    
    const arrayBuffer = await response.arrayBuffer();
    return PSD.readPsd(arrayBuffer); // Метод из ag-psd
  } catch (error) {
    console.error('PSD load error:', error);
    throw error;
  }
}
