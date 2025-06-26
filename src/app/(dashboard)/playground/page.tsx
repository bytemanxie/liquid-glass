'use client';

import { useState } from 'react';
import { Card, Button, Space, Tag, Slider, Switch } from 'tdesign-react';
import { ControlPlatformIcon, PlayCircleIcon, RefreshIcon, SaveIcon } from 'tdesign-icons-react';
import LiquidGlass, { physicsPresets, PhysicsConfig } from '@/components/LiquidGlass';

export default function PlaygroundPage() {
  // 物理参数状态
  const [physics, setPhysics] = useState<PhysicsConfig>({
    elasticity: 0.5,
    dampening: 0.7,
    rippleIntensity: 0.6,
    viscosity: 0.3,
    surfaceTension: 0.5
  });

  // 效果开关状态
  const [effects, setEffects] = useState({
    enablePhysics: true,
    enableRipples: true,
    bounceOnConstraints: true,
    draggable: true
  });

  // 外观设置
  const [appearance, setAppearance] = useState({
    width: 300,
    height: 200,
    borderRadius: 20
  });

  // 重置为默认值
  const resetToDefaults = () => {
    setPhysics({
      elasticity: 0.5,
      dampening: 0.7,
      rippleIntensity: 0.6,
      viscosity: 0.3,
      surfaceTension: 0.5
    });
    setEffects({
      enablePhysics: true,
      enableRipples: true,
      bounceOnConstraints: true,
      draggable: true
    });
    setAppearance({
      width: 300,
      height: 200,
      borderRadius: 20
    });
  };

  // 应用预设
  const applyPreset = (presetName: keyof typeof physicsPresets) => {
    setPhysics(physicsPresets[presetName]);
  };

  return (
    <div className="space-y-8">
      {/* 页面标题 */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          液体玻璃效果实验室
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          实时调整物理参数，创造你独特的液体玻璃效果。所有变化都会实时反映在预览区域中。
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 预览区域 */}
        <div className="lg:col-span-2">
          <Card title="实时预览" bordered>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ControlPlatformIcon className="text-blue-600" />
                  <span className="text-sm text-gray-600">拖拽体验你的自定义效果</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Tag theme="primary" variant="light">实时调整</Tag>
                  <Tag theme="success" variant="light">即时预览</Tag>
                </div>
              </div>
              
              <div className="relative bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-600 rounded-lg overflow-hidden" 
                   style={{ height: '400px' }}>
                {/* 固定定位的可拖拽玻璃 */}
                <LiquidGlass
                  enablePhysics={effects.enablePhysics}
                  physics={physics}
                  enableRipples={effects.enableRipples}
                  bounceOnConstraints={effects.bounceOnConstraints}
                  draggable={effects.draggable}
                  width={appearance.width}
                  height={appearance.height}
                  borderRadius={appearance.borderRadius}
                  position="fixed"
                  initialPosition={{ x: 200, y: 150 }}
                >
                  🧪 实验室效果
                </LiquidGlass>
                
                {/* 静态展示玻璃 */}
                <div className="absolute top-4 left-4">
                  <LiquidGlass
                    enablePhysics={effects.enablePhysics}
                    physics={physics}
                    width={200}
                    height={120}
                    draggable={false}
                  />
                </div>
                
                <div className="absolute bottom-4 left-4 text-white text-sm bg-black/20 px-3 py-2 rounded-lg backdrop-blur-sm">
                  拖拽上方的玻璃框体验效果
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                <div className="text-center p-2 bg-blue-50 rounded">
                  <div className="font-medium">弹性</div>
                  <div className="text-blue-600">{((physics.elasticity || 0) * 100).toFixed(0)}%</div>
                </div>
                <div className="text-center p-2 bg-green-50 rounded">
                  <div className="font-medium">阻尼</div>
                  <div className="text-green-600">{((physics.dampening || 0) * 100).toFixed(0)}%</div>
                </div>
                <div className="text-center p-2 bg-purple-50 rounded">
                  <div className="font-medium">波纹</div>
                  <div className="text-purple-600">{((physics.rippleIntensity || 0) * 100).toFixed(0)}%</div>
                </div>
                <div className="text-center p-2 bg-orange-50 rounded">
                  <div className="font-medium">粘度</div>
                  <div className="text-orange-600">{((physics.viscosity || 0) * 100).toFixed(0)}%</div>
                </div>
                <div className="text-center p-2 bg-red-50 rounded">
                  <div className="font-medium">张力</div>
                  <div className="text-red-600">{((physics.surfaceTension || 0) * 100).toFixed(0)}%</div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* 控制面板 */}
        <div className="space-y-6">
          {/* 快速预设 */}
          <Card title="快速预设" bordered>
            <div className="space-y-3">
              <Button 
                theme="primary" 
                variant="outline" 
                size="small" 
                block
                onClick={() => applyPreset('water')}
              >
                💧 水效果
              </Button>
              <Button 
                theme="success" 
                variant="outline" 
                size="small" 
                block
                onClick={() => applyPreset('jelly')}
              >
                🍮 果冻效果
              </Button>
              <Button 
                theme="warning" 
                variant="outline" 
                size="small" 
                block
                onClick={() => applyPreset('oil')}
              >
                🛢️ 油效果
              </Button>
              <Button 
                theme="danger" 
                variant="outline" 
                size="small" 
                block
                onClick={() => applyPreset('bouncy')}
              >
                ⚡ 弹性球
              </Button>
              <Button 
                theme="default" 
                variant="outline" 
                size="small" 
                block
                onClick={() => applyPreset('viscous')}
              >
                🍯 粘稠效果
              </Button>
            </div>
          </Card>

          {/* 物理参数调节 */}
          <Card title="物理参数" bordered>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">弹性系数: {((physics.elasticity || 0) * 100).toFixed(0)}%</label>
                <Slider
                  value={(physics.elasticity || 0) * 100}
                  min={0}
                  max={100}
                  step={1}
                  onChange={(value) => setPhysics(prev => ({ ...prev, elasticity: (value as number) / 100 }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">阻尼系数: {((physics.dampening || 0) * 100).toFixed(0)}%</label>
                <Slider
                  value={(physics.dampening || 0) * 100}
                  min={0}
                  max={100}
                  step={1}
                  onChange={(value) => setPhysics(prev => ({ ...prev, dampening: (value as number) / 100 }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">波纹强度: {((physics.rippleIntensity || 0) * 100).toFixed(0)}%</label>
                <Slider
                  value={(physics.rippleIntensity || 0) * 100}
                  min={0}
                  max={100}
                  step={1}
                  onChange={(value) => setPhysics(prev => ({ ...prev, rippleIntensity: (value as number) / 100 }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">粘性系数: {((physics.viscosity || 0) * 100).toFixed(0)}%</label>
                <Slider
                  value={(physics.viscosity || 0) * 100}
                  min={0}
                  max={100}
                  step={1}
                  onChange={(value) => setPhysics(prev => ({ ...prev, viscosity: (value as number) / 100 }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">表面张力: {((physics.surfaceTension || 0) * 100).toFixed(0)}%</label>
                <Slider
                  value={(physics.surfaceTension || 0) * 100}
                  min={0}
                  max={100}
                  step={1}
                  onChange={(value) => setPhysics(prev => ({ ...prev, surfaceTension: (value as number) / 100 }))}
                />
              </div>
            </div>
          </Card>

          {/* 效果开关 */}
          <Card title="效果控制" bordered>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">启用物理效果</span>
                <Switch
                  value={effects.enablePhysics}
                  onChange={(checked) => setEffects(prev => ({ ...prev, enablePhysics: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">启用波纹效果</span>
                <Switch
                  value={effects.enableRipples}
                  onChange={(checked) => setEffects(prev => ({ ...prev, enableRipples: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">边界反弹</span>
                <Switch
                  value={effects.bounceOnConstraints}
                  onChange={(checked) => setEffects(prev => ({ ...prev, bounceOnConstraints: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">可拖拽</span>
                <Switch
                  value={effects.draggable}
                  onChange={(checked) => setEffects(prev => ({ ...prev, draggable: checked }))}
                />
              </div>
            </div>
          </Card>

          {/* 操作按钮 */}
          <Card bordered>
            <div className="space-y-3">
              <Button 
                theme="primary" 
                block
                icon={<SaveIcon />}
              >
                保存配置
              </Button>
              <Button 
                theme="default" 
                block
                icon={<RefreshIcon />}
                onClick={resetToDefaults}
              >
                重置默认
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* 使用说明 */}
      <Card title="实验室指南" bordered>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <ControlPlatformIcon className="text-blue-600 text-xl" />
            </div>
            <h3 className="font-medium mb-2">调整参数</h3>
            <p className="text-sm text-gray-600">实时拖动滑块调整物理参数，观察效果变化</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <PlayCircleIcon className="text-green-600 text-xl" />
            </div>
            <h3 className="font-medium mb-2">实时预览</h3>
            <p className="text-sm text-gray-600">所有更改立即反映在预览区域中</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <SaveIcon className="text-purple-600 text-xl" />
            </div>
            <h3 className="font-medium mb-2">保存配置</h3>
            <p className="text-sm text-gray-600">保存你喜欢的参数配置供将来使用</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <RefreshIcon className="text-orange-600 text-xl" />
            </div>
            <h3 className="font-medium mb-2">快速重置</h3>
            <p className="text-sm text-gray-600">一键重置为默认值或应用预设配置</p>
          </div>
        </div>
      </Card>
    </div>
  );
} 