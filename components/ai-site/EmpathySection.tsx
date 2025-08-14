'use client'

import { useEffect, useState } from 'react'
import TextType from '@/components/common/TextType'

export default function EmpathySection() {
	const [visible, setVisible] = useState(false)
	useEffect(()=>{ setVisible(true)},[])

	return (
		<section className="relative py-20 bg-gradient-to-br from-gray-900 via-slate-900 to-black overflow-hidden">
			<div className="container mx-auto px-4">
				<div className="max-w-5xl mx-auto text-center">
					<div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-6 py-2 mb-6">
						<span className="text-white font-semibold text-sm">時代背景</span>
					</div>
					<h2 className="text-3xl lg:text-4xl font-bold text-white mb-4 leading-relaxed">
						<TextType text="検索は “10件から1件を選ぶ” から、AIが1件を選ぶ時代へ" className="text-white" showCursor={false} startOnVisible as="span" />
					</h2>
					<p className="text-xl text-slate-300 leading-relaxed">
						AIに<strong className="text-cyan-300">引用されない = 見つけられない</strong>。従来型サイトでは、2年後に機会損失が常態化します。
						<br className="hidden lg:block" />
						AIサイトは最初から<strong className="text-cyan-300">“AIに選ばれる構造”</strong>を備えた、自己成長型の集客資産です。
					</p>
				</div>
			</div>
		</section>
	)
} 