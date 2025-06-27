'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { Slider } from 'antd';
import 'antd/dist/reset.css';
import DelayedFilter, { delayedFilterFragments } from '@/components/DelayedFilter';
import { Typography } from 'antd';
const { Text } = Typography;

// 响应式尺寸配置 - 使用 Tailwind 断点
const responsiveSizes = {
  sm: { width: 80, height: 40 },   // mobile: 640px+
  md: { width: 100, height: 50 },  // tablet: 768px+  
  lg: { width: 120, height: 60 },  // laptop: 1024px+
  xl: { width: 140, height: 70 },  // desktop: 1280px+
  '2xl': { width: 160, height: 80 } // large desktop: 1536px+
};

// 响应式尺寸 Hook - 基于 Tailwind 断点
const useResponsiveGlassSize = () => {
  const [size, setSize] = useState(responsiveSizes.md);

  useEffect(() => {
    const updateSize = () => {
      const width = window.innerWidth;
      
      if (width >= 1536) {
        setSize(responsiveSizes['2xl']);
      } else if (width >= 1280) {
        setSize(responsiveSizes.xl);
      } else if (width >= 1024) {
        setSize(responsiveSizes.lg);
      } else if (width >= 768) {
        setSize(responsiveSizes.md);
      } else {
        setSize(responsiveSizes.sm);
      }
    };

    // 初始设置
    updateSize();

    // 防抖的 resize 监听器
    let timeoutId: NodeJS.Timeout;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateSize, 150);
    };

    window.addEventListener('resize', debouncedResize);
    
    return () => {
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(timeoutId);
    };
  }, []);

  return size;
};

// 动画定义
const moveBackground = keyframes`
  0% { background-position: 0 0; }
  100% { background-position: 500px 500px; }
`;

// 主容器
const AnimatedBackground = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin: 0;
  height: 85vh;
  background: url('https://www.publicdomainpictures.net/pictures/610000/velka/seamless-floral-wallpaper-art-1715193626Gct.jpg')
    center center;
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
  max-width: 36rem;
  margin: 0 2rem;
