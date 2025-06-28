'use client';

import React from 'react';
import LiquidGlass from '@/components/LiquidGlass';
import { keyframes, styled } from 'styled-components';

const moveBackground = keyframes`
  0% { background-position: 0 0; }
  100% { background-position: 500px 500px; }
`;

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
export default function BackdropTestPage() {
  return (
    <AnimatedBackground>

      {/* LiquidGlass 组件 - 默认效果 */}
      <LiquidGlass
        width={350}
        height={220}
        position={{ x: 200, y: 200 }}
        draggable={true}
        borderRadius={25}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>🌈 默认滤镜</div>
        </div>
      </LiquidGlass>

      {/* LiquidGlass 组件 - 强效果 */}
      <LiquidGlass
        width={400}
        height={250}
        position={{ x: 200, y: 300 }}
        draggable={true}
        borderRadius={20}
        fragment={(uv, mouse) => {
          const ix = uv.x - 0.5;
          const iy = uv.y - 0.5;
          
          // 使用鼠标位置影响扭曲
          const mouseInfluence = 0.3;
          const mouseX = (mouse.x - 0.5) * mouseInfluence;
          const mouseY = (mouse.y - 0.5) * mouseInfluence;
          
          const radius = Math.sqrt((ix - mouseX) * (ix - mouseX) + (iy - mouseY) * (iy - mouseY));
          const distortion = Math.sin(radius * 15) * 0.1 * (1 - radius);
          
          return {
            type: 't' as const,
            x: uv.x + distortion * (ix - mouseX),
            y: uv.y + distortion * (iy - mouseY)
          };
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>🌊 交互滤镜</div>
          <div style={{ fontSize: '0.8rem', opacity: 0.6, marginTop: '0.3rem' }}>鼠标交互实时变化</div>
        </div>
      </LiquidGlass>

      {/* LiquidGlass 组件 - 圆形效果 */}
      <LiquidGlass
        width={300}
        height={300}
        position={{ x: 200, y: 400 }}
        draggable={true}
        borderRadius={150}
        fragment={(uv, mouse) => {
          const ix = uv.x - 0.5;
          const iy = uv.y - 0.5;
          const radius = Math.sqrt(ix * ix + iy * iy);
          const angle = Math.atan2(iy, ix);
          
          // 螺旋扭曲效果
          const spiralFactor = radius * 8;
          const newAngle = angle + spiralFactor;
          const distortion = 0.2;
          
          return {
            type: 't' as const,
            x: 0.5 + radius * Math.cos(newAngle) * (1 + distortion),
            y: 0.5 + radius * Math.sin(newAngle) * (1 + distortion)
          };
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>🌀 螺旋滤镜</div>
        </div>
      </LiquidGlass>
    </AnimatedBackground>
  );
}
