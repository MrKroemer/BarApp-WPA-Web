import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: '#ffffff',
        font: { size: 12 }
      }
    }
  },
  scales: {
    x: {
      ticks: { color: '#9ca3af' },
      grid: { color: '#374151' }
    },
    y: {
      ticks: { color: '#9ca3af' },
      grid: { color: '#374151' }
    }
  }
};

export const SalesChart = ({ data }) => {
  const chartData = {
    labels: data.labels || [],
    datasets: [{
      label: 'Vendas (R$)',
      data: data.values || [],
      borderColor: '#ff6b35',
      backgroundColor: 'rgba(255, 107, 53, 0.1)',
      tension: 0.4,
      fill: true
    }]
  };

  return (
    <div className="h-64">
      <Line data={chartData} options={chartOptions} />
    </div>
  );
};

export const ProductsChart = ({ data }) => {
  const chartData = {
    labels: data.labels || [],
    datasets: [{
      label: 'Vendas',
      data: data.values || [],
      backgroundColor: [
        '#ff6b35', '#4caf50', '#2196f3', '#ff9800', '#9c27b0'
      ]
    }]
  };

  return (
    <div className="h-64">
      <Bar data={chartData} options={chartOptions} />
    </div>
  );
};

export const StatusChart = ({ data }) => {
  const chartData = {
    labels: data.labels || [],
    datasets: [{
      data: data.values || [],
      backgroundColor: ['#4caf50', '#ff9800', '#f44336', '#2196f3']
    }]
  };

  return (
    <div className="h-64">
      <Doughnut data={chartData} options={{
        ...chartOptions,
        scales: undefined
      }} />
    </div>
  );
};