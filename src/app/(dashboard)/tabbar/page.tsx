'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { Slider } from 'antd';
import 'antd/dist/reset.css';
import LiquidGlass, { presetFragments } from '@/components/LiquidGlass';

// 动画定义
const moveBackground = keyframes`
  0% { background-position: 0 0; }
  100% { background-position: 500px 500px; }
`;

// 主容器
const AnimatedBackground = styled.div`
  min-height: 100vh;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin: 0;
  height: 100vh;
  background: url("https://www.publicdomainpictures.net/pictures/610000/velka/seamless-floral-wallpaper-art-1715193626Gct.jpg") center center;
  background-size: 500px;
  background-repeat: repeat;
  font-family: sans-serif;
  font-weight: 300;
  animation: ${moveBackground} 60s linear infinite;
`;

// 主内容容器
const MainContent = styled.div`
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 36rem; /* 576px */
  margin: 0 2rem;
`;

// 标题区域
const TitleSection = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const MainTitle = styled.h1`
  font-size: 2.25rem; /* text-4xl */
  font-weight: bold;
  color: white;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  font-size: 1.125rem; /* text-lg */
  color: rgba(255, 255, 255, 0.9);
`;

// 状态指示器
const GlassIndicator = styled.div<{ $isDragging: boolean; $isVisible: boolean }>`
  margin-top: 0.5rem;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  color: ${props => {
    if (props.$isDragging) return '#93c5fd'; /* blue-300 */
    return 'rgba(255, 255, 255, 0.6)';
  }};
`;

// 滑块容器
const SliderContainer = styled.div`
  background: rgba(255, 255, 255, 0.25);
  border-radius: 1rem;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  transition: transform 0.1s ease-out;
  position: relative;
  z-index: 10; /* 确保在glass前面 */

  .ant-slider-track {
    background: linear-gradient(90deg, #3b82f6, #8b5cf6);
    border-radius: 3px;
    height: 6px;
  }

  .ant-slider-handle {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    transition: transform 0.1s ease;

    &:hover, &:focus {
      transform: scale(1.1);
      border-color: #3b82f6;
      box-shadow: 0 0 0 5px rgba(59, 130, 246, 0.12);
    }
  }

  .ant-slider:hover .ant-slider-track {
    background: linear-gradient(90deg, #1d4ed8, #7c3aed);
  }
`;

// 滑块信息区域
const SliderInfo = styled.div`
  margin-bottom: 1.5rem;
  text-align: center;
`;

const SliderTitle = styled.h3`
  color: white;
  font-weight: 600;
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
`;

const SliderValue = styled.div`
  font-size: 1.875rem;
  font-weight: bold;
  color: white;
`;

const SliderStatus = styled.div`
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 0.25rem;
`;

// 滑块包装器
const SliderWrapper = styled.div`
  margin-bottom: 1rem;
  padding: 0 0.5rem;
`;

// 刻度标记
const ScaleMarks = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  padding: 0 1rem;
`;

// 性能提示
const PerformanceTip = styled.div`
  margin-top: 1rem;
  text-align: center;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
