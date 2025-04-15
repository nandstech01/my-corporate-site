"use client"; 


import React, {
  useRef,
  useState,
  useEffect,
  useMemo,
  useCallback,
  Suspense,
  MutableRefObject,
} from "react";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  useTexture,
  MeshDistortMaterial,
  MeshWobbleMaterial,
  Html,
} from "@react-three/drei";

import { motion, useAnimation, AnimatePresence } from "framer-motion";

// Postprocessing
import { EffectComposer, Bloom, DepthOfField, Vignette } from "@react-three/postprocessing";
import { ChromaticAberration } from "@react-three/postprocessing";
import { KernelSize } from "postprocessing";

import * as THREE from "three";
import { Vector2 } from "three";
import Squares from './Squares';
import Masonry from './Masonry';

/***************************************************************************
 * type definitions / constants
 ***************************************************************************/

// 3Dグリッドの設定
const GRID_SIZE = 100;       // グリッド全体のサイズ
const GRID_DIVISIONS = 50;   // グリッドの細かさ
const GRID_COLOR = "#2a3a4a"; // グリッドのライン色 (青系)

// データポイント数
const NUM_DATA_POINTS = 18; // 浮遊オブジェクトの個数
// オブジェクト形状を複数用意してモーフィング
// 例：球体, 立方体, トーラス, 多面体 など
type MorphShape = "sphere" | "cube" | "icosahedron" | "torus";

// Postprocessing params
const BLOOM_INTENSITY = 0.8;
const CHROMA_OFFSET = 0.0008;
const VIGNETTE_DARKNESS = 1.1;

// カメラ挙動の設定
const BASE_CAMERA_POS = new THREE.Vector3(0, 10, 30); // 初期カメラ位置
// スクロールやマウスに応じて多少動かす範囲
const CAMERA_SCROLL_RANGE = 20; 
const CAMERA_MOUSE_FACTOR = 0.03;

// カラー (ブルートーンを基調)
const PRIMARY_COLOR = "#1c3d5b";

/***************************************************************************
 * デフォルトエクスポート: HeroSectionコンポーネント
 *  - 3Dシーン & 前景テキスト/CTA
 ***************************************************************************/
