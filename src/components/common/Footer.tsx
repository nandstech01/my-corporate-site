// src/components/common/Footer.tsx
'use client';

import React, { useState } from 'react'
import Link from 'next/link'
import { ChevronRight, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface FooterItemProps {
  label: string
  href?: string
  children?: React.ReactNode
  isExternal?: boolean
}

const FooterItem: React.FC<FooterItemProps> = ({ label, href, children, isExternal }) => {
  const [isOpen, setIsOpen] = useState(false)

  const content = (
    <div className="py-2">
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => children && setIsOpen(!isOpen)}
      >
        <span className="flex items-center text-white">
          <ChevronRight size={16} className="mr-2" />
          {label}
        </span>
        {children && (
          <ChevronDown
            size={16}
            className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        )}
      </div>
      <AnimatePresence>
        {isOpen && children && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="ml-6 mt-2 space-y-2"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )

  if (href) {
    const linkProps = isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {}
    return (
      <Link href={href} className="block" {...linkProps}>
        {content}
      </Link>
    )
  }

  return content
}

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white font-sans">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">NANDS 生成AIリスキリング研修</h2>
          <nav className="space-y-2">
            <FooterItem label="TOP" href="/" />
            <FooterItem label="プロンプトエンジニアリング">
              <FooterItem label="基礎コース" href="#contact-form" />
              <FooterItem label="応用コース" href="#contact-form" />
              <FooterItem label="エキスパートコース" href="#contact-form" />
            </FooterItem>
            <FooterItem label="無料相談" href="https://lin.ee/LRj3T2V" isExternal={true} />
            <FooterItem label="コース申し込み" href="#contact-form" />
            <FooterItem label="法人研修" href="/corporate" />
            <FooterItem label="よくある質問" href="/faq" />
          </nav>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <div className="flex items-center mb-4">
            <span className="text-white font-bold text-lg mr-2">NANDS</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 font-bold text-lg">TECH</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <Link href="/about" className="text-gray-400 hover:text-white">運営会社</Link>
            <Link href="/terms" className="text-gray-400 hover:text-white">利用規約</Link>
            <Link href="/privacy" className="text-gray-400 hover:text-white">プライバシーポリシー</Link>
            <Link href="/legal" className="text-gray-400 hover:text-white">特定商取引に関する表示</Link>
          </div>
          <div className="mt-8 text-xs text-gray-500">
            ©2014 - {new Date().getFullYear()} NANDS Inc.
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer;
