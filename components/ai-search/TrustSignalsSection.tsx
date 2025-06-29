'use client';

import React from 'react';
import { AuthorProfile, TrustSignals, Credential, Achievement } from '@/lib/structured-data/author-trust-system';

interface TrustSignalsSectionProps {
  authorProfile: AuthorProfile;
  trustSignals: TrustSignals;
  title?: string;
  className?: string;
}

/**
 * Trust Signals Section - 著者・組織の信頼性訴求コンポーネント
 */
export const TrustSignalsSection: React.FC<TrustSignalsSectionProps> = ({
  authorProfile,
  trustSignals,
  title = "専門家プロフィール",
  className = "mt-12 py-16 bg-gradient-to-r from-gray-50 to-blue-50"
}) => {
  return (
    <section className={className}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ヘッダー */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{title}</h2>
          <p className="text-lg text-gray-600">
            レリバンスエンジニアリング・AI技術分野での豊富な実績と専門性
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* 著者プロフィール */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-start space-x-6">
              {/* プロフィール画像 */}
              <div className="flex-shrink-0">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {authorProfile.name.charAt(0)}
                </div>
              </div>

              {/* 基本情報 */}
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {authorProfile.name}
                </h3>
                <p className="text-lg text-blue-600 font-medium mb-3">
                  {authorProfile.jobTitle}
                </p>
                <p className="text-gray-600 leading-relaxed">
                  {authorProfile.description}
                </p>

                {/* ソーシャルリンク */}
                <div className="flex items-center space-x-4 mt-6">
                  {authorProfile.socialMedia.map((social, index) => (
                    <a
                      key={index}
                      href={social.url}
                      className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <SocialIcon platform={social.platform} />
                      <span className="text-sm">{social.platform}</span>
                      {social.verified && (
                        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* 専門分野 */}
            <div className="mt-8">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">専門分野</h4>
              <div className="flex flex-wrap gap-2">
                {authorProfile.expertise.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 実績・信頼性指標 */}
          <div className="space-y-6">
            {/* 組織統計 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-6">組織実績</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {trustSignals.organizationTrust.projectsCompleted}
                  </div>
                  <div className="text-sm text-gray-600">完了プロジェクト</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-xl font-bold text-green-600">
                    {trustSignals.organizationTrust.clientCount}
                  </div>
                  <div className="text-sm text-gray-600">クライアント</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-xl font-bold text-purple-600">
                    {trustSignals.businessCredibility.satisfactionScore}
                  </div>
                  <div className="text-sm text-gray-600">評価</div>
                </div>
                <div className="text-center p-4 bg-amber-50 rounded-lg">
                  <div className="text-2xl font-bold text-amber-600">
                    {trustSignals.organizationTrust.industryExperience}年
                  </div>
                  <div className="text-sm text-gray-600">業界経験</div>
                </div>
              </div>
            </div>

            {/* 認定・資格 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">認定・資格</h4>
              <div className="space-y-3">
                {authorProfile.credentials.slice(0, 3).map((credential, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CredentialIcon type={credential.type} />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{credential.title}</div>
                      <div className="text-sm text-gray-600">
                        {credential.issuer} • {credential.year}年
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 主要実績 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">主要実績</h4>
              <div className="space-y-4">
                {authorProfile.achievements.slice(0, 3).map((achievement, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4">
                    <div className="font-medium text-gray-900">{achievement.title}</div>
                    <div className="text-sm text-gray-600 mt-1">{achievement.description}</div>
                    {achievement.metrics && (
                      <div className="text-sm text-blue-600 font-medium mt-2">
                        {achievement.metrics.value} {achievement.metrics.unit}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* パートナー認定 */}
            {trustSignals.businessCredibility.certifications && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">パートナー認定</h4>
                <div className="flex flex-wrap gap-3">
                  {trustSignals.businessCredibility.certifications.map((cert, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg text-sm"
                    >
                      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>{cert}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

/**
 * ソーシャルアイコンコンポーネント
 */
const SocialIcon: React.FC<{ platform: string }> = ({ platform }) => {
  switch (platform.toLowerCase()) {
    case 'github':
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
        </svg>
      );
    case 'linkedin':
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      );
    default:
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clipRule="evenodd" />
        </svg>
      );
  }
};

/**
 * 認定アイコンコンポーネント
 */
const CredentialIcon: React.FC<{ type: string }> = ({ type }) => {
  switch (type) {
    case 'certification':
      return (
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
      );
    case 'experience':
      return (
        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
            <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
          </svg>
        </div>
      );
    default:
      return (
        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      );
  }
};

export default TrustSignalsSection; 