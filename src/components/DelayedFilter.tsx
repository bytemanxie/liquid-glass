'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';

// 类型定义 - 直接从Shader.ts移植
interface UV {
  x: number;
  y: number;
}

interface Mouse {
  x: number;
  y: number;
}

interface TextureResult {
  type: 't';
  x: number;
  y: number;
}

type FragmentFunction = (uv: UV, mouse: Mouse) => TextureResult;

// 工具函数 - 直接从Shader.ts移植
function smoothStep(a: number, b: number, t: number): number {
  t = Math.max(0, Math.min(1, (t - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

function length(x: number, y: number): number {
  return Math.sqrt(x * x + y * y);
}

function roundedRectSDF(
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): number {
  const qx = Math.abs(x) - width + radius;
  const qy = Math.abs(y) - height + radius;
  return (
    Math.min(Math.max(qx, qy), 0) +
    length(Math.max(qx, 0), Math.max(qy, 0)) -
    radius
  );
}

function texture(x: number, y: number): TextureResult {
  return { type: 't', x, y };
}

function generateId(): string {
  return 'delayed-filter-' + Math.random().toString(36).substr(2, 9);
}

interface DelayedFilterProps {
  width: number;
  height: number;
  fragment?: FragmentFunction;
  position?: { x: number; y: number };
  targetPosition?: { x: number; y: number };
  borderRadius?: number;
  scale?: number;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  // 延迟参数
  delayStrength?: number; // 延迟强度 0-1，越小延迟越明显
  isDragging?: boolean;
  onPositionChange?: (x: number, y: number) => void;
}

// Shader.ts原版滤镜效果 - 最佳效果
const shaderDefaultFragment: FragmentFunction = (uv, mouse) => {
  const ix = uv.x - 0.5;
  const iy = uv.y - 0.5;
  const distanceToEdge = roundedRectSDF(ix, iy, 0.3, 0.2, 0.6);
  const displacement = smoothStep(0.8, 0, distanceToEdge - 0.15);
  const scaled = smoothStep(0, 1, displacement);
  return texture(ix * scaled + 0.5, iy * scaled + 0.5);
};

export default function DelayedFilter({
  width,
  height,
  fragment = shaderDefaultFragment,
  position = { x: 100, y: 100 },
  targetPosition,
  borderRadius = 150,
  scale = 1,
  className = '',
  style = {},
  children,
  delayStrength = 0.2,
  isDragging = false,
  onPositionChange,
}: DelayedFilterProps) {
  const [currentPosition, setCurrentPosition] = useState(targetPosition || position);
  const [internalMouse, setInternalMouse] = useState({ x: 0.5, y: 0.5 });
  const [targetMouse, setTargetMouse] = useState({ x: 0.5, y: 0.5 });
  const animationRef = useRef<number | null>(null);
  
  // Shader相关refs
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const feImageRef = useRef<SVGFEImageElement>(null);
  const feDisplacementMapRef = useRef<SVGFEDisplacementMapElement>(null);
  
  const [filterId] = useState(() => generateId());
  const canvasDPI = 1;

  // 更新滤镜效果 - 完全按照glass.js实现
  const updateFilter = useCallback(() => {
    const canvas = canvasRef.current;
    const feImage = feImageRef.current;
    const feDisplacementMap = feDisplacementMapRef.current;
    
    if (!canvas || !feImage || !feDisplacementMap) return;

    // 创建鼠标代理来检测是否被使用 - 和glass.js一致
    let mouseUsed = false;
    const mouseProxy = new Proxy(internalMouse, {
      get: (target, prop) => {
        mouseUsed = true;
        return target[prop as keyof Mouse];
      }
    });

    const context = canvas.getContext('2d')!;
    const w = width * canvasDPI;
    const h = height * canvasDPI;
    const data = new Uint8ClampedArray(w * h * 4);

    let maxScale = 0;
    const rawValues: number[] = [];

    // 生成置换图 - 使用代理鼠标
    for (let i = 0; i < data.length; i += 4) {
      const x = (i / 4) % w;
      const y = Math.floor(i / 4 / w);
      const pos = fragment({ x: x / w, y: y / h }, mouseProxy);
      const dx = pos.x * w - x;
      const dy = pos.y * h - y;
      maxScale = Math.max(maxScale, Math.abs(dx), Math.abs(dy));
      rawValues.push(dx, dy);
    }

    maxScale *= 0.5;

    // 填充像素数据
    let index = 0;
    for (let i = 0; i < data.length; i += 4) {
      const r = rawValues[index++] / maxScale + 0.5;
      const g = rawValues[index++] / maxScale + 0.5;
      data[i] = r * 255;
      data[i + 1] = g * 255;
      data[i + 2] = 0;
      data[i + 3] = 255;
    }

    // 更新canvas和SVG滤镜
    context.putImageData(new ImageData(data, w, h), 0, 0);
    feImage.setAttributeNS(
      'http://www.w3.org/1999/xlink',
      'href',
      canvas.toDataURL()
    );
    feDisplacementMap.setAttribute(
      'scale',
      (maxScale / canvasDPI).toString()
    );

    // 鼠标使用状态已检测完成
  }, [width, height, fragment, internalMouse, canvasDPI]);

  // 延迟位置更新循环
  const updateDelayedPosition = useCallback(() => {
    if (!isDragging) return;

    const target = targetPosition || position;
    
    // 位置延迟跟随
    const dx = target.x - currentPosition.x;
    const dy = target.y - currentPosition.y;
    
    if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
      const newPosition = {
        x: currentPosition.x + dx * delayStrength,
        y: currentPosition.y + dy * delayStrength,
      };
      
      setCurrentPosition(newPosition);
      onPositionChange?.(newPosition.x, newPosition.y);
    }

    // 鼠标位置延迟跟随
    const mouseDx = targetMouse.x - internalMouse.x;
    const mouseDy = targetMouse.y - internalMouse.y;
    
    if (Math.abs(mouseDx) > 0.001 || Math.abs(mouseDy) > 0.001) {
      setInternalMouse(prev => ({
        x: prev.x + mouseDx * delayStrength * 3, // 鼠标跟随比位置快一些
        y: prev.y + mouseDy * delayStrength * 3,
      }));
    }

    if (isDragging) {
      animationRef.current = requestAnimationFrame(updateDelayedPosition);
    }
  }, [currentPosition, targetPosition, position, delayStrength, isDragging, targetMouse, internalMouse, onPositionChange]);

  // 启动/停止延迟更新
  useEffect(() => {
    if (isDragging) {
      animationRef.current = requestAnimationFrame(updateDelayedPosition);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      // 拖拽结束时，逐渐回到目标位置
      const finalTarget = targetPosition || position;
      setCurrentPosition(finalTarget);
      setInternalMouse({ x: 0.5, y: 0.5 });
      setTargetMouse({ x: 0.5, y: 0.5 });
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isDragging, updateDelayedPosition, targetPosition, position]);

  // 处理外部位置变化
  useEffect(() => {
    const target = targetPosition || position;
    setTargetMouse({ x: 0.5, y: 0.5 }); // 重置鼠标目标
    
    if (!isDragging) {
      setCurrentPosition(target);
    }
  }, [targetPosition, position, isDragging]);

  // 处理鼠标移动来创建拉伸效果
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current || !isDragging) return;

    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) / rect.width;
    const mouseY = (e.clientY - rect.top) / rect.height;

    setTargetMouse({ x: mouseX, y: mouseY });
  }, [isDragging]);

  // 更新滤镜效果
  useEffect(() => {
    updateFilter();
  }, [updateFilter]);

  return (
    <>
      {/* SVG滤镜定义 */}
      <svg
        ref={svgRef}
        xmlns="http://www.w3.org/2000/svg"
        width="0"
        height="0"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          pointerEvents: 'none',
          zIndex: -1,
        }}
      >
        <defs>
          <filter
            id={filterId}
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
            x="0"
            y="0"
            width={width.toString()}
            height={height.toString()}
          >
            <feImage
              ref={feImageRef}
              id={`${filterId}_map`}
              width={width.toString()}
              height={height.toString()}
            />
            <feDisplacementMap
              ref={feDisplacementMapRef}
              in="SourceGraphic"
              in2={`${filterId}_map`}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      {/* 隐藏的canvas用于生成置换图 */}
      <canvas
        ref={canvasRef}
        width={width * canvasDPI}
        height={height * canvasDPI}
        style={{ display: 'none' }}
      />

      {/* 滤镜容器 */}
      <div
        ref={containerRef}
        className={className}
        style={{
          position: 'fixed',
          left: currentPosition.x,
          top: currentPosition.y,
          width: width,
          height: height,
          borderRadius: borderRadius,
                     backdropFilter: `url(#${filterId})`,
          cursor: 'grab',
          pointerEvents: 'auto',
          zIndex: 9999,
          overflow: 'hidden',
          ...style,
        }}
        onMouseMove={handleMouseMove}
      >
        {children}
      </div>
    </>
  );
}

