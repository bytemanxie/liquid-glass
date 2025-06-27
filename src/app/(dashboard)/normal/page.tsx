'use client';

import React, { useState } from 'react';
import { Card, Button, Radio, Slider, Space, Typography, Tag } from 'tdesign-react';

const { Title, Paragraph, Text } = Typography;
import LiquidGlass, { presetFragments } from '@/components/LiquidGlass';

const fragments = [
  { name: '默认', key: 'default' as const, description: '平衡的液态效果' },
  { name: '强烈', key: 'strong' as const, description: '明显的形变效果' },
  { name: '微妙', key: 'subtle' as const, description: '轻微的波动效果' },
];

export default function EnhancedPage() {
  const [selectedFragment, setSelectedFragment] =
    useState<keyof typeof presetFragments>('default');
  const [glassSize, setGlassSize] = useState(300);

  const currentFragment = presetFragments[selectedFragment];

  return (
    <div className='p-0' style={{ backgroundColor: '#1e293b' }}>
      <div className='max-w-6xl mx-auto'>
        {/* 页面标题 */}
        <div className='text-center mb-4 p-4'>
          <Title level="h1" style={{ color: '#f1f5f9', marginBottom: '8px', fontSize: '28px' }}>
            液态玻璃效果展示
          </Title>
          <Paragraph style={{ color: '#94a3b8', fontSize: '16px', margin: '0 auto', maxWidth: '600px' }}>
            探索不同的液态变形效果，体验流畅的视觉体验
          </Paragraph>
        </div>

        {/* 效果展示区域 */}
        <div className='px-4 mb-4'>
          <Card
            title={<Text style={{ color: '#f1f5f9', fontWeight: 600, fontSize: '16px' }}>实时预览</Text>}
            bordered
            style={{ backgroundColor: '#334155', borderColor: '#475569' }}
            size="small"
          >
            <div className='relative h-72 bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 rounded-lg overflow-hidden'>
              {/* 背景装饰 */}
              <div className='absolute inset-0 bg-gradient-to-t from-black/20 to-transparent'></div>
              <div className='absolute top-4 left-4' style={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '14px',
                fontWeight: 500
              }}>
                <Tag theme="primary">{fragments.find(f => f.key === selectedFragment)?.name}效果</Tag>
              </div>

              {/* 液态玻璃效果 */}
              <LiquidGlass
                width={glassSize}
                height={glassSize * 0.6}
                fragment={currentFragment}
                position={{ x: 50, y: 50 }}
              />

              {/* 信息显示 */}
              <div className='absolute bottom-4 right-4' style={{
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                backdropFilter: 'blur(8px)',
                borderRadius: '8px',
                padding: '12px',
                color: 'white',
                fontSize: '14px'
              }}>
                <Space direction="vertical" size="small">
                  <Text style={{ color: '#e2e8f0' }}>
                    尺寸: {glassSize} × {Math.round(glassSize * 0.6)}
                  </Text>
                  <Text style={{ color: '#e2e8f0' }}>
                    效果: {fragments.find(f => f.key === selectedFragment)?.name}
                  </Text>
                </Space>
              </div>
            </div>
          </Card>
        </div>

        {/* 控制面板 - 移到底部 */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 px-4 pb-4'>
          {/* 效果选择 */}
          <Card
            title={<Text style={{ color: '#f1f5f9', fontWeight: 600, fontSize: '16px' }}>效果类型</Text>}
            bordered
            style={{ backgroundColor: '#334155', borderColor: '#475569' }}
            size="small"
          >
            <Radio.Group
              value={selectedFragment}
              onChange={value =>
                setSelectedFragment(value as keyof typeof presetFragments)
              }
            >
              <Space direction="vertical" size="small">
                {fragments.map(fragment => (
                  <Radio key={fragment.key} value={fragment.key}>
                    <div>
                      <Text strong style={{ color: '#f1f5f9', display: 'block' }}>
                        {fragment.name}
                      </Text>
                      <Text style={{ color: '#94a3b8', fontSize: '14px' }}>
                        {fragment.description}
                      </Text>
                    </div>
                  </Radio>
                ))}
              </Space>
            </Radio.Group>
          </Card>

          {/* 参数调节 */}
          <Card
            title={<Text style={{ color: '#f1f5f9', fontWeight: 600, fontSize: '16px' }}>参数调节</Text>}
            bordered
            style={{ backgroundColor: '#334155', borderColor: '#475569' }}
            size="small"
          >
            <div>
              <Text style={{ color: '#cbd5e1', fontSize: '14px', display: 'block', marginBottom: '8px' }}>
                大小: <Tag theme="success" variant="light">{glassSize}px</Tag>
              </Text>
              <Slider
                value={glassSize}
                onChange={value =>
                  setGlassSize(Array.isArray(value) ? value[0] : value)
                }
                min={200}
                max={400}
                step={20}
              />
            </div>
          </Card>

          {/* 快速预设 */}
          <Card
            title={<Text style={{ color: '#f1f5f9', fontWeight: 600, fontSize: '16px' }}>快速预设</Text>}
            bordered
            style={{ backgroundColor: '#334155', borderColor: '#475569' }}
            size="small"
          >
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Button
                block
                theme="default"
                onClick={() => {
                  setSelectedFragment('subtle');
                  setGlassSize(250);
                }}
              >
                背景效果
              </Button>
              <Button
                block
                theme="primary"
                variant="outline"
                onClick={() => {
                  setSelectedFragment('strong');
                  setGlassSize(350);
                }}
              >
                主角效果
              </Button>
              <Button
                block
                theme="primary"
                onClick={() => {
                  setSelectedFragment('default');
                  setGlassSize(300);
                }}
              >
                平衡效果
              </Button>
            </Space>
          </Card>
        </div>
      </div>
    </div>
  );
}
