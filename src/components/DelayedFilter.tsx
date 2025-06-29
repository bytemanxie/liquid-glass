'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';

// 类型定义
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

// 工具函数
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

// 移动端检测
function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  
  // 多重检测确保准确性
  const userAgent = navigator.userAgent.toLowerCase();
  const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isSmallScreen = window.innerWidth <= 768;
  
  // iOS Safari 特殊检测
  const isIOS = /ipad|iphone|ipod/.test(userAgent);
  const isIOSSafari = isIOS && /safari/.test(userAgent) && !/chrome|crios|fxios/.test(userAgent);
  
  return isMobileUA || isIOSSafari || (isTouchDevice && isSmallScreen);
}

// 检测backdrop-filter支持
function supportsBackdropFilter(): boolean {
  if (typeof window === 'undefined') return false;
  
  const testElement = document.createElement('div');
  const style = testElement.style as any;
  style.backdropFilter = 'blur(1px)';
  style.webkitBackdropFilter = 'blur(1px)';
  
  return style.backdropFilter !== '' || style.webkitBackdropFilter !== '';
}

// 检测SVG滤镜支持
function supportsSVGFilters(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    // 更准确的SVG滤镜检测
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    const feDisplacementMap = document.createElementNS('http://www.w3.org/2000/svg', 'feDisplacementMap');
    
    filter.appendChild(feDisplacementMap);
    svg.appendChild(filter);
    
    // 检测Canvas和toDataURL支持
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    return !!(ctx && canvas.toDataURL && typeof canvas.toDataURL === 'function');
  } catch {
    return false;
  }
}

interface DelayedFilterProps {
  width: number;
  height: number;
  fragment?: FragmentFunction;
  borderRadius?: number;
  scale?: number;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  delayStrength?: number; // 延迟强度 0-1，越小延迟越明显
  draggable?: boolean;
}

