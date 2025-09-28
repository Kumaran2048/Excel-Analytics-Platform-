import React, { useEffect, useRef } from 'react';
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
  Filler,
  RadialLinearScale,
} from 'chart.js';
import { Line, Bar, Pie, Doughnut, Scatter, Radar, PolarArea } from 'react-chartjs-2';
import { gsap } from 'gsap';
import { motion } from 'framer-motion';
import * as THREE from 'three';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  RadialLinearScale
);

const Chart2D = ({ data, chartType = 'bar', xAxis, yAxis, title, options = {}, animation = { type: 'gsap' } }) => {
  const chartRef = useRef(null);
  const containerRef = useRef(null);
  const threeRef = useRef({ renderer: null, scene: null, camera: null, raf: null });

  useEffect(() => {
    const handleResize = () => {
      if (chartRef.current && chartRef.current.chartInstance) {
        const instance = chartRef.current.chartInstance || chartRef.current.chart;
        if (instance && instance.resize) instance.resize();
      }
      if (animation?.type === 'three' && threeRef.current.renderer && containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        threeRef.current.renderer.setSize(clientWidth, clientHeight);
        threeRef.current.camera.aspect = clientWidth / clientHeight;
        threeRef.current.camera.updateProjectionMatrix();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [animation]);

  useEffect(() => {
    if (animation?.type !== 'gsap') return;
    const el = containerRef.current;
    if (!el) return;

    const tl = gsap.timeline();
    tl.fromTo(
      el,
      { autoAlpha: 0, y: 18, scale: 0.995 },
      { autoAlpha: 1, y: 0, scale: 1, duration: 0.7, ease: 'power3.out' }
    );

    const chartInst = chartRef.current && (chartRef.current.chartInstance || chartRef.current.chart);
    if (chartInst) {
      gsap.fromTo(
        chartInst, 
        { alpha: 0 },
        {
          alpha: 1,
          duration: 0.9,
          onUpdate: () => {
            try {
              if (chartInst && chartInst.options) {
                chartInst.update();
              }
            } catch (e) {}
          }
        }
      );
    }

    return () => tl.kill();
  }, [animation]);

  useEffect(() => {
    if (animation?.type !== 'three') return;
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 50;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = 0;
    renderer.domElement.style.left = 0;
    renderer.domElement.style.zIndex = 0;

    container.insertBefore(renderer.domElement, container.firstChild);

    const particlesCount = Math.min(200, Math.floor((container.clientWidth * container.clientHeight) / 3000));
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * container.clientWidth / 6;
      positions[i * 3 + 1] = (Math.random() - 0.5) * container.clientHeight / 6;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({ size: 1.2, transparent: true, opacity: 0.25 });
    const points = new THREE.Points(geometry, material);
    scene.add(points);

    const ambient = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambient);

    let frameId;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      points.rotation.y += 0.0008;
      points.rotation.x += 0.0004;
      renderer.render(scene, camera);
    };

    animate();

    threeRef.current = { renderer, scene, camera, raf: frameId };

    return () => {
      if (threeRef.current.raf) cancelAnimationFrame(threeRef.current.raf);
      if (threeRef.current.renderer) {
        threeRef.current.renderer.dispose();
        if (threeRef.current.renderer.domElement && threeRef.current.renderer.domElement.parentNode) {
          threeRef.current.renderer.domElement.parentNode.removeChild(threeRef.current.renderer.domElement);
        }
      }
      geometry.dispose();
      material.dispose();
    };
  }, [animation]);

  const getChartData = () => {
    if (!data || !xAxis || !yAxis) return { labels: [], datasets: [] };

    let labels, values;

    if (chartType === 'scatter') {
      const scatterData = data.map(item => ({ x: item[xAxis], y: item[yAxis] }));
      return {
        datasets: [
          {
            label: `${yAxis} vs ${xAxis}`,
            data: scatterData,
            backgroundColor: 'rgba(255, 99, 132, 0.6)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1,
            pointRadius: 5,
            pointHoverRadius: 7,
          },
        ],
      };
    }

    if (chartType === 'radar' || chartType === 'polarArea') {
      labels = data.map(item => item[xAxis]);
      values = data.map(item => item[yAxis]);
    } else {
      labels = data.slice(0, 20).map(item => item[xAxis]);
      values = data.slice(0, 20).map(item => item[yAxis]);
    }

    const backgroundColors = [
      'rgba(255, 99, 132, 0.6)',
      'rgba(54, 162, 235, 0.6)',
      'rgba(255, 206, 86, 0.6)',
      'rgba(75, 192, 192, 0.6)',
      'rgba(153, 102, 255, 0.6)',
      'rgba(255, 159, 64, 0.6)',
      'rgba(199, 199, 199, 0.6)',
      'rgba(83, 102, 255, 0.6)',
      'rgba(40, 159, 64, 0.6)',
      'rgba(210, 99, 132, 0.6)',
    ];

    return {
      labels,
      datasets: [
        {
          label: yAxis,
          data: values,
          backgroundColor:
            chartType === 'line' || chartType === 'bar' || chartType === 'radar'
              ? backgroundColors[0]
              : backgroundColors.slice(0, values.length),
          borderColor: chartType === 'line' || chartType === 'bar' || chartType === 'radar' ? 'rgba(255, 99, 132, 1)' : undefined,
          borderWidth: 1,
          fill: chartType === 'line' || chartType === 'radar' ? true : false,
          pointBackgroundColor: chartType === 'line' || chartType === 'radar' ? 'rgba(255, 99, 132, 1)' : undefined,
          pointBorderColor: chartType === 'line' || chartType === 'radar' ? '#fff' : undefined,
          pointHoverBackgroundColor: chartType === 'line' || chartType === 'radar' ? 'rgba(255, 99, 132, 1)' : undefined,
          pointHoverBorderColor: chartType === 'line' || chartType === 'radar' ? 'rgba(255, 99, 132, 1)' : undefined,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          boxWidth: 12,
          font: {
            size: window.innerWidth < 768 ? 10 : 12,
          },
        },
      },
      title: {
        display: true,
        text: title || `${yAxis} vs ${xAxis}`,
        font: {
          size: window.innerWidth < 768 ? 14 : 16,
        },
      },
      tooltip: {
        mode: chartType === 'scatter' ? 'point' : 'index',
        intersect: false,
        titleFont: { size: window.innerWidth < 768 ? 10 : 12 },
        bodyFont: { size: window.innerWidth < 768 ? 10 : 12 },
      },
    },
    scales: chartType === 'line' || chartType === 'bar' ? {
      y: {
        beginAtZero: true,
        title: { display: true, text: yAxis, font: { size: window.innerWidth < 768 ? 10 : 12 } },
        ticks: { font: { size: window.innerWidth < 768 ? 8 : 10 } },
      },
      x: {
        title: { display: true, text: xAxis, font: { size: window.innerWidth < 768 ? 10 : 12 } },
        ticks: { font: { size: window.innerWidth < 768 ? 8 : 10 }, maxRotation: window.innerWidth < 768 ? 45 : 0, autoSkip: true, maxTicksLimit: window.innerWidth < 768 ? 5 : 10 },
      },
    } : undefined,
    ...options,
  };

  const renderChart = () => {
    const chartData = getChartData();

    switch (chartType) {
      case 'line':
        return <Line ref={chartRef} data={chartData} options={chartOptions} />;
      case 'bar':
        return <Bar ref={chartRef} data={chartData} options={chartOptions} />;
      case 'pie':
        return <Pie ref={chartRef} data={chartData} options={chartOptions} />;
      case 'doughnut':
        return <Doughnut ref={chartRef} data={chartData} options={chartOptions} />;
      case 'scatter':
        return <Scatter ref={chartRef} data={chartData} options={chartOptions} />;
      case 'radar':
        return <Radar ref={chartRef} data={chartData} options={chartOptions} />;
      case 'polarArea':
        return <PolarArea ref={chartRef} data={chartData} options={chartOptions} />;
      default:
        return <Bar ref={chartRef} data={chartData} options={chartOptions} />;
    }
  };

  const content = (
    <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow-md w-full h-full" style={{ position: 'relative', zIndex: 1 }}>
      <div
        ref={containerRef}
        className="chart-container"
        style={{ position: 'relative', height: 'clamp(300px, 50vh, 600px)', width: '100%' }}
      >
        {xAxis && yAxis ? (
          <div style={{ position: 'relative', zIndex: 2, height: '100%' }}>
            {renderChart()}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base text-center px-2">
              Please select X and Y axes to generate chart
            </p>
          </div>
        )}
      </div>
    </div>
  );

  if (animation?.type === 'framer') {
    const framerDefaults = {
      initial: { opacity: 0, y: 12, scale: 0.995 },
      animate: { opacity: 1, y: 0, scale: 1 },
      transition: { duration: 0.6, ease: 'easeOut' },
    };

    const props = { ...framerDefaults, ...(animation.framerProps || {}) };

    return (
      <motion.div {...props} style={{ width: '100%' }}>
        {content}
      </motion.div>
    );
  }

  return <div style={{ width: '100%' }}>{content}</div>;
};

export default Chart2D;