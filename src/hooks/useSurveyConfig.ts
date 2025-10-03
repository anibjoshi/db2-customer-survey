import { useState, useEffect } from 'react';
import { Problem, ProblemGroup } from '../types';

interface SurveySection {
  id: string;
  name: string;
  color?: string;
  problems: Array<{
    id: number;
    title: string;
  }>;
}

interface SurveyConfig {
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

  useEffect(() => {
    fetch('/survey-config.json')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to load survey configuration');
        }
        return response.json();
      })
      .then((data: SurveyConfig) => {
        setConfig(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Transform config to match existing Problem type
  const problems: Problem[] = config
    ? config.sections.flatMap(section =>
        section.problems.map(problem => ({
          id: problem.id,
          title: problem.title,
          group: section.name as ProblemGroup
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
    error
  };
};

