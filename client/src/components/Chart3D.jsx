import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Stats, TransformControls } from '@react-three/drei';
import * as THREE from 'three';

// 3D Bar Component
const Bar3D = ({ position, height, color, label, value, onHover, onUnhover }) => {
  const [hovered, setHovered] = useState(false);
  
  const handlePointerOver = () => {
    setHovered(true);
    if (onHover) onHover(value, label);
  };
  
  const handlePointerOut = () => {
    setHovered(false);
    if (onUnhover) onUnhover();
  };

  return (
    <group position={position}>
      <mesh 
        position={[0, height / 2, 0]}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <boxGeometry args={[0.8, height, 0.8]} />
        <meshStandardMaterial 
          color={hovered ? '#ffd700' : color} 
          emissive={hovered ? '#ffd700' : '#000000'}
          emissiveIntensity={hovered ? 0.5 : 0}
        />
      </mesh>
      {label && (
        <Text
          position={[0, height + 0.5, 0]}
          fontSize={0.3}
          color="black"
          anchorX="center"
          anchorY="middle"
        >
          {Math.round(value * 100) / 100}
        </Text>
      )}
    </group>
  );
};

// 3D Line Component
const Line3D = ({ points, color }) => {
  const lineRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    if (lineRef.current && !hovered) {
      lineRef.current.rotation.y += 0.001;
    }
  });

  const geometry = new THREE.BufferGeometry().setFromPoints(points);

  return (
    <line 
      ref={lineRef} 
      geometry={geometry}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <lineBasicMaterial color={hovered ? '#ffd700' : color} linewidth={hovered ? 4 : 2} />
    </line>
  );
};

// 3D Point (Scatter) Component
const Point3D = ({ position, color, size = 0.2, onHover, onUnhover, value, label }) => {
  const [hovered, setHovered] = useState(false);
  
  const handlePointerOver = () => {
    setHovered(true);
    if (onHover) onHover(value, label);
  };
  
  const handlePointerOut = () => {
    setHovered(false);
    if (onUnhover) onUnhover();
  };

  return (
    <mesh 
      position={position}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      <sphereGeometry args={[hovered ? size * 1.5 : size, 16, 16]} />
      <meshStandardMaterial 
        color={hovered ? '#ffd700' : color} 
        emissive={hovered ? '#ffd700' : '#000000'}
        emissiveIntensity={hovered ? 0.5 : 0}
      />
    </mesh>
  );
};

// 3D Pie Segment Component
const PieSegment3D = ({ startAngle, endAngle, radius, height, color, label, value, onHover, onUnhover }) => {
  const [hovered, setHovered] = useState(false);
  
  const handlePointerOver = () => {
    setHovered(true);
    if (onHover) onHover(value, label);
  };
  
  const handlePointerOut = () => {
    setHovered(false);
    if (onUnhover) onUnhover();
  };

  const shape = new THREE.Shape();
  const angleSize = endAngle - startAngle;
  
  shape.moveTo(0, 0);
  shape.lineTo(radius * Math.cos(startAngle), radius * Math.sin(startAngle));
  shape.absarc(0, 0, radius, startAngle, endAngle, false);
  shape.lineTo(0, 0);

  const extrudeSettings = {
    depth: height,
    bevelEnabled: false
  };

  return (
    <mesh
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      <extrudeGeometry args={[shape, extrudeSettings]} />
      <meshStandardMaterial 
        color={hovered ? '#ffd700' : color} 
        emissive={hovered ? '#ffd700' : '#000000'}
        emissiveIntensity={hovered ? 0.5 : 0}
      />
      {label && (
        <Text
          position={[
            (radius * 0.7) * Math.cos((startAngle + endAngle) / 2),
            (radius * 0.7) * Math.sin((startAngle + endAngle) / 2),
            height + 0.2
          ]}
          fontSize={0.3}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {label}
        </Text>
      )}
    </mesh>
  );
};

