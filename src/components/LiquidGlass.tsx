'use client';

import { useEffect, useRef, useCallback } from 'react';
import {
  Shader,
  type UV,
  type Mouse,
  type TextureResult,
  type FragmentFunction,
  smoothStep,
  roundedRectSDF,
  texture,
  generateId,
} from './Shader';

interface LiquidGlassProps {
  width?: number;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  fragment?: FragmentFunction;
  borderRadius?: number;
  position?: { x: number; y: number };
  draggable?: boolean;
}

// 创建适应宽高比的fragment函数
const createAdaptiveFragment = (width: number, height: number): FragmentFunction => {
  return (uv, mouse) => {
    const ix = uv.x - 0.5;
    const iy = uv.y - 0.5;
    
    const aspectRatio = width / height;
    const radius = Math.min(width, height) * 0.0025; 
    
    let halfWidth, halfHeight;
    if (aspectRatio > 1) {
      halfWidth = 0.4;
      halfHeight = 0.4 / aspectRatio;
    } else {
      halfWidth = 0.4 * aspectRatio;
      halfHeight = 0.4;
    }
    
    const distanceToEdge = roundedRectSDF(ix, iy, halfWidth, halfHeight, radius);
    const displacement = smoothStep(0.8, 0, distanceToEdge - 0.15);
    const scaled = smoothStep(0, 1, displacement);
    return texture(ix * scaled + 0.5, iy * scaled + 0.5);
  };
};

// 默认fragment - 完全按照glass.js的方式
const defaultFragment: FragmentFunction = (uv, mouse) => {
  const ix = uv.x - 0.5;
  const iy = uv.y - 0.5;
  const distanceToEdge = roundedRectSDF(ix, iy, 0.3, 0.2, 0.6);
  const displacement = smoothStep(0.8, 0, distanceToEdge - 0.15);
  const scaled = smoothStep(0, 1, displacement);
  return texture(ix * scaled + 0.5, iy * scaled + 0.5);
};

export default function LiquidGlass({
  width = 300,
  height = 200,
  className = '',
  style = {},
  children,
  fragment = defaultFragment,
  borderRadius,
  position = { x: 100, y: 100 },
  draggable = true,
}: LiquidGlassProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const shaderRef = useRef<Shader | null>(null);

  const createShader = useCallback(() => {
    // 清理之前的shader
    if (shaderRef.current) {
      shaderRef.current.destroy();
    }

    // 如果borderRadius为0，使用自适应fragment；否则使用传入的fragment
    const effectiveFragment = borderRadius === 0 
      ? createAdaptiveFragment(width, height)
      : fragment;

    const shader = new Shader({
      width,
      height,
      fragment: effectiveFragment,
      borderRadius,
      draggable,
      initialPosition: position,
    });

    shader.appendTo(document.body);
    shaderRef.current = shader;
  }, [width, height, fragment, borderRadius, position, draggable]);

  useEffect(() => {
    createShader();

    return () => {
      if (shaderRef.current) {
        shaderRef.current.destroy();
        shaderRef.current = null;
      }
    };
  }, [createShader]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        width: width,
        height: height,
        zIndex: 10000,
        pointerEvents: 'none',
        display: children ? 'block' : 'none',
        ...style,
      }}
    >
      {children && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: 'white',
            fontSize: '16px',
            fontWeight: 600,
            textAlign: 'center',
            pointerEvents: 'none',
            zIndex: 10001,
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

// 预设fragments
export const presetFragments = {
  default: defaultFragment,

  strong: (uv: UV, mouse: Mouse) => {
    const ix = uv.x - 0.5;
    const iy = uv.y - 0.5;
    const distanceToEdge = roundedRectSDF(ix, iy, 0.25, 0.15, 0.5);
    const displacement = smoothStep(0.7, 0, distanceToEdge - 0.1);
    const scaled = smoothStep(0, 1, displacement);
    return texture(ix * scaled + 0.5, iy * scaled + 0.5);
  },

  subtle: (uv: UV, mouse: Mouse) => {
    const ix = uv.x - 0.5;
    const iy = uv.y - 0.5;
    const distanceToEdge = roundedRectSDF(ix, iy, 0.35, 0.25, 0.7);
    const displacement = smoothStep(0.9, 0, distanceToEdge - 0.05);
    const scaled = smoothStep(0, 1, displacement);
    return texture(ix * scaled + 0.5, iy * scaled + 0.5);
  },

  interactive: defaultFragment,
};

export { createAdaptiveFragment };
export type { FragmentFunction, UV, Mouse, LiquidGlassProps };
