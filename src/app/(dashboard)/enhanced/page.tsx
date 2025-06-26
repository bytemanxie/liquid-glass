'use client';

import { Card, Button, Space, Tag } from 'tdesign-react';
import { LayersIcon, TipsIcon, PlayCircleIcon } from 'tdesign-icons-react';
import LiquidGlass, { physicsPresets } from '@/components/LiquidGlass';

export default function EnhancedPage() {
  return (
    <div className="space-y-8">
      {/* 页面标题 */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          增强物理液体效果
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          带有真实物理效果的液体玻璃组件，包含弹性、阻尼、表面张力等物理属性
        </p>
      </div>

      {/* 效果展示区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 水效果 */}
        <Card title="水效果" bordered>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-blue-600">
                <LayersIcon />
                <span className="text-sm">流动性强，弹性适中</span>
              </div>
              <Tag theme="primary" variant="light">拖拽体验</Tag>
            </div>
            <div className="relative h-64 bg-gradient-to-br from-blue-400 to-cyan-600 rounded-lg overflow-hidden">
              <LiquidGlass
                enablePhysics={true}
                physics={physicsPresets.water}
                width={250}
                height={150}
                className="w-full h-full"
                draggable={false}
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-white text-xl font-bold bg-black/20 px-4 py-2 rounded-lg backdrop-blur-sm">
                  💧 水效果
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* 果冻效果 */}
        <Card title="果冻效果" bordered>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-purple-600">
                <PlayCircleIcon />
                <span className="text-sm">高弹性，Q弹感觉</span>
              </div>
              <Tag theme="warning" variant="light">弹性十足</Tag>
            </div>
            <div className="relative h-64 bg-gradient-to-br from-purple-400 to-pink-600 rounded-lg overflow-hidden">
              <LiquidGlass
                enablePhysics={true}
                physics={physicsPresets.jelly}
                width={250}
                height={150}
                className="w-full h-full"
                draggable={false}
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-white text-xl font-bold bg-black/20 px-4 py-2 rounded-lg backdrop-blur-sm">
                  🍮 果冻效果
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* 油效果 */}
        <Card title="油效果" bordered>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-orange-600">
                <TipsIcon />
                <span className="text-sm">粘稠感，慢响应</span>
              </div>
              <Tag theme="success" variant="light">粘稠流动</Tag>
            </div>
            <div className="relative h-64 bg-gradient-to-br from-orange-400 to-red-600 rounded-lg overflow-hidden">
              <LiquidGlass
                enablePhysics={true}
                physics={physicsPresets.oil}
                width={250}
                height={150}
                className="w-full h-full"
                draggable={false}
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-white text-xl font-bold bg-black/20 px-4 py-2 rounded-lg backdrop-blur-sm">
                  🛢️ 油效果
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* 弹性球效果 */}
        <Card title="弹性球效果" bordered>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-green-600">
                <PlayCircleIcon />
                <span className="text-sm">超强弹性回弹</span>
              </div>
              <Tag theme="danger" variant="light">极限弹性</Tag>
            </div>
            <div className="relative h-64 bg-gradient-to-br from-green-400 to-emerald-600 rounded-lg overflow-hidden">
              <LiquidGlass
                enablePhysics={true}
                physics={physicsPresets.bouncy}
                width={250}
                height={150}
                className="w-full h-full"
                draggable={false}
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-white text-xl font-bold bg-black/20 px-4 py-2 rounded-lg backdrop-blur-sm">
                  ⚡ 弹性球
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* 粘稠效果 */}
        <Card title="粘稠效果" bordered>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-gray-600">
                <TipsIcon />
                <span className="text-sm">高粘度，缓慢响应</span>
              </div>
              <Tag theme="default" variant="light">超级粘稠</Tag>
            </div>
            <div className="relative h-64 bg-gradient-to-br from-gray-400 to-gray-600 rounded-lg overflow-hidden">
              <LiquidGlass
                enablePhysics={true}
                physics={physicsPresets.viscous}
                width={250}
                height={150}
                className="w-full h-full"
                draggable={false}
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-white text-xl font-bold bg-black/20 px-4 py-2 rounded-lg backdrop-blur-sm">
                  🍯 粘稠效果
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* 可拖拽物理效果 */}
        <Card title="可拖拽物理效果" bordered>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-indigo-600">
                <LayersIcon />
                <span className="text-sm">拖拽体验物理效果</span>
              </div>
              <Tag theme="primary" variant="light">可拖拽</Tag>
            </div>
            <div className="relative h-64 bg-gradient-to-br from-indigo-400 to-violet-600 rounded-lg overflow-hidden">
              <LiquidGlass
                enablePhysics={true}
                physics={physicsPresets.water}
                width={200}
                height={120}
                position="fixed"
                initialPosition={{ x: 100, y: 100 }}
                bounceOnConstraints={true}
                draggable={true}
              >
                拖拽我试试
              </LiquidGlass>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-white text-sm bg-black/20 px-3 py-2 rounded-lg backdrop-blur-sm">
                  🎯 拖拽上方的玻璃框体验物理效果
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* 物理特性说明 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card title="物理特性说明" bordered>
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-medium text-gray-900">弹性系数 (Elasticity)</h4>
                  <p className="text-sm text-gray-600">控制物体的弹性回弹力度，值越大回弹越强</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-medium text-gray-900">阻尼系数 (Dampening)</h4>
                  <p className="text-sm text-gray-600">控制运动的衰减，值越大运动停止越快</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-medium text-gray-900">波纹强度 (Ripple Intensity)</h4>
                  <p className="text-sm text-gray-600">控制表面波纹的强度和传播距离</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-medium text-gray-900">粘性系数 (Viscosity)</h4>
                  <p className="text-sm text-gray-600">控制液体的粘稠度，影响流动和响应速度</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-medium text-gray-900">表面张力 (Surface Tension)</h4>
                  <p className="text-sm text-gray-600">控制液体表面的内聚力，影响形状保持</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card title="交互技巧" bordered>
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-medium text-gray-900">拖拽体验</h4>
                  <p className="text-sm text-gray-600">拖拽固定定位的玻璃框，感受不同物理效果</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-medium text-gray-900">鼠标悬停</h4>
                  <p className="text-sm text-gray-600">在玻璃表面移动鼠标，观察实时形变效果</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-teal-500 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-medium text-gray-900">点击波纹</h4>
                  <p className="text-sm text-gray-600">点击玻璃表面会产生波纹扩散效果</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-medium text-gray-900">速度形变</h4>
                  <p className="text-sm text-gray-600">快速拖拽会产生更明显的液体形变效果</p>
                </div>
              </div>
            </div>
            <div className="pt-4">
              <Space>
                <Button theme="primary" size="small">
                  查看代码示例
                </Button>
                <Button theme="default" variant="text" size="small">
                  API 文档
                </Button>
              </Space>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}