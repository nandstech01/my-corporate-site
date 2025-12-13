# 04. コンポーネント設計

> **実装仕様とコード例**

---

## 📦 コンポーネント一覧

| コンポーネント | ファイル | 優先度 | 複雑度 |
|---------------|---------|--------|--------|
| TheGreatSwitch | `TheGreatSwitch.tsx` | ⭐⭐⭐ | 高 |
| HeroSection | `HeroSection.tsx` | ⭐⭐⭐ | 高 |
| VectorLinkBackground | `VectorLinkBackground.tsx` | ⭐⭐ | 高 |
| ProblemSection | `ProblemSection.tsx` | ⭐⭐⭐ | 中 |
| SolutionBentoGrid | `SolutionBentoGrid.tsx` | ⭐⭐⭐ | 中 |
| PricingSection | `PricingSection.tsx` | ⭐⭐⭐ | 中 |
| PhilosophySection | `PhilosophySection.tsx` | ⭐⭐⭐ | 低 |
| ServicesBlueprint | `ServicesBlueprint.tsx` | ⭐⭐⭐ | 中 |
| KnowledgeShowcase | `KnowledgeShowcase.tsx` | ⭐⭐ | 低 |

---

## 🔄 TheGreatSwitch

### 概要
LPの心臓部。「個人」と「法人」でコンテンツを切り替える。

### Props

```typescript
interface TheGreatSwitchProps {
  defaultMode?: 'individual' | 'corporate';
  onModeChange?: (mode: 'individual' | 'corporate') => void;
}
```

### 実装例

```typescript
// app/components/portal/TheGreatSwitch.tsx
'use client'

import { useState, createContext, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Context for mode sharing across sections
export type Mode = 'individual' | 'corporate'

interface ModeContextType {
  mode: Mode;
  setMode: (mode: Mode) => void;
}

export const ModeContext = createContext<ModeContextType>({
  mode: 'individual',
  setMode: () => {}
})

export const useMode = () => useContext(ModeContext)

// Provider component
export function ModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<Mode>('individual')
  
  return (
    <ModeContext.Provider value={{ mode, setMode }}>
      {children}
    </ModeContext.Provider>
  )
}

// Switch component
export default function TheGreatSwitch() {
  const { mode, setMode } = useMode()

  return (
    <div className="flex justify-center">
      <div 
        className="
          relative inline-flex p-1 
          bg-white/5 
          rounded-full 
          border border-cyan-500/20
          backdrop-blur-sm
        "
      >
        {/* 背景スライダー */}
        <motion.div
          className="
            absolute top-1 bottom-1 
            bg-gradient-to-r from-purple-600 to-cyan-600
            rounded-full
          "
          initial={false}
          animate={{
            left: mode === 'individual' ? '4px' : '50%',
            right: mode === 'individual' ? '50%' : '4px',
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />

        {/* 個人ボタン */}
        <button
          onClick={() => setMode('individual')}
          className={`
            relative z-10 px-6 py-3 rounded-full
            font-medium text-sm
            transition-colors duration-300
            ${mode === 'individual' 
              ? 'text-white' 
              : 'text-gray-400 hover:text-white'
            }
          `}
        >
          👤 個人：Career Shift
        </button>

        {/* 法人ボタン */}
        <button
          onClick={() => setMode('corporate')}
          className={`
            relative z-10 px-6 py-3 rounded-full
            font-medium text-sm
            transition-colors duration-300
            ${mode === 'corporate' 
              ? 'text-white' 
              : 'text-gray-400 hover:text-white'
            }
          `}
        >
          🏢 法人：Biz Transformation
        </button>
      </div>
    </div>
  )
}
```

### スタイルノート
- Dynamic Island風の滑らかなアニメーション
- `framer-motion`の`spring`で自然な動き
- グラデーション背景がスライド

---

## 🎬 HeroSection

### 概要
ファーストビュー。背景アニメーション + キャッチコピー + スイッチ。

### 実装例

