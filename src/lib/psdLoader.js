import PSD from 'psd';

export async function loadPSD() {
  try {
    // Для GitHub Pages используем правильный путь
    const response = await fetch(`${process.env.PUBLIC_URL}/assets/model_kinwoods.psd`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch PSD: ${response.status}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    return await PSD.fromArrayBuffer(arrayBuffer);
  } catch (error) {
    console.error('Error loading PSD:', error);
    throw error;
  }
}
