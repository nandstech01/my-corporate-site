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
          <div className="flex flex-row gap-4 p-4 bg-black bg-opacity-80 rounded-lg">
            <a 
              href="https://lin.ee/LRj3T2V"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-bold py-3 px-6 rounded-md w-40 shadow-md text-center"
              style={{
                fontFamily: 'Arial, sans-serif',
                letterSpacing: '0.05em',
                transition: 'background-color 0.3s ease-in-out',
              }}
            >
              無料相談で<br />10大特典GET
            </a>
            <a 
              href="#contact-form"
              className="bg-[#ff3131] hover:bg-[#e62c2c] text-white font-bold py-3 px-6 rounded-md w-40 shadow-md text-center"
              style={{
                fontFamily: 'Arial, sans-serif',
                letterSpacing: '0.05em',
                transition: 'background-color 0.3s ease-in-out',
              }}
            >
              コースに<br />申し込む
            </a>
          </div>
        </div>
      )}
      <div ref={footerRef} className="h-1"></div>
    </>
  );
};

export default FixedButtons;
