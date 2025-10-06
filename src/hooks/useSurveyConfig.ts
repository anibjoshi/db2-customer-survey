import { useState, useEffect } from 'react';
import { Problem, ProblemGroup, QuestionType } from '../types';
import { configManager } from '../storage/configManager';

interface SurveySection {
  id: string;
  name: string;
  color?: string;
  problems: Array<{
    id: number;
    title: string;
    questionType?: QuestionType;
    options?: string[];
  }>;
}

export interface SurveyConfig {
  title: string;
  description: string;
  sections: SurveySection[];
}

// Predefined color palette for sections
const COLOR_PALETTE = [
  '#3b82f6', // Blue
  '#10b981', // Green
  '#8b5cf6', // Purple
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#06b6d4', // Cyan
  '#ec4899', // Pink
  '#84cc16', // Lime
  '#f97316', // Orange
  '#14b8a6', // Teal
];

export const useSurveyConfig = () => {
  const [config, setConfig] = useState<SurveyConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        setLoading(true);
        // Try loading from API first (database)
        const API_BASE_URL = import.meta.env.VITE_API_URL || 
          (import.meta.env.MODE === 'production' ? '/api' : 'http://localhost:3001/api');
        const response = await fetch(`${API_BASE_URL}/config`);
        
        if (response.ok) {
          const data = await response.json();
          setConfig(data);
          setLoading(false);
          return;
        }
        
        // Fallback to localStorage override
        const customConfig = configManager.loadConfig();
        if (customConfig) {
          setConfig(customConfig);
          setLoading(false);
          return;
        }
        
        // Final fallback to JSON file
        const fileResponse = await fetch('/survey-config.json');
        if (!fileResponse.ok) {
          throw new Error('Failed to load survey configuration');
        }
        const data = await fileResponse.json();
        setConfig(data);
        setLoading(false);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    };
    
    loadConfig();
  }, [reloadTrigger]);

  const reload = () => {
    setReloadTrigger(prev => prev + 1);
  };

  // Transform config to match existing Problem type
  const problems: Problem[] = config
    ? config.sections.flatMap(section =>
        section.problems.map(problem => ({
          id: problem.id,
          title: problem.title,
          group: section.name as ProblemGroup,
          questionType: problem.questionType || 'slider',
          options: problem.options
        }))
      )
    : [];

  // Transform config to match existing GROUP_COLORS type
  // Auto-assign colors from palette if not specified
  const groupColors: Record<string, string> = config
    ? config.sections.reduce((acc, section, index) => {
        acc[section.name] = section.color || COLOR_PALETTE[index % COLOR_PALETTE.length];
        return acc;
      }, {} as Record<string, string>)
    : {};

  return {
    config,
    problems,
    groupColors,
    loading,
    error,
    reload
  };
};

