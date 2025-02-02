import './blog.css';
import Header from '@/components/common/Header';

export const metadata = {
  title: 'ブログ | 退職代行案内',
  description: '退職に関する情報や知識をお届けするブログです。',
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="blog-container">
        <div className="blog-content">
          {children}
        </div>
      </main>
    </>
  );
} 