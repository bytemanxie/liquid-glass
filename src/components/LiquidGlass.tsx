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

    // 如果有children，将其渲染到shader容器中
    if (children && shader.container) {
      const contentWrapper = document.createElement('div');
      contentWrapper.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: white;
        font-size: 16px;
        font-weight: 600;
        text-align: center;
        pointer-events: none;
        z-index: 1;
        text-shadow: 0 1px 3px rgba(0,0,0,0.5);
        user-select: none;
        white-space: nowrap;
      `;
      
      // 创建React内容的挂载点
      const reactRoot = document.createElement('div');
      contentWrapper.appendChild(reactRoot);
      shader.container.appendChild(contentWrapper);

      // 使用React的createRoot API渲染children
      import('react-dom/client').then(({ createRoot }) => {
        const root = createRoot(reactRoot);
        root.render(children);
        
        // 保存root以便清理
        (shader as any).__reactRoot = root;
      });
    }
  }, [width, height, fragment, borderRadius, position, draggable, children]);

  useEffect(() => {
    createShader();

    return () => {
      if (shaderRef.current) {
        shaderRef.current.destroy();
        shaderRef.current = null;
      }
    };
  }, [createShader]);

  // 如果没有提供children，创建一个临时的Shader来显示默认文本
  useEffect(() => {
    if (!children && shaderRef.current?.container) {
      const existingContent = shaderRef.current.container.querySelector('.default-content');
      if (!existingContent) {
        const defaultContentWrapper = document.createElement('div');
        defaultContentWrapper.className = 'default-content';
        defaultContentWrapper.style.cssText = `
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: white;
          font-size: 16px;
          font-weight: 600;
          text-align: center;
          pointer-events: none;
          z-index: 1;
          text-shadow: 0 1px 3px rgba(0,0,0,0.5);
          user-select: none;
          white-space: nowrap;
        `;
        shaderRef.current.container.appendChild(defaultContentWrapper);
      }
    }
  }, [draggable, children]);

  // 这个组件现在只是一个控制器，不渲染任何可见内容
  return null;
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
