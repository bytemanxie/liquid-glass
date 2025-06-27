'use client';

import React, { useState } from 'react';
import { Card, Button, Radio, Slider } from 'tdesign-react';
import LiquidGlass, { presetFragments } from '@/components/LiquidGlass';

const fragments = [
  { name: '默认', key: 'default' as const, description: '平衡的液态效果' },
  { name: '强烈', key: 'strong' as const, description: '明显的形变效果' },
  { name: '微妙', key: 'subtle' as const, description: '轻微的波动效果' }
];

export default function EnhancedPage() {
  const [selectedFragment, setSelectedFragment] = useState<keyof typeof presetFragments>('default');
  const [glassOpacity, setGlassOpacity] = useState(0.8);
  const [glassSize, setGlassSize] = useState(300);

  const currentFragment = presetFragments[selectedFragment];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            液态玻璃效果展示
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            探索不同的液态变形效果，体验流畅的视觉体验
          </p>
        </div>

        {/* 主要内容区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 控制面板 */}
          <div className="lg:col-span-1 space-y-6">
            {/* 效果选择 */}
            <Card title="效果类型" bordered className="bg-white/10 backdrop-blur-md border-white/20">
              <div className="space-y-3">
                <Radio.Group 
                  value={selectedFragment} 
                  onChange={(value) => setSelectedFragment(value as keyof typeof presetFragments)}
                  className="flex flex-col space-y-2"
                >
                  {fragments.map((fragment) => (
                    <Radio key={fragment.key} value={fragment.key}>
                      <div className="text-white">
                        <div className="font-semibold">{fragment.name}</div>
                        <div className="text-sm text-slate-300">{fragment.description}</div>
                      </div>
                    </Radio>
                  ))}
                </Radio.Group>
              </div>
            </Card>

            {/* 参数调节 */}
            <Card title="参数调节" bordered className="bg-white/10 backdrop-blur-md border-white/20">
              <div className="space-y-6">
                <div>
                  <label className="block text-white font-medium mb-2">
                    透明度: {(glassOpacity * 100).toFixed(0)}%
                  </label>
                  <Slider
                    value={glassOpacity}
                    onChange={(value) => setGlassOpacity(Array.isArray(value) ? value[0] : value)}
                    min={0.1}
                    max={1}
                    step={0.1}
                  />
                </div>
                
                <div>
                  <label className="block text-white font-medium mb-2">
                    大小: {glassSize}px
                  </label>
                  <Slider
                    value={glassSize}
                    onChange={(value) => setGlassSize(Array.isArray(value) ? value[0] : value)}
                    min={200}
                    max={400}
                    step={20}
                  />
                </div>
              </div>
            </Card>

            {/* 快速预设 */}
            <Card title="快速预设" bordered className="bg-white/10 backdrop-blur-md border-white/20">
              <div className="space-y-3">
                <Button 
                  block 
                  onClick={() => {
                    setSelectedFragment('subtle');
                    setGlassOpacity(0.6);
                    setGlassSize(250);
                  }}
                  className="text-white border-white/30 hover:bg-white/10"
                >
                  背景效果
                </Button>
                <Button 
                  block 
                  onClick={() => {
                    setSelectedFragment('strong');
                    setGlassOpacity(0.9);
                    setGlassSize(350);
                  }}
                  className="text-white border-white/30 hover:bg-white/10"
                >
                  主角效果
                </Button>
                <Button 
                  block 
                  onClick={() => {
                    setSelectedFragment('default');
                    setGlassOpacity(0.8);
                    setGlassSize(300);
                  }}
                  className="text-white border-white/30 hover:bg-white/10"
                >
                  平衡效果
                </Button>
              </div>
            </Card>
          </div>

          {/* 效果展示区域 */}
          <div className="lg:col-span-2">
            <Card title="实时预览" bordered className="bg-white/10 backdrop-blur-md border-white/20 h-full">
              <div className="relative h-96 bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 rounded-lg overflow-hidden">
                {/* 背景装饰 */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                <div className="absolute top-4 left-4 text-white/80 text-sm font-medium">
                  {fragments.find(f => f.key === selectedFragment)?.name}效果
                </div>
                
                {/* 液态玻璃效果 */}
                <LiquidGlass
                  width={glassSize}
                  height={glassSize * 0.6}
                  fragment={currentFragment}
                  position={{ x: 50, y: 50 }}
                  style={{ 
                    opacity: glassOpacity,
                    transition: 'opacity 0.3s ease'
                  }}
                />

                {/* 信息显示 */}
                <div className="absolute bottom-4 right-4 bg-black/30 backdrop-blur-sm rounded-lg p-3 text-white text-sm">
                  <div>尺寸: {glassSize} × {Math.round(glassSize * 0.6)}</div>
                  <div>透明度: {(glassOpacity * 100).toFixed(0)}%</div>
                  <div>效果: {fragments.find(f => f.key === selectedFragment)?.name}</div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* 底部说明 */}
        <div className="mt-8 text-center">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-3">使用说明</h3>
            <p className="text-slate-300 max-w-2xl mx-auto">
              选择不同的效果类型，调节透明度和大小参数，实时查看液态玻璃的视觉效果。
              所有效果都经过性能优化，确保流畅的显示体验。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}