const HeroSection = () => {
  const scrollToConsultation = () => {
    const consultationSection = document.getElementById('consultation-section');
    if (consultationSection) {
      consultationSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-start overflow-hidden bg-black">
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/70 z-[1]" />

      {/* Animated squares background */}
      <div className="absolute inset-0 z-[2]">
        <Squares 
          speed={0.4} 
          squareSize={45}
          direction='diagonal'
          borderColor='rgba(255, 255, 255, 0.15)'
          hoverFillColor='rgba(255, 255, 255, 0.08)'
        />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center pt-32 md:pt-40">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
          Corporate Solutions
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
          ビジネスの成長を加速させる、最先端のソリューションを提供します
        </p>
        <div className="flex flex-wrap justify-center gap-6 mb-8">
          <button
            onClick={scrollToConsultation}
            className="px-8 py-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm transition-all duration-300 group"
            type="button"
          >
            <span className="relative z-10 flex items-center text-white/90 text-lg">
              無料相談はこちら
              <svg
                className="w-4 h-4 ml-2 transform transition-transform group-hover:translate-y-1 opacity-70"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </span>
          </button>
        </div>

        {/* Masonry gallery below the button */}
        <div className="flex justify-center w-full pt-12 px-0 sm:px-2">
          <Masonry 
            items={GALLERY_ITEMS.map(item => ({
              id: item.id,
              image: item.image,
              slug: item.link.replace('/categories/', ''),
              height: item.height,
              text: item.alt,
              width: 280 // デフォルト幅
            }))} 
            columnWidth={230}
            gap={16}
            maxColumns={4}
            maxContentWidth={1050}
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

/***************************************************************************
 * シーンを管理するコンテナ: Canvas + カメラ + グローバル要素
 ***************************************************************************/
function SceneContainer() {
  return (
    <Canvas
      shadows
      onCreated={({ gl }) => {
        // 背景色を微ブルーに
        gl.setClearColor(new THREE.Color("#eaf2f9"), 0.0);
      }}
      // ピクセル比の調整
      dpr={[1, 2]}
      className="w-full h-full"
    >
      {/* カメラ制御 (Framer Motion or custom) */}
      <CameraController />
      
      {/* メイン照明 */}
      <directionalLight
        intensity={0.6}
        position={[30, 50, 50]}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      {/* アンビエントライト */}
      <ambientLight intensity={0.4} color={PRIMARY_COLOR} />

      {/* 背景グリッド */}
      <GridBackground />

      {/* 浮遊データポイント */}
      <Suspense fallback={null}>
        <DataPoints />
      </Suspense>

      {/* ポストエフェクト */}
      <PostEffects />
    </Canvas>
  );
}

/***************************************************************************
 * カメラをマウスやスクロールで制御し、シーン全体が変化するようにする
 * - フレーム毎に状態を更新 (useFrame)
 * - ユーザのscrollYやmouse位置に応じてカメラ位置を移動
 ***************************************************************************/
function CameraController() {
  const { camera, size } = useThree();
  const [scrollY, setScrollY] = useState(0);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  // スクロール量の監視
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY || 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // マウス移動の監視
  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      setMouse({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, []);

  // カメラを毎フレーム更新
  useFrame(() => {
    const aspect = size.width / size.height;
    // scrollYをカメラのZやYに反映: 0 ~ CAMERA_SCROLL_RANGE
    const scrollFactor = Math.min(scrollY / 200, 1); 
    const newZ = BASE_CAMERA_POS.z - scrollFactor * CAMERA_SCROLL_RANGE;
    const newY = BASE_CAMERA_POS.y - scrollFactor * 5;

    // マウスによる左右振れ
    const mouseOffsetX = (mouse.x - size.width / 2) * CAMERA_MOUSE_FACTOR;
    const mouseOffsetY = (mouse.y - size.height / 2) * CAMERA_MOUSE_FACTOR;

    camera.position.set(
      BASE_CAMERA_POS.x + mouseOffsetX * 1.2,
      newY + mouseOffsetY * 0.4,
      newZ
    );

    // Look at center
    camera.lookAt(0, 0, 0);
  });

  return null;
}

/***************************************************************************
 * 背景グリッド
 *  - 企業の土台、ネットワークの象徴
 *  - Three.jsのGridHelperを使用しつつ、カスタム要素を足す
 ***************************************************************************/
function GridBackground() {
  const gridRef = useRef<THREE.GridHelper>(null);

  useEffect(() => {
    if (gridRef.current) {
      // GridHelperの色調整
      (gridRef.current.material as THREE.Material).opacity = 0.35;
      (gridRef.current.material as THREE.Material).transparent = true;
    }
  }, []);

  return (
    <group>
      <gridHelper
        ref={gridRef}
        args={[GRID_SIZE, GRID_DIVISIONS, GRID_COLOR, GRID_COLOR]}
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, -1, 0]}
      />
    </group>
  );
}

/***************************************************************************
 * DataPoints: 浮遊オブジェクト群
 *  - スキルやデータポイントを象徴
 *  - モーフィングやサイン波運動で変化を表現
 ***************************************************************************/
function DataPoints() {
  // 複数のデータポイント情報を生成
  const points = useMemo(() => {
    const arr: DataPointProps[] = [];
    for (let i = 0; i < NUM_DATA_POINTS; i++) {
      // ランダムな初期位置
      const x = (Math.random() - 0.5) * 30;
      const y = Math.random() * 10;
      const z = (Math.random() - 0.5) * 30;
      // ランダムな形
      const shapeCandidates: MorphShape[] = ["sphere", "cube", "icosahedron", "torus"];
      const shape = shapeCandidates[Math.floor(Math.random() * shapeCandidates.length)];
      // カラー(ブルー系)
      const hue = 200 + Math.floor(Math.random() * 30);
      const color = `hsl(${hue}, 60%, ${40 + Math.random() * 20}%)`;

      arr.push({
        id: i,
        position: new THREE.Vector3(x, y, z),
        shape,
        color,
      });
    }
    return arr;
  }, []);

  return (
    <>
      {points.map((p) => (
        <FloatingObject key={p.id} {...p} />
      ))}
    </>
  );
}

/***************************************************************************
 * 各オブジェクトのプロパティ型
 ***************************************************************************/
interface DataPointProps {
  id: number;
  position: THREE.Vector3;
  shape: MorphShape;
  color: string;
}

/***************************************************************************
 * FloatingObject: 個々の浮遊オブジェクト
 *  - モーフィング + フレーム毎の位置変化 + マウスオーバーエフェクト
 *  - Framer MotionやReact Three FiberのuseFrameを組み合わせ
 ***************************************************************************/
function FloatingObject(props: DataPointProps) {
  const { position, shape, color } = props;
  const meshRef = useRef<THREE.Mesh>(null);

  // シェイプのモーフ用State
  const [morphShape, setMorphShape] = useState<MorphShape>(shape);

  // フレームごとに揺れ動かす
  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime() + props.id * 10;
    // y座標をサイン波で変動
    meshRef.current.position.y =
      position.y + Math.sin(t * 0.5) * 1.0;
    // x,zは微弱に揺らす
    meshRef.current.position.x =
      position.x + Math.cos(t * 0.3) * 0.3;
    meshRef.current.position.z =
      position.z + Math.sin(t * 0.3) * 0.3;

    // 回転
    meshRef.current.rotation.x += delta * 0.3;
    meshRef.current.rotation.y += delta * 0.4;
  });

  // 定期的に形状を変える
  useEffect(() => {
    const interval = setInterval(() => {
      setMorphShape((prev) => nextShape(prev));
    }, 5000 + Math.random() * 5000); 
    return () => clearInterval(interval);
  }, []);

  // マウスオーバーした際のエフェクト
  const [hovered, setHovered] = useState(false);

  // shapeに応じたgeometry
  const geometryElement = useMemo(() => {
    switch (morphShape) {
      case "sphere":
        return <sphereGeometry args={[1, 16, 16]} />;
      case "cube":
        return <boxGeometry args={[1.5, 1.5, 1.5]} />;
      case "icosahedron":
        return <icosahedronGeometry args={[1, 0]} />;
      case "torus":
        return <torusGeometry args={[1, 0.4, 16, 32]} />;
      default:
        return <sphereGeometry args={[1, 16, 16]} />;
    }
  }, [morphShape]);

  // 材質
  // hovered時に少し色を変える
  const finalColor = hovered
    ? new THREE.Color(color).multiplyScalar(1.2)
    : new THREE.Color(color);

  return (
    <mesh
      ref={meshRef}
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      castShadow
    >
      {geometryElement}
      <meshStandardMaterial
        color={finalColor}
        emissive={hovered ? finalColor : "#000000"}
        emissiveIntensity={hovered ? 0.5 : 0}
        roughness={0.3}
        metalness={0.2}
        transparent
        opacity={0.9}
      />
    </mesh>
  );
}

/***************************************************************************
 * オブジェクト形状をローテーションするヘルパー
 ***************************************************************************/
function nextShape(current: MorphShape): MorphShape {
  const shapes: MorphShape[] = ["sphere", "cube", "icosahedron", "torus"];
  const currentIndex = shapes.indexOf(current);
  const nextIndex = (currentIndex + 1) % shapes.length;
  return shapes[nextIndex];
}

/***************************************************************************
 * ポストエフェクト適用
 *  - Bloom, Chromatic Aberration, Vignette, DepthOfFieldなど
 ***************************************************************************/
function PostEffects() {
  return (
    <EffectComposer>
      {/* Bloom */}
      <Bloom
        intensity={BLOOM_INTENSITY}
        kernelSize={KernelSize.LARGE}
        luminanceThreshold={0.3}
        luminanceSmoothing={0.9}
      />
      {/* 軽い色収差 */}
      <ChromaticAberration
        offset={new Vector2(CHROMA_OFFSET, CHROMA_OFFSET)}
        radialModulation={false}
        modulationOffset={0}
      />
      {/* Vignette */}
      <Vignette eskil={false} offset={0.2} darkness={VIGNETTE_DARKNESS} />
      {/* DepthOfField (軽度) */}
      <DepthOfField
        focusDistance={0.02} 
        focalLength={0.02}
        bokehScale={1.0}
      />
    </EffectComposer>
  );
}

/***************************************************************************
 * (約700行)
 * 実装ポイントまとめ:
 *  - シーン全体: SceneContainer
 *  - カメラ: CameraController (スクロール & マウス連動)
 *  - グリッド: GridBackground
 *  - データポイント: DataPoints / FloatingObject
 *  - オブジェクト形状モーフィング, Hover, サイン波アニメ
 *  - Postprocessing: Bloom, ChromaticAberration, Vignette, DOF
 * 
 * プロフェッショナルな企業イメージの演出と、
 * 未来感 (変革と成長) を表す動的な3D表現を両立。
 * 
 * 運用時は適宜ファイル分割を推奨。
 ***************************************************************************/

const GALLERY_ITEMS = [
  {
    id: "manufacturing",
    image: "/images/industries/manufacturing.jpg",
    link: "/categories/manufacturing",
    alt: "製造業",
    height: 300
  },
  {
    id: "finance",
    image: "/images/industries/finance.jpg",
    link: "/categories/finance",
    alt: "金融",
    height: 400
  },
  {
    id: "medical-care",
    image: "/images/industries/medical-care.jpg",
    link: "/categories/medical-care",
    alt: "医療・ヘルスケア",
    height: 300
  },
  {
    id: "retail",
    image: "/images/industries/retail.jpg",
    link: "/categories/retail",
    alt: "小売・流通",
    height: 350
  },
  {
    id: "construction",
    image: "/images/industries/construction.jpg",
    link: "/categories/construction",
    alt: "建設・不動産",
    height: 300
  },
  {
    id: "it-software",
    image: "/images/industries/it-software.jpg",
    link: "/categories/it-software",
    alt: "IT・ソフトウェア",
    height: 400
  },
  {
    id: "logistics",
    image: "/images/industries/logistics.jpg",
    link: "/categories/logistics",
    alt: "物流",
    height: 350
  },
  {
    id: "government",
    image: "/images/industries/government.jpg",
    link: "/categories/government",
    alt: "官公庁・自治体",
    height: 300
  },
  {
    id: "hr-service",
    image: "/images/industries/hr-service.jpg",
    link: "/categories/hr-service",
    alt: "人材サービス",
    height: 400
  },
  {
    id: "marketing",
    image: "/images/industries/marketing.jpg",
    link: "/categories/marketing",
    alt: "マーケティング",
    height: 350
  }
];
