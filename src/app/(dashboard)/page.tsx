'use client';

import { Card, Button, Space } from 'tdesign-react';
import { InfoCircleIcon, BrowseIcon } from 'tdesign-icons-react';
import LiquidGlass, { presetFragments } from '@/components/LiquidGlass';

export default function HomePage() {
  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
          基础液体玻璃效果
        </h1>
        <p className="text-base text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          展示不同预设的基础液体玻璃效果，包括默认、强烈、交互和微妙四种风格
        </p>
      </div>

      {/* 效果展示区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 默认效果 */}
        <Card title="默认效果" bordered>
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-blue-600">
              <InfoCircleIcon />
              <span className="text-sm">平衡的波动和响应</span>
            </div>
            <div className="relative h-56 bg-gradient-to-br from-blue-400 to-purple-600 rounded-lg overflow-hidden">
              <LiquidGlass
                fragment={presetFragments.default}
                position="absolute"
                className="inset-0"
                draggable={true}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-white text-xl font-bold bg-black/20 px-4 py-2 rounded-lg backdrop-blur-sm">
                  默认效果
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* 强烈效果 */}
        <Card title="强烈效果" bordered>
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-red-600">
              <BrowseIcon />
              <span className="text-sm">更加明显的扭曲和波动</span>
            </div>
            <div className="relative h-56 bg-gradient-to-br from-red-400 to-orange-600 rounded-lg overflow-hidden">
              <LiquidGlass
                fragment={presetFragments.strong}
                position="absolute"
                className="inset-0"
                draggable={true}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-white text-xl font-bold bg-black/20 px-4 py-2 rounded-lg backdrop-blur-sm">
                  强烈效果
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* 交互效果 */}
        <Card title="交互效果" bordered>
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-green-600">
              <InfoCircleIcon />
              <span className="text-sm">响应鼠标移动的动态效果</span>
            </div>
            <div className="relative h-56 bg-gradient-to-br from-green-400 to-teal-600 rounded-lg overflow-hidden">
              <LiquidGlass
                fragment={presetFragments.interactive}
                position="absolute"
                className="inset-0"
                draggable={true}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-white text-xl font-bold bg-black/20 px-4 py-2 rounded-lg backdrop-blur-sm">
                  交互效果
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* 微妙效果 */}
        <Card title="微妙效果" bordered>
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-purple-600">
              <BrowseIcon />
              <span className="text-sm">轻微的波动，适合背景使用</span>
            </div>
            <div className="relative h-56 bg-gradient-to-br from-purple-400 to-pink-600 rounded-lg overflow-hidden">
              <LiquidGlass
                fragment={presetFragments.subtle}
                position="absolute"
                className="inset-0"
                draggable={true}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-white text-xl font-bold bg-black/20 px-4 py-2 rounded-lg backdrop-blur-sm">
                  微妙效果
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
} 