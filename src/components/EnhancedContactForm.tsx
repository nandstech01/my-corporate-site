'use client'

import React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import Link from 'next/link'

const formSchema = z.object({
  lastName: z.string().min(1, { message: '姓を入力してください' }),
  firstName: z.string().min(1, { message: '名を入力してください' }),
  email: z.string().email({ message: '有効なメールアドレスを入力してください' }),
  phone: z.string().regex(/^\d{10,11}$/, { message: '有効な電話番号を入力してください' }),
  course: z.enum(['基礎コース', '応用コース', 'エキスパートコース'], {
    required_error: 'コースを選択してください',
  }),
  agreement: z.literal(true, {
    errorMap: () => ({ message: '利用規約とプライバシーポリシーに同意する必要があります' }),
  }),
})

const courseDescriptions = {
  基礎コース: 'AIの基本概念と応用を学び、実務での活用方法を習得します。',
  応用コース: 'より高度なAI技術を学び、複雑な問題解決能力を養成します。',
  エキスパートコース: '最先端のAI技術を駆使し、革新的なソリューションを創造する力を身につけます。',
}

type FormData = z.infer<typeof formSchema>

export default function EnhancedContactForm() {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  })

  const onSubmit = (data: FormData) => {
    console.log(data)
  }

  return (
    <div id="contact-form">
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl mx-auto p-8 bg-gray-50 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-6">
          お申し込みフォーム
        </h2>

        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <label htmlFor="lastName" className="block">
                <div className="flex items-center">
                  <span>お名前（姓）</span>
                  <span className="ml-2 px-2 py-1 text-xs font-semibold bg-pink-500 text-white rounded-md">
                    必須
                  </span>
                </div>
              </label>
              <input
                id="lastName"
                type="text"
                {...register('lastName')}
                placeholder="田中"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
              )}
            </div>

            <div className="flex-1">
              <label htmlFor="firstName" className="block">
                <div className="flex items-center">
                  <span>お名前（名）</span>
                  <span className="ml-2 px-2 py-1 text-xs font-semibold bg-pink-500 text-white rounded-md">
                    必須
                  </span>
                </div>
              </label>
              <input
                id="firstName"
                type="text"
                {...register('firstName')}
                placeholder="太郎"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block">
              <div className="flex items-center">
                <span>メールアドレス</span>
                <span className="ml-2 px-2 py-1 text-xs font-semibold bg-pink-500 text-white rounded-md">
                  必須
                </span>
              </div>
            </label>
            <input
              id="email"
              type="email"
              {...register('email')}
              placeholder="study@example.com"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="phone" className="block">
              <div className="flex items-center">
                <span>電話番号</span>
                <span className="ml-2 px-2 py-1 text-xs font-semibold bg-pink-500 text-white rounded-md">
                  必須
                </span>
              </div>
            </label>
            <input
              id="phone"
              type="tel"
              {...register('phone')}
              placeholder="09012345678"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
            )}
          </div>

          <div>
            <label className="block">
              <div className="flex items-center">
                <span>希望コース</span>
                <span className="ml-2 px-2 py-1 text-xs font-semibold bg-pink-500 text-white rounded-md">
                  必須
                </span>
              </div>
            </label>
            <Controller
              name="course"
              control={control}
              render={({ field }) => (
                <div className="mt-2 space-y-3">
                  {Object.entries(courseDescriptions).map(([course, description]) => (
                    <label
                      key={course}
                      className="block p-2 w-full rounded-lg hover:bg-gray-100 cursor-pointer"
                    >
                      <div className="flex items-start">
                        <input
                          type="radio"
                          {...field}
                          value={course}
                          className="mt-1 mr-2"
                        />
                        <div>
                          <div className="font-medium">{course}</div>
                          <div className="text-sm text-gray-600">{description}</div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            />
            {errors.course && (
              <p className="mt-1 text-sm text-red-600">{errors.course.message}</p>
            )}
          </div>

          <div>
            <div className="flex items-start">
              <input
                type="checkbox"
                {...register('agreement')}
                className="mt-1 mr-2"
              />
              <span className="text-sm text-gray-600">
                <Link href="#" className="text-blue-600 hover:underline">
                  利用規約
                </Link>
                {' '}と{' '}
                <Link href="#" className="text-blue-600 hover:underline">
                  プライバシーポリシー
                </Link>
                {' '}に同意します。
              </span>
            </div>
            {errors.agreement && (
              <p className="mt-1 text-sm text-red-600">{errors.agreement.message}</p>
            )}
          </div>

          <button
    type="submit"
    className="w-full py-3 px-4 bg-[#ff3131] hover:bg-[#e62c2c] text-white font-semibold rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#ff3131] focus:ring-offset-2"
  >
    選択したコースに申し込む
  </button>

          <p className="text-xs text-gray-500">
            ※ 携帯電話など、日中ご本人さまにつながりやすい電話番号をご入力ください。
          </p>
        </div>
      </form>
    </div>
  )
}