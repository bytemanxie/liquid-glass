'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Slider } from 'tdesign-react';
import LiquidGlass, { presetFragments } from '@/components/LiquidGlass';

const TabBarPage: React.FC = () => {
  const [sliderValue, setSliderValue] = useState(50);
  const [isGlassVisible, setIsGlassVisible] = useState(false);
  const [glassPosition, setGlassPosition] = useState({ x: 0, y: 0 });
  const sliderRef = useRef<HTMLDivElement>(null);
  const glassTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle slider events
  const handleSliderChange = useCallback((value: number | number[]) => {
    const numValue = Array.isArray(value) ? value[0] : value;
    setSliderValue(numValue);
    
    // 显示玻璃效果
    setIsGlassVisible(true);
    
    // 计算玻璃位置 - 基于滑块位置和值
    if (sliderRef.current) {
      const rect = sliderRef.current.getBoundingClientRect();
      const sliderProgress = numValue / 100; // 滑块进度 0-1
      const sliderWidth = rect.width - 100; // 减去padding
      
      const glassX = rect.left + 50 + (sliderWidth * sliderProgress) - 150; // 居中玻璃
      const glassY = rect.top + rect.height / 2 - 40; // 垂直居中
      
      setGlassPosition({
        x: glassX,
        y: glassY
      });
    }
    
    // 清除之前的定时器
    if (glassTimeoutRef.current) {
      clearTimeout(glassTimeoutRef.current);
    }
    
    // 设置玻璃显示时间
    glassTimeoutRef.current = setTimeout(() => {
      setIsGlassVisible(false);
    }, 800); // 显示800ms后隐藏
  }, []);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (glassTimeoutRef.current) {
        clearTimeout(glassTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative">
      {isGlassVisible && (
        <div
          style={{
            position: 'fixed',
            left: glassPosition.x,
            top: glassPosition.y,
            zIndex: 1000,
            pointerEvents: 'none',
            transition: 'opacity 0.3s ease-out',
          }}
        >
          <LiquidGlass
            width={300}
            height={80}
            fragment={presetFragments.default}
            position="relative"
            draggable={false}
            enablePhysics={false}
            style={{
              opacity: 0.9,
            }}
          />
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10 h-screen flex items-center justify-center">
        <div className="max-w-2xl w-full mx-8">
          {/* Title */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-4">
              液态玻璃滑块
            </h1>
            <p className="text-xl text-white/70">
              拖拽滑块体验液体玻璃效果
            </p>
          </div>

          {/* Slider Container */}
          <div 
            ref={sliderRef}
            className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl"
          >
            <div className="mb-8 text-center">
              <h3 className="text-white font-semibold text-2xl mb-3">控制滑块</h3>
              <p className="text-white/70 text-lg">当前值: {sliderValue}</p>
            </div>
            
            <div className="mb-6">
              <Slider
                value={sliderValue}
                onChange={handleSliderChange}
                min={0}
                max={100}
                step={1}
                className="mb-4"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TabBarPage; 