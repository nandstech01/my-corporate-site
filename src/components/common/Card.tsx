// src/components/common/Card.tsx

import React from 'react';

type CardProps = React.HTMLAttributes<HTMLDivElement>;

// 各コンポーネントの定義
export const Card: React.FC<CardProps> = ({ children, className, ...props }) => {
  return (
    <div className={`bg-white shadow-md rounded-lg p-6 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardContent: React.FC<CardProps> = ({ children, className, ...props }) => {
  return (
    <div className={`p-4 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<CardProps> = ({ children, className, ...props }) => {
  return (
    <div className={`border-b border-gray-200 px-4 py-2 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardTitle: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => {
  return (
    <h3 className={`text-lg font-semibold ${className}`} {...props}>
      {children}
    </h3>
  );
};

export const CardFooter: React.FC<CardProps> = ({ children, className, ...props }) => {
  return (
    <div className={`px-4 py-2 ${className}`} {...props}>
      {children}
    </div>
  );
};

// 新たに追加：デフォルトエクスポート
export default Card;
