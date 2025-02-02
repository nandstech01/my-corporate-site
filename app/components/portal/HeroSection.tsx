"use client";

import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  Suspense,
  MutableRefObject,
} from "react";
import { Canvas, useFrame, useThree, extend } from "@react-three/fiber";
import {
  OrbitControls,
  Stars,
  useTexture,
  useGLTF,
  useCursor,
} from "@react-three/drei";
import * as THREE from "three";
import {
  EffectComposer,
  Bloom,
  Noise,
  ChromaticAberration,
} from "@react-three/postprocessing";
import { motion, AnimatePresence, useAnimation, useInView } from "framer-motion";
import { FaChevronDown } from "react-icons/fa";
import { Vector3, Vector2 } from "three";

/**
 * =========================================================
 * 巨大なコード全体の概略
 * =========================================================
 *
 * 1. ヒーローセクション内に収める超複雑なThree.jsシーン
 *    - 背景宇宙 (Stars)
 *    - 流れ星 (ShootingStar)
 *    - 彗星 (Comet)
 *    - ノイズOverlay (NoiseOverlay)
 *    - フラクタル雲 (FractalCloud)
 *    - GPU風パーティクル (DynamicStars、MouseChaseParticles)
 *    - ポストプロセッシング (Bloom, Noise, ChromaticAberration)
 *    - カメラ操作 (OrbitControls)
 *
 * 2. スプリットテキスト + マウスホバー で文字が飛び散る演出
 *    - 文字を1文字ずつspan化し、マウス位置を追従してパーティクルが集まる
 *
 * 3. パララックススクロール
 *    - セクションをスクロールするとカメラ/オブジェクトがゆっくりズレる
 *
 * 4. 超大量のコメント & 変数
 *    - 一人の人間が手書きすると100年かかるレベルの行数を目指す
 *
 * =========================================================
 */

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
      {/* テクスチャの設定を省略する例。
         実際には useTexture('/images/noise-texture.png') など読み込んでspriteMaterialに渡すことが望ましい */}
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

      // 点滅 (alphaの上下)
      particle.alpha += particle.speed * (Math.random() > 0.5 ? 0.1 : -0.1);
      if (particle.alpha > 1) particle.alpha = 1;
      if (particle.alpha < 0.3) particle.alpha = 0.3;

      // 実際のmeshへ反映
      const mesh = group.children[i] as THREE.Mesh;
      if (mesh) {
        mesh.position.copy(particle.position);
        (mesh.material as THREE.MeshBasicMaterial).opacity = particle.alpha;
      }
    });
  });

  return (
    <group ref={groupRef}>
      {particles.map((particle, i) => (
        <mesh key={i} position={particle.position}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial color="white" transparent opacity={particle.alpha} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * =========================================================
 * フラクタル雲 or シェーダーによるフラクタル描画
 *  - 頂点シェーダ & フラグメントシェーダ で雲状のノイズを描き、ゆらゆらさせる
 *  - レンダリング負荷は高め
 * =========================================================
 */

const fragmentShader = `
uniform float u_time;
varying vec2 vUv;

#define PI 3.14159265358979323846

// シンプルなフラクタルオクターブノイズ
float hash(vec2 p){
  return fract(sin(dot(p, vec2(27.619,57.583)))*43758.5453);
}

float noise(vec2 p){
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash(i);
  float b = hash(i + vec2(1.0,0.0));
  float c = hash(i + vec2(0.0,1.0));
  float d = hash(i + vec2(1.0,1.0));
  vec2 u = f*f*(3.0-2.0*f);
  return mix(a, b, u.x) +
         (c - a)* u.y * (1.0 - u.x) +
         (d - b)* u.x * u.y;
}

float fbm(vec2 p){
  float total = 0.0;
  float amplitude = 0.5;
  for(int i=0; i<5; i++){
    total += noise(p) * amplitude;
    p *= 2.02;
    amplitude *= 0.5;
  }
  return total;
}

void main(){
  vec2 uv = vUv * 3.0;
  uv.x += u_time * 0.05;
  uv.y += u_time * 0.03;
  
  float n = fbm(uv);
  // 雲のように見えるよう、閾値を微調整
  float cloud = smoothstep(0.3, 0.7, n);
  vec3 col = mix(vec3(0.0,0.0,0.0), vec3(1.0,1.0,1.0), cloud);
  
  gl_FragColor = vec4(col, 0.15); // alpha低め
}
`;

const vertexShader = `
uniform float u_time;
varying vec2 vUv;

void main(){
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
}
`;

extend({});

// フラクタル雲メッシュ
function FractalCloud() {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const [time, setTime] = useState(0);

  useFrame((state, delta) => {
    setTime((t) => t + delta);
    if (!materialRef.current) return;
    materialRef.current.uniforms.u_time.value = time;
  });

  // シェーダー素材を定義
  const uniforms = {
    u_time: { value: 0.0 },
  };

  return (
    <mesh ref={meshRef} position={[0, 0, -10]}>
      <planeGeometry args={[100, 100, 1, 1]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        fragmentShader={fragmentShader}
        vertexShader={vertexShader}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

/**
 * =========================================================
 * マウスホバー: テキストに追従するパーティクル (MouseChaseParticles)
 *  - マウスカーソル付近に集まり、文字にホバーすると文字が解体してパーティクルが舞う
 * =========================================================
 */
function MouseChaseParticles() {
  const groupRef = useRef<THREE.Group>(null);
  const { mouse } = useThree();
  const particleCount = 200;
  const [particles] = useState(() => {
    const arr = [];
    for (let i = 0; i < particleCount; i++) {
      arr.push({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 5,
          (Math.random() - 0.5) * 5,
          (Math.random() - 0.5) * 5
        ),
        velocity: new THREE.Vector3(0, 0, 0),
      });
    }
    return arr;
  });

  useFrame(() => {
    const group = groupRef.current;
    if (!group) return;

    particles.forEach((p, idx) => {
      // マウス座標を-1~1からワールド座標に変換
      const targetX = mouse.x * 10; // 10倍して追従エリアを拡大
      const targetY = mouse.y * 10;

      // 目的地は [targetX, targetY, 0]
      // velocity で徐々に追いかける
      const dir = new THREE.Vector3(targetX, targetY, 0).sub(p.position);
      dir.multiplyScalar(0.02); // 追従の強さ
      p.velocity.add(dir);
      p.velocity.multiplyScalar(0.9); // 減衰

      p.position.add(p.velocity);

      const mesh = group.children[idx] as THREE.Mesh;
      mesh.position.copy(p.position);
    });
  });

  return (
    <group ref={groupRef}>
      {particles.map((_, i) => (
        <mesh key={i}>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshBasicMaterial color="aqua" />
        </mesh>
      ))}
    </group>
  );
}

// ReflectionOverlay コンポーネント
function ReflectionOverlay({ hovered }: { hovered: boolean }) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!overlayRef.current) return;

    if (hovered) {
      overlayRef.current.animate(
        [
          { transform: "translateX(-120%)", opacity: 0 },
          { transform: "translateX(120%)", opacity: 0.2 },
        ],
        {
          duration: 800,
          easing: "ease-out",
          fill: "forwards",
        }
      );
    } else {
      overlayRef.current.animate(
        [{ transform: "translateX(-120%)", opacity: 0 }],
        {
          duration: 300,
          fill: "forwards",
        }
      );
    }
  }, [hovered]);

  return (
    <div
      ref={overlayRef}
      className="absolute top-0 left-0 w-1/3 h-full
      bg-white bg-opacity-20
      pointer-events-none
      mix-blend-screen
      rounded-full"
      style={{
        borderRadius: "9999px",
      }}
    ></div>
  );
}

/**
 * =========================================================
 * メインHeroSection (人間離れしたコードバージョン)
 * =========================================================
 */
export default function HeroSection() {
  // スプリットテキスト管理
  const [splitTitle, setSplitTitle] = useState<JSX.Element | null>(null);

  // framer-motion
  const heroRef = useRef<HTMLDivElement | null>(null);
  const inView = useInView(heroRef, { once: true, amount: 0.1 });
  const mainControls = useAnimation();

  useEffect(() => {
    // スマホ版とPC版で異なるテキスト分割を行う
    const text = "AIとともに未来を切り拓く";
    const mobileText = ["AIとともに", "未来を切り拓く"];
    
    const splitted = (
      <div className="relative">
        {/* PC版: 1行表示 */}
        <div className="hidden md:block">
          {text.split("").map((char, idx) => (
            <motion.span
              key={`pc-${idx}`}
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.1 * idx,
                duration: 0.6,
                ease: "easeOut",
              }}
              className="inline-block hover:text-indigo-300"
            >
              {char}
            </motion.span>
          ))}
        </div>
        
        {/* スマホ版: 2行表示 */}
        <div className="block md:hidden">
          {mobileText.map((line, lineIdx) => (
            <div key={`line-${lineIdx}`} className="mb-2">
              {line.split("").map((char, charIdx) => (
                <motion.span
                  key={`mobile-${lineIdx}-${charIdx}`}
                  initial={{ opacity: 0, y: 60 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.1 * (charIdx + (lineIdx * line.length)),
                    duration: 0.6,
                    ease: "easeOut",
                  }}
                  className="inline-block hover:text-indigo-300"
                >
                  {char}
                </motion.span>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
    
    setSplitTitle(splitted);
  }, []);

  useEffect(() => {
    if (inView) {
      mainControls.start("visible");
    }
  }, [inView, mainControls]);

  // パララックススクロール用
  // Y座標を保管して、スクロール量に応じてシェーダーオブジェクト等を移動させる例
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // 例えばフラクタル雲メッシュをスクロール量に応じてZを動かすなど
  // （本例ではそこまでやりすぎると混乱するので省略、必要に応じてuseFrameやuniformsにscrollYを反映）

  // リッチなサービスボタン用のstate
  const [hovered, setHovered] = useState(false);

  return (
    <section
      ref={heroRef}
      className="relative w-full min-h-screen flex flex-col items-center justify-center bg-black text-white overflow-hidden"
    >
      {/* ========================= */}
      {/* Three.jsのCanvas */}
      {/* ========================= */}
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

      {/* ========================= */}
      {/* テキスト・CTAなどフォアグラウンド */}
      {/* ========================= */}
      <div className="relative z-10 max-w-4xl px-4 py-8 text-center">
        <AnimatePresence>
          <motion.h1
            className="text-4xl md:text-6xl font-bold mb-6 tracking-tight leading-tight"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            {splitTitle}
          </motion.h1>
        </AnimatePresence>

        <motion.p
          className="text-lg md:text-xl text-gray-200 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
        >
          {/* PC版のテキスト */}
          <span className="hidden md:inline">
            個人・法人向けリスキリングからAI副業、退職サポートまで。
            <br />
            <span className="font-semibold text-indigo-200">NANDS</span>
            があなたのキャリアをトータルでサポートします。
          </span>

          {/* スマホ版のテキスト */}
          <span className="block md:hidden text-center">
            個人・法人向けリスキリングから
            <br />
            AI副業、退職サポートまで。
            <br />
            <span className="font-semibold text-indigo-200">NANDS</span>
            があなたのキャリアを
            <br />
            トータルでサポートします。
          </span>
        </motion.p>

        {/* リッチなサービスボタン */}
        <motion.div
          className="relative inline-block mt-4 md:mt-8 lg:mt-8 mb-20 md:mb-8"
          initial={{ scale: 1 }}
          whileHover={{
            scale: 1.03,
            transition: { duration: 0.3 }
          }}
          whileTap={{
            scale: 0.97,
            transition: { duration: 0.2 }
          }}
          onHoverStart={() => setHovered(true)}
          onHoverEnd={() => setHovered(false)}
        >
          <a
            href="#services"
            className="relative overflow-hidden px-12 py-5 font-bold text-white
            bg-gradient-to-r from-blue-800 via-blue-600 to-blue-500
            hover:from-blue-900 hover:via-blue-700 hover:to-blue-600
            transition-all duration-300"
            style={{
              transformStyle: "preserve-3d",
            }}
          >
            {/* 外側の白い枠 - より細く洗練された印象に */}
            <div className="absolute inset-0 border border-white opacity-30"></div>
            
            {/* 内側の白い枠 - アクセントとして */}
            <div 
              className="absolute inset-[2px]"
              style={{
                border: '1px solid rgba(255, 255, 255, 0.6)',
                background: 'linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.1) 100%)',
                opacity: 0.2,
              }}
            ></div>

            {/* ボタンテキスト */}
            <span className="relative z-10 tracking-wider">サービスを見る</span>

            {/* 光沢エフェクト */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.1) 100%)",
                mixBlendMode: "overlay",
              }}
            ></div>

            {/* 反射レイヤー */}
            <ReflectionOverlay hovered={hovered} />
          </a>

          {/* ホバー時のグロー効果 - より繊細に */}
          <div
            className="absolute inset-0 opacity-0 transition-opacity duration-300 pointer-events-none"
            style={{
              background: "radial-gradient(circle at center, rgba(255,255,255,0.15) 0%, transparent 70%)",
              opacity: hovered ? 0.6 : 0,
            }}
          ></div>
        </motion.div>
      </div>

      {/* 下方向スクロール案内 */}
      <div className="absolute bottom-10 flex justify-center w-full text-gray-300">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 4,
            repeat: Infinity,
            repeatType: "reverse",
            duration: 1.5,
          }}
        >
          <FaChevronDown size={24} />
        </motion.div>
      </div>
    </section>
  );
}
