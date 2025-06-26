import { useRef, useEffect, useCallback } from 'react';
import type { FragmentFunction, UV, Mouse } from '../components/LiquidGlass';

// 扩展的液体玻璃配置
interface LiquidGlassConfig {
  width?: number;
  height?: number;
  fragment?: FragmentFunction;
  draggable?: boolean;
  borderRadius?: number;
  position?: 'fixed' | 'absolute' | 'relative';
  initialPosition?: { x: number; y: number };
  autoCleanup?: boolean;
}

// 动画预设
export const animationPresets = {
  // 波浪效果
  wave: (uv: UV, mouse: Mouse, time: number = 0) => {
    const ix = uv.x - 0.5;
    const iy = uv.y - 0.5;
    
    // 添加时间基础的波浪动画
    const wave = Math.sin(time * 0.003 + ix * 10) * 0.02;
    
    const distanceToEdge = Math.sqrt(ix * ix + iy * iy) - 0.3;
    const displacement = Math.max(0, Math.min(1, (0.8 - distanceToEdge) / 0.8)) + wave;
    const scaled = displacement * 0.5;
    
    return { type: 't' as const, x: ix * scaled + 0.5, y: iy * scaled + 0.5 };
  },

  // 脉冲效果
  pulse: (uv: UV, mouse: Mouse, time: number = 0) => {
    const ix = uv.x - 0.5;
    const iy = uv.y - 0.5;
    
    // 脉冲动画
    const pulse = (Math.sin(time * 0.005) + 1) * 0.5;
    const distanceToCenter = Math.sqrt(ix * ix + iy * iy);
    const displacement = Math.max(0, (0.5 - distanceToCenter) / 0.5) * pulse * 0.1;
    
    return { 
      type: 't' as const, 
      x: ix * (1 + displacement) + 0.5, 
      y: iy * (1 + displacement) + 0.5 
    };
  },

  // 旋转效果
  rotate: (uv: UV, mouse: Mouse, time: number = 0) => {
    const ix = uv.x - 0.5;
    const iy = uv.y - 0.5;
    
    // 旋转动画
    const angle = time * 0.001;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    
    const rotatedX = ix * cos - iy * sin;
    const rotatedY = ix * sin + iy * cos;
    
    const distanceToEdge = Math.sqrt(rotatedX * rotatedX + rotatedY * rotatedY) - 0.3;
    const displacement = Math.max(0, Math.min(1, (0.8 - distanceToEdge) / 0.8));
    
    return { 
      type: 't' as const, 
      x: rotatedX * displacement + 0.5, 
      y: rotatedY * displacement + 0.5 
    };
  },

  // 鼠标引力效果
  magneticMouse: (uv: UV, mouse: Mouse) => {
    const ix = uv.x - 0.5;
    const iy = uv.y - 0.5;
    const mouseX = mouse.x - 0.5;
    const mouseY = mouse.y - 0.5;
    
    // 计算到鼠标的距离
    const dx = ix - mouseX;
    const dy = iy - mouseY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // 磁性吸引力
    const attraction = Math.max(0, (0.3 - distance) / 0.3) * 0.1;
    const attractionX = -dx * attraction;
    const attractionY = -dy * attraction;
    
    return { 
      type: 't' as const, 
      x: (ix + attractionX) + 0.5, 
      y: (iy + attractionY) + 0.5 
    };
  }
};

// 自定义 Hook
export function useLiquidGlass(config: LiquidGlassConfig = {}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const shaderRef = useRef<any>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const startTimeRef = useRef<number>(Date.now());

  // 创建带动画的 fragment 函数
  const createAnimatedFragment = useCallback((
    baseFragment: FragmentFunction, 
    animated: boolean = false
  ) => {
    if (!animated) return baseFragment;
    
    return (uv: UV, mouse: Mouse) => {
      const currentTime = Date.now() - startTimeRef.current;
      return baseFragment(uv, mouse);
    };
  }, []);

  // 启动动画循环
  const startAnimation = useCallback((updateCallback: () => void) => {
    const animate = () => {
      updateCallback();
      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);
  }, []);

  // 停止动画
  const stopAnimation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = undefined;
    }
  }, []);

  // 更新液体玻璃效果
  const updateShader = useCallback(() => {
    if (shaderRef.current && shaderRef.current.updateShader) {
      shaderRef.current.updateShader();
    }
  }, []);

  // 清理效果
  const cleanup = useCallback(() => {
    stopAnimation();
    if (shaderRef.current && shaderRef.current.destroy) {
      shaderRef.current.destroy();
      shaderRef.current = null;
    }
  }, [stopAnimation]);

  // 重新初始化
  const reinitialize = useCallback((newConfig: LiquidGlassConfig = {}) => {
    cleanup();
    // 这里需要重新创建 shader，具体实现依赖于 LiquidGlass 组件的接口
  }, [cleanup]);

  // 自动清理
  useEffect(() => {
    if (config.autoCleanup !== false) {
      return cleanup;
    }
  }, [cleanup, config.autoCleanup]);

  return {
    containerRef,
    startAnimation,
    stopAnimation,
    updateShader,
    cleanup,
    reinitialize,
    isAnimating: !!animationRef.current
  };
}

// 工具函数：创建自定义 fragment
export function createCustomFragment(
  effectFn: (uv: UV, mouse: Mouse, time?: number) => { x: number; y: number }
): FragmentFunction {
  return (uv: UV, mouse: Mouse) => {
    const result = effectFn(uv, mouse, Date.now());
    return { type: 't', x: result.x, y: result.y };
  };
}

// 预设配置组合
export const presetConfigs = {
  // 菜单卡片
  menuCard: {
    width: 250,
    height: 180,
    position: 'relative' as const,
    draggable: false,
    borderRadius: 20
  },

  // 悬浮按钮
  floatingButton: {
    width: 120,
    height: 50,
    position: 'fixed' as const,
    draggable: true,
    borderRadius: 25
  },

  // 大型面板
  panel: {
    width: 400,
    height: 300,
    position: 'relative' as const,
    draggable: false,
    borderRadius: 15
  },

  // 紧凑型
  compact: {
    width: 150,
    height: 100,
    position: 'relative' as const,
    draggable: false,
    borderRadius: 12
  }
};

// 导出类型
export type { LiquidGlassConfig }; 