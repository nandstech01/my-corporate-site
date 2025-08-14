'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function AIHeader() {
	const [open, setOpen] = useState(false)

	const scrollToId = (id: string) => {
		const el = document.getElementById(id)
		if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
	}

	return (
		<header className="relative z-50 bg-white border-b border-gray-200/70">
			<div className="container mx-auto px-4">
				<div className="flex items-center justify-between h-16">
					<Link href="/" className="flex items-center">
						<Image src="/images/logo.svg" alt="N&S Logo" width={120} height={40} className="w-auto h-8" priority />
					</Link>
					<nav className="hidden md:flex items-center gap-4">
						<Link href="#features" onClick={(e)=>{e.preventDefault();scrollToId('features')}} className="px-3 py-1 rounded-full text-gray-700 hover:text-cyan-700 hover:bg-cyan-50 transition-colors font-medium ring-1 ring-transparent hover:ring-cyan-100">機能</Link>
						<Link href="#mechanism" onClick={(e)=>{e.preventDefault();scrollToId('mechanism')}} className="px-3 py-1 rounded-full text-gray-700 hover:text-cyan-700 hover:bg-cyan-50 transition-colors font-medium ring-1 ring-transparent hover:ring-cyan-100">仕組み</Link>
						<Link href="#pricing" onClick={(e)=>{e.preventDefault();scrollToId('pricing')}} className="px-3 py-1 rounded-full text-gray-700 hover:text-cyan-700 hover:bg-cyan-50 transition-colors font-medium ring-1 ring-transparent hover:ring-cyan-100">価格</Link>
						<Link href="#contact" onClick={(e)=>{e.preventDefault();scrollToId('contact')}} className="px-3 py-1 rounded-full text-gray-700 hover:text-cyan-700 hover:bg-cyan-50 transition-colors font-medium ring-1 ring-transparent hover:ring-cyan-100">お問い合わせ</Link>
						<Link href="/partner-admin" className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm font-semibold bg-gradient-to-r from-cyan-500 to-cyan-600 shadow-md hover:shadow-lg ring-1 ring-cyan-200 transition-colors duration-200">パートナー</Link>
					</nav>
					<button onClick={()=>setOpen(!open)} className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg text-gray-600 hover:text-cyan-700 hover:bg-gray-100">
						<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							{open ? (
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
							) : (
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
							)}
						</svg>
					</button>
				</div>
				{open && (
					<div className="md:hidden py-3">
						<nav className="grid gap-2">
							<Link href="#features" onClick={(e)=>{e.preventDefault();setOpen(false);scrollToId('features')}} className="px-4 py-3 rounded-xl bg-white ring-1 ring-gray-200 hover:ring-cyan-200 shadow-sm text-gray-800">機能</Link>
							<Link href="#mechanism" onClick={(e)=>{e.preventDefault();setOpen(false);scrollToId('mechanism')}} className="px-4 py-3 rounded-xl bg-white ring-1 ring-gray-200 hover:ring-cyan-200 shadow-sm text-gray-800">仕組み</Link>
							<Link href="#pricing" onClick={(e)=>{e.preventDefault();setOpen(false);scrollToId('pricing')}} className="px-4 py-3 rounded-xl bg-white ring-1 ring-gray-200 hover:ring-cyan-200 shadow-sm text-gray-800">価格</Link>
							<Link href="#contact" onClick={(e)=>{e.preventDefault();setOpen(false);scrollToId('contact')}} className="px-4 py-3 rounded-xl bg-white ring-1 ring-gray-200 hover:ring-cyan-200 shadow-sm text-gray-800">お問い合わせ</Link>
							<Link href="/partner-admin" className="px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 text-white shadow">パートナー</Link>
						</nav>
					</div>
				)}
			</div>
		</header>
	)
} 