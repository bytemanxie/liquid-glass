'use client';

import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useTransform, useVelocity } from 'framer-motion';
import { Slider } from 'tdesign-react';
import LiquidGlass, { presetFragments, physicsPresets } from '@/components/LiquidGlass';

const TabBarPage: React.FC = () => {
  const [sliderValue, setSliderValue] = useState(50);
  const [isGlassVisible, setIsGlassVisible] = useState(false);
  const [glassPosition, setGlassPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  
  // Motion values for glass effects
  const x = useMotionValue(0);
  const velocity = useVelocity(x);
  
  // Transform values for glass effects based on drag velocity
  const glassOpacity = useTransform(velocity, [-500, 0, 500], [0.9, 0, 0.9]);
  const glassScale = useTransform(velocity, [-500, 0, 500], [1.3, 1, 1.3]);

  // Handle slider events
  const handleSliderChange = (value: number | number[]) => {
    const numValue = Array.isArray(value) ? value[0] : value;
    setSliderValue(numValue);
    x.set(numValue * 10); // Amplify movement for velocity detection
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setIsGlassVisible(true);
    updateGlassPosition(e);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      updateGlassPosition(e);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    // Hide glass after animation
    setTimeout(() => {
      setIsGlassVisible(false);
    }, 300);
  };

  const updateGlassPosition = (e: React.MouseEvent) => {
    setGlassPosition({
      x: e.clientX,
      y: e.clientY,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-40 h-40 bg-purple-500/20 rounded-full blur-2xl animate-pulse" />
        <div className="absolute top-60 right-32 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl animate-pulse delay-1000" />
        <div className="absolute bottom-60 left-32 w-36 h-36 bg-indigo-500/20 rounded-full blur-2xl animate-pulse delay-2000" />
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-pink-500/20 rounded-full blur-2xl animate-pulse delay-3000" />
      </div>

      {/* Instructions */}
      <div className="absolute top-8 right-8 bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 max-w-sm z-50">
        <h3 className="text-white font-semibold mb-3 text-lg">滑动玻璃效果</h3>
        <p className="text-white/70 text-sm leading-relaxed">
          • 拖拽滑块查看液态玻璃滤镜<br/>
          • 拖拽速度越快，玻璃效果越明显<br/>
          • 观察液体变形和恢复动画<br/>
          • 体验真实的物理反馈效果
        </p>
      </div>

      {/* Liquid Glass Filter - Only visible during drag */}
      {isGlassVisible && (
        <LiquidGlass
            width={300}
            height={80}
            fragment={presetFragments.interactive}
            position="relative"
            draggable={true}
        />
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
              拖拽滑块体验真实的液体物理效果
            </p>
          </div>

          {/* Slider Container */}
          <div 
            ref={sliderRef}
            className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
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
            
            <div className="flex justify-between text-sm text-white/60 mb-6">
              <span>0</span>
              <span>25</span>
              <span>50</span>
              <span>75</span>
              <span>100</span>
            </div>

            {/* Value Display */}
            <div className="grid grid-cols-3 gap-4 mt-8">
              <div className="bg-white/10 rounded-2xl p-4 text-center">
                <div className="text-2xl mb-2">📊</div>
                <div className="text-white font-semibold">当前值</div>
                <div className="text-white/70">{sliderValue}%</div>
              </div>
              <div className="bg-white/10 rounded-2xl p-4 text-center">
                <div className="text-2xl mb-2">⚡</div>
                <div className="text-white font-semibold">速度</div>
                <div className="text-white/70">{Math.abs(velocity.get()).toFixed(0)}</div>
              </div>
              <div className="bg-white/10 rounded-2xl p-4 text-center">
                <div className="text-2xl mb-2">🎯</div>
                <div className="text-white font-semibold">状态</div>
                <div className="text-white/70">{isDragging ? '拖拽中' : '静止'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TabBarPage; 