'use client'

import React, { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';

const FixedButtons = () => {
  const { ref: footerRef, inView: isFooterVisible } = useInView();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    setIsVisible(!isFooterVisible); // フッターが見えるときにボタンを非表示
  }, [isFooterVisible]);

  return (
    <>
      {isVisible && (
        <div className="fixed-buttons fixed bottom-0 left-0 right-0 flex justify-center p-4 z-50">
          <div className="flex flex-row gap-4 p-4 rounded-lg">
            <a 
              href="https://lin.ee/vQmAwMU"
              target="_blank"
              rel="noopener noreferrer"
              className="neon-button group"
              style={{
                // fontFamily: 'Arial, sans-serif',
                // letterSpacing: '0.05em',
              }}
            >
              <span className="relative z-10">
                無料相談で10大特典GET
              </span>
            </a>
          </div>
        </div>
      )}
      <div ref={footerRef} className="h-1"></div>
    </>
  );
};

export default FixedButtons;
