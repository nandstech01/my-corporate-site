'use client';

import { useState } from 'react';
import { useSpring, animated } from '@react-spring/web';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    company: '',
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const fadeIn = useSpring({
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    config: {
      tension: 120,
      friction: 14,
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          to: 'contact@nands.tech'
        }),
      });
      
      if (response.ok) {
        alert('お問い合わせを受け付けました。担当者より連絡させていただきます。');
        setFormData({
          company: '',
          name: '',
          email: '',
          phone: '',
          message: ''
        });
      } else {
        throw new Error('送信に失敗しました');
      }
    } catch (error) {
      alert('エラーが発生しました。時間をおいて再度お試しください。');
      console.error('Form submission error:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <section className="relative py-20 overflow-hidden">
      {/* 装飾的な背景要素 */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/images/grid.svg')] opacity-5"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-10 w-40 h-40 bg-blue-500 rounded-full filter blur-[100px] opacity-10"></div>
          <div className="absolute bottom-40 right-20 w-60 h-60 bg-cyan-400 rounded-full filter blur-[120px] opacity-10"></div>
        </div>
      </div>

      <animated.div style={fadeIn} className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900 bg-clip-text text-transparent mb-4">
            お問い合わせ
          </h2>
          <p className="text-gray-600 text-lg">
            AI副業に関するご質問や、セミナーについてのお問い合わせはこちらから
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                  会社名
                </label>
                <input
                  type="text"
                  name="company"
                  id="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
                  required
                />
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  お名前
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  メールアドレス
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
                  required
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  電話番号
                </label>
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                お問い合わせ内容
              </label>
              <textarea
                name="message"
                id="message"
                rows={4}
                value={formData.message}
                onChange={handleChange}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
                required
              />
            </div>

            <div className="text-center pt-4">
              <button
                type="submit"
                className="neon-button group"
              >
                <span className="relative z-10">
                  送信する
                  <span className="inline-block ml-2 transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </span>
              </button>
            </div>
          </form>
        </div>

        <style jsx>{`
          .neon-button {
            display: inline-block;
            position: relative;
            padding: 1rem 4rem;
            color: #fff;
            text-decoration: none;
            font-size: 1.25rem;
            font-weight: bold;
            border-radius: 50px;
            background: linear-gradient(
              90deg,
              rgba(59, 130, 246, 0.9) 0%,
              rgba(6, 182, 212, 0.9) 50%,
              rgba(59, 130, 246, 0.9) 100%
            );
            box-shadow: 0 0 15px rgba(59, 130, 246, 0.6),
              0 0 30px rgba(6, 182, 212, 0.5),
              0 0 60px rgba(59, 130, 246, 0.4);
            transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
            animation: neonPulse 3s infinite alternate;
            border: 1px solid rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(10px);
            cursor: pointer;
          }

          .neon-button:hover {
            transform: scale(1.05) translateY(-5px);
            box-shadow: 0 0 25px rgba(59, 130, 246, 0.8),
              0 0 50px rgba(6, 182, 212, 0.7),
              0 0 100px rgba(59, 130, 246, 0.6);
            background: linear-gradient(
              90deg,
              rgba(59, 130, 246, 1) 0%,
              rgba(6, 182, 212, 1) 50%,
              rgba(59, 130, 246, 1) 100%
            );
          }

          @keyframes neonPulse {
            0% {
              box-shadow: 0 0 15px rgba(59, 130, 246, 0.6),
                0 0 30px rgba(6, 182, 212, 0.5),
                0 0 60px rgba(59, 130, 246, 0.4);
            }
            100% {
              box-shadow: 0 0 20px rgba(59, 130, 246, 0.8),
                0 0 40px rgba(6, 182, 212, 0.7),
                0 0 80px rgba(59, 130, 246, 0.6);
            }
          }
        `}</style>
      </animated.div>
    </section>
  );
} 