```typescript
// app/components/portal/HeroSection.tsx
'use client'

import { motion } from 'framer-motion'
import TheGreatSwitch from './TheGreatSwitch'
import VectorLinkBackground from './VectorLinkBackground'

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* 背景アニメーション */}
      <VectorLinkBackground />
      
      {/* オーバーレイ（可読性確保） */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-deep-navy/50 to-deep-navy" />
      
      {/* コンテンツ */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        {/* ロゴ */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <span className="font-mono text-xl text-gray-400 tracking-widest">
            NANDS TECH
          </span>
        </motion.div>

        {/* H1（視覚的） */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl md:text-7xl font-black leading-tight mb-8"
        >
          <span className="block">AIに使われるな。</span>
          <span className="block mt-2">
            AIが使う
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
              「構造」
            </span>
            を設計せよ。
          </span>
        </motion.h2>

        {/* H1（SEO用・非表示） */}
        <h1 className="sr-only">
          NANDS TECH - AIアーキテクトによる企業OS設計とレリバンスエンジニアリング
        </h1>

        {/* サブコピー */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-16 space-y-2"
        >
          <p className="font-mono text-lg text-cyan-400">
            Architecture over Algorithms.
          </p>
          <p className="text-gray-400">
            2026年、生き残るのは「書く人」ではなく「設計する人」だ。
          </p>
        </motion.div>

        {/* スイッチ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <TheGreatSwitch />
        </motion.div>
      </div>

      {/* スクロール誘導 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-gray-500"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.div>
      </motion.div>
    </section>
  )
}
```

---

## ✨ VectorLinkBackground

### 概要
ベクトルリンクを可視化する背景アニメーション。
ノード（点）とリンク（線）が有機的に結合・切断。

### 実装オプション

#### オプション1: CSS/SVG（軽量）
```typescript
// app/components/portal/VectorLinkBackground.tsx
'use client'

import { useEffect, useRef } from 'react'

interface Node {
  x: number
  y: number
  vx: number
  vy: number
}

export default function VectorLinkBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Canvas サイズ設定
    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // ノード生成
    const nodes: Node[] = Array.from({ length: 50 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
    }))

    // アニメーションループ
    let animationId: number
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // ノード更新
      nodes.forEach(node => {
        node.x += node.vx
        node.y += node.vy

        // 境界で反射
        if (node.x < 0 || node.x > canvas.width) node.vx *= -1
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1
      })

      // 線を描画（近いノード間）
      nodes.forEach((nodeA, i) => {
        nodes.slice(i + 1).forEach(nodeB => {
          const dist = Math.hypot(nodeA.x - nodeB.x, nodeA.y - nodeB.y)
          if (dist < 150) {
            ctx.beginPath()
            ctx.moveTo(nodeA.x, nodeA.y)
            ctx.lineTo(nodeB.x, nodeB.y)
            ctx.strokeStyle = `rgba(0, 255, 255, ${1 - dist / 150})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        })
      })

      // ノードを描画
      nodes.forEach(node => {
        ctx.beginPath()
        ctx.arc(node.x, node.y, 2, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(138, 43, 226, 0.8)'
        ctx.fill()
      })

      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 opacity-30"
      style={{ mixBlendMode: 'screen' }}
    />
  )
}
```

#### オプション2: Three.js（リッチ）
Three.jsを使った3D版は複雑度が高いため、Phase 3で実装。

---

## 📊 ProblemSection

### 概要
モード（個人/法人）に応じて異なる Pain Point を表示。

### 実装例

```typescript
// app/components/portal/ProblemSection.tsx
'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useMode } from './TheGreatSwitch'

