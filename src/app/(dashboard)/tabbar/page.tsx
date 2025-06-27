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

// 液态玻璃动画 - 开始拖拽时的变形
const glassSquish = keyframes`
  0% { 
    transform: scale(1, 1) rotate(0deg);
    opacity: 0;
  }
  30% { 
    transform: scale(2.5, 0.3) rotate(2deg);
    opacity: 0.9;
  }
  100% { 
    transform: scale(1.8, 0.5) rotate(0deg);
    opacity: 0.95;
  }
`;

// 液态玻璃动画 - 拖拽过程中的波动
const glassRipple = keyframes`
  0% { 
    transform: scale(1.8, 0.5) rotate(0deg);
  }
  20% { 
    transform: scale(2.2, 0.3) rotate(2deg);
  }
  40% { 
    transform: scale(1.4, 0.7) rotate(-2deg);
  }
  60% { 
    transform: scale(2.0, 0.4) rotate(1deg);
  }
  80% { 
    transform: scale(1.6, 0.6) rotate(-1deg);
  }
  100% { 
    transform: scale(1.8, 0.5) rotate(0deg);
  }
`;

// 液态玻璃动画 - 结束时的弹性恢复
const glassRestore = keyframes`
  0% { 
    transform: scale(1.8, 0.5) rotate(0deg);
  }
  30% { 
    transform: scale(0.8, 1.4) rotate(-2deg);
  }
  60% { 
    transform: scale(1.3, 0.8) rotate(1deg);
  }
  80% { 
    transform: scale(0.95, 1.1) rotate(-0.5deg);
  }
  100% { 
    transform: scale(1, 1) rotate(0deg);
  }
`;

// 液态玻璃动画 - 消失时的收缩
const glassFadeOut = keyframes`
  0% { 
    transform: scale(1, 1) rotate(0deg);
    opacity: 0.95;
  }
  50% { 
    transform: scale(0.5, 0.5) rotate(5deg);
    opacity: 0.5;
  }
  100% { 
    transform: scale(0, 0) rotate(10deg);
    opacity: 0;
  }
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
const GlassIndicator = styled.div<{
  $isDragging: boolean;
  $isVisible: boolean;
}>`
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

// 动画化的玻璃容器
const AnimatedGlass = styled.div<{ $animationState: string }>`
  position: fixed;
  pointer-events: none;
  z-index: 5;
  transform-origin: center center;
  opacity: 1;
  will-change: transform, opacity;

  animation: ${props => {
    switch (props.$animationState) {
      case 'squish':
        return css`
          ${glassSquish} 0.5s ease-out forwards
        `;
      case 'ripple':
        return css`
          ${glassRipple} 0.6s ease-in-out infinite
        `;
      case 'restore':
        return css`
          ${glassRestore} 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards
        `;
      case 'fadeout':
        return css`
          ${glassFadeOut} 0.4s ease-in forwards
        `;
      default:
        return 'none';
    }
  }};
`;

const TabBarPage: React.FC = () => {
  const [sliderValue, setSliderValue] = useState(0);
  const [isGlassVisible, setIsGlassVisible] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const glassTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [glassPosition, setGlassPosition] = useState({ x: 100, y: 100 });
  const [animationState, setAnimationState] = useState<
    'squish' | 'ripple' | 'restore' | 'fadeout' | 'none'
  >('none');

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
        const x = handleRect.left + handleRect.width / 2 - 50; // glass宽度100的一半
        const y = handleRect.top + handleRect.height / 2 - 40; // glass高度80的一半

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
      const x = handleX - 50; // glass宽度100的一半
      const y = handleY - 40; // glass高度80的一半

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
        // 开始拖拽 - 启动挤压动画
        setIsDragging(true);
        setIsGlassVisible(true);
        setAnimationState('squish');

        // 延迟设置正确位置，确保DOM已渲染
        setTimeout(() => {
          const initialPosition = calculateHandlePosition(numValue);
          setGlassPosition(initialPosition);
        }, 10);

        if (glassTimeoutRef.current) {
          clearTimeout(glassTimeoutRef.current);
        }

        // 挤压动画结束后切换到波动动画
        setTimeout(() => {
          setAnimationState('ripple');
        }, 400);
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

    // 启动恢复动画
    setAnimationState('restore');

    // 恢复动画结束后启动消失动画
    setTimeout(() => {
      setAnimationState('fadeout');
    }, 600);

    // 完全隐藏
    glassTimeoutRef.current = setTimeout(() => {
      setIsGlassVisible(false);
      setAnimationState('none');
    }, 900);
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
        <LiquidGlass
          width={100}
          height={80}
          fragment={presetFragments.default}
          position={glassPosition}
          draggable={false}
          style={{
            transformOrigin: 'center center',
            willChange: 'transform, opacity',
            pointerEvents: 'none',
            zIndex: 5,
            animation:
              animationState === 'squish'
                ? `squish 0.5s ease-out forwards`
                : animationState === 'ripple'
                  ? `ripple 0.6s ease-in-out infinite`
                  : animationState === 'restore'
                    ? `restore 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards`
                    : animationState === 'fadeout'
                      ? `fadeout 0.4s ease-in forwards`
                      : 'none',
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
            玻璃状态:{' '}
            {animationState === 'squish'
              ? '🌊 液态挤压中'
              : animationState === 'ripple'
                ? '〰️ 波动流动中'
                : animationState === 'restore'
                  ? '✨ 弹性恢复中'
                  : animationState === 'fadeout'
                    ? '💨 收缩消失中'
                    : '💤 待机'}
          </GlassIndicator>
        </TitleSection>

        {/* 滑块容器 */}
        <SliderContainer ref={sliderRef}>
          <SliderInfo>
            <SliderTitle>液态玻璃动画</SliderTitle>
            <SliderValue>{sliderValue}</SliderValue>
            <SliderStatus>
              {animationState === 'squish'
                ? '液态玻璃正在挤压变形...'
                : animationState === 'ripple'
                  ? '玻璃随拖拽波动流动...'
                  : animationState === 'restore'
                    ? '玻璃弹性恢复原形...'
                    : animationState === 'fadeout'
                      ? '玻璃收缩消失中...'
                      : '拖拽查看液态玻璃动画'}
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
