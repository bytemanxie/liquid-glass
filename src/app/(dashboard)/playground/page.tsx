'use client';

import React, { useState } from 'react';
import { Card, Slider, Input, Button, Space, Typography, Divider, Switch, Tag } from 'tdesign-react';

const { Title, Paragraph, Text } = Typography;
import LiquidGlass, { presetFragments } from '@/components/LiquidGlass';

export default function PlaygroundPage() {
  const [size, setSize] = useState(300);
  const [glassRadius, setGlassRadius] = useState(20);
  const [selectedPreset, setSelectedPreset] =
    useState<keyof typeof presetFragments>('default');
  const [showGlass, setShowGlass] = useState(true);
  const [isDraggable, setIsDraggable] = useState(true);

  return (
    <div className='p-0' style={{ backgroundColor: '#1e293b' }}>
      <div className='max-w-7xl mx-auto'>
        {/* 预览区域 */}
        <div className='mb-4'>
          <Card
            title={<Text style={{ color: '#f1f5f9', fontWeight: 600, fontSize: '16px' }}>实时预览</Text>}
            bordered
            style={{ backgroundColor: '#334155', borderColor: '#475569' }}
            size="small"
          >
            <div className='relative h-72 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-lg overflow-hidden'>
              {/* 背景网格 */}
              <div
                className='absolute inset-0 opacity-10'
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
                  `,
                  backgroundSize: '20px 20px',
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
                    transition: 'all 0.3s ease',
                  }}
                >
                  {isDraggable ? '🖱️ 拖拽我' : '🔒 固定位置'}
                </LiquidGlass>
              )}

              {/* 信息叠加 */}
              <div className='absolute top-4 left-4' style={{
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                backdropFilter: 'blur(8px)',
                borderRadius: '8px',
                padding: '12px',
                color: 'white',
                fontSize: '14px'
              }}>
                <Text strong style={{ color: 'white', display: 'block', marginBottom: '8px' }}>
                  液态玻璃状态
                </Text>
                <div style={{ color: '#e2e8f0' }}>效果: {selectedPreset}</div>
                <div style={{ color: '#e2e8f0' }}>
                  大小: {size}×{Math.round(size * 0.6)}
                </div>
                <div style={{ color: '#e2e8f0' }}>圆角: {glassRadius}px</div>
                <div style={{ color: '#e2e8f0' }}>交互: {isDraggable ? '可拖拽' : '固定'}</div>
              </div>

              {!showGlass && (
                <div className='absolute inset-0 flex items-center justify-center'>
                  <div style={{
                    color: 'white',
                    fontSize: '24px',
                    fontWeight: 'bold',
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    padding: '24px 32px',
                    borderRadius: '12px',
                    backdropFilter: 'blur(8px)'
                  }}>
                    玻璃效果已隐藏
                  </div>
                </div>
              )}

              {/* 拖拽提示 */}
              {showGlass && isDraggable && (
                <div className='absolute bottom-4 right-4' style={{
                  backgroundColor: 'rgba(59, 130, 246, 0.8)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: '8px',
                  padding: '8px',
                  color: 'white',
                  fontSize: '12px'
                }}>
                  💡 拖拽玻璃到任意位置
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* 控制面板 - 移到底部 */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-4 pb-4'>
          {/* 基础设置 */}
          <Card
            title={<Text style={{ color: '#f1f5f9', fontWeight: 600, fontSize: '16px' }}>基础设置</Text>}
            bordered
            style={{ backgroundColor: '#334155', borderColor: '#475569' }}
            size="small"
          >
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <div>
                <Text style={{ color: '#cbd5e1', fontSize: '14px', display: 'block', marginBottom: '8px' }}>
                  显示/隐藏
                </Text>
                <Button
                  block
                  theme={showGlass ? 'primary' : 'default'}
                  onClick={() => setShowGlass(!showGlass)}
                >
                  {showGlass ? '显示中' : '已隐藏'}
                </Button>
              </div>

              <div>
                <Text style={{ color: '#cbd5e1', fontSize: '14px', display: 'block', marginBottom: '8px' }}>
                  拖拽功能
                </Text>
                <Switch
                  value={isDraggable}
                  onChange={setIsDraggable}
                  label={[
                    <Text key="on" style={{ color: '#cbd5e1' }}>可拖拽</Text>,
                    <Text key="off" style={{ color: '#cbd5e1' }}>固定位置</Text>
                  ]}
                />
              </div>

              <Divider style={{ borderColor: '#475569' }} />

              <div>
                <Text style={{ color: '#cbd5e1', fontSize: '14px', display: 'block', marginBottom: '8px' }}>
                  尺寸: <Tag theme="success" variant="light">{size}px</Tag>
                </Text>
                <Slider
                  value={size}
                  onChange={value =>
                    setSize(Array.isArray(value) ? value[0] : value)
                  }
                  min={150}
                  max={500}
                  step={10}
                />
              </div>

              <div>
                <Text style={{ color: '#cbd5e1', fontSize: '14px', display: 'block', marginBottom: '8px' }}>
                  圆角: <Tag theme="warning" variant="light">{glassRadius}px</Tag>
                </Text>
                <Slider
                  value={glassRadius}
                  onChange={value =>
                    setGlassRadius(Array.isArray(value) ? value[0] : value)
                  }
                  min={0}
                  max={50}
                  step={2}
                />
              </div>
            </Space>
          </Card>

          {/* 效果预设 */}
          <Card
            title={<Text style={{ color: '#f1f5f9', fontWeight: 600, fontSize: '16px' }}>效果预设</Text>}
            bordered
            style={{ backgroundColor: '#334155', borderColor: '#475569' }}
            size="small"
          >
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              {Object.entries(presetFragments).map(([key, _]) => (
                <Button
                  key={key}
                  block
                  theme={selectedPreset === key ? 'primary' : 'default'}
                  variant={selectedPreset === key ? 'base' : 'outline'}
                  onClick={() =>
                    setSelectedPreset(key as keyof typeof presetFragments)
                  }
                >
                  {key === 'default' && '默认效果'}
                  {key === 'strong' && '强烈效果'}
                  {key === 'subtle' && '微妙效果'}
                  {key === 'interactive' && '交互效果'}
                </Button>
              ))}
            </Space>
          </Card>

          {/* 参数信息 */}
          <Card
            title={<Text style={{ color: '#f1f5f9', fontWeight: 600, fontSize: '16px' }}>参数信息</Text>}
            bordered
            style={{ backgroundColor: '#334155', borderColor: '#475569' }}
            size="small"
          >
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: '#94a3b8' }}>当前效果:</Text>
                <Tag theme="primary">{selectedPreset}</Tag>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: '#94a3b8' }}>尺寸:</Text>
                <Tag theme="success" variant="light">{size} × {Math.round(size * 0.6)}</Tag>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: '#94a3b8' }}>圆角:</Text>
                <Tag theme="warning" variant="light">{glassRadius}px</Tag>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: '#94a3b8' }}>状态:</Text>
                <Tag theme={showGlass ? 'success' : 'default'}>{showGlass ? '显示' : '隐藏'}</Tag>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: '#94a3b8' }}>交互:</Text>
                <Tag theme={isDraggable ? 'success' : 'default'}>{isDraggable ? '可拖拽' : '固定'}</Tag>
              </div>
            </Space>
          </Card>

          {/* 快速操作 */}
          <Card
            title={<Text style={{ color: '#f1f5f9', fontWeight: 600, fontSize: '16px' }}>快速操作</Text>}
            bordered
            style={{ backgroundColor: '#334155', borderColor: '#475569' }}
            size="small"
          >
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Button
                block
                theme="default"
                onClick={() => {
                  setSize(300);
                  setGlassRadius(20);
                  setSelectedPreset('default');
                  setIsDraggable(false);
                }}
              >
                重置默认
              </Button>
              <Button
                block
                theme="primary"
                variant="outline"
                onClick={() => {
                  setSize(Math.floor(Math.random() * 200) + 200);
                  setGlassRadius(Math.floor(Math.random() * 30) + 10);
                  const presets = Object.keys(
                    presetFragments
                  ) as (keyof typeof presetFragments)[];
                  setSelectedPreset(
                    presets[Math.floor(Math.random() * presets.length)]
                  );
                  setIsDraggable(Math.random() > 0.5);
                }}
              >
                随机参数
              </Button>
            </Space>
          </Card>
        </div>
      </div>
    </div>
  );
}
