'use client';

import React from 'react';
import Link from 'next/link';
import LiquidGlass, { presetFragments } from '@/components/LiquidGlass';

const DashboardPage: React.FC = () => {
  return (
    <div
      className=' bg-slate-950 relative overflow-hidden'
      style={{
        background: `linear-gradient(135deg, #1e293b 0%, #0f172a 100%)`,
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {/* Background elements */}
      <div className='absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/10 to-emerald-900/20'></div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2MCA2MCI+PHBhdGggZD0iTTMwIDBsMjUuOTggMTV2MzBMMzAgNjAgNC4wMiA0NVYxNXoiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAyKSIgc3Ryb2tlLXdpZHRoPSIwLjUiLz48L3N2Zz4=')] opacity-40"></div>

      {/* 减少到只有一个可拖拽的演示组件 */}
      <LiquidGlass
        width={200}
        height={120}
        fragment={presetFragments.interactive}
        draggable={true}
        position={{ x: 150, y: 100 }}
        style={{ opacity: 0.9 }}
      >
        🧪 拖拽我！
      </LiquidGlass>

      {/* Header */}
      <header className='relative z-10 pt-8 pb-6'>
        <div className='max-w-6xl mx-auto px-6'>
          <h1 className='text-5xl font-bold text-center text-white mb-4'>
            液态玻璃组件
          </h1>
          <p className='text-xl text-center text-slate-300 max-w-2xl mx-auto'>
            探索流动变形的玻璃效果，体验前沿的 WebGL 技术
          </p>
          <p className='text-sm text-center text-slate-400 mt-2'>
            💡 提示：拖拽上方的玻璃框体验交互效果
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className='relative z-10 max-w-6xl mx-auto px-6 pb-12'>
        {/* Feature Grid - 移除内嵌的LiquidGlass组件，减少性能开销 */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16'>
          {/* Enhanced Slider */}
          <Link href='/tabbar' className='group'>
            <div className='relative bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 hover:transform hover:scale-105'>
              <div className='w-full h-32 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg mb-4 flex items-center justify-center'>
                <span className='text-2xl'>🌊</span>
              </div>
              <h3 className='text-xl font-semibold text-white mb-3'>
                滑块演示
              </h3>
              <p className='text-slate-300 text-sm mb-4'>
                实时跟踪滑块的液态玻璃效果
              </p>
              <div className='text-blue-400 text-sm font-medium group-hover:text-blue-300'>
                体验流畅交互 →
              </div>
            </div>
          </Link>

          {/* Basic Examples */}
          <Link href='/enhanced' className='group'>
            <div className='relative bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-emerald-500/50 transition-all duration-300 hover:transform hover:scale-105'>
              <div className='w-full h-32 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-lg mb-4 flex items-center justify-center'>
                <span className='text-2xl'>✨</span>
              </div>
              <h3 className='text-xl font-semibold text-white mb-3'>
                基础效果
              </h3>
              <p className='text-slate-300 text-sm mb-4'>
                多种液态变形效果展示
              </p>
              <div className='text-emerald-400 text-sm font-medium group-hover:text-emerald-300'>
                查看效果库 →
              </div>
            </div>
          </Link>

          {/* Playground */}
          <Link href='/playground' className='group'>
            <div className='relative bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-purple-500/50 transition-all duration-300 hover:transform hover:scale-105'>
              <div className='w-full h-32 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg mb-4 flex items-center justify-center'>
                <span className='text-2xl'>🎨</span>
              </div>
              <h3 className='text-xl font-semibold text-white mb-3'>实验场</h3>
              <p className='text-slate-300 text-sm mb-4'>
                自定义参数和创意实验
              </p>
              <div className='text-purple-400 text-sm font-medium group-hover:text-purple-300'>
                开始创作 →
              </div>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
