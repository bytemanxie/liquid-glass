'use client'

import styled from 'styled-components';
import { useEffect } from 'react';

// 容器样式
const PageContainer = styled.div`
  font-family: 'Arial', sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  margin: 0.5rem;
  padding: 1rem;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  text-align: center;
  color: white;
  margin-bottom: 40px;
  
  h1 {
    font-size: 2.5em;
    margin-bottom: 10px;
    font-weight: 300;
  }
  
  p {
    font-size: 1.1em;
    opacity: 0.9;
  }
`;

const DemoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 15px;
  margin-bottom: 20px;
`;

const DemoCard = styled.div<{ bgImage: string }>`
  position: relative;
  height: 200px;
  border-radius: 10px;
  overflow: hidden;
  background-image: url(${props => props.bgImage});
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
`;

// SVG滤镜容器
const SVGContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 0;
  height: 0;
  pointer-events: none;
  z-index: -1;
`;

// 玻璃面板基础样式
const GlassPanel = styled.div`
  padding: 30px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  text-align: center;
  max-width: 280px;
  position: relative;
  
  h3 {
    margin-bottom: 15px;
    font-size: 1.4em;
  }
  
  p {
    font-size: 0.9em;
    opacity: 0.9;
    line-height: 1.4;
  }
`;

// 测试 backdrop-filter 使用 url() 语法
const URLBackdropPanel = styled(GlassPanel)`
  backdrop-filter: url(#turbulence-filter) blur(5px) contrast(2) brightness(1.5) saturate(2);
  -webkit-backdrop-filter: url(#turbulence-filter) blur(5px) contrast(2) brightness(1.5) saturate(2);
  background: rgba(255, 255, 255, 0.3);
  border: 3px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
`;

const CodeSection = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
  padding: 30px;
  margin-top: 40px;
  
  h2 {
    color: #333;
    margin-bottom: 20px;
    text-align: center;
  }
`;

const CodeExample = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  border-left: 4px solid #667eea;
  
  h4 {
    color: #333;
    margin-bottom: 10px;
  }
  
  code {
    display: block;
    background: #e9ecef;
    padding: 10px;
    border-radius: 5px;
    font-family: 'Courier New', monospace;
    color: #495057;
    overflow-x: auto;
    white-space: pre-wrap;
  }
`;

const WarningBanner = styled.div`
  background: #ffc107;
  color: #856404;
  padding: 15px;
  border-radius: 5px;
  margin-bottom: 20px;
  text-align: center;
  
  strong {
    font-weight: bold;
  }
`;

export default function SVGFilterDemo() {
  useEffect(() => {
    // 检查浏览器支持情况
    console.log('SVG 滤镜 + backdrop-filter 演示页面已加载');
    
    // 检查 backdrop-filter 支持
    const testElement = document.createElement('div');
    testElement.style.backdropFilter = 'blur(1px)';
    
    if (!testElement.style.backdropFilter && !(testElement.style as any).webkitBackdropFilter) {
      console.warn('浏览器可能不支持 backdrop-filter');
    }

    // 日志输出 SVG 滤镜信息
    console.log('已定义的 SVG 滤镜：');
    console.log('- turbulence-filter: 湍流噪声效果');
    console.log('- displacement-filter: 位移扭曲效果');
    console.log('- morphology-filter: 形态学变换效果');
    console.log('- composite-filter: 复合效果');
  }, []);

  return (
    <PageContainer>
      {/* SVG 滤镜定义 */}
      <SVGContainer>
        <svg>
          <defs>
            {/* 超猛烈扭曲滤镜 */}
            <filter id="turbulence-filter" x="-100%" y="-100%" width="300%" height="300%">
              <feTurbulence baseFrequency="0.1 0.05" numOctaves="6" result="turbulence1"/>
              <feDisplacementMap in="SourceGraphic" in2="turbulence1" scale="50" result="displaced1"/>
              <feTurbulence baseFrequency="0.05 0.02" numOctaves="8" result="turbulence2"/>
              <feDisplacementMap in="displaced1" in2="turbulence2" scale="80" result="displaced2"/>
              <feGaussianBlur in="displaced2" stdDeviation="2"/>
              <feColorMatrix type="saturate" values="2"/>
            </filter>

            {/* 增强的位移扭曲滤镜 */}
            <filter id="displacement-filter" x="-50%" y="-50%" width="200%" height="200%">
              <feTurbulence baseFrequency="0.1 0.05" numOctaves="3" result="noise"/>
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="15"/>
              <feGaussianBlur stdDeviation="1"/>
            </filter>

            {/* 增强的形态学滤镜 */}
            <filter id="morphology-filter" x="-30%" y="-30%" width="160%" height="160%">
              <feMorphology operator="dilate" radius="2"/>
              <feGaussianBlur stdDeviation="1.5"/>
              <feColorMatrix type="saturate" values="1.5"/>
              <feOffset dx="1" dy="1"/>
            </filter>

            {/* 增强的复合效果滤镜 */}
            <filter id="composite-filter" x="-50%" y="-50%" width="200%" height="200%">
              <feTurbulence baseFrequency="0.08 0.04" numOctaves="5" result="turbulence"/>
              <feDisplacementMap in="SourceGraphic" in2="turbulence" scale="10" result="displaced"/>
              <feGaussianBlur in="displaced" stdDeviation="1.2" result="blurred"/>
              <feColorMatrix in="blurred" type="matrix" 
                  values="1.2 0 0 0 0.05
                          0 1.2 0 0 0.05  
                          0 0 1.3 0 0.05
                          0 0 0 1 0"/>
              <feOffset dx="2" dy="2"/>
            </filter>
          </defs>
        </svg>
      </SVGContainer>

      <Container>
        <DemoGrid>
          <DemoCard bgImage="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80">
            <URLBackdropPanel>
              <h3>🌊 backdrop-filter URL 语法测试</h3>
              <p>超强扭曲效果 - 测试 backdrop-filter: url(#filter) 是否有效</p>
            </URLBackdropPanel>
          </DemoCard>
        </DemoGrid>

        <CodeSection>

          <CodeExample>
            <code>{`
/* SVG 超强扭曲滤镜 */
<filter id="turbulence-filter" x="-100%" y="-100%" width="300%" height="300%">
    <feTurbulence baseFrequency="0.1 0.05" numOctaves="6" result="turbulence1"/>
    <feDisplacementMap in="SourceGraphic" in2="turbulence1" scale="50" result="displaced1"/>
    <feTurbulence baseFrequency="0.05 0.02" numOctaves="8" result="turbulence2"/>
    <feDisplacementMap in="displaced1" in2="turbulence2" scale="80" result="displaced2"/>
    <feGaussianBlur in="displaced2" stdDeviation="2"/>
    <feColorMatrix type="saturate" values="2"/>
</filter>`}</code>
          </CodeExample>
        </CodeSection>
      </Container>
    </PageContainer>
  );
} 