// 默认滤镜效果
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
  borderRadius = 150,
  scale = 1,
  className = '',
  style = {},
  children,
  delayStrength = 0.2,
  draggable = true,
}: DelayedFilterProps) {
  // 移动端检测状态
  const [isMobile, setIsMobile] = useState(false);
  const [useFallback, setUseFallback] = useState(false);

  // 增强液体系统状态
  const [targetMouse, setTargetMouse] = useState({ x: 0.5, y: 0.5 });
  const [internalMouse, setInternalMouse] = useState({ x: 0.5, y: 0.5 });
  const [isDragging, setIsDragging] = useState(false);
  
  // 高级液体物理状态
  const [velocity, setVelocity] = useState({ x: 0, y: 0 });
  const [acceleration, setAcceleration] = useState({ x: 0, y: 0 });
  const [liquidTrail, setLiquidTrail] = useState<Array<{ x: number; y: number; life: number; intensity: number }>>([]);
  const [elasticForce, setElasticForce] = useState({ x: 0, y: 0 });
  const [surfaceWaves, setSurfaceWaves] = useState<Array<{ x: number; y: number; amplitude: number; frequency: number; life: number }>>([]);
  
  // 物理参数
  const lastMouseRef = useRef({ x: 0.5, y: 0.5 });
  const lastVelocityRef = useRef({ x: 0, y: 0 });
  const lastTimeRef = useRef(Date.now());
  const restPositionRef = useRef({ x: 0.5, y: 0.5 });
  
  // Shader相关refs
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const feImageRef = useRef<SVGFEImageElement>(null);
  const feDisplacementMapRef = useRef<SVGFEDisplacementMapElement>(null);
  
  // 动画控制
  const animationRef = useRef<number | null>(null);
  
  const [filterId] = useState(() => generateId());
  const canvasDPI = 1;

  // 初始化移动端检测
  useEffect(() => {
    const mobile = isMobileDevice();
    const svgSupport = supportsSVGFilters();
    const backdropSupport = supportsBackdropFilter();
    
    setIsMobile(mobile);
    
    // 更严格的降级条件：移动端且不完全支持复杂滤镜
    const shouldUseFallback = mobile && (!svgSupport || !backdropSupport);
    setUseFallback(shouldUseFallback);
  }, []);

  // 生成移动端CSS模拟效果
  const generateMobileFallback = useCallback(() => {
    if (!useFallback) return {};
    
    const mx = internalMouse.x;
    const my = internalMouse.y;
    const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
    
    // 生成更明显的动态边缘扭曲
    const generateEnhancedClipPath = () => {
      const baseDistortion = isDragging ? 0.25 : 0.15; // 增大扭曲程度
      const speedBoost = speed * 0.3; // 速度影响
      const totalDistortion = baseDistortion + speedBoost;
      
      const points = [];
      const numPoints = 20; // 增加控制点数量让边缘更平滑
      
      for (let i = 0; i < numPoints; i++) {
        const angle = (i / numPoints) * Math.PI * 2;
        const baseRadius = 46; // 基础半径
        
        // 基础椭圆坐标
        const baseX = 50 + Math.cos(angle) * baseRadius;
        const baseY = 50 + Math.sin(angle) * (baseRadius * 0.9); // 稍微扁一点
        
        // 鼠标位置影响
        const distanceToMouse = Math.sqrt(
          Math.pow((baseX - mx * 100) / 100, 2) + 
          Math.pow((baseY - my * 100) / 100, 2)
        );
        
        // 扭曲计算
        const mouseFactor = Math.exp(-distanceToMouse * 2.5) * totalDistortion;
        
        // 时间动画
        const time = Date.now() * 0.003;
        const waveEffect = Math.sin(time + angle * 4) * 0.03;
        const pulseEffect = Math.cos(time * 0.7 + angle * 2) * 0.02;
        
        // 速度方向影响
        const velocityEffect = (velocity.x * Math.cos(angle) + velocity.y * Math.sin(angle)) * 0.1;
        
        // 最终坐标计算
        const distortionX = (mx * 100 - baseX) * mouseFactor;
        const distortionY = (my * 100 - baseY) * mouseFactor;
        
        const finalX = baseX + distortionX + waveEffect * 100 + velocityEffect * 50;
        const finalY = baseY + distortionY + pulseEffect * 100;
        
        // 确保在边界内
        const clampedX = Math.max(5, Math.min(95, finalX));
        const clampedY = Math.max(5, Math.min(95, finalY));
        
        points.push(`${clampedX}% ${clampedY}%`);
      }
      
      return `polygon(${points.join(', ')})`;
    };
    
    // 增强背景效果
    const gradientIntensity = isDragging ? 0.35 : 0.2;
    const gradientSize = 35 + speed * 25;
    
    return {
      clipPath: generateEnhancedClipPath(),
      background: `
        radial-gradient(
          ellipse ${gradientSize}% ${gradientSize * 0.8}% at ${mx * 100}% ${my * 100}%, 
          rgba(255, 255, 255, ${gradientIntensity}) 0%, 
          rgba(255, 255, 255, ${gradientIntensity * 0.7}) 25%, 
          rgba(255, 255, 255, ${gradientIntensity * 0.4}) 50%, 
          transparent 75%
        ),
        conic-gradient(
          from ${velocity.x * 120}deg at ${mx * 100}% ${my * 100}%,
          transparent 0deg,
          rgba(255, 255, 255, 0.08) 60deg,
          transparent 120deg,
          rgba(255, 255, 255, 0.05) 240deg,
          transparent 360deg
        )
      `,
      backdropFilter: `blur(${8 + speed * 3}px) saturate(${1.3 + speed * 0.2}) contrast(${1.15 + speed * 0.1})`,
      WebkitBackdropFilter: `blur(${8 + speed * 3}px) saturate(${1.3 + speed * 0.2}) contrast(${1.15 + speed * 0.1})`,
      transform: `
        scale(${scale}) 
        scale(${1.01 + speed * 0.03}) 
        rotate(${velocity.x * 8}deg)
        ${isDragging ? 'scale(1.015)' : ''}
      `,
      border: `1.5px solid rgba(255, 255, 255, ${0.4 + speed * 0.1})`,
      boxShadow: `
        0 ${12 + speed * 6}px ${40 + speed * 20}px rgba(0, 0, 0, ${0.2 + speed * 0.05}),
        inset 0 2px 0 rgba(255, 255, 255, ${0.4 + speed * 0.1}),
        inset 0 -1px 0 rgba(0, 0, 0, 0.1),
        0 0 ${30 + speed * 15}px rgba(255, 255, 255, ${0.15 + speed * 0.05})
      `,
      transition: isDragging ? 'all 0.05s ease-out' : 'all 0.2s ease-out',
    };
  }, [useFallback, internalMouse, velocity, isDragging, scale]);

  // 高级液体物理更新循环
  const updateAdvancedLiquidSystem = useCallback(() => {
    const now = Date.now();
    const deltaTime = Math.min(now - lastTimeRef.current, 16) / 1000; // 限制为60fps
    lastTimeRef.current = now;
    
    // 1. 计算加速度（基于鼠标位置变化）
    const mouseDx = targetMouse.x - lastMouseRef.current.x;
    const mouseDy = targetMouse.y - lastMouseRef.current.y;
    
    setAcceleration(prev => ({
      x: (mouseDx / deltaTime) * 0.1,
      y: (mouseDy / deltaTime) * 0.1,
    }));
    
    // 2. 更新速度（加入重力和阻力）
    setVelocity(prev => {
      const gravity = isDragging ? 0 : 0.3; // 停止拖拽时有重力
      const damping = 0.85; // 阻力系数
      
      let newVx = (prev.x + acceleration.x * deltaTime) * damping;
      let newVy = (prev.y + acceleration.y * deltaTime + gravity * deltaTime) * damping;
      
      // 弹性力（回弹到静止位置）
      if (!isDragging) {
        const restoreFactor = 0.02;
        const elasticX = (restPositionRef.current.x - internalMouse.x) * restoreFactor;
        const elasticY = (restPositionRef.current.y - internalMouse.y) * restoreFactor;
        
        newVx += elasticX;
        newVy += elasticY;
        
        setElasticForce({ x: elasticX, y: elasticY });
      }
      
      return { x: newVx, y: newVy };
    });
    
    lastMouseRef.current = targetMouse;
    lastVelocityRef.current = velocity;
    
    // 3. 更新液体内部位置（粘性和惯性）
    setInternalMouse(prev => {
      const dx = targetMouse.x - prev.x;
      const dy = targetMouse.y - prev.y;
      
      // 动态阻力（速度越快阻力越大，模拟粘性）
      const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
      const viscosity = Math.max(0.01, delayStrength * (1 - speed * 0.3));
      
      return {
        x: prev.x + dx * viscosity + velocity.x * deltaTime * 0.1,
        y: prev.y + dy * viscosity + velocity.y * deltaTime * 0.1,
      };
    });
    
    // 4. 更新液体拖尾系统
    setLiquidTrail(prev => {
      let newTrail = [...prev];
      
      // 添加新的拖尾点
      const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
      if (speed > 0.1 && isDragging) {
        // 根据速度添加多个拖尾点
        const trailCount = Math.min(Math.floor(speed * 3), 5);
        for (let i = 0; i < trailCount; i++) {
          const offset = (i + 1) * 0.05;
          newTrail.push({
            x: internalMouse.x - velocity.x * offset,
            y: internalMouse.y - velocity.y * offset,
            life: 1.0 - i * 0.2,
            intensity: speed * (1 - i * 0.3)
          });
        }
        
        // 限制拖尾点数量
        if (newTrail.length > 20) {
          newTrail = newTrail.slice(-20);
        }
      }
      
      // 更新拖尾点生命周期
      return newTrail
        .map(point => ({
          ...point,
          life: point.life - deltaTime * 1.5
        }))
        .filter(point => point.life > 0);
    });
    
    // 5. 更新表面波纹系统
    setSurfaceWaves(prev => {
      let newWaves = [...prev];
      
      // 在加速变化时生成表面波纹
      const accelChange = Math.abs(acceleration.x - lastVelocityRef.current.x) + 
                         Math.abs(acceleration.y - lastVelocityRef.current.y);
      
      if (accelChange > 0.5 && isDragging) {
        newWaves.push({
          x: internalMouse.x,
          y: internalMouse.y,
          amplitude: Math.min(accelChange * 0.1, 0.3),
          frequency: 8 + Math.random() * 4,
          life: 1.0
        });
        
        if (newWaves.length > 10) {
          newWaves = newWaves.slice(-10);
        }
      }
      
      // 更新波纹
      return newWaves
        .map(wave => ({
          ...wave,
          life: wave.life - deltaTime * 2,
          amplitude: wave.amplitude * 0.98 // 波纹衰减
        }))
        .filter(wave => wave.life > 0);
    });
    
    // 继续动画循环
    const isMoving = Math.abs(targetMouse.x - internalMouse.x) > 0.001 || 
                    Math.abs(targetMouse.y - internalMouse.y) > 0.001 ||
                    Math.abs(velocity.x) > 0.001 || 
                    Math.abs(velocity.y) > 0.001 ||
                    liquidTrail.length > 0 ||
                    surfaceWaves.length > 0;
                    
    if (isDragging || isMoving) {
      animationRef.current = requestAnimationFrame(updateAdvancedLiquidSystem);
    }
  }, [targetMouse, internalMouse, velocity, acceleration, liquidTrail, surfaceWaves, elasticForce, delayStrength, isDragging]);

  // 启动/停止高级液体系统
  useEffect(() => {
    if (isDragging) {
      if (!animationRef.current) {
        lastTimeRef.current = Date.now();
        restPositionRef.current = internalMouse; // 记录静止位置
        animationRef.current = requestAnimationFrame(updateAdvancedLiquidSystem);
      }
    } else {
      // 拖拽结束时不立即停止，让液体自然沉降
      if (!animationRef.current) {
        animationRef.current = requestAnimationFrame(updateAdvancedLiquidSystem);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [isDragging, updateAdvancedLiquidSystem]);

  // 创建超级液体fragment
  const hyperLiquidFragment = useCallback((uv: UV, mouse: Mouse) => {
    const ix = uv.x - 0.5;
    const iy = uv.y - 0.5;
    
    // 基础液体形状 - 动态调整
    const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
    const baseSize = 0.25 + speed * 0.1; // 速度越快液体越大
    let distanceToEdge = roundedRectSDF(ix, iy, baseSize, baseSize * 0.8, 0.8);
    
    // 1. 速度拉伸效果（非线性）
    const stretchIntensity = Math.min(speed * 3, 2.0);
    const stretchX = 1 + Math.abs(velocity.x) * stretchIntensity * 0.8;
    const stretchY = 1 + Math.abs(velocity.y) * stretchIntensity * 0.6;
    
    // 2. 方向性变形（椭圆化）
    const angle = Math.atan2(velocity.y, velocity.x);
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);
    
    // 旋转坐标系
    const rotatedX = ix * cosA + iy * sinA;
    const rotatedY = -ix * sinA + iy * cosA;
    
    // 应用拉伸
    const stretchedX = rotatedX / stretchX;
    const stretchedY = rotatedY / stretchY;
    
    // 旋转回来
    const finalX = stretchedX * cosA - stretchedY * sinA;
    const finalY = stretchedX * sinA + stretchedY * cosA;
    
    distanceToEdge = roundedRectSDF(finalX, finalY, baseSize, baseSize * 0.8, 0.8);
    
    // 3. 拖尾点影响（粘性连接）
    for (const trail of liquidTrail) {
      const trailDx = ix - (trail.x - 0.5);
      const trailDy = iy - (trail.y - 0.5);
      const trailDistance = Math.sqrt(trailDx * trailDx + trailDy * trailDy);
      const trailInfluence = smoothStep(0.2, 0, trailDistance) * trail.life * trail.intensity * 0.4;
      distanceToEdge -= trailInfluence;
      
      // 添加连接效果
      if (trailDistance < 0.3 && trail.intensity > 0.5) {
        const connection = smoothStep(0.3, 0.1, trailDistance) * trail.life * 0.2;
        distanceToEdge -= connection;
      }
    }
    
    // 4. 表面波纹效果
    let waveEffect = 0;
    for (const wave of surfaceWaves) {
      const waveDx = ix - (wave.x - 0.5);
      const waveDy = iy - (wave.y - 0.5);
      const waveDistance = Math.sqrt(waveDx * waveDx + waveDy * waveDy);
      const waveInfluence = Math.sin(waveDistance * wave.frequency) * 
                           wave.amplitude * wave.life * 
                           smoothStep(0.4, 0, waveDistance);
      waveEffect += waveInfluence;
    }
    distanceToEdge += waveEffect * 0.1;
    
    // 5. 弹性变形（回弹效果）
    const elasticEffect = (elasticForce.x * ix + elasticForce.y * iy) * 0.05;
    distanceToEdge += elasticEffect;
    
    // 6. 主要变形计算
    const displacement = smoothStep(0.9, 0, distanceToEdge - 0.1);
    let liquidScale = smoothStep(0, 1, displacement);
    
    // 7. 动态表面张力
    const time = Date.now() * 0.0008;
    const primaryTension = Math.sin(time * 2 + ix * 10 + velocity.x * 5) * 0.015;
    const secondaryTension = Math.cos(time * 1.3 + iy * 8 + velocity.y * 3) * 0.01;
    const tensionEffect = (primaryTension + secondaryTension) * (1 + speed * 0.5);
    
    liquidScale *= (1 + tensionEffect + stretchIntensity * 0.05);
    
    // 8. 高速飞溅效果
    if (speed > 1.5) {
      const splashNoise = Math.sin(ix * 20 + time * 5) * Math.cos(iy * 15 + time * 7) * 0.02;
      liquidScale *= (1 + splashNoise);
    }
    
    // 9. 最终位置计算（加入轨迹预测）
    const predictiveX = ix + velocity.x * 0.05 * stretchIntensity;
    const predictiveY = iy + velocity.y * 0.05 * stretchIntensity;
    
    return texture(
      predictiveX * liquidScale + 0.5, 
      predictiveY * liquidScale + 0.5
    );
  }, [velocity, acceleration, liquidTrail, surfaceWaves, elasticForce]);

  // 更新滤镜效果
  const updateFilter = useCallback(() => {
    if (useFallback) return; // 移动端降级模式不使用SVG滤镜
    
    const canvas = canvasRef.current;
    const feImage = feImageRef.current;
    const feDisplacementMap = feDisplacementMapRef.current;
    
    if (!canvas || !feImage || !feDisplacementMap) return;

    const mouseProxy = new Proxy(internalMouse, {
      get: (target, prop) => target[prop as keyof Mouse]
    });

    const context = canvas.getContext('2d')!;
    const w = width * canvasDPI;
    const h = height * canvasDPI;
    const data = new Uint8ClampedArray(w * h * 4);

    let maxScale = 0;
    const rawValues: number[] = [];

    // 使用超级液体fragment
    const currentFragment = isDragging ? hyperLiquidFragment : fragment;

    // 生成置换图
    for (let i = 0; i < data.length; i += 4) {
      const x = (i / 4) % w;
      const y = Math.floor(i / 4 / w);
      const pos = currentFragment({ x: x / w, y: y / h }, mouseProxy);
      const dx = pos.x * w - x;
      const dy = pos.y * h - y;
      maxScale = Math.max(maxScale, Math.abs(dx), Math.abs(dy));
      rawValues.push(dx, dy);
    }

    maxScale *= 0.6; // 增强效果强度

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
  }, [width, height, fragment, internalMouse, canvasDPI, isDragging, hyperLiquidFragment, useFallback]);

  // 处理鼠标移动
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current || !draggable) return;

    const rect = containerRef.current.getBoundingClientRect();
    const targetMouseX = (e.clientX - rect.left) / rect.width;
    const targetMouseY = (e.clientY - rect.top) / rect.height;

    setTargetMouse({ x: targetMouseX, y: targetMouseY });
    
    if (!isDragging) {
      setIsDragging(true);
      lastMouseRef.current = { x: targetMouseX, y: targetMouseY };
    }
  }, [draggable, isDragging]);

  // 处理触摸事件（移动端优化）
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!containerRef.current || !draggable || e.touches.length !== 1) return;
    
    e.preventDefault(); // 防止滚动

    const rect = containerRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const targetMouseX = (touch.clientX - rect.left) / rect.width;
    const targetMouseY = (touch.clientY - rect.top) / rect.height;

    setTargetMouse({ x: targetMouseX, y: targetMouseY });
    
    if (!isDragging) {
      setIsDragging(true);
      lastMouseRef.current = { x: targetMouseX, y: targetMouseY };
    }
  }, [draggable, isDragging]);

  // 鼠标进入
  const handleMouseEnter = useCallback(() => {
    setIsDragging(true);
  }, []);

  // 鼠标离开
  const handleMouseLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  // 更新滤镜效果
  useEffect(() => {
    updateFilter();
  }, [updateFilter]);

  // 移动端实时动画更新
  useEffect(() => {
    if (useFallback) {
      let animationId: number;
      
      const updateMobileAnimation = () => {
        if (isDragging || Math.abs(velocity.x) > 0.001 || Math.abs(velocity.y) > 0.001) {
          // 强制重新渲染以更新clip-path
          setInternalMouse(prev => ({ ...prev }));
          animationId = requestAnimationFrame(updateMobileAnimation);
        }
      };
      
      if (isDragging) {
        animationId = requestAnimationFrame(updateMobileAnimation);
      }
      
      return () => {
        if (animationId) {
          cancelAnimationFrame(animationId);
        }
      };
    }
  }, [useFallback, isDragging, velocity.x, velocity.y]);

  // 获取移动端降级样式
  const mobileStyles = generateMobileFallback();

  return (
    <>
      {/* SVG滤镜定义（仅桌面端） */}
      {!useFallback && (
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
      )}

      {/* 隐藏的canvas用于生成置换图（仅桌面端） */}
      {!useFallback && (
        <canvas
          ref={canvasRef}
          width={width * canvasDPI}
          height={height * canvasDPI}
          style={{ display: 'none' }}
        />
      )}

      {/* 滤镜容器 */}
      <div
        ref={containerRef}
        className={className}
        style={{
          position: 'relative',
          width: width,
          height: height,
          borderRadius: borderRadius,
          backdropFilter: useFallback ? mobileStyles.backdropFilter : `url(#${filterId})`,
          WebkitBackdropFilter: useFallback ? mobileStyles.WebkitBackdropFilter : `url(#${filterId})`,
          cursor: draggable ? 'grab' : 'default',
          pointerEvents: 'auto',
          zIndex: 9999,
          overflow: 'hidden',
          transform: useFallback ? mobileStyles.transform : `scale(${scale})`,
          transformOrigin: 'center',
          touchAction: 'none',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          WebkitTouchCallout: 'none',
          // 应用移动端样式
          ...(useFallback ? mobileStyles : {}),
          // 用户自定义样式
          ...style,
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchMove={handleTouchMove}
      >
        {children || null}
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
export { smoothStep, length, roundedRectSDF, texture, generateId, isMobileDevice, supportsSVGFilters, supportsBackdropFilter }; 