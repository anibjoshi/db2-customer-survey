const CONFIG_KEY = 'zora_survey_config_override';

interface SurveyConfig {
  title: string;
  description: string;
  sections: Array<{
    id: string;
    name: string;
    color?: string;
    problems: Array<{
      id: number;
      title: string;
    }>;
  }>;
}

export const configManager = {
  // Save custom config
  saveConfig(config: SurveyConfig): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
    } catch (error) {
      console.error('Failed to save config:', error);
    }
  },

  // Load custom config
  loadConfig(): SurveyConfig | null {
    if (typeof window === 'undefined') return null;
    try {
      const data = localStorage.getItem(CONFIG_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to load config:', error);
      return null;
    }
  },

  // Check if custom config exists
  hasCustomConfig(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(CONFIG_KEY) !== null;
  },

  // Clear custom config (revert to default)
  clearConfig(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(CONFIG_KEY);
    } catch (error) {
      console.error('Failed to clear config:', error);
    }
  },

  // Export config as JSON file
  exportConfig(config: SurveyConfig): void {
    const dataStr = JSON.stringify(config, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `survey-config-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

