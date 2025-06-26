'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { motion, useMotionValue, useSpring, useVelocity, useAnimationFrame } from 'framer-motion';

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

// 物理效果配置接口
interface PhysicsConfig {
  elasticity?: number;      // 弹性系数 (0-1)
  dampening?: number;       // 阻尼系数 (0-1) 
  rippleIntensity?: number; // 波纹强度 (0-1)
  viscosity?: number;       // 粘性 (0-1)
  surfaceTension?: number;  // 表面张力 (0-1)
}

interface LiquidGlassProps {
  width?: number;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  fragment?: FragmentFunction;
  draggable?: boolean;
  borderRadius?: number;
  position?: 'fixed' | 'absolute' | 'relative';
  initialPosition?: { x: number; y: number };
  // 物理效果相关
  enablePhysics?: boolean;      // 是否启用物理效果
  physics?: PhysicsConfig;      // 物理参数配置
  enableRipples?: boolean;      // 是否启用波纹效果
  bounceOnConstraints?: boolean; // 是否在边界反弹
}

// 工具函数
function smoothStep(a: number, b: number, t: number): number {
  t = Math.max(0, Math.min(1, (t - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

function length(x: number, y: number): number {
  return Math.sqrt(x * x + y * y);
}

function roundedRectSDF(x: number, y: number, width: number, height: number, radius: number): number {
  const qx = Math.abs(x) - width + radius;
  const qy = Math.abs(y) - height + radius;
  return Math.min(Math.max(qx, qy), 0) + length(Math.max(qx, 0), Math.max(qy, 0)) - radius;
}

function texture(x: number, y: number): TextureResult {
  return { type: 't', x, y };
}

function generateId(): string {
  return 'liquid-glass-' + Math.random().toString(36).substr(2, 9);
}

// 默认物理配置
const defaultPhysics: PhysicsConfig = {
  elasticity: 0.5,
  dampening: 0.7,
  rippleIntensity: 0.6,
  viscosity: 0.3,
  surfaceTension: 0.5
};

// 默认液体变形算法
const defaultFragment: FragmentFunction = (uv) => {
  const ix = uv.x - 0.5;
  const iy = uv.y - 0.5;
  const distanceToEdge = roundedRectSDF(ix, iy, 0.3, 0.2, 0.6);
  const displacement = smoothStep(0.8, 0, distanceToEdge - 0.15);
  const scaled = smoothStep(0, 1, displacement);
  return texture(ix * scaled + 0.5, iy * scaled + 0.5);
};

// 增强的Shader类，支持物理效果
class Shader {
  width: number;
  height: number;
  fragment: FragmentFunction;
  canvasDPI: number = 1;
  id: string;
  offset: number = 10;
  mouse: Mouse = { x: 0, y: 0 };
  mouseUsed: boolean = false;
  container!: HTMLDivElement;
  svg!: SVGSVGElement;
  canvas!: HTMLCanvasElement;
  context!: CanvasRenderingContext2D;
  feImage!: SVGFEImageElement;
  feDisplacementMap!: SVGFEDisplacementMapElement;
  
  // 物理效果相关属性
  enablePhysics: boolean;
  physics: PhysicsConfig;
  velocity: { x: number; y: number } = { x: 0, y: 0 };
  ripples: Array<{ x: number; y: number; intensity: number; age: number }> = [];

  constructor(options: {
    width: number;
    height: number;
    fragment: FragmentFunction;
    borderRadius?: number;
    draggable?: boolean;
    position?: string;
    initialPosition?: { x: number; y: number };
    enablePhysics?: boolean;
    physics?: PhysicsConfig;
  }) {
    this.width = options.width;
    this.height = options.height;
    this.fragment = options.fragment;
    this.id = generateId();
    this.enablePhysics = options.enablePhysics || false;
    this.physics = { ...defaultPhysics, ...options.physics };
    
    this.createElement(options);
    if (options.draggable !== false) {
      this.setupEventListeners(options.position || 'fixed');
    }
    this.updateShader();
  }

  createElement(options: {
    borderRadius?: number;
    position?: string;
    initialPosition?: { x: number; y: number };
  }) {
    // 创建容器
    this.container = document.createElement('div');
    const borderRadius = options.borderRadius || Math.min(this.width, this.height) * 0.5;
    const position = options.position || 'fixed';
    
    let positionStyles = '';
    if (position === 'fixed') {
      positionStyles = options.initialPosition 
        ? `left: ${options.initialPosition.x}px; top: ${options.initialPosition.y}px;`
        : 'top: 50%; left: 50%; transform: translate(-50%, -50%);';
    }

    this.container.style.cssText = `
      position: ${position};
      ${positionStyles}
      width: ${this.width}px;
      height: ${this.height}px;
      overflow: hidden;
      border-radius: ${borderRadius}px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.25), 0 -10px 25px inset rgba(0, 0, 0, 0.15);
      cursor: ${position === 'fixed' ? 'grab' : 'move'};
      backdrop-filter: url(#${this.id}_filter) blur(0.25px) contrast(1.2) brightness(1.05) saturate(1.1);
      z-index: 9999;
      pointer-events: auto;
      transition: ${this.enablePhysics ? 'none' : 'transform 0.1s ease-out'};
    `;

    // 创建 SVG 滤镜
    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    this.svg.setAttribute('width', '0');
    this.svg.setAttribute('height', '0');
    this.svg.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      pointer-events: none;
      z-index: 9998;
    `;

    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    filter.setAttribute('id', `${this.id}_filter`);
    filter.setAttribute('filterUnits', 'userSpaceOnUse');
    filter.setAttribute('colorInterpolationFilters', 'sRGB');
    filter.setAttribute('x', '0');
    filter.setAttribute('y', '0');
    filter.setAttribute('width', this.width.toString());
    filter.setAttribute('height', this.height.toString());

    this.feImage = document.createElementNS('http://www.w3.org/2000/svg', 'feImage');
    this.feImage.setAttribute('id', `${this.id}_map`);
    this.feImage.setAttribute('width', this.width.toString());
    this.feImage.setAttribute('height', this.height.toString());

    this.feDisplacementMap = document.createElementNS('http://www.w3.org/2000/svg', 'feDisplacementMap');
    this.feDisplacementMap.setAttribute('in', 'SourceGraphic');
    this.feDisplacementMap.setAttribute('in2', `${this.id}_map`);
    this.feDisplacementMap.setAttribute('xChannelSelector', 'R');
    this.feDisplacementMap.setAttribute('yChannelSelector', 'G');

    filter.appendChild(this.feImage);
    filter.appendChild(this.feDisplacementMap);
    defs.appendChild(filter);
    this.svg.appendChild(defs);

    // 创建 Canvas（隐藏）
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.width * this.canvasDPI;
    this.canvas.height = this.height * this.canvasDPI;
    this.canvas.style.display = 'none';

    this.context = this.canvas.getContext('2d')!;
  }

  // 添加波纹效果
  addRipple(x: number, y: number, intensity: number = 1) {
    if (!this.enablePhysics) return;
    this.ripples.push({ x, y, intensity: intensity * this.physics.rippleIntensity!, age: 0 });
  }

  // 更新物理效果
  updatePhysics(deltaTime: number) {
    if (!this.enablePhysics) return;

    // 更新速度衰减
    this.velocity.x *= (1 - this.physics.dampening! * deltaTime * 0.001);
    this.velocity.y *= (1 - this.physics.dampening! * deltaTime * 0.001);
    
    // 更新波纹
    this.ripples = this.ripples.filter(ripple => {
      ripple.age += deltaTime;
      return ripple.age < 1000; // 1秒后移除波纹
    });
  }

  constrainPosition(x: number, y: number): { x: number; y: number } {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    const minX = this.offset;
    const maxX = viewportWidth - this.width - this.offset;
    const minY = this.offset;
    const maxY = viewportHeight - this.height - this.offset;
    
    const constrainedX = Math.max(minX, Math.min(maxX, x));
    const constrainedY = Math.max(minY, Math.min(maxY, y));
    
    return { x: constrainedX, y: constrainedY };
  }

  setupEventListeners(position: string) {
    let isDragging = false;
    let startX: number, startY: number, initialX: number, initialY: number;

    this.container.addEventListener('mousedown', (e) => {
      isDragging = true;
      this.container.style.cursor = 'grabbing';
      startX = e.clientX;
      startY = e.clientY;
      
      // 根据position类型获取初始位置
      if (position === 'fixed') {
        const rect = this.container.getBoundingClientRect();
        initialX = rect.left;
        initialY = rect.top;
      } else {
        // 对于relative和absolute，使用当前的transform值或默认为0
        const computedStyle = window.getComputedStyle(this.container);
        const transform = computedStyle.transform;
        if (transform && transform !== 'none') {
          const matrix = new DOMMatrix(transform);
          initialX = matrix.m41; // translateX
          initialY = matrix.m42; // translateY
        } else {
          initialX = 0;
          initialY = 0;
        }
      }
      
      // 添加点击波纹效果
      if (this.enablePhysics) {
        const rect = this.container.getBoundingClientRect();
        const rippleX = (e.clientX - rect.left) / rect.width;
        const rippleY = (e.clientY - rect.top) / rect.height;
        this.addRipple(rippleX, rippleY, 1);
      }
      
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (isDragging) {
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        
        const newX = initialX + deltaX;
        const newY = initialY + deltaY;
        
        // 根据position类型应用不同的位置更新策略
        if (position === 'fixed') {
          const constrained = this.constrainPosition(newX, newY);
          this.container.style.left = constrained.x + 'px';
          this.container.style.top = constrained.y + 'px';
          this.container.style.transform = 'none';
        } else {
          // 对于relative和absolute，使用transform而不是left/top
          // 这样可以避免影响文档流和父容器的布局
          this.container.style.transform = `translate(${newX}px, ${newY}px)`;
        }
        
        // 更新物理速度
        if (this.enablePhysics) {
          this.velocity.x = deltaX * 0.1;
          this.velocity.y = deltaY * 0.1;
        }
      }

      // 更新鼠标位置用于shader效果
      const rect = this.container.getBoundingClientRect();
      this.mouse.x = (e.clientX - rect.left) / rect.width;
      this.mouse.y = (e.clientY - rect.top) / rect.height;
      
      if (this.mouseUsed) {
        this.updateShader();
      }
    });

    document.addEventListener('mouseup', () => {
      isDragging = false;
      this.container.style.cursor = position === 'fixed' ? 'grab' : 'move';
    });

    // 只为fixed定位添加resize监听器
    if (position === 'fixed') {
      window.addEventListener('resize', () => {
        const rect = this.container.getBoundingClientRect();
        const constrained = this.constrainPosition(rect.left, rect.top);
        
        if (rect.left !== constrained.x || rect.top !== constrained.y) {
          this.container.style.left = constrained.x + 'px';
          this.container.style.top = constrained.y + 'px';
          this.container.style.transform = 'none';
        }
      });
    }
  }

  updateShader() {
    const mouseProxy = new Proxy(this.mouse, {
      get: (target, prop) => {
        this.mouseUsed = true;
        return target[prop as keyof Mouse];
      }
    });

    this.mouseUsed = false;

    const w = this.width * this.canvasDPI;
    const h = this.height * this.canvasDPI;
    const data = new Uint8ClampedArray(w * h * 4);

    let maxScale = 0;
    const rawValues: number[] = [];

    for (let i = 0; i < data.length; i += 4) {
      const x = (i / 4) % w;
      const y = Math.floor(i / 4 / w);
      
      // 基础变形
      let pos = this.fragment(
        { x: x / w, y: y / h },
        mouseProxy
      );

      // 添加物理效果
      if (this.enablePhysics) {
        const centerX = w / 2;
        const centerY = h / 2;
        const distanceFromCenter = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
        
        // 添加速度形变效果
        const velocityMagnitude = Math.sqrt(this.velocity.x ** 2 + this.velocity.y ** 2);
        if (velocityMagnitude > 0.1) {
          const deformationFactor = Math.exp(-distanceFromCenter / (w * 0.3)) * velocityMagnitude * 0.001;
          pos.x += this.velocity.x * deformationFactor;
          pos.y += this.velocity.y * deformationFactor;
        }
        
        // 添加波纹效果
        this.ripples.forEach(ripple => {
          const rippleDistance = Math.sqrt((x - ripple.x * w) ** 2 + (y - ripple.y * h) ** 2);
          const rippleStrength = Math.exp(-rippleDistance / (w * 0.2)) * 
                                Math.sin(ripple.age * 0.01 - rippleDistance * 0.05) * 
                                ripple.intensity * 0.02;
          pos.x += rippleStrength;
          pos.y += rippleStrength;
        });
        
        // 添加粘性效果
        if (this.physics.viscosity! > 0.5) {
          const viscosityFactor = (this.physics.viscosity! - 0.5) * 0.02;
          pos.x += (Math.random() - 0.5) * viscosityFactor;
          pos.y += (Math.random() - 0.5) * viscosityFactor;
        }
      }

      const dx = pos.x * w - x;
      const dy = pos.y * h - y;
      maxScale = Math.max(maxScale, Math.abs(dx), Math.abs(dy));
      rawValues.push(dx, dy);
    }

    maxScale *= 0.5;

    let index = 0;
    for (let i = 0; i < data.length; i += 4) {
      const r = rawValues[index++] / maxScale + 0.5;
      const g = rawValues[index++] / maxScale + 0.5;
      data[i] = r * 255;
      data[i + 1] = g * 255;
      data[i + 2] = 0;
      data[i + 3] = 255;
    }

    this.context.putImageData(new ImageData(data, w, h), 0, 0);
    this.feImage.setAttributeNS('http://www.w3.org/1999/xlink', 'href', this.canvas.toDataURL());
    this.feDisplacementMap.setAttribute('scale', (maxScale / this.canvasDPI).toString());
  }

  appendTo(parent: HTMLElement) {
    parent.appendChild(this.svg);
    parent.appendChild(this.container);
  }

  destroy() {
    this.svg.remove();
    this.container.remove();
    this.canvas.remove();
  }
}

// React 组件
export default function LiquidGlass({
  width = 300,
  height = 200,
  className = '',
  style = {},
  children,
  fragment = defaultFragment,
  draggable = true,
  borderRadius,
  position = 'relative',
  initialPosition,
  enablePhysics = false,
  physics = defaultPhysics,
  enableRipples = true,
  bounceOnConstraints = false
}: LiquidGlassProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const shaderRef = useRef<Shader | null>(null);
  const lastUpdateTime = useRef(Date.now());
  const [isDragging, setIsDragging] = useState(false);

  // Motion values for physics (只在启用物理效果时使用)
  const x = useMotionValue(initialPosition?.x || 0);
  const y = useMotionValue(initialPosition?.y || 0);
  
  const mergedPhysics = { ...defaultPhysics, ...physics };
  
  // Spring configuration for elastic behavior
  const springConfig = {
    damping: 25 + mergedPhysics.dampening! * 75,
    stiffness: 200 + mergedPhysics.elasticity! * 300,
    mass: 1 + mergedPhysics.viscosity! * 2
  };
  
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);
  const velocityX = useVelocity(springX);
  const velocityY = useVelocity(springY);

  // Constraint boundaries (只在启用物理效果时使用)
  const constrainPosition = useCallback((newX: number, newY: number) => {
    if (!bounceOnConstraints || !enablePhysics) return { x: newX, y: newY };
    
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const offset = 10;
    
    const minX = offset;
    const maxX = viewportWidth - width - offset;
    const minY = offset;
    const maxY = viewportHeight - height - offset;
    
    let constrainedX = newX;
    let constrainedY = newY;
    
    // Bounce effect at boundaries
    if (newX < minX) {
      constrainedX = minX;
      if (shaderRef.current) {
        shaderRef.current.velocity.x *= -mergedPhysics.elasticity!;
      }
    } else if (newX > maxX) {
      constrainedX = maxX;
      if (shaderRef.current) {
        shaderRef.current.velocity.x *= -mergedPhysics.elasticity!;
      }
    }
    
    if (newY < minY) {
      constrainedY = minY;
      if (shaderRef.current) {
        shaderRef.current.velocity.y *= -mergedPhysics.elasticity!;
      }
    } else if (newY > maxY) {
      constrainedY = maxY;
      if (shaderRef.current) {
        shaderRef.current.velocity.y *= -mergedPhysics.elasticity!;
      }
    }
    
    return { x: constrainedX, y: constrainedY };
  }, [width, height, bounceOnConstraints, enablePhysics, mergedPhysics.elasticity]);

  const createShader = useCallback(() => {
    if (!containerRef.current) return;

    // 清理之前的 shader
    if (shaderRef.current) {
      shaderRef.current.destroy();
    }

    // 创建新的 shader
    const shader = new Shader({
      width,
      height,
      fragment,
      borderRadius,
      draggable,
      position,
      initialPosition,
      enablePhysics,
      physics: mergedPhysics
    });

    // 将 shader 添加到容器中
    if (position === 'relative' || position === 'absolute') {
      shader.container.style.position = position;
      shader.container.style.left = '0';
      shader.container.style.top = '0';
      shader.container.style.transform = 'none';
      containerRef.current.appendChild(shader.svg);
      containerRef.current.appendChild(shader.container);
    } else {
      shader.appendTo(document.body);
    }

    shaderRef.current = shader;
  }, [width, height, fragment, borderRadius, draggable, position, initialPosition, enablePhysics, mergedPhysics]);

  // Physics animation frame (只在启用物理效果时运行)
  useAnimationFrame((time) => {
    if (!shaderRef.current || !enablePhysics) return;
    
    const deltaTime = time - lastUpdateTime.current;
    lastUpdateTime.current = time;
    
    // Update physics
    const currentVelX = velocityX.get();
    const currentVelY = velocityY.get();
    
    shaderRef.current.velocity.x = currentVelX * 0.001;
    shaderRef.current.velocity.y = currentVelY * 0.001;
    
    shaderRef.current.updatePhysics(deltaTime);
    shaderRef.current.updateShader();
  });

  // Mouse event handlers for physics (只在启用物理效果时使用)
  const handleMouseDown = useCallback((event: any) => {
    if (!draggable || position !== 'fixed' || !enablePhysics) return;
    setIsDragging(true);
    
    // Add ripple effect at interaction point
    if (enableRipples && shaderRef.current) {
      const rect = shaderRef.current.container.getBoundingClientRect();
      const rippleX = (event.clientX - rect.left) / rect.width;
      const rippleY = (event.clientY - rect.top) / rect.height;
      shaderRef.current.addRipple(rippleX, rippleY, 1);
    }
  }, [draggable, position, enablePhysics, enableRipples]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Update position with constraints (只在启用物理效果时使用)
  useEffect(() => {
    if (!enablePhysics || position !== 'fixed') return;

    const updatePosition = () => {
      const currentX = springX.get();
      const currentY = springY.get();
      const constrained = constrainPosition(currentX, currentY);
      
      if (shaderRef.current) {
        shaderRef.current.container.style.transform = 
          `translate3d(${constrained.x}px, ${constrained.y}px, 0)`;
      }
    };

    const unsubscribeX = springX.on('change', updatePosition);
    const unsubscribeY = springY.on('change', updatePosition);

    return () => {
      unsubscribeX();
      unsubscribeY();
    };
  }, [springX, springY, constrainPosition, enablePhysics, position]);

  useEffect(() => {
    createShader();

    return () => {
      if (shaderRef.current) {
        shaderRef.current.destroy();
        shaderRef.current = null;
      }
    };
  }, [createShader]);

  // 如果启用物理效果且为固定定位，使用motion wrapper
  if (enablePhysics && position === 'fixed') {
    return (
      <motion.div
        ref={containerRef}
        drag={draggable}
        dragElastic={mergedPhysics.elasticity}
        dragMomentum={mergedPhysics.viscosity! < 0.5}
        dragTransition={{
          bounceStiffness: 200 + mergedPhysics.surfaceTension! * 400,
          bounceDamping: 20 + mergedPhysics.dampening! * 30
        }}
        style={{
          position: 'fixed',
          left: initialPosition?.x || 100,
          top: initialPosition?.y || 100,
          width: width,
          height: height,
          x: springX,
          y: springY,
          zIndex: 10000,
          cursor: draggable ? (isDragging ? 'grabbing' : 'grab') : 'default'
        }}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        whileHover={draggable ? { scale: 1.02 } : undefined}
        whileTap={draggable ? { scale: 0.98 } : undefined}
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
      </motion.div>
    );
  }

  // 如果是相对或绝对定位，返回包装容器
  if (position === 'relative' || position === 'absolute') {
    return (
      <div
        ref={containerRef}
        className={className}
        style={{
          position: 'relative',
          width: width,
          height: height,
          ...style
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

  // 如果是固定定位但未启用物理效果，返回空的 div
  return <div ref={containerRef} style={{ display: 'none' }} />;
}

// 导出预设的 fragment 函数
export const presetFragments = {
  // 默认液体效果
  default: defaultFragment,
  
  // 更强烈的液体效果
  strong: (uv: UV) => {
    const ix = uv.x - 0.5;
    const iy = uv.y - 0.5;
    const distanceToEdge = roundedRectSDF(ix, iy, 0.25, 0.15, 0.4);
    const displacement = smoothStep(0.6, 0, distanceToEdge - 0.1);
    const scaled = smoothStep(0, 1, displacement);
    return texture(ix * scaled + 0.5, iy * scaled + 0.5);
  },
  
  // 鼠标交互效果
  interactive: (uv: UV, mouse: Mouse) => {
    const ix = uv.x - 0.5;
    const iy = uv.y - 0.5;
    const mouseX = mouse.x - 0.5;
    const mouseY = mouse.y - 0.5;
    
    const distanceToMouse = Math.sqrt(
      (ix - mouseX) * (ix - mouseX) + 
      (iy - mouseY) * (iy - mouseY)
    );
    
    const mouseEffect = smoothStep(0.3, 0, distanceToMouse) * 0.1;
    const distanceToEdge = roundedRectSDF(ix, iy, 0.3, 0.2, 0.6);
    const displacement = smoothStep(0.8, 0, distanceToEdge - 0.15) + mouseEffect;
    const scaled = smoothStep(0, 1, displacement);
    
    return texture(ix * scaled + 0.5, iy * scaled + 0.5);
  },
  
  // 微妙的效果
  subtle: (uv: UV) => {
    const ix = uv.x - 0.5;
    const iy = uv.y - 0.5;
    const distanceToEdge = roundedRectSDF(ix, iy, 0.4, 0.3, 0.8);
    const displacement = smoothStep(0.9, 0, distanceToEdge - 0.05);
    const scaled = smoothStep(0, 1, displacement * 0.5);
    return texture(ix * scaled + 0.5, iy * scaled + 0.5);
  }
};

// 导出预设的物理配置
export const physicsPresets = {
  // 水一样的液体
  water: {
    elasticity: 0.3,
    dampening: 0.8,
    rippleIntensity: 0.7,
    viscosity: 0.1,
    surfaceTension: 0.5
  },
  
  // 果冻般的弹性
  jelly: {
    elasticity: 0.9,
    dampening: 0.6,
    rippleIntensity: 0.8,
    viscosity: 0.4,
    surfaceTension: 0.9
  },
  
  // 油性液体
  oil: {
    elasticity: 0.1,
    dampening: 0.95,
    rippleIntensity: 0.3,
    viscosity: 0.8,
    surfaceTension: 0.2
  },
  
  // 弹力球
  bouncy: {
    elasticity: 0.95,
    dampening: 0.3,
    rippleIntensity: 1.0,
    viscosity: 0.1,
    surfaceTension: 0.8
  },
  
  // 粘稠液体
  viscous: {
    elasticity: 0.2,
    dampening: 0.9,
    rippleIntensity: 0.4,
    viscosity: 0.9,
    surfaceTension: 0.6
  }
};

// 导出类型
export type { FragmentFunction, UV, Mouse, LiquidGlassProps, PhysicsConfig }; 