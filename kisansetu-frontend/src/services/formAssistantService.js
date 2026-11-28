import apiClient from '../api/axiosClient';

/**
 * Service to communicate with Spring Boot / FastAPI Form Assistant endpoints.
 */
export const formAssistantService = {
  /**
   * Send transcribed spoken text + active form schema for AI field extraction.
   */
  async extractFromVoice({ audioText, formSchema, language = 'hi', currentValues = {} }) {
    try {
      const response = await apiClient.post('/form-assistant/voice-extract', {
        audioText,
        formSchema,
        language,
        currentValues,
      });

      // Handle standard ApiResponse wrapper: response.data.data or response.data
      const data = response.data?.data || response.data;
      return data;
    } catch (error) {
      console.warn('Form assistant voice extraction API error:', error);
      throw error;
    }
  },

  /**
   * Upload image / document + active form schema for OCR & AI field extraction.
   */
  async extractFromDocument({ file, formSchema, currentValues = {}, language = 'hi' }) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('formSchema', JSON.stringify(formSchema));
      formData.append('currentValues', JSON.stringify(currentValues));
      formData.append('language', language);

      const response = await apiClient.post('/form-assistant/document-extract', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = response.data?.data || response.data;
      return data;
    } catch (error) {
      console.warn('Form assistant document extraction API error:', error);
      throw error;
    }
  },
};

export default formAssistantService;
