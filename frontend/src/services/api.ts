// src/services/api.ts
import axios from 'axios';
const backendUrl = import.meta.env.VITE_API_BASE_URL;
const API_URL = `${backendUrl}/api`;

export const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await axios.post(`${API_URL}/upload/file`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log("RESPONSE", response);
    return response.data;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

export const uploadText = async (text: string) => {
  try {
    const response = await axios.post(`${API_URL}/upload/text`, { text });
    console.log("RESPONSE", response.data);
    return response.data;
  } catch (error) {
    console.error('Error uploading text:', error);
    throw error;
  }
};