`;

const TabBarPage: React.FC = () => {
  const [sliderValue, setSliderValue] = useState(0);
  const [isGlassVisible, setIsGlassVisible] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const glassTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [glassPosition, setGlassPosition] = useState({ x: 100, y: 100 });
  const [glassTransform, setGlassTransform] = useState('scale(1, 1)');

  // 计算滑块手柄的精确位置
  const calculateHandlePosition = useCallback((value?: number) => {
    if (!sliderRef.current) return { x: 100, y: 100 };
    
    const sliderElement = sliderRef.current.querySelector('.ant-slider');
    if (!sliderElement) return { x: 100, y: 100 };
    
    const rect = sliderElement.getBoundingClientRect();
    const currentValue = value !== undefined ? value : sliderValue;
    const progress = currentValue / 100;
    
    // 计算手柄位置（考虑轨道的padding）
    const trackPadding = 10; // Ant Design滑块的内边距
    const availableWidth = rect.width - (trackPadding * 2);
    const handleX = rect.left + trackPadding + (availableWidth * progress);
    const handleY = rect.top + rect.height / 2;
    
    // Glass居中在手柄上
    const x = handleX + window.scrollX - 40; // glass宽度80的一半
    const y = handleY + window.scrollY - 30; // glass高度60的一半
    
    return { 
      x: Math.max(10, Math.min(window.innerWidth - 90, x)), 
      y: Math.max(10, y) 
    };
  }, [sliderValue]);

  // 滑块值变化处理
  const handleSliderChange = useCallback((value: number | number[]) => {
    const numValue = Array.isArray(value) ? value[0] : value;
    setSliderValue(numValue);
    
    if (!isDragging) {
      // 开始拖拽
      setIsDragging(true);
      setIsGlassVisible(true);
      setGlassTransform('scale(2, 0.4) rotate(0deg)'); // 更扁平的开始状态
      
      if (glassTimeoutRef.current) {
        clearTimeout(glassTimeoutRef.current);
      }
    }
    
    // 实时更新位置（拖拽过程中）
    if (isDragging || isGlassVisible) {
      const newPosition = calculateHandlePosition(numValue);
      setGlassPosition(newPosition);
      // 拖拽中保持动态变形
      const rotation = (numValue - 50) * 0.2; // 根据位置轻微旋转
      setGlassTransform(`scale(1.8, 0.5) rotate(${rotation}deg)`);
    }
  }, [isDragging, isGlassVisible, calculateHandlePosition]);

  // 滑块拖拽结束
  const handleSliderAfterChange = useCallback((value: number | number[]) => {
    setIsDragging(false);
    
    // 结束时弹性恢复形状
    setGlassTransform('scale(1.2, 1.2) rotate(0deg)'); // 先放大
    
    // 短暂显示然后隐藏
    setTimeout(() => {
      setGlassTransform('scale(1, 1) rotate(0deg)'); // 然后恢复正常
    }, 100);
    
    glassTimeoutRef.current = setTimeout(() => {
      setIsGlassVisible(false);
      setGlassTransform('scale(1, 1) rotate(0deg)'); // 重置变形
    }, 400); // 增加显示时间
  }, []);

  // 监听窗口大小变化
  useEffect(() => {
    if (!isGlassVisible) return;
    
    const updateGlassPosition = () => {
      const newPosition = calculateHandlePosition();
      setGlassPosition(newPosition);
    };

    window.addEventListener('resize', updateGlassPosition);
    return () => window.removeEventListener('resize', updateGlassPosition);
  }, [isGlassVisible, calculateHandlePosition]);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (glassTimeoutRef.current) {
        clearTimeout(glassTimeoutRef.current);
      }
    };
  }, []);

  return (
    <AnimatedBackground>
      {/* 液态玻璃 - 只包裹手柄圆点，带动态变形 */}
      {isGlassVisible && (
        <LiquidGlass
          width={80}
          height={60}
          fragment={presetFragments.subtle}
          position={glassPosition}
          draggable={false}
          style={{
            opacity: 0.9,
            willChange: 'transform, opacity',
            zIndex: 5, // 在滑块上方但不阻挡交互
            pointerEvents: 'none',
            transform: glassTransform,
            transition: isDragging 
              ? 'transform 0.05s ease-out, opacity 0.1s ease' 
              : 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease',
            transformOrigin: 'center center',
          }}
        />
      )}

      <MainContent>
        {/* 标题 */}
        <TitleSection>
          <MainTitle>液态玻璃滑块</MainTitle>
          <Subtitle>拖拽滑块查看动态玻璃效果</Subtitle>
          {/* 状态指示器 */}
          <GlassIndicator $isDragging={isDragging} $isVisible={isGlassVisible}>
            玻璃状态: {isDragging ? '🌊 流动变形中' : isGlassVisible ? '✨ 弹性恢复中' : '💤 待机'}
          </GlassIndicator>
        </TitleSection>

        {/* 滑块容器 */}
        <SliderContainer ref={sliderRef}>
          <SliderInfo>
            <SliderTitle>动态液态玻璃</SliderTitle>
            <SliderValue>{sliderValue}</SliderValue>
            <SliderStatus>
              {isDragging ? '玻璃正在流动变形...' : '拖拽查看液态效果'}
            </SliderStatus>
          </SliderInfo>
          
          {/* 滑块组件 */}
          <SliderWrapper>
            <Slider
              value={sliderValue}
              onChange={handleSliderChange}
              onChangeComplete={handleSliderAfterChange}
              min={0}
              max={100}
              step={1}
              className="slider-optimized"
            />
          </SliderWrapper>

          {/* 刻度标记 */}
          <ScaleMarks>
            <span>0</span>
            <span>25</span>
            <span>50</span>
            <span>75</span>
            <span>100</span>
          </ScaleMarks>
        </SliderContainer>
      </MainContent>
    </AnimatedBackground>
  );
};

export default TabBarPage; 