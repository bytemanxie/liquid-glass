'use client';

import React, { useState } from 'react';
import { Card, Slider, Input, Button } from 'tdesign-react';
import LiquidGlass, { presetFragments } from '@/components/LiquidGlass';

export default function PlaygroundPage() {
  const [opacity, setOpacity] = useState(0.8);
  const [size, setSize] = useState(300);
  const [glassRadius, setGlassRadius] = useState(20);
  const [selectedPreset, setSelectedPreset] = useState<keyof typeof presetFragments>('default');
  const [showGlass, setShowGlass] = useState(true);
  const [isDraggable, setIsDraggable] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            液态玻璃实验场
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            自由调节参数，探索液态玻璃的视觉效果
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* 控制面板 */}
          <div className="xl:col-span-1 space-y-6">
            {/* 基础设置 */}
            <Card title="基础设置" bordered className="bg-white/10 backdrop-blur-md border-white/20">
              <div className="space-y-4">
                <div>
                  <label className="block text-white font-medium mb-2">
                    显示/隐藏
                  </label>
                  <Button 
                    block
                    onClick={() => setShowGlass(!showGlass)}
                    className={`${showGlass ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'} text-white border-0`}
                  >
                    {showGlass ? '🟢 显示中' : '🔴 已隐藏'}
                  </Button>
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">
                    拖拽功能
                  </label>
                  <Button 
                    block
                    onClick={() => setIsDraggable(!isDraggable)}
                    className={`${isDraggable ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600 hover:bg-gray-700'} text-white border-0`}
                  >
                    {isDraggable ? '🖱️ 可拖拽' : '🔒 固定位置'}
                  </Button>
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">
                    透明度: {(opacity * 100).toFixed(0)}%
                  </label>
                  <Slider
                    value={opacity}
                    onChange={(value) => setOpacity(Array.isArray(value) ? value[0] : value)}
                    min={0.1}
                    max={1}
                    step={0.05}
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">
                    尺寸: {size}px
                  </label>
                  <Slider
                    value={size}
                    onChange={(value) => setSize(Array.isArray(value) ? value[0] : value)}
                    min={150}
                    max={500}
                    step={10}
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">
                    圆角: {glassRadius}px
                  </label>
                  <Slider
                    value={glassRadius}
                    onChange={(value) => setGlassRadius(Array.isArray(value) ? value[0] : value)}
                    min={0}
                    max={50}
                    step={2}
                  />
                </div>
              </div>
            </Card>

            {/* 效果预设 */}
            <Card title="效果预设" bordered className="bg-white/10 backdrop-blur-md border-white/20">
              <div className="space-y-3">
                {Object.entries(presetFragments).map(([key, _]) => (
                  <Button
                    key={key}
                    block
                    onClick={() => setSelectedPreset(key as keyof typeof presetFragments)}
                    className={`${
                      selectedPreset === key 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white border-0' 
                        : 'text-white border-white/30 hover:bg-white/10'
                    }`}
                  >
                    {key === 'default' && '默认效果'}
                    {key === 'strong' && '强烈效果'}
                    {key === 'subtle' && '微妙效果'}
                    {key === 'interactive' && '交互效果'}
                  </Button>
                ))}
              </div>
            </Card>

            {/* 参数信息 */}
            <Card title="参数信息" bordered className="bg-white/10 backdrop-blur-md border-white/20">
              <div className="space-y-2 text-sm text-slate-300">
                <div>当前效果: <span className="text-white font-medium">{selectedPreset}</span></div>
                <div>透明度: <span className="text-white font-medium">{(opacity * 100).toFixed(0)}%</span></div>
                <div>尺寸: <span className="text-white font-medium">{size} × {Math.round(size * 0.6)}</span></div>
                <div>圆角: <span className="text-white font-medium">{glassRadius}px</span></div>
                <div>状态: <span className="text-white font-medium">{showGlass ? '显示' : '隐藏'}</span></div>
                <div>交互: <span className="text-white font-medium">{isDraggable ? '可拖拽' : '固定'}</span></div>
              </div>
            </Card>

            {/* 快速操作 */}
            <Card title="快速操作" bordered className="bg-white/10 backdrop-blur-md border-white/20">
              <div className="space-y-3">
                <Button 
                  block 
                  onClick={() => {
                    setOpacity(0.8);
                    setSize(300);
                    setGlassRadius(20);
                    setSelectedPreset('default');
                    setIsDraggable(false);
                  }}
                  className="text-white border-white/30 hover:bg-white/10"
                >
                  重置默认
                </Button>
                <Button 
                  block 
                  onClick={() => {
                    setOpacity(Math.random() * 0.6 + 0.3);
                    setSize(Math.floor(Math.random() * 200) + 200);
                    setGlassRadius(Math.floor(Math.random() * 30) + 10);
                    const presets = Object.keys(presetFragments) as (keyof typeof presetFragments)[];
                    setSelectedPreset(presets[Math.floor(Math.random() * presets.length)]);
                    setIsDraggable(Math.random() > 0.5);
                  }}
                  className="text-white border-white/30 hover:bg-white/10"
                >
                  随机参数
                </Button>
              </div>
            </Card>
          </div>

          {/* 预览区域 */}
          <div className="xl:col-span-3">
            <Card title="实时预览" bordered className="bg-white/10 backdrop-blur-md border-white/20 h-full">
              <div className="relative h-96 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-lg overflow-hidden">
                {/* 背景网格 */}
                <div 
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage: `
                      linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
                    `,
                    backgroundSize: '20px 20px'
                  }}
                ></div>

                {/* 液态玻璃 */}
                {showGlass && (
                  <LiquidGlass
                    width={size}
                    height={Math.round(size * 0.6)}
                    fragment={presetFragments[selectedPreset]}
                    borderRadius={glassRadius}
                    position={{ x: 100, y: 80 }}
                    draggable={isDraggable}
                    style={{ 
                      opacity: opacity,
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {isDraggable ? '🖱️ 拖拽我' : '🔒 固定位置'}
                  </LiquidGlass>
                )}

                {/* 信息叠加 */}
                <div className="absolute top-4 left-4 bg-black/30 backdrop-blur-sm rounded-lg p-3 text-white text-sm">
                  <div className="font-medium mb-1">液态玻璃状态</div>
                  <div>效果: {selectedPreset}</div>
                  <div>大小: {size}×{Math.round(size * 0.6)}</div>
                  <div>透明度: {(opacity * 100).toFixed(0)}%</div>
                  <div>圆角: {glassRadius}px</div>
                  <div>交互: {isDraggable ? '可拖拽' : '固定'}</div>
                </div>

                {!showGlass && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-white text-2xl font-bold bg-black/30 px-6 py-3 rounded-lg backdrop-blur-sm">
                      玻璃效果已隐藏
                    </div>
                  </div>
                )}

                {/* 拖拽提示 */}
                {showGlass && isDraggable && (
                  <div className="absolute bottom-4 right-4 bg-blue-600/80 backdrop-blur-sm rounded-lg p-2 text-white text-xs">
                    💡 拖拽玻璃到任意位置
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* 底部说明 */}
        <div className="mt-8">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-3">实验指南</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-slate-300">
              <div>
                <h4 className="font-semibold text-white mb-2">基础参数</h4>
                <ul className="space-y-1 text-sm">
                  <li>• 透明度控制玻璃的透明程度</li>
                  <li>• 尺寸调节玻璃的大小</li>
                  <li>• 圆角影响边缘的圆润度</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">效果类型</h4>
                <ul className="space-y-1 text-sm">
                  <li>• 默认：平衡的液态变形</li>
                  <li>• 强烈：明显的扭曲效果</li>
                  <li>• 微妙：轻微的波动效果</li>
                  <li>• 交互：响应鼠标的动态效果</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">交互功能</h4>
                <ul className="space-y-1 text-sm">
                  <li>• 可拖拽：自由移动玻璃位置</li>
                  <li>• 边界约束：防止拖出视口</li>
                  <li>• 鼠标响应：交互式变形效果</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 