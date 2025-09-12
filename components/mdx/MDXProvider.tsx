'use client';

import React from 'react';
import { MDXProvider } from '@mdx-js/react';
import { mdxComponents } from './MDXComponents';

interface MDXContentProviderProps {
  children: React.ReactNode;
}

export const MDXContentProvider: React.FC<MDXContentProviderProps> = ({ children }) => {
  return (
    <MDXProvider components={mdxComponents}>
      <div className="prose dark:prose-invert max-w-none prose-lg prose-img:rounded-lg mdx-content">
        {children}
      </div>
    </MDXProvider>
  );
};

export default MDXContentProvider; 