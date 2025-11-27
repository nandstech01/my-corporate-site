import type { Metadata } from 'next';
import '../globals.css';

export const metadata: Metadata = {
  title: '月120万円を目指す人のロードマップ | N&S',
  description: '本気で収入を上げたいあなたへ。AIやデジタル分野で新たな可能性を探り、月120万円を目指すためのロードマップをLINEで受け取れます。',
  robots: {
    index: false,
    follow: false,
  },
};

export default function DmNandsLayout({
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
          body {
            overflow: hidden !important;
          }
        `
      }} />
      {children}
    </>
  );
}
