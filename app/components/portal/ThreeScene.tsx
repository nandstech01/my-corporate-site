"use client";

import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  Stars,
} from "@react-three/drei";
import * as THREE from "three";
import {
  EffectComposer,
  Bloom,
  Noise,
  ChromaticAberration,
} from "@react-three/postprocessing";
import { Vector2 } from "three";

/**
 * =========================================================
 * 流れ星 (ShootingStar)
 * =========================================================
 */
function ShootingStar({ speed = 0.02, color = "white" }: { speed?: number; color?: string }) {
  const ref = useRef<THREE.Mesh>(null);
  const [position, setPosition] = useState<[number, number, number]>([0, 0, 0]);

  // ランダム初期位置を取得
  const getRandomPosition = (): [number, number, number] => {
    const x = Math.random() * 300 - 150;
    const y = Math.random() * 300 - 150;
    const z = -50;
    return [x, y, z];
  };

  // 初期位置セット
  useEffect(() => {
    setPosition(getRandomPosition());
  }, []);

  // 毎フレームごとにz軸方向に移動 & 再配置
  useFrame(() => {
    if (!ref.current) return;
    ref.current.position.z += speed;
    if (ref.current.position.z > 200) {
      const [x, y, z] = getRandomPosition();
      ref.current.position.set(x, y, z);
    }
  });

  return (
    <mesh ref={ref} position={new THREE.Vector3(...position)}>
      <cylinderGeometry args={[0.02, 0.02, 2, 8]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
}

/**
 * =========================================================
 * 彗星 (Comet)
 * =========================================================
 */
function Comet({ speed = 0.01 }: { speed?: number }) {
  const ref = useRef<THREE.Mesh>(null);
  let angle = 0;

  useFrame(() => {
    if (!ref.current) return;
    angle += speed;
    const radius = 50;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius * 0.5;
    const z = Math.sin(angle) * radius;
    ref.current.position.set(x, y, z);
    ref.current.rotation.y += 0.02;
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshBasicMaterial 
        color="#ffcc99" 
        transparent 
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
      <pointLight color="#ff9966" intensity={2} distance={20} />
    </mesh>
  );
}

/**
 * =========================================================
 * ノイズオーバーレイ (NoiseOverlay)
 * =========================================================
 */
function NoiseOverlay() {
  const spriteRef = useRef<THREE.Sprite>(null);
  useFrame(() => {
    if (!spriteRef.current) return;
    spriteRef.current.material.rotation += 0.001;
  });

  return (
    <sprite ref={spriteRef}>
      <spriteMaterial color="white" opacity={0.03} transparent />
    </sprite>
  );
}

/**
 * =========================================================
 * DynamicStars: GPUパーティクルのように振る舞う星々
 * =========================================================
 */
function DynamicStars() {
  const groupRef = useRef<THREE.Group>(null);
  const [particles, setParticles] = useState<
    Array<{
      position: THREE.Vector3;
      velocity: THREE.Vector3;
      alpha: number;
      speed: number;
    }>
  >([]);

  // 初期生成
  useEffect(() => {
    const newParticles = Array.from({ length: 500 }, () => ({
      position: new THREE.Vector3(
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 100
      ),
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 0.1,
        (Math.random() - 0.5) * 0.1,
        (Math.random() - 0.5) * 0.1
      ),
      alpha: Math.random() * 0.5 + 0.5,
      speed: Math.random() * 0.02 + 0.01,
    }));
    setParticles(newParticles);
  }, []);

  // 毎フレーム更新
  useFrame(() => {
    const group = groupRef.current;
    if (!group) return;

    particles.forEach((particle, i) => {
      particle.position.add(particle.velocity);

      // 画面外に出たら再配置
      if (particle.position.x > 50) particle.position.x = -50;
      if (particle.position.x < -50) particle.position.x = 50;
      if (particle.position.y > 50) particle.position.y = -50;
      if (particle.position.y < -50) particle.position.y = 50;
      if (particle.position.z > 50) particle.position.z = -50;
      if (particle.position.z < -50) particle.position.z = 50;

      // グループ内のメッシュ位置を更新
      const child = group.children[i] as THREE.Mesh;
      if (child) {
        child.position.copy(particle.position);
        // 透明度変更
        const material = child.material as THREE.MeshBasicMaterial;
        if (material) {
          material.opacity = particle.alpha * (0.5 + 0.5 * Math.sin(Date.now() * 0.001 + i));
        }
      }
    });
  });

  return (
    <group ref={groupRef}>
      {particles.map((_, i) => (
        <mesh key={i}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial 
            color="white" 
            transparent 
            opacity={0.8}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
}

/**
 * =========================================================
 * フラクタル雲 (FractalCloud)
 * =========================================================
 */
function FractalCloud() {
  const cloudRef = useRef<THREE.Mesh>(null);
  let cloudTime = 0;

  useFrame(() => {
    if (!cloudRef.current) return;
    cloudTime += 0.01;
    
    // 雲のうねりのような動き
    cloudRef.current.rotation.x = Math.sin(cloudTime * 0.3) * 0.1;
    cloudRef.current.rotation.y += 0.002;
    cloudRef.current.rotation.z = Math.cos(cloudTime * 0.2) * 0.05;
    
    // 微妙なスケール変動
    const scale = 1 + Math.sin(cloudTime) * 0.1;
    cloudRef.current.scale.setScalar(scale);
    
    // 位置の微調整
    cloudRef.current.position.y = Math.sin(cloudTime * 0.1) * 2;
  });

  return (
    <mesh ref={cloudRef} position={[0, 0, -20]}>
      <sphereGeometry args={[15, 32, 32]} />
      <meshBasicMaterial 
        color="#4A5568" 
        transparent 
        opacity={0.1}
        blending={THREE.AdditiveBlending}
        wireframe
      />
    </mesh>
  );
}

/**
 * =========================================================
 * マウス追従パーティクル (MouseChaseParticles)
 * =========================================================
 */
function MouseChaseParticles() {
  const { camera, gl } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const particleCount = 50;

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const x = (event.clientX / window.innerWidth) * 2 - 1;
      const y = -(event.clientY / window.innerHeight) * 2 + 1;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame(() => {
    if (!groupRef.current) return;

    // マウス位置を3D空間に変換
    const targetPos = new THREE.Vector3(mousePos.x * 10, mousePos.y * 10, 0);

    groupRef.current.children.forEach((child, i) => {
      if (child instanceof THREE.Mesh) {
        // 各パーティクルがマウス位置に向かって移動
        const lerpFactor = 0.02 + (i % 10) * 0.002;
        child.position.lerp(targetPos, lerpFactor);
        
        // 回転を追加
        child.rotation.x += 0.01;
        child.rotation.y += 0.015;
      }
    });
  });

  return (
    <group ref={groupRef}>
      {Array.from({ length: particleCount }).map((_, i) => (
        <mesh key={i} position={[
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 20
        ]}>
          <boxGeometry args={[0.1, 0.1, 0.1]} />
          <meshBasicMaterial 
            color={`hsl(${180 + i * 5}, 70%, 60%)`}
            transparent 
            opacity={0.6}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
}

/**
 * =========================================================
 * 3Dシーンコンポーネント
 * =========================================================
 */
export default function ThreeScene() {
  return (
    <div className="absolute inset-0">
      <Canvas camera={{ position: [0, 0, 50], fov: 45 }}>
        {/* 背景の星 (dreiのStars) */}
        <Stars
          radius={100}
          depth={80}
          count={1500}
          factor={4}
          saturation={0}
          fade
          speed={0.5}
        />

        {/* GPU的なDynamicStars */}
        <DynamicStars />

        {/* 流れ星複数 */}
        {Array.from({ length: 6 }).map((_, i) => (
          <ShootingStar key={i} speed={0.3 + i * 0.02} />
        ))}

        {/* 彗星 */}
        <Comet speed={0.002} />

        {/* フラクタル雲 */}
        <FractalCloud />

        {/* マウスに追従するパーティクル */}
        <MouseChaseParticles />

        {/* ノイズオーバーレイ */}
        <NoiseOverlay />

        {/* ポストプロセッシング */}
        <EffectComposer>
          {/* Bloom */}
          <Bloom
            intensity={0.8}
            luminanceThreshold={0.1}
            luminanceSmoothing={0.9}
          />
          {/* ノイズ */}
          <Noise opacity={0.02} />
          {/* 色収差 */}
          <ChromaticAberration 
            offset={new Vector2(0.001, 0.001)}
            radialModulation={false}
            modulationOffset={1.0}
          />
        </EffectComposer>

        {/* カメラ操作 */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 3}
        />
        
        {/* シーン背景 */}
        <color attach="background" args={["#000000"]} />
      </Canvas>
    </div>
  );
} 