export default function ProblemSection() {
  const { mode } = useMode()

  return (
    <section className="py-24 bg-gradient-to-b from-deep-navy to-midnight-blue">
      <div className="max-w-4xl mx-auto px-4">
        <AnimatePresence mode="wait">
          {mode === 'individual' ? (
            <IndividualProblem key="individual" />
          ) : (
            <CorporateProblem key="corporate" />
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}

function IndividualProblem() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="text-center"
    >
      <h2 className="text-4xl md:text-5xl font-bold mb-8">
        2026年、そのコードは
        <br />
        <span className="text-red-500">AIが1秒で書く。</span>
      </h2>

      {/* グラフ（CSS実装） */}
      <div className="my-12 h-64 relative">
        {/* TODO: グラフコンポーネント */}
        <div className="absolute inset-0 flex items-center justify-center text-gray-500">
          [コーダー単価↓ × アーキテクト単価↑ のグラフ]
        </div>
      </div>

      <p className="text-lg text-gray-300 leading-relaxed">
        GitHub Copilot, Devin, Claude...
        <br />
        <span className="text-gray-400">「作る」だけのエンジニアの価値は暴落しています。</span>
        <br />
        今必要なのは、AIを部下として指揮し、
        <br />
        システム全体を俯瞰する<span className="text-cyan-400 font-bold">「設計力」</span>です。
      </p>
    </motion.div>
  )
}

function CorporateProblem() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="text-center"
    >
      <h2 className="text-4xl md:text-5xl font-bold mb-8">
        RAGを入れたのに、
        <br />
        なぜ御社のAIは<span className="text-red-500">「バカ」</span>なのか？
      </h2>

      {/* ビジュアル */}
      <div className="my-12 flex justify-center gap-8">
        <div className="text-center">
          <div className="w-32 h-32 bg-gray-800 rounded-lg flex items-center justify-center text-4xl">
            📄📄📄
          </div>
          <p className="mt-2 text-gray-500 text-sm">散らかった書類</p>
        </div>
        <div className="flex items-center text-3xl text-cyan-500">→</div>
        <div className="text-center">
          <div className="w-32 h-32 bg-gray-800 rounded-lg flex items-center justify-center">
            <div className="grid grid-cols-3 gap-1">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="w-4 h-4 bg-cyan-500/50 rounded-sm" />
              ))}
            </div>
          </div>
          <p className="mt-2 text-gray-500 text-sm">構造化データ</p>
        </div>
      </div>

      <p className="text-lg text-gray-300 leading-relaxed">
        ChatGPTにPDFを読ませただけのRAGは、ただの<span className="text-gray-400">「検索窓」</span>です。
        <br />
        AIはファイルを読みません。データの<span className="text-cyan-400 font-bold">「意味（Context）」</span>を読みます。
        <br />
        構造なきデータは、AIにとって<span className="text-red-400">ノイズ</span>でしかありません。
      </p>
    </motion.div>
  )
}
```

---

## 🧱 SolutionBentoGrid

### 概要
Apple風のBento Gridレイアウトでソリューションを提示。

### グリッド構成

```
Desktop:
┌──────────────────────────────┬──────────────────────┐
│                              │                      │
│     メインカード（2x2）      │   監修者カード       │
│     ソリューション図解       │   原田賢治           │
│                              │                      │
│                              ├──────────────────────┤
│                              │                      │
│                              │   実績カード         │
│                              │   数字で証明         │
│                              │                      │
└──────────────────────────────┴──────────────────────┘

Mobile:
┌──────────────────────────────┐
│   メインカード               │
└──────────────────────────────┘
┌──────────────────────────────┐
│   監修者カード               │
└──────────────────────────────┘
┌──────────────────────────────┐
│   実績カード                 │
└──────────────────────────────┘
```

### 実装例

```typescript
// app/components/portal/SolutionBentoGrid.tsx
'use client'

import { motion } from 'framer-motion'
import { useMode } from './TheGreatSwitch'
import Image from 'next/image'

