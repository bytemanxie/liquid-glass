'use client';

import { useState } from 'react';
import { Layout, Button, Drawer } from 'tdesign-react';
import { ViewModuleIcon, LayersIcon, ControlPlatformIcon, MenuIcon } from 'tdesign-icons-react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

const { Header, Content } = Layout;

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [drawerVisible, setDrawerVisible] = useState(false);

  const menuItems = [
    {
      value: '/',
      label: '基础效果',
      icon: <ViewModuleIcon />,
      description: '展示基础的液体玻璃效果'
    },
    {
      value: '/enhanced',
      label: '物理效果',
      icon: <LayersIcon />,
      description: '增强的物理液体效果'
    },
    {
      value: '/playground',
      label: '效果实验室',
      icon: <ControlPlatformIcon />,
      description: '自定义和实验各种效果'
    },
    {
      value: '/tabbar',
      label: 'Tab栏滤镜',
      icon: <ViewModuleIcon />,
      description: 'iOS风格的液态玻璃Tab栏效果'
    }
  ];

  const handleLinkClick = () => {
    setDrawerVisible(false);
  };


  const DesktopNavigation = () => (
    <nav className="hidden md:flex items-center space-x-6">
      {menuItems.map((item) => (
        <Link
          key={item.value}
          href={item.value}
          className={`
            flex items-center space-x-2 px-3 py-2 rounded-lg 
            transition-colors duration-200 no-underline
            ${pathname === item.value 
              ? 'text-blue-600 dark:text-blue-400 font-semibold' 
              : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
            }
          `}
          onClick={handleLinkClick}
        >
          <span className="text-lg">
            {item.icon}
          </span>
          <span className="font-medium">
            {item.label}
          </span>
        </Link>
      ))}
    </nav>
  );

  const MobileMenuContent = () => (
    <div className="space-y-2 p-4">
      {menuItems.map((item) => (
        <Link
          key={item.value}
          href={item.value}
          className={`
            block rounded-lg p-4 transition-colors duration-200 no-underline
            ${pathname === item.value 
              ? 'bg-blue-50 dark:bg-blue-900/20 border-l-3 border-blue-500' 
              : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
            }
          `}
          onClick={handleLinkClick}
        >
          <div className="flex items-center space-x-3">
            <div className={`
              text-xl
              ${pathname === item.value 
                ? 'text-blue-600 dark:text-blue-400' 
                : 'text-gray-600 dark:text-gray-400'
              }
            `}>
              {item.icon}
            </div>
            <div className="flex-1">
              <div className={`
                font-medium
                ${pathname === item.value 
                  ? 'text-blue-900 dark:text-blue-200' 
                  : 'text-gray-900 dark:text-gray-100'
                }
              `}>
                {item.label}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {item.description}
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );

  return (
    <Layout className="min-h-screen">
      {/* 顶部导航栏 */}
      <Header className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-teal-500/10 backdrop-blur-md dark:border-gray-700/50 px-6 py-4 relative">
        {/* 玻璃效果背景层 */}
        <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md"></div>
        
        <div className="max-w-7xl mx-auto flex items-center justify-between relative z-10">
          {/* Logo和标题 */}
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent">
              Liquid Glass
            </h1>
          </div>

          {/* 桌面端导航 */}
          <DesktopNavigation />

          {/* 移动端菜单按钮 */}
          <Button 
            className="md:hidden"
            variant="text" 
            size="small"
            onClick={() => setDrawerVisible(true)}
          >
            <MenuIcon className="text-gray-700 dark:text-gray-300" />
          </Button>
        </div>
      </Header>

      {/* 移动端抽屉菜单 */}
      <Drawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        header="导航菜单"
        size="medium"
        placement="left"
      >
        <MobileMenuContent />
      </Drawer>

      {/* 主内容区域 */}
      <Content className="bg-gray-50 dark:bg-gray-800 min-h-screen">
        <div className="max-w-7xl mx-auto p-6">
          {children}
        </div>
      </Content>
    </Layout>
  );
}