This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# Liquid Glass Components

一个基于 React 和 TypeScript 的高性能液体玻璃效果组件库，提供美丽的玻璃形态变形效果。

## ✨ 特性

- 🌊 **实时液体变形效果** - 使用 WebGL 和 SVG 滤镜实现的高性能液体玻璃效果
- 🎨 **多种预设效果** - 内置多种液体效果预设（默认、强烈、交互式、微妙）
- 🖱️ **鼠标交互** - 智能鼠标交互检测，只在需要时重新渲染
- 📱 **响应式设计** - 支持不同尺寸和位置设置
- 🎯 **可拖拽** - 可选的拖拽功能
- ⚡ **性能优化** - 智能渲染和内存管理
- 🔧 **TypeScript 支持** - 完整的类型定义
- 🎪 **灵活配置** - 高度可定制的参数

## 📦 安装

```bash
# 克隆项目
git clone <project-url>
cd liquid-glass

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

## 🚀 快速开始

### 基本用法

```tsx
import LiquidGlass from '@/components/LiquidGlass';

function MyComponent() {
  return (
    <LiquidGlass width={300} height={200} position="relative">
      <div>你的内容</div>
    </LiquidGlass>
  );
}
```

### 使用预设效果

```tsx
import LiquidGlass, { presetFragments } from '@/components/LiquidGlass';

function InteractiveCard() {
  return (
    <LiquidGlass
      width={250}
      height={180}
      fragment={presetFragments.interactive}
      position="relative"
      draggable={false}
    >
      <div>鼠标悬停试试</div>
    </LiquidGlass>
  );
}
```

### 可拖拽的悬浮框

```tsx
function FloatingGlass() {
  return (
    <LiquidGlass
      width={200}
      height={150}
      position="fixed"
      initialPosition={{ x: 100, y: 100 }}
      fragment={presetFragments.strong}
    >
      <div>拖拽我!</div>
    </LiquidGlass>
  );
}
```

## 📋 API 文档

### LiquidGlass Props

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `width` | `number` | `300` | 玻璃框宽度 |
| `height` | `number` | `200` | 玻璃框高度 |
| `position` | `'fixed' \| 'absolute' \| 'relative'` | `'relative'` | 定位方式 |
| `className` | `string` | `''` | CSS 类名 |
| `style` | `React.CSSProperties` | `{}` | 行内样式 |
| `children` | `React.ReactNode` | - | 子元素内容 |
| `fragment` | `FragmentFunction` | `defaultFragment` | 液体效果算法 |
| `draggable` | `boolean` | `true` | 是否可拖拽 |
| `borderRadius` | `number` | `auto` | 圆角大小 |
| `initialPosition` | `{x: number, y: number}` | - | 初始位置（仅 fixed 定位） |

### 预设效果 (presetFragments)

```tsx
import { presetFragments } from '@/components/LiquidGlass';

// 可用预设：
presetFragments.default      // 标准液体效果
presetFragments.strong       // 强烈变形效果  
presetFragments.interactive  // 鼠标交互效果
presetFragments.subtle       // 微妙的效果
```

### 自定义 Fragment 函数

```tsx
import type { FragmentFunction, UV, Mouse } from '@/components/LiquidGlass';

const customFragment: FragmentFunction = (uv: UV, mouse: Mouse) => {
  const ix = uv.x - 0.5;
  const iy = uv.y - 0.5;
  
  // 你的自定义变形逻辑
  const distanceToCenter = Math.sqrt(ix * ix + iy * iy);
  const displacement = Math.max(0, (0.4 - distanceToCenter) / 0.4);
  
  return {
    type: 't',
    x: ix * displacement + 0.5,
    y: iy * displacement + 0.5
  };
};
```

## 🎨 使用 Hook

```tsx
import { useLiquidGlass, animationPresets } from '@/hooks/useLiquidGlass';

function AdvancedComponent() {
  const {
    containerRef,
    startAnimation,
    stopAnimation,
    updateShader,
    isAnimating
  } = useLiquidGlass({
    width: 300,
    height: 200,
    autoCleanup: true
  });

  return (
    <div ref={containerRef}>
      <button onClick={startAnimation}>开始动画</button>
      <button onClick={stopAnimation}>停止动画</button>
    </div>
  );
}
```

## 📝 高级用法

### 动画预设

```tsx
import { animationPresets, createCustomFragment } from '@/hooks/useLiquidGlass';

// 波浪动画
const waveFragment = createCustomFragment(animationPresets.wave);

// 脉冲动画  
const pulseFragment = createCustomFragment(animationPresets.pulse);

// 鼠标磁性效果
const magneticFragment = createCustomFragment(animationPresets.magneticMouse);
```

### 预设配置组合

```tsx
import { presetConfigs } from '@/hooks/useLiquidGlass';

// 菜单卡片配置
<LiquidGlass {...presetConfigs.menuCard}>
  <MenuContent />
</LiquidGlass>

// 悬浮按钮配置
<LiquidGlass {...presetConfigs.floatingButton}>
  <ButtonContent />
</LiquidGlass>
```

## 🎯 最佳实践

### 性能优化

1. **避免频繁重新创建 fragment 函数**
```tsx
// ❌ 不好的做法
function BadComponent() {
  return (
    <LiquidGlass
      fragment={(uv, mouse) => {
        // 每次渲染都会创建新函数
        return { type: 't', x: uv.x, y: uv.y };
      }}
    />
  );
}

// ✅ 好的做法
const stableFragment = (uv, mouse) => ({ type: 't', x: uv.x, y: uv.y });

function GoodComponent() {
  return <LiquidGlass fragment={stableFragment} />;
}
```

2. **使用预设效果**
```tsx
// ✅ 推荐使用预设，性能更好
<LiquidGlass fragment={presetFragments.interactive} />
```

3. **合理设置 draggable**
```tsx
// 如果不需要拖拽功能，关闭它以节省事件监听
<LiquidGlass draggable={false} />
```

### 布局建议

1. **相对定位用于卡片布局**
```tsx
<div className="grid grid-cols-3 gap-4">
  <LiquidGlass position="relative" width={250} height={180}>
    <Card1 />
  </LiquidGlass>
  <LiquidGlass position="relative" width={250} height={180}>
    <Card2 />
  </LiquidGlass>
</div>
```

2. **固定定位用于悬浮元素**
```tsx
<LiquidGlass
  position="fixed"
  initialPosition={{ x: 20, y: 20 }}
  draggable={true}
>
  <FloatingMenu />
</LiquidGlass>
```

## 🐛 常见问题

### Q: 为什么液体效果不显示？
A: 检查以下几点：
- 确保浏览器支持 SVG 滤镜
- 检查 CSS backdrop-filter 支持
- 确认组件大小设置正确

### Q: 性能问题怎么办？
A: 尝试以下优化：
- 使用预设 fragment 而不是自定义
- 减小玻璃框尺寸
- 关闭不必要的 draggable 功能
- 使用 position="relative" 而不是 "fixed"

### Q: 如何自定义液体效果？
A: 创建自定义 fragment 函数：
```tsx
const myCustomFragment = (uv, mouse) => {
  // 你的算法逻辑
  return { type: 't', x: newX, y: newY };
};
```

## 🤝 贡献

欢迎提交 Issues 和 Pull Requests！

## 📄 许可证

MIT License

---

**享受液体玻璃的魅力吧！** ✨