// 导出预设的延迟fragment效果
export const delayedFilterFragments = {
  default: shaderDefaultFragment,
  
  liquid: (uv: UV, mouse: Mouse) => {
    const ix = uv.x - 0.5;
    const iy = uv.y - 0.5;
    
    // 基础液体形状 - 更圆润，更像水滴
    const distanceToEdge = roundedRectSDF(ix, iy, 0.25, 0.18, 0.8);
    
    // 添加动态表面张力效果
    const time = Date.now() * 0.002;
    const surfaceTension = Math.sin(time + ix * 6) * 0.02 + Math.cos(time * 1.3 + iy * 4) * 0.015;
    
    // 模拟液体内部的折射
    const refraction = smoothStep(0.7, 0, distanceToEdge - 0.1 + surfaceTension);
    
    // 增强的缩放效果，模拟液体的光学特性
    const liquidScale = smoothStep(0, 1, refraction) * (1.2 + Math.sin(time * 0.8) * 0.1);
    
    return texture(ix * liquidScale + 0.5, iy * liquidScale + 0.5);
  },

  interactive: (uv: UV, mouse: Mouse) => {
    const ix = uv.x - 0.5;
    const iy = uv.y - 0.5;
    
    // 鼠标交互效果
    const mouseDistanceX = ix - (mouse.x - 0.5);
    const mouseDistanceY = iy - (mouse.y - 0.5);
    const mouseDistance = Math.sqrt(mouseDistanceX * mouseDistanceX + mouseDistanceY * mouseDistanceY);
    
    // 基础形状
    const distanceToEdge = roundedRectSDF(ix, iy, 0.3, 0.2, 0.6);
    
    // 鼠标影响
    const mouseInfluence = smoothStep(0.3, 0, mouseDistance) * 0.5;
    
    const displacement = smoothStep(0.8, 0, distanceToEdge - 0.15 - mouseInfluence);
    const scaled = smoothStep(0, 1, displacement) * (1 + mouseInfluence);
    
    return texture(ix * scaled + 0.5, iy * scaled + 0.5);
  },
};

export type { DelayedFilterProps, UV, Mouse, TextureResult, FragmentFunction };
export { smoothStep, length, roundedRectSDF, texture, generateId }; 