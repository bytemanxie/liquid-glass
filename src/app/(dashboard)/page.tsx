'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { Slider } from 'antd';
import 'antd/dist/reset.css';
import DelayedFilter, { delayedFilterFragments } from '@/components/DelayedFilter';

// 动画定义
const moveBackground = keyframes`
  0% { background-position: 0 0; }
  100% { background-position: 500px 500px; }
`;

const glassPluse = keyframes`
  0% { 
    box-shadow: 0 0 20px rgba(255, 255, 255, 0.6), 
                0 0 40px rgba(59, 130, 246, 0.4),
                inset 0 0 15px rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.8);
  }
  100% { 
    box-shadow: 0 0 30px rgba(255, 255, 255, 0.8), 
                0 0 60px rgba(59, 130, 246, 0.6),
                inset 0 0 20px rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 1);
  }
`;

const width=90;
const height=50;


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
  max-width: 36rem; /* 576px */
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
  z-index: 10; /* 确保在glass前面 */

  .ant-slider-track {
    background: linear-gradient(90deg, #3b82f6, #8b5cf6);
    border-radius: 3px;
    height: 6px;
  }

  .ant-slider-handle {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    transition: transform 0.1s ease;

    &:hover,
    &:focus {
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


const TabBarPage: React.FC = () => {
  const [sliderValue, setSliderValue] = useState(0);
  const [isGlassVisible, setIsGlassVisible] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const glassTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [glassPosition, setGlassPosition] = useState({ x: 100, y: 100 });

  // 计算滑块手柄的精确位置
  const calculateHandlePosition = useCallback(
    (value?: number) => {
      if (!sliderRef.current) {
        return { x: 100, y: 100 };
      }

      // 直接查找手柄元素
      const handleElement =
        sliderRef.current.querySelector('.ant-slider-handle');
      if (handleElement) {
        const handleRect = handleElement.getBoundingClientRect();
        const x = handleRect.left + handleRect.width / 2 - width/2; // glass宽度100的一半
        const y = handleRect.top + handleRect.height / 2 - height/2; // glass高度80的一半

        return {
          x: Math.max(10, Math.min(window.innerWidth - 110, x)),
          y: Math.max(10, y),
        };
      }

      // 备用方法：基于轨道计算
      const sliderElement = sliderRef.current.querySelector('.ant-slider');
      if (!sliderElement) {
        return { x: 100, y: 100 };
      }

      const rect = sliderElement.getBoundingClientRect();
      const currentValue = value !== undefined ? value : sliderValue;
      const progress = currentValue / 100;

      // 计算手柄位置
      const handleX = rect.left + rect.width * progress;
      const handleY = rect.top + rect.height / 2;

      // Glass居中在手柄上
      const x = handleX - width/2; // glass宽度100的一半
      const y = handleY - height/2; // glass高度80的一半

      return {
        x: Math.max(10, Math.min(window.innerWidth - 110, x)),
        y: Math.max(10, y),
      };
    },
    [sliderValue]
  );

  // 滑块值变化处理
  const handleSliderChange = useCallback(
    (value: number | number[]) => {
      const numValue = Array.isArray(value) ? value[0] : value;
      setSliderValue(numValue);

      if (!isDragging) {
        // 开始拖拽
        setIsDragging(true);
        setIsGlassVisible(true);

        // 延迟设置正确位置，确保DOM已渲染
        setTimeout(() => {
          const initialPosition = calculateHandlePosition(numValue);
          setGlassPosition(initialPosition);
        }, 10);

        if (glassTimeoutRef.current) {
          clearTimeout(glassTimeoutRef.current);
        }
      }

      // 实时更新位置 - 始终更新位置
      const newPosition = calculateHandlePosition(numValue);
      setGlassPosition(newPosition);
    },
    [isDragging, isGlassVisible, calculateHandlePosition]
  );

  // 滑块拖拽结束
  const handleSliderAfterChange = useCallback((value: number | number[]) => {
    setIsDragging(false);

    // 延迟隐藏
    glassTimeoutRef.current = setTimeout(() => {
      setIsGlassVisible(false);
    }, 200);
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
      {/* 液态玻璃 - 只包裹手柄圆点，带动态keyframe动画 */}
      {isGlassVisible && (
        <DelayedFilter
          width={width}
          height={height}
          fragment={delayedFilterFragments.default}
          targetPosition={glassPosition}
          isDragging={isDragging}
          delayStrength={0.3}
          style={{
            // 增强边界感的样式
            border: isDragging 
              ? '2px solid rgba(255, 255, 255, 0.8)' 
              : '1px solid rgba(255, 255, 255, 0.4)',
            boxShadow: isDragging
              ? `0 0 20px rgba(255, 255, 255, 0.6), 
                 0 0 40px rgba(59, 130, 246, 0.4),
                 inset 0 0 15px rgba(255, 255, 255, 0.1)`
              : `0 0 10px rgba(255, 255, 255, 0.3),
                 inset 0 0 8px rgba(255, 255, 255, 0.05)`,
          }}
        />
      )}

      <MainContent>

        {/* 滑块容器 */}
        <SliderContainer ref={sliderRef}>
          <SliderInfo>
            <SliderTitle>液态玻璃动画</SliderTitle>
            <SliderValue>{sliderValue}</SliderValue>
            <SliderStatus>
              {isDragging
                ? '液态玻璃正在跟随拖拽移动...'
                : '拖拽查看液态玻璃效果'}
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
              className='slider-optimized'
              tooltip={{ open: false }}
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
