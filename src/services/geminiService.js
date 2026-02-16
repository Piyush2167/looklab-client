// Gemini AI Service for frontend
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

class GeminiService {
  
  /**
   * Check service status and availability
   */
  static async checkServiceStatus() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/status`);
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Test Gemini connection
   */
  static async testConnection() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/test-gemini`);
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Analyze face shape and features (lightweight operation)
   */
  static async analyzeFace(imageFile) {
    try {
      // Check service availability first
      const statusCheck = await this.checkServiceStatus();
      if (!statusCheck.success || !statusCheck.data.canMakeRequest) {
        return { 
          success: false, 
          error: 'Service is busy. Please wait a moment before trying again.',
          retryAfter: statusCheck.data?.minInterval / 1000 || 2
        };
      }

      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await fetch(`${API_BASE_URL}/api/ai/analyze-face`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      
      if (response.status === 429) {
        return { 
          success: false, 
          error: data.message,
          retryAfter: data.retryAfter 
        };
      }

      return { success: response.ok, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Analyze single style compatibility (main feature)
   */
  static async analyzeSingleStyle(imageFile, styleOptions = {}) {
    try {
      // Check service availability first
      const statusCheck = await this.checkServiceStatus();
      if (!statusCheck.success || !statusCheck.data.canMakeRequest) {
        return { 
          success: false, 
          error: 'Service is busy. Please wait a moment before trying again.',
          retryAfter: statusCheck.data?.minInterval / 1000 || 2
        };
      }

      const formData = new FormData();
      formData.append('image', imageFile);
      
      // Add style information
      if (styleOptions.styleId) {
        formData.append('styleId', styleOptions.styleId);
      }
      if (styleOptions.styleName) {
        formData.append('styleName', styleOptions.styleName);
      }
      if (styleOptions.stylePrompt) {
        formData.append('stylePrompt', styleOptions.stylePrompt);
      }

      const response = await fetch(`${API_BASE_URL}/api/ai/analyze-single-style`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      
      if (response.status === 429) {
        return { 
          success: false, 
          error: data.message,
          retryAfter: data.retryAfter 
        };
      }

      return { success: response.ok, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get personalized style recommendations
   */
  static async getRecommendations(imageFile, preferences = {}) {
    try {
      // Check service availability first
      const statusCheck = await this.checkServiceStatus();
      if (!statusCheck.success || !statusCheck.data.canMakeRequest) {
        return { 
          success: false, 
          error: 'Service is busy. Please wait a moment before trying again.',
          retryAfter: statusCheck.data?.minInterval / 1000 || 2
        };
      }

      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('preferences', JSON.stringify(preferences));

      const response = await fetch(`${API_BASE_URL}/api/ai/style-recommendations`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      
      if (response.status === 429) {
        return { 
          success: false, 
          error: data.message,
          retryAfter: data.retryAfter 
        };
      }

      return { success: response.ok, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Handle rate limiting with retry logic
   */
  static async makeRequestWithRetry(requestFunction, maxRetries = 2) {
    let attempt = 0;
    
    while (attempt < maxRetries) {
      try {
        const result = await requestFunction();
        
        if (result.success) {
          return result;
        }
        
        // If rate limited, wait and retry
        if (result.retryAfter && attempt < maxRetries - 1) {
          await new Promise(resolve => 
            setTimeout(resolve, result.retryAfter * 1000)
          );
          attempt++;
          continue;
        }
        
        return result;
      } catch (error) {
        if (attempt === maxRetries - 1) {
          return { success: false, error: error.message };
        }
        attempt++;
      }
    }
  }

  /**
   * Extract face shape from analysis text
   */
  static extractFaceShape(analysisText) {
    if (!analysisText) return null;
    
    const text = analysisText.toLowerCase();
    const shapes = ['oval', 'round', 'square', 'heart', 'diamond', 'oblong'];
    
    for (const shape of shapes) {
      if (text.includes(shape)) {
        return shape.charAt(0).toUpperCase() + shape.slice(1);
      }
    }
    
    return null;
  }

  /**
   * Parse structured analysis response
   */
  static parseAnalysis(analysisText) {
    if (!analysisText) return {};
    
    const sections = {};
    const lines = analysisText.split('\n');
    let currentSection = 'general';
    let currentContent = [];
    
    lines.forEach(line => {
      const trimmed = line.trim();
      
      // Check for section headers (markdown style)
      if (trimmed.startsWith('##') || trimmed.startsWith('**')) {
        // Save previous section
        if (currentContent.length > 0) {
          sections[currentSection] = currentContent.join('\n').trim();
        }
        
        // Start new section
        currentSection = trimmed.replace(/[#*]/g, '').trim().toLowerCase().replace(/\s+/g, '_');
        currentContent = [];
      } else if (trimmed) {
        currentContent.push(trimmed);
      }
    });
    
    // Save last section
    if (currentContent.length > 0) {
      sections[currentSection] = currentContent.join('\n').trim();
    }
    
    return sections;
  }

  /**
   * Generate visual hairstyle transformation using Gemini 3 Pro Image
   */
  static async generateVisualStyle(imageFile, styleOptions = {}) {
    try {
      // Check service availability first
      const statusCheck = await this.checkServiceStatus();
      if (!statusCheck.success || !statusCheck.data.canMakeRequest) {
        return { 
          success: false, 
          error: 'Service is busy. Please wait a moment before trying again.',
          retryAfter: statusCheck.data?.minInterval / 1000 || 3
        };
      }

      const formData = new FormData();
      formData.append('image', imageFile);
      
      // Add style information
      if (styleOptions.styleId) {
        formData.append('styleId', styleOptions.styleId);
      }
      if (styleOptions.styleName) {
        formData.append('styleName', styleOptions.styleName);
      }
      if (styleOptions.stylePrompt) {
        formData.append('stylePrompt', styleOptions.stylePrompt);
      }
      
      // Control whether to generate image (default: true)
      if (styleOptions.generateImage !== undefined) {
        formData.append('generateImage', styleOptions.generateImage.toString());
      }

      const response = await fetch(`${API_BASE_URL}/api/ai/generate-visual-style`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      
      if (response.status === 429) {
        return { 
          success: false, 
          error: data.message,
          retryAfter: data.retryAfter 
        };
      }

      return { success: response.ok, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Check Gemini image generation status
   */
  static async checkImageGenerationStatus() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/image-generation-status`);
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  /**
   * Format analysis for display
   */
  static formatAnalysisForDisplay(analysisText) {
    const sections = this.parseAnalysis(analysisText);
    
    return {
      faceShape: sections.face_shape_analysis || sections.general || '',
      compatibility: sections.style_compatibility || '',
      instructions: sections.styling_instructions || '',
      maintenance: sections.maintenance_requirements || '',
      variations: sections.variations || '',
      recommendation: sections.professional_recommendation || ''
    };
  }
}

export default GeminiService;