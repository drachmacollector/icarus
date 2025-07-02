

// src/Solar Flare/components/GlobeLoader.jsx
import { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';

const AnimatedGlobe = ({ onComplete }) => {
  const globeRef = useRef();
  const [started, setStarted] = useState(false);

  useEffect(() => {
    // Initial position (off-screen right)
    globeRef.current.position.x = 10;
    globeRef.current.scale.set(3, 3, 3);
    
    // Animation timeline
    const tl = gsap.timeline({
      onComplete: () => {
        setTimeout(onComplete, 500);
      }
    });
    
    tl.to(globeRef.current.position, {
      x: 0,
      y: 0,
      z: 0,
      duration: 2,
      ease: "power3.out"
    })
    .to(globeRef.current.scale, {
      x: 1,
      y: 1,
      z: 1,
      duration: 1.5,
      ease: "elastic.out(1, 0.5)"
    }, 0);
    
    setStarted(true);
  }, []);

  useFrame(() => {
    if (globeRef.current && started) {
      globeRef.current.rotation.y += 0.01;
    }
  });

  return (
    <Sphere ref={globeRef} args={[1, 64, 64]}>
      <meshStandardMaterial 
        color="#2a3cad"
        emissive="#2a3cad" 
        emissiveIntensity={0.5}
        metalness={0.7}
        roughness={0.2}
      />
    </Sphere>
  );
};

export default function GlobeLoader({ isLoading }) {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => setShowContent(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (!isLoading && showContent) {
    return null;
  }

  return (
    <div className="loading-overlay">
      <Canvas camera={{ position: [0, 0, 3], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <AnimatedGlobe onComplete={() => setShowContent(true)} />
        <OrbitControls enabled={false} />
      </Canvas>
      {isLoading && (
        <div className="loading-text">
          Loading solar data...
        </div>
      )}
    </div>
  );
}