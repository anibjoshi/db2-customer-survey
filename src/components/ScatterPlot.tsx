import React from 'react';
import { ScatterChart } from '@carbon/charts-react';
import { AggregatePoint } from '../types';
import { GROUP_COLORS } from '../constants';

interface ScatterPlotProps {
  data: AggregatePoint[];
}

export const ScatterPlot: React.FC<ScatterPlotProps> = ({ data }) => {
  // Transform data for Carbon Charts
  const chartData = data.map(point => ({
    group: point.group,
    key: point.id,
    value: point.x,
    value2: point.y,
    title: `Problem ${point.id}: ${point.title}`
  }));

  const options = {
    title: "Priority Matrix",
    axes: {
      bottom: {
        title: "Frequency (How Often)",
        mapsTo: "value",
        scaleType: "linear",
        domain: [1, 10]
      },
      left: {
        title: "Severity (How Painful)",
        mapsTo: "value2", 
        scaleType: "linear",
        domain: [1, 10]
      }
    },
    color: {
      scale: GROUP_COLORS
    },
    points: {
      radius: 8,
      fillOpacity: 0.8
    },
    tooltip: {
      customHTML: (data: any) => {
        const point = data[0];
        return `
          <div style="padding: 0.5rem;">
            <strong>Problem ${point.key}</strong><br/>
            <span style="color: ${GROUP_COLORS[point.group]}">●</span> ${point.group}<br/>
            Frequency: ${point.value}<br/>
            Severity: ${point.value2}
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
    }
  };

  return (
    <div style={{ 
      width: '100%', 
      height: '500px',
      backgroundColor: 'white',
      border: '1px solid #e0e0e0',
      borderRadius: '4px',
      padding: '1rem'
    }}>
      <ScatterChart
        data={chartData}
        options={options}
      />
    </div>
  );
};