`;

// 滑块容器
const SliderContainer = styled.div`
  border-radius: 1rem;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  transition: transform 0.1s ease-out;
  position: relative;
  z-index: 10;

  .ant-slider-track {
    background: linear-gradient(90deg, #3b82f6, #8b5cf6);
    border-radius: 3px;
    height: 6px;
  }

  .ant-slider-handle {
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    &:hover,
    &:focus {
      transform: scale(1.1);
      border-color: #1d4ed8;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
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

// 滑块包装器
const SliderWrapper = styled.div`
  margin-bottom: 1rem;
  padding: 0 0.5rem;
  position: relative;
`;

// 刻度标记
const ScaleMarks = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  padding: 0 1rem;
`;

const TabBarPage: React.FC = () => {
  // 使用响应式尺寸
  const { width, height } = useResponsiveGlassSize();
  
  const [sliderValue, setSliderValue] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [handleElement, setHandleElement] = useState<HTMLElement | null>(null);
  const [glassPosition, setGlassPosition] = useState({ x: 100, y: 100 });
  const [currentPosition, setCurrentPosition] = useState({ x: 100, y: 100 });
  const sliderRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);

  // 查找Slider手柄元素
  const findSliderHandle = useCallback(() => {
    if (sliderRef.current) {
      const handle = sliderRef.current.querySelector('.ant-slider-handle') as HTMLElement;
      setHandleElement(handle);
      return handle;
    }
    return null;
  }, []);

  // 计算手柄位置
  const calculateHandlePosition = useCallback((value?: number) => {
    if (!sliderRef.current) {
      return { x: 100, y: 100 };
    }

    // 直接查找手柄元素
    const handleElement = sliderRef.current.querySelector('.ant-slider-handle');
    if (handleElement) {
      const handleRect = handleElement.getBoundingClientRect();
      const x = handleRect.left + handleRect.width / 2 - width/2;
      const y = handleRect.top + handleRect.height / 2 - height/2;

      return {
        x: Math.max(10, Math.min(window.innerWidth - width - 10, x)),
        y: Math.max(10, y),
      };
    }

    return { x: 100, y: 100 };
  }, [width, height]);

  // 延迟位置跟踪动画
  const updateDelayedPosition = useCallback(() => {
    const target = glassPosition;
    const dx = target.x - currentPosition.x;
    const dy = target.y - currentPosition.y;
    
    if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
      const delayStrength = 0.3;
      const newPosition = {
        x: currentPosition.x + dx * delayStrength,
        y: currentPosition.y + dy * delayStrength,
      };
      
      setCurrentPosition(newPosition);
    }

    if (isDragging || Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
      animationRef.current = requestAnimationFrame(updateDelayedPosition);
    }
  }, [currentPosition, glassPosition, isDragging]);

  // 启动/停止位置跟踪
  useEffect(() => {
    if (isDragging) {
      if (!animationRef.current) {
        animationRef.current = requestAnimationFrame(updateDelayedPosition);
      }
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [isDragging, updateDelayedPosition]);

  // 监听DOM变化，确保能找到手柄
  useEffect(() => {
    const timer = setTimeout(() => {
      findSliderHandle();
    }, 100);

    return () => clearTimeout(timer);
  }, [findSliderHandle]);

  // 滑块值变化处理
  const handleSliderChange = useCallback((value: number | number[]) => {
    const numValue = Array.isArray(value) ? value[0] : value;
    setSliderValue(numValue);
    
    // 确保手柄元素存在
    if (!handleElement) {
      findSliderHandle();
    }
    
    // 更新目标位置
    const newPosition = calculateHandlePosition(numValue);
    setGlassPosition(newPosition);
    
    if (!isDragging) {
      setIsDragging(true);
      setCurrentPosition(newPosition); // 初始位置
    }
  }, [isDragging, handleElement, findSliderHandle, calculateHandlePosition]);

  // 滑块拖拽结束
  const handleSliderAfterChange = useCallback((value: number | number[]) => {
    setIsDragging(false);
  }, []);

  return (
    <AnimatedBackground>
      {/* 液态玻璃 - 全局固定定位，带延迟跟踪 */}
      {handleElement && isDragging && (
        <DelayedFilter
          width={width}
          height={height}
          fragment={delayedFilterFragments.default}
          delayStrength={0.1}
          draggable={true}
          style={{
            position: 'fixed',
            left: currentPosition.x,
            top: currentPosition.y,
            border: '2px solid rgba(255, 255, 255, 0.8)',
            boxShadow: '0 0 20px rgba(255, 255, 255, 0.6), 0 0 40px rgba(59, 130, 246, 0.4), inset 0 0 15px rgba(255, 255, 255, 0.1)',
            zIndex: 10000,
          }}
        >
          <div style={{ width: '100%', height: '100%' }} />
        </DelayedFilter>
      )}

      <MainContent>
        {/* 滑块容器 */}
        <SliderContainer>
          <SliderInfo>
            <SliderTitle>液态玻璃动画</SliderTitle>
            <SliderValue>{sliderValue}</SliderValue>
          </SliderInfo>

          {/* 滑块组件 */}
          <SliderWrapper ref={sliderRef}>
            <Slider
              value={sliderValue}
              onChange={handleSliderChange}
              onChangeComplete={handleSliderAfterChange}
              min={0}
              max={100}
              step={1}
              tooltip={{ open: false }}
            />
          </SliderWrapper>

          {/* 刻度标记 */}
          <ScaleMarks>
            <MarkFont>0</MarkFont>
            <MarkFont>25</MarkFont>
            <MarkFont>50</MarkFont>
            <MarkFont>75</MarkFont>
            <MarkFont>100</MarkFont>
          </ScaleMarks>
        </SliderContainer>
      </MainContent>
    </AnimatedBackground>
  );
};

export default TabBarPage;

const MarkFont = styled(Text)`
  font-size: 1rem;
  color: white;
  font-weight: 600;
`;