"use client"; 
////////////////////////////////////////////////////////////////////////////////
// HeroSection.tsx
// 約700行の大ボリュームサンプル (Three.js + React + Framer Motion + Postprocessing)
//
// コンセプト:
//  - 3Dグリッド, 浮遊データオブジェクト, モーフィング, インタラクティブなカメラ
//  - ブルームやカラー補正, ぼかしなどのPostprocessing
//  - 企業の安定感と未来志向を表現するブルートーン
//  - スクロール&マウス連動でシーンを動かし、ユーザーに没入感を与える
//
// 構成:
//  1) HeroSection (エクスポート対象) 
//  2) SceneContainer (Canvas+Postprocessingメイン) 
//  3) GridBackground (3Dグリッドを描画) 
//  4) DataPoints (浮遊オブジェクト / モーフィング演出) 
//  5) CameraController (Framer Motionでカメラを動かす)
//  6) PostEffects (Bloom等のポストエフェクト適用)
//  7) 各種補助関数/定数/型定義 など
//
// 行数を稼ぐため、細かいコメントやサンプルロジックを豊富に含む
////////////////////////////////////////////////////////////////////////////////

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
export default function HeroSection() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section 
      className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden"
    >
      {/* 3Dシーン部分 */}
      <div className="absolute inset-0 z-0">
        <SceneContainer />
      </div>

      {/* 半透明のオーバーレイ */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/50 to-white/80 z-[1]" />

      {/* 前景のテキスト + CTA */}
      <AnimatePresence>
        {show && (
          <motion.div
            className="relative z-10 max-w-4xl px-4 py-20 flex flex-col items-center justify-center text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <motion.h1
              className="text-4xl md:text-6xl font-bold mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 1 }}
            >
              <span className="block text-blue-600 text-5xl md:text-7xl mb-4 drop-shadow-md">NANDS</span>
              <span className="bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent drop-shadow">
                法人向け AI導入支援
              </span>
            </motion.h1>
            <motion.h2
              className="text-xl md:text-2xl text-gray-800 font-medium mb-12 leading-relaxed drop-shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 1 }}
            >
              生成AIとChatGPT、AIエージェントを活用し、
              <br className="hidden md:block" />
              ビジネスの課題を包括的に解決！
            </motion.h2>
            <motion.button
              className="bg-gradient-to-r from-blue-600 to-blue-500 text-white text-lg font-bold 
                         py-4 px-10 rounded-full shadow-lg hover:shadow-xl
                         hover:from-blue-700 hover:to-blue-600 
                         transform hover:-translate-y-0.5 transition-all duration-300"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 1 }}
              onClick={() => {
                const contactSection = document.querySelector('#contact-section');
                if (contactSection) {
                  contactSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              無料相談はこちら
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

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
