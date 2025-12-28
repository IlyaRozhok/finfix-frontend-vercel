import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Expense } from "@/features/dashboard/model/types";

interface ThreePieChartProps {
  expenses: Expense[];
}

const COLORS = [
  "#3B82F6", // blue
  "#10B981", // emerald
  "#F59E0B", // amber
  "#EF4444", // red
  "#8B5CF6", // violet
  "#06B6D4", // cyan
  "#84CC16", // lime
  "#F97316", // orange
];

// Individual pie slice component
function PieSlice({
  startAngle,
  endAngle,
  color,
  radius = 3.4,
  height = 0.5,
  name,
  value,
  total,
  delay = 0,
}: {
  startAngle: number;
  endAngle: number;
  color: string;
  radius?: number;
  height?: number;
  name: string;
  value: number;
  total: number;
  delay?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [scale, setScale] = React.useState(0);

  // Very slow automatic rotation
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002; // Very slow rotation

      // Animate appearance with delay
      if (state.clock.elapsedTime > delay) {
        setScale(Math.min(1, scale + 0.02));
      }
    }
  });

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setScale(1);
    }, delay * 1000);
    return () => clearTimeout(timer);
  }, [delay]);

  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.arc(0, 0, radius, startAngle, endAngle, false);
    shape.lineTo(0, 0);

    const extrudeSettings = {
      depth: height,
      bevelEnabled: true,
      bevelSegments: 8,
      steps: 1,
      bevelSize: 0.05,
      bevelThickness: 0.05,
    };

    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, [startAngle, endAngle, radius, height]);

  const percentage = ((value / total) * 100).toFixed(1);

  return (
    <group scale={scale}>
      <mesh ref={meshRef} geometry={geometry} position={[0, 0, 0]}>
        <meshStandardMaterial
          color={color}
          metalness={0.3}
          roughness={0.4}
          emissive={new THREE.Color(color).multiplyScalar(0.1)}
        />
      </mesh>
    </group>
  );
}

// Main 3D Pie Chart component
function PieChart3D({
  data,
}: {
  data: Array<{ name: string; value: number; color: string }>;
}) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = 0;

  return (
    <group>
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} />
      <directionalLight position={[-10, -10, -5]} intensity={0.4} />

      {/* Pie slices */}
      {data.map((item, index) => {
        const angle = (item.value / total) * Math.PI * 2;
        const startAngle = currentAngle;
        const endAngle = currentAngle + angle;

        currentAngle += angle;

        return (
          <PieSlice
            key={index}
            startAngle={startAngle}
            endAngle={endAngle}
            color={item.color}
            name={item.name}
            value={item.value}
            total={total}
            delay={index * 0.2} // Staggered appearance animation
          />
        );
      })}

      {/* Legend removed - now using HTML legend below */}
    </group>
  );
}

export function ThreePieChart({ expenses }: ThreePieChartProps) {
  // Group expenses by category name and sum amounts
  const categoryTotals = expenses.reduce((acc, expense) => {
    const amount = parseFloat(expense.amount);
    const categoryName = expense.category.name;
    acc[categoryName] = (acc[categoryName] || 0) + amount;
    return acc;
  }, {} as Record<string, number>);

  const data = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a) // Sort by value descending
    .slice(0, 8) // Take top 8 categories
    .map(([categoryName, total], index) => ({
      name:
        categoryName.length > 15
          ? categoryName.substring(0, 15) + "..."
          : categoryName,
      value: total,
      color: COLORS[index % COLORS.length],
    }));

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-80 text-primary-background/70">
        No expense data available
      </div>
    );
  }

  return (
    <div className="w-full h-80">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        style={{ background: "transparent" }}
      >
        <PieChart3D data={data} />
      </Canvas>
    </div>
  );
}