export default function SolutionBentoGrid() {
  const { mode } = useMode()

  return (
    <section className="py-24">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-6">
          {/* メインカード（2x2） */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="
              md:col-span-2 md:row-span-2
              bg-white/5 border border-white/10
              rounded-2xl p-8
              backdrop-blur-sm
            "
          >
            {mode === 'individual' ? (
              <IndividualSolution />
            ) : (
              <CorporateSolution />
            )}
          </motion.div>

          {/* 監修者カード */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="
              bg-gradient-to-br from-purple-900/30 to-cyan-900/30
              border border-purple-500/30
              rounded-2xl p-6
              backdrop-blur-sm
            "
          >
            <div className="relative w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden">
              <Image
                src="/images/kenji-harada.jpg"
                alt="原田賢治"
                fill
                className="object-cover grayscale"
              />
            </div>
            <h3 className="text-lg font-bold text-center mb-2">原田 賢治</h3>
            <p className="text-sm text-gray-400 text-center">
              AI Architect
              <br />
              Relevance Engineer
            </p>
          </motion.div>

          {/* 実績カード */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="
              bg-white/5 border border-white/10
              rounded-2xl p-6
              backdrop-blur-sm
            "
          >
            <h3 className="text-sm text-gray-400 mb-4">📊 実績</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <span className="text-2xl font-bold text-cyan-400">10万+</span>
                <span className="text-sm text-gray-400">月間PV</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-2xl font-bold text-purple-400">TOP10</span>
                <span className="text-sm text-gray-400">技術記事</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-2xl font-bold text-green-400">98%</span>
                <span className="text-sm text-gray-400">満足度</span>
              </li>
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function IndividualSolution() {
  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">
        「書く」側から、
        <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
          「操る」側へ。
        </span>
      </h2>
      
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-300">カリキュラム</h3>
        <ul className="space-y-3">
          {[
            { icon: '⚡', text: 'Cursor 2.0 完全習得', desc: 'AIペアプログラミング' },
            { icon: '🔗', text: 'Vector Link 構造化設計', desc: 'データの意味を伝える技術' },
            { icon: '🤖', text: 'Mastra Framework', desc: '自律エージェント開発' },
            { icon: '🏗️', text: 'アーキテクト思考', desc: 'システム全体を設計する力' },
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
              <span className="text-2xl">{item.icon}</span>
              <div>
                <p className="font-medium">{item.text}</p>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function CorporateSolution() {
  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">
        「企業OS」の設計
      </h2>
      
      <div className="space-y-4">
        {/* 3層構造図 */}
        <div className="space-y-3">
          {[
            { 
              layer: 'Layer 3', 
              title: 'Output', 
              desc: 'マーケティング自動化',
              color: 'from-green-500/20 to-green-600/20',
              border: 'border-green-500/30'
            },
            { 
              layer: 'Layer 2', 
              title: 'Agent', 
              desc: '業務自動化（問い合わせ・調査・要約）',
              color: 'from-cyan-500/20 to-cyan-600/20',
              border: 'border-cyan-500/30'
            },
            { 
              layer: 'Layer 1', 
              title: 'Brain', 
              desc: '構造化（Vector Linkによるデータ再構築）',
              color: 'from-purple-500/20 to-purple-600/20',
              border: 'border-purple-500/30'
            },
          ].map((item, i) => (
            <div 
              key={i}
              className={`
                p-4 rounded-lg
                bg-gradient-to-r ${item.color}
                border ${item.border}
              `}
            >
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-gray-400">{item.layer}</span>
                <span className="font-bold">{item.title}</span>
              </div>
              <p className="text-sm text-gray-400 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

---

## 🗂️ ServicesBlueprint

### 概要
23個のFragment IDを保持しつつ、UIは控えめに。

### 実装例

```typescript
// app/components/portal/ServicesBlueprint.tsx
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// 23個のFragment ID定義
const SERVICES = [
  { id: 'service-system-development', title: 'システム開発', type: 'service' },
  { id: 'service-aio-seo', title: 'AIO SEO対策', type: 'service' },
  { id: 'service-chatbot-development', title: 'チャットボット開発', type: 'service' },
  { id: 'service-vector-rag', title: 'ベクトルRAG', type: 'service' },
  { id: 'service-ai-agents', title: 'AIエージェント', type: 'service' },
  { id: 'service-hr-support', title: 'HR支援', type: 'service' },
  { id: 'service-individual-reskilling', title: '個人リスキリング', type: 'service' },
  { id: 'service-corporate-reskilling', title: '企業リスキリング', type: 'service' },
  { id: 'service-ai-side-business', title: 'AI副業支援', type: 'service' },
  { id: 'service-mcp-servers', title: 'MCPサーバー', type: 'service' },
  { id: 'service-sns-automation', title: 'SNS自動化', type: 'service' },
  { id: 'service-video-generation', title: '動画生成', type: 'service' },
  { id: 'faq-main-1', title: '主要サービスについて', type: 'faq' },
  { id: 'faq-main-2', title: 'AI検索最適化について', type: 'faq' },
  { id: 'faq-main-3', title: 'Fragment IDについて', type: 'faq' },
  { id: 'faq-main-4', title: 'ベクトルRAGについて', type: 'faq' },
  { id: 'faq-main-5', title: 'AIエージェントについて', type: 'faq' },
  { id: 'faq-main-6', title: '導入期間・費用', type: 'faq' },
  { id: 'faq-main-7', title: 'サポート体制', type: 'faq' },
  { id: 'faq-main-8', title: 'セキュリティ', type: 'faq' },
  { id: 'nands-ai-site', title: 'NANDSのAIサイト', type: 'section' },
  { id: 'ai-site-features', title: 'AIサイトの特徴', type: 'section' },
  { id: 'ai-site-technology', title: 'AIサイトの技術基盤', type: 'section' },
]

export default function ServicesBlueprint() {
  const [isExpanded, setIsExpanded] = useState(false)

  const services = SERVICES.filter(s => s.type === 'service')
  const faqs = SERVICES.filter(s => s.type === 'faq')
  const sections = SERVICES.filter(s => s.type === 'section')

  return (
    <section className="py-16 border-t border-gray-800">
      <div className="max-w-4xl mx-auto px-4">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">
            📐 Services Architecture
          </h2>
          <p className="text-sm text-gray-500">
            AI検索最適化済み・全23サービスの構造化マップ
          </p>
        </div>

        {/* 展開ボタン */}
        <div className="text-center mb-8">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="
              px-6 py-3 
              bg-gray-800 hover:bg-gray-700 
              rounded-lg 
              border border-cyan-500/30
              text-sm
              transition-all
            "
          >
            {isExpanded ? '▲ 閉じる' : '▼ 全サービスを表示（AI引用最適化済み）'}
          </button>
        </div>

        {/* コンテンツ（折りたたみ） */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="grid md:grid-cols-3 gap-8 pt-4">
                {/* サービス */}
                <div>
                  <h3 className="text-sm font-bold text-purple-400 mb-4">
                    🛠️ サービス（{services.length}個）
                  </h3>
                  <ul className="space-y-2">
                    {services.map(service => (
                      <li 
                        key={service.id}
                        id={service.id}
                        className="scroll-mt-20"
                      >
                        <a 
                          href={`#${service.id}`}
                          className="text-sm text-gray-400 hover:text-cyan-400 transition-colors"
                        >
                          {service.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* FAQ */}
                <div>
                  <h3 className="text-sm font-bold text-cyan-400 mb-4">
                    ❓ FAQ（{faqs.length}個）
                  </h3>
                  <ul className="space-y-2">
                    {faqs.map(faq => (
                      <li 
                        key={faq.id}
                        id={faq.id}
                        className="scroll-mt-20"
                      >
                        <a 
                          href={`#${faq.id}`}
                          className="text-sm text-gray-400 hover:text-cyan-400 transition-colors"
                        >
                          {faq.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* セクション */}
                <div>
                  <h3 className="text-sm font-bold text-green-400 mb-4">
                    🤖 AIサイト（{sections.length}個）
                  </h3>
                  <ul className="space-y-2">
                    {sections.map(section => (
                      <li 
                        key={section.id}
                        id={section.id}
                        className="scroll-mt-20"
                      >
                        <a 
                          href={`#${section.id}`}
                          className="text-sm text-gray-400 hover:text-cyan-400 transition-colors"
                        >
                          {section.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
```

---

**次のドキュメント**: [05-structured-data.md](./05-structured-data.md) - 構造化データ・Fragment ID戦略