// Axis Labels Component
const AxisLabels = ({ xAxis, yAxis, zAxis, chartType }) => {
  return (
    <group>
      {/* X Axis Label */}
      <Text
        position={[10, -2, 0]}
        fontSize={0.5}
        color="black"
        anchorX="center"
        anchorY="middle"
      >
        {xAxis}
      </Text>
      
      {/* Y Axis Label */}
      <Text
        position={[0, 12, 0]}
        fontSize={0.5}
        color="black"
        anchorX="center"
        anchorY="middle"
        rotation={[-Math.PI / 2, 0, 0]}
      >
        {yAxis}
      </Text>
      
      {/* Z Axis Label (if applicable) */}
      {zAxis && (
        <Text
          position={[0, -2, 10]}
          fontSize={0.5}
          color="black"
          anchorX="center"
          anchorY="middle"
          rotation={[0, Math.PI / 2, 0]}
        >
          {zAxis}
        </Text>
      )}
    </group>
  );
};

const Chart3D = ({ data, xAxis, yAxis, zAxis, chartType }) => {
  const containerRef = useRef();
  const [hoverInfo, setHoverInfo] = useState(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [showAxes, setShowAxes] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const handleHover = (value, label) => {
    setHoverInfo({ value, label });
  };

  const handleUnhover = () => {
    setHoverInfo(null);
  };

  if (!data || !xAxis || !yAxis) {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow-md h-80 md:h-96 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base text-center px-2">
          Select X and Y axes to generate 3D chart
        </p>
      </div>
    );
  }

  // Prepare data for 3D visualization
  const xValues = data.map(item => item[xAxis]);
  const yValues = data.map(item => item[yAxis]);
  const zValues = zAxis ? data.map(item => item[zAxis]) : null;

  // Normalize values for 3D space
  const maxY = Math.max(...yValues.filter(val => val !== null && val !== undefined));
  const normalizedYValues = yValues.map(val => (val / maxY) * 10);

  const colors = [
    '#ff6b6b', '#4ecdc4', '#45b7d1', '#f9c74f', '#ffafcc', '#83e377',
    '#9d4edd', '#90be6d', '#f3722c', '#577590', '#f8961e', '#43aa8b'
  ];

  const render3DChart = () => {
    switch (chartType) {
      case '3d-bar':
        return (
          <group>
            {normalizedYValues.map((height, index) => (
              <Bar3D
                key={index}
                position={[index * 2 - (normalizedYValues.length - 1), 0, 0]}
                height={height}
                color={colors[index % colors.length]}
                label={!isMobile} // Only show labels on desktop
                value={yValues[index]}
                onHover={handleHover}
                onUnhover={handleUnhover}
              />
            ))}
          </group>
        );

      case '3d-line':
        const linePoints = normalizedYValues.map((height, index) => (
          new THREE.Vector3(
            index * 2 - (normalizedYValues.length - 1),
            height,
            0
          )
        ));
        return <Line3D points={linePoints} color={colors[0]} />;

      case '3d-scatter':
        return (
          <group>
            {normalizedYValues.map((height, index) => (
              <Point3D
                key={index}
                position={[
                  index * 2 - (normalizedYValues.length - 1),
                  height,
                  zValues ? (zValues[index] / Math.max(...zValues)) * 5 : 0
                ]}
                color={colors[index % colors.length]}
                size={isMobile ? 0.2 : 0.3}
                value={yValues[index]}
                label={xValues[index]}
                onHover={handleHover}
                onUnhover={handleUnhover}
              />
            ))}
          </group>
        );

      case '3d-pie':
        const total = yValues.reduce((sum, val) => sum + val, 0);
        let currentAngle = 0;
        
        return (
          <group>
            {yValues.slice(0, isMobile ? 6 : 8).map((value, index) => {
              const angle = (value / total) * Math.PI * 2;
              const segment = (
                <PieSegment3D
                  key={index}
                  startAngle={currentAngle}
                  endAngle={currentAngle + angle}
                  radius={isMobile ? 4 : 5}
                  height={isMobile ? 1.5 : 2}
                  color={colors[index % colors.length]}
                  label={!isMobile ? `${Math.round((value / total) * 100)}%` : ''}
                  value={value}
                  onHover={handleHover}
                  onUnhover={handleUnhover}
                />
              );
              currentAngle += angle;
              return segment;
            })}
          </group>
        );

      default:
        return (
          <group>
            {normalizedYValues.map((height, index) => (
              <Bar3D
                key={index}
                position={[index * 2 - (normalizedYValues.length - 1), 0, 0]}
                height={height}
                color={colors[index % colors.length]}
                label={!isMobile}
                value={yValues[index]}
                onHover={handleHover}
                onUnhover={handleUnhover}
              />
            ))}
          </group>
        );
    }
  };

  return (
    <div ref={containerRef} className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow-md h-80 md:h-96 relative">
      {/* Hover info display */}
      {hoverInfo && (
        <div className="absolute top-2 md:top-4 left-2 md:left-4 bg-black bg-opacity-70 text-white p-2 md:p-3 rounded-lg z-10 max-w-[70%]">
          <p className="text-xs md:text-sm font-medium truncate">{hoverInfo.label}</p>
          <p className="text-sm md:text-lg">{hoverInfo.value}</p>
        </div>
      )}
      
      {/* Control panel */}
      <div className="absolute top-2 md:top-4 right-2 md:right-4 bg-white dark:bg-gray-700 p-2 md:p-3 rounded-lg shadow-md z-10">
        <div className="flex flex-col space-y-1 md:space-y-2">
          <label className="flex items-center space-x-1 md:space-x-2 text-xs md:text-sm">
            <input 
              type="checkbox" 
              checked={autoRotate} 
              onChange={() => setAutoRotate(!autoRotate)} 
              className="rounded w-3 h-3 md:w-4 md:h-4"
            />
            <span>Auto Rotate</span>
          </label>
          <label className="flex items-center space-x-1 md:space-x-2 text-xs md:text-sm">
            <input 
              type="checkbox" 
              checked={showGrid} 
              onChange={() => setShowGrid(!showGrid)} 
              className="rounded w-3 h-3 md:w-4 md:h-4"
            />
            <span>Show Grid</span>
          </label>
          <label className="flex items-center space-x-1 md:space-x-2 text-xs md:text-sm">
            <input 
              type="checkbox" 
              checked={showAxes} 
              onChange={() => setShowAxes(!showAxes)} 
              className="rounded w-3 h-3 md:w-4 md:h-4"
            />
            <span>Show Axes</span>
          </label>
        </div>
      </div>

      <Canvas
        camera={{ position: isMobile ? [12, 12, 12] : [15, 15, 15], fov: isMobile ? 70 : 75 }}
        style={{ height: '100%', width: '100%' }}
        dpr={Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2)} // Optimize performance on mobile
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        
        {render3DChart()}
        
        <AxisLabels xAxis={xAxis} yAxis={yAxis} zAxis={zAxis} chartType={chartType} />
        
        <OrbitControls 
          enablePan={true} 
          enableZoom={true} 
          enableRotate={true} 
          autoRotate={autoRotate}
          autoRotateSpeed={2}
          enableDamping={true} // Smoother controls
          dampingFactor={0.05}
        />
        
        {showGrid && <gridHelper args={[20, 20]} />}
        {showAxes && <axesHelper args={[10]} />}
        
        {/* Performance stats - can be removed in production */}
        {!isMobile && <Stats />}
      </Canvas>
      
      <div className="mt-2 md:mt-4 text-xs md:text-sm text-gray-600 dark:text-gray-400">
        <p>Chart Type: {chartType.replace('3d-', '3D ')}</p>
        <p className="truncate">X Axis: {xAxis} | Y Axis: {yAxis} {zAxis && `| Z Axis: ${zAxis}`}</p>
        <p className="hidden md:block">Use mouse to rotate, scroll to zoom, and right-click to pan</p>
        <p className="md:hidden">Touch and drag to rotate, pinch to zoom</p>
      </div>
    </div>
  );
};

export default Chart3D;