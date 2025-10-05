import React from 'react';
import { Tile, Heading } from '@carbon/react';
import { SimpleBarChart } from '@carbon/charts-react';
import '@carbon/charts-react/styles.css';
import { Problem, SurveySubmission } from '../types';

interface ChoiceResultsChartProps {
  problems: Problem[];
  submissions: SurveySubmission[];
}

// Classy color palette
const CHART_COLORS = [
  '#8a3ffc', // Purple
  '#33b1ff', // Cyan
  '#007d79', // Teal
  '#ff7eb6', // Pink
  '#fa4d56', // Red
  '#fff1f1', // Light pink
  '#d2a106', // Gold
  '#08bdba', // Aqua
];

export const ChoiceResultsChart: React.FC<ChoiceResultsChartProps> = ({ problems, submissions }) => {
  // Filter to only show choice-based questions (not slider)
  const choiceProblems = problems.filter(p => 
    p.questionType === 'single-choice' || 
    p.questionType === 'multiple-choice' ||
    p.questionType === 'slider-labeled'
  );

  if (choiceProblems.length === 0 || submissions.length === 0) {
    return null;
  }

  // Calculate response counts for each question
  const getResponseData = (problemId: number) => {
    const problem = problems.find(p => p.id === problemId);
    if (!problem) return [];

    const counts: Record<string, number> = {};
    const questionType = problem.questionType || 'slider';

    submissions.forEach(submission => {
      const response = submission.responses.find(r => r.problemId === problemId);
      if (!response) return;

      if (questionType === 'slider-labeled' && response.frequency !== undefined) {
        // For slider-labeled, use the frequency value to get the label
        const label = problem.options?.[response.frequency - 1] || `Option ${response.frequency}`;
        counts[label] = (counts[label] || 0) + 1;
      } else if (response.textResponse) {
        // For single-choice and multiple-choice
        if (questionType === 'multiple-choice') {
          // Multiple selections separated by |||
          const selections = response.textResponse.split('|||').filter(s => s.trim());
          selections.forEach(selection => {
            counts[selection] = (counts[selection] || 0) + 1;
          });
        } else {
          // Single selection
          counts[response.textResponse] = (counts[response.textResponse] || 0) + 1;
        }
      }
    });

    // Convert to Carbon Charts format and sort by count
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .map(([option, count], index) => ({
        group: 'Responses',
        key: option.length > 60 ? option.substring(0, 57) + '...' : option,
        value: count
      }));
  };

  return (
    <div style={{ marginBottom: '3rem' }}>
      {choiceProblems.map(problem => {
        const data = getResponseData(problem.id);
        if (data.length === 0) return null;
        
        const totalResponses = data.reduce((sum, d) => sum + d.value, 0);
        const questionType = problem.questionType || 'slider';

        // Create color scale for this chart
        const colorScale: Record<string, string> = {};
        data.forEach((d, index) => {
          colorScale[d.key] = CHART_COLORS[index % CHART_COLORS.length];
        });

        return (
          <Tile key={problem.id} style={{ padding: '1.5rem', marginBottom: '1.5rem', backgroundColor: '#262626' }}>
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.75rem', opacity: 0.7, marginBottom: '0.25rem' }}>
                Question #{problem.id} • {questionType === 'slider-labeled' ? 'Slider' : questionType === 'multiple-choice' ? 'Multiple Choice' : 'Single Choice'}
              </div>
              <Heading style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>
                {problem.title}
              </Heading>
              <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                {totalResponses} {totalResponses === 1 ? 'response' : 'responses'}
                {questionType === 'multiple-choice' && ' (multiple selections allowed)'}
              </div>
            </div>

            <div style={{ height: '400px' }}>
              <SimpleBarChart
                data={data}
                options={{
                  title: '',
                  theme: 'g100',
                  height: '400px',
                  axes: {
                    left: {
                      mapsTo: 'value',
                      title: 'Number of responses'
                    },
                    bottom: {
                      mapsTo: 'key',
                      scaleType: 'labels',
                      truncation: {
                        type: 'mid_line',
                        threshold: 25,
                        numCharacter: 25
                      }
                    }
                  },
                  color: {
                    scale: colorScale
                  },
                  toolbar: {
                    enabled: false
                  },
                  legend: {
                    enabled: false
                  },
                  bars: {
                    maxWidth: 50
                  },
                  tooltip: {
                    truncation: {
                      type: 'none'
                    }
                  }
                }}
              />
            </div>
          </Tile>
        );
      })}
    </div>
  );
};
