import React, { useMemo } from 'react';
import { ScatterChart } from '@carbon/charts-react';
import { AggregatePoint } from '../types';
import { GROUP_COLORS } from '../constants';

interface ScatterPlotProps {
  data: AggregatePoint[];
}

export const ScatterPlot: React.FC<ScatterPlotProps> = React.memo(({ data }) => {
  // Transform data for Carbon Charts
  // Use deterministic jitter based on title hash so points stay in same place
  // Memoize to prevent re-computation on every render
  const chartData = useMemo(() => data.map((point) => {
    // Create a consistent seed from the title
    const seed = point.title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const jitterX = ((seed % 100) / 100 - 0.5) * 0.15;
    const jitterY = (((seed * 17) % 73) / 73 - 0.5) * 0.15; // Use different multiplier for Y
    
    return {
      group: point.group,
      key: point.title,
      value: point.x + jitterX,
      value2: point.y + jitterY
    };
  }), [data]);

  const options = {
    title: "Priority Matrix",
    theme: "g90",
    axes: {
      bottom: {
        title: "Frequency (How Often)",
        mapsTo: "value",
        domain: [1, 10]
      },
      left: {
        title: "Severity (How Painful)",
        mapsTo: "value2", 
        domain: [1, 10]
      }
    },
    color: {
      scale: GROUP_COLORS as any
    },
    points: {
      radius: 8,
      fillOpacity: 0.8
    },
    tooltip: {
      customHTML: (data: any) => {
        const point = data[0];
        return `
          <div style="padding: 0.75rem; background-color: #262626; color: #f4f4f4; border-radius: 4px; max-width: 300px;">
            <strong style="font-size: 0.875rem;">${point.key}</strong><br/>
            <span style="color: ${(GROUP_COLORS as any)[point.group]}">●</span> <span style="font-size: 0.75rem;">${point.group}</span><br/>
            <div style="margin-top: 0.5rem; font-size: 0.75rem;">
              Frequency: ${point.value}<br/>
              Severity: ${point.value2}
            </div>
          </div>
        `;
      }
    },
    grid: {
      x: {
        enabled: true
      },
      y: {
        enabled: true
      }
    },
    legend: {
      enabled: false
    },
    toolbar: {
      enabled: true
    }
  };

  return (
    <div style={{ 
      width: '100%', 
      height: '500px',
      backgroundColor: '#262626',
      border: '1px solid #393939',
      borderRadius: '4px',
      padding: '1rem'
    }}>
      <ScatterChart
        data={chartData}
        options={options}
      />
    </div>
  );
});
