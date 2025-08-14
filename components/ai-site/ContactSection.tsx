'use client'

import { useState } from 'react'

export default function ContactSection() {
	const [form, setForm] = useState({ company: '', name: '', email: '', phone: '', message: '', subsidy: 'はい' })
	return (
		<section id="contact" className="py-20 bg-gradient-to-br from-cyan-900 via-slate-900 to-black">
			<div className="container mx-auto px-4">
				<div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-start">
					<div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20">
						<h2 className="text-2xl lg:text-3xl font-bold text-white mb-6">お問い合わせ</h2>
						<form className="space-y-4">
							<input className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-400" placeholder="会社名" value={form.company} onChange={e=>setForm({...form, company:e.target.value})} />
							<input className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-400" placeholder="ご担当者" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} />
							<input className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-400" placeholder="メール" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} />
							<input className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-400" placeholder="電話（任意）" value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} />
							<select className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white">
								<option value="はい" className="text-gray-800">IT補助金 希望：はい</option>
								<option value="いいえ" className="text-gray-800">IT補助金 希望：いいえ</option>
							</select>
							<textarea className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-400 resize-none" rows={4} placeholder="現状の課題・ご相談内容"></textarea>
							<button type="button" className="w-full lg:w-auto px-10 py-4 bg-gradient-to-r from-cyan-400 to-blue-500 text-gray-900 font-bold text-lg rounded-full shadow-lg">送信</button>
						</form>
					</div>
					<div className="space-y-6">
						<div className="bg-white/5 p-6 rounded-2xl border border-white/10">
							<h3 className="text-white font-bold mb-2">30分デモ</h3>
							<p className="text-gray-300 text-sm">デモで“引用→クリック→LP導線”までの体験をご紹介します</p>
						</div>
						<div className="bg-white/5 p-6 rounded-2xl border border-white/10">
							<h3 className="text-white font-bold mb-2">資料DL</h3>
							<p className="text-gray-300 text-sm">導入構成・要件整理の雛形をご提供します</p>
						</div>
					</div>
				</div>
			</div>
		</section>
	)
} 