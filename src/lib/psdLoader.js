export async function loadPSD() {
  try {
    const response = await fetch(`${process.env.PUBLIC_URL}/assets/model_kinwoods.psd`);
    if (!response.ok) throw new Error('PSD file not found');
    return await response.arrayBuffer();
  } catch (error) {
    console.error('Failed to load PSD:', error);
    throw error;
  }
}
