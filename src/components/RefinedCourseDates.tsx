import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, AlertCircle } from 'lucide-react';

export default function RefinedCourseDates() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="font-sans">
      <AnimatePresence>
        {isVisible && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-r from-teal-800 to-blue-900 text-white py-2 px-4 shadow-lg relative overflow-hidden"
          >
            <motion.div
              className="absolute inset-0 bg-blue-500 opacity-10"
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
            />
            <div className="container mx-auto relative z-10">
              <div className="flex flex-wrap justify-between items-center">
                <div className="flex items-center space-x-4">
                  <div className="flex items-baseline">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium mr-2">次回開始日</span>
                    <motion.span
                      className="text-3xl font-bold tracking-tighter"
                      initial={{ scale: 1 }}
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      2/15
                    </motion.span>
                    <span className="text-lg ml-1">(火)</span>
                  </div>
                  <div className="h-8 w-px bg-white opacity-30" />
                  <div className="flex flex-col">
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      className="flex items-center text-white text-sm"
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      お申し込み期限 2/8 (土)
                    </motion.div>
                    <div className="text-xs text-gray-300 mt-1 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      開始日は選択可能です
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
