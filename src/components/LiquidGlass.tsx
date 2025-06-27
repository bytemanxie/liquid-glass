'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { motion, useMotionValue, useSpring, useVelocity, useAnimationFrame } from 'framer-motion';
import { 
  Shader, 
  type UV, 
  type Mouse, 
  type TextureResult, 
  type FragmentFunction, 
  type PhysicsConfig,
  smoothStep,
  roundedRectSDF,
  texture,
  defaultPhysics,
  generateId
} from './Shader';

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



// 默认液体变形算法
const defaultFragment: FragmentFunction = (uv) => {
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
      // 为相对和绝对定位设置不同的处理方式
      if (position === 'relative') {
        // relative定位：shader容器相对于包装容器定位
        shader.container.style.position = 'absolute';
        shader.container.style.left = '0';
        shader.container.style.top = '0';
        shader.container.style.width = '100%';
        shader.container.style.height = '100%';
      } else if (position === 'absolute') {
        // absolute定位：shader容器填满包装容器
        shader.container.style.position = 'absolute';
        shader.container.style.left = '0';
        shader.container.style.top = '0';
        shader.container.style.width = '100%';
        shader.container.style.height = '100%';
      }
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

  // 处理相对和绝对定位的不同行为
  if (position === 'relative' || position === 'absolute') {
    return (
      <div
        ref={containerRef}
        className={className}
        style={{
          position: position, // relative: 相对于正常位置; absolute: 相对于最近的定位祖先
          width: width,
          height: height,
          // absolute定位时，可能需要明确的left/top定位
          ...(position === 'absolute' && initialPosition ? {
            left: initialPosition.x,
            top: initialPosition.y
          } : {}),
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