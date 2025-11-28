import type { Metadata } from 'next';
import '../globals.css';

export const metadata: Metadata = {
  title: '無料相談お申し込み | N&S',
  description: 'SNS自動化、AI検索対策についての無料相談をお申し込みください。外注費ゼロにする方法を全て公開します。',
  robots: {
    index: false,
    follow: false,
  },
};

export default function DmFormLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          header,
          footer {
            display: none !important;
          }
        `
      }} />
      {children}
    </>
  );
}

