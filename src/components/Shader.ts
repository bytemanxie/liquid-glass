// 类型定义
interface UV {
  x: number;
  y: number;
}

interface Mouse {
  x: number;
  y: number;
}

interface TextureResult {
  type: 't';
  x: number;
  y: number;
}

type FragmentFunction = (uv: UV, mouse: Mouse) => TextureResult;

// 工具函数
function smoothStep(a: number, b: number, t: number): number {
  t = Math.max(0, Math.min(1, (t - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

function length(x: number, y: number): number {
  return Math.sqrt(x * x + y * y);
}

function roundedRectSDF(
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): number {
  const qx = Math.abs(x) - width + radius;
  const qy = Math.abs(y) - height + radius;
  return (
    Math.min(Math.max(qx, qy), 0) +
    length(Math.max(qx, 0), Math.max(qy, 0)) -
    radius
  );
}

function texture(x: number, y: number): TextureResult {
  return { type: 't', x, y };
}

function generateId(): string {
  return 'liquid-glass-' + Math.random().toString(36).substr(2, 9);
}

// 简化版Shader类 - 完全按照glass.js的方式
export class Shader {
  width: number;
  height: number;
  fragment: FragmentFunction;
  canvasDPI: number = 1;
  id: string;
  offset: number = 10;

  mouse: Mouse = { x: 0, y: 0 };
  mouseUsed: boolean = false;

  container!: HTMLDivElement;
  svg!: SVGSVGElement;
  canvas!: HTMLCanvasElement;
  context!: CanvasRenderingContext2D;
  feImage!: SVGFEImageElement;
  feDisplacementMap!: SVGFEDisplacementMapElement;

  constructor(options: {
    width: number;
    height: number;
    fragment: FragmentFunction;
    borderRadius?: number;
    draggable?: boolean;
    position?: string;
    initialPosition?: { x: number; y: number };
    enablePhysics?: boolean;
  }) {
    this.width = options.width;
    this.height = options.height;
    this.fragment = options.fragment;
    this.id = generateId();

    this.createElement(options);

    if (options.draggable !== false) {
      this.setupEventListeners();
    }

    this.updateShader();
  }

  createElement(options: {
    borderRadius?: number;
    position?: string;
    initialPosition?: { x: number; y: number };
    draggable?: boolean;
  }) {
    // 创建容器
    this.container = document.createElement('div');
    this.container.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: ${this.width}px;
      height: ${this.height}px;
      overflow: hidden;
      border-radius: ${options.borderRadius || 150}px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.25), 0 -10px 25px inset rgba(0, 0, 0, 0.15);
      cursor: grab;
      backdrop-filter: url(#${this.id}_filter) blur(0.25px) contrast(1.2) brightness(1.05) saturate(1.1);
      z-index: 9999;
      pointer-events: auto;
    `;

    // 设置初始位置
    if (options.initialPosition) {
      this.container.style.left = options.initialPosition.x + 'px';
      this.container.style.top = options.initialPosition.y + 'px';
      this.container.style.transform = 'none';
    }

    // 创建SVG滤镜
    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    this.svg.setAttribute('width', '0');
    this.svg.setAttribute('height', '0');
    this.svg.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      pointer-events: none;
      z-index: 9998;
    `;

    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const filter = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'filter'
    );
    filter.setAttribute('id', `${this.id}_filter`);
    filter.setAttribute('filterUnits', 'userSpaceOnUse');
    filter.setAttribute('colorInterpolationFilters', 'sRGB');
    filter.setAttribute('x', '0');
    filter.setAttribute('y', '0');
    filter.setAttribute('width', this.width.toString());
    filter.setAttribute('height', this.height.toString());

    this.feImage = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'feImage'
    );
    this.feImage.setAttribute('id', `${this.id}_map`);
    this.feImage.setAttribute('width', this.width.toString());
    this.feImage.setAttribute('height', this.height.toString());

    this.feDisplacementMap = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'feDisplacementMap'
    );
    this.feDisplacementMap.setAttribute('in', 'SourceGraphic');
    this.feDisplacementMap.setAttribute('in2', `${this.id}_map`);
    this.feDisplacementMap.setAttribute('xChannelSelector', 'R');
    this.feDisplacementMap.setAttribute('yChannelSelector', 'G');

    filter.appendChild(this.feImage);
    filter.appendChild(this.feDisplacementMap);
    defs.appendChild(filter);
    this.svg.appendChild(defs);

    // 创建Canvas（隐藏）
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.width * this.canvasDPI;
    this.canvas.height = this.height * this.canvasDPI;
    this.canvas.style.display = 'none';

    this.context = this.canvas.getContext('2d')!;
  }

  constrainPosition(x: number, y: number): { x: number; y: number } {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const minX = this.offset;
    const maxX = viewportWidth - this.width - this.offset;
    const minY = this.offset;
    const maxY = viewportHeight - this.height - this.offset;

    const constrainedX = Math.max(minX, Math.min(maxX, x));
    const constrainedY = Math.max(minY, Math.min(maxY, y));

    return { x: constrainedX, y: constrainedY };
  }

  setupEventListeners() {
    let isDragging = false;
    let startX: number, startY: number, initialX: number, initialY: number;

    this.container.addEventListener('mousedown', e => {
      isDragging = true;
      this.container.style.cursor = 'grabbing';
      startX = e.clientX;
      startY = e.clientY;
      const rect = this.container.getBoundingClientRect();
      initialX = rect.left;
      initialY = rect.top;
      e.preventDefault();
    });

    document.addEventListener('mousemove', e => {
      if (isDragging) {
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;

        const newX = initialX + deltaX;
        const newY = initialY + deltaY;

        const constrained = this.constrainPosition(newX, newY);

        this.container.style.left = constrained.x + 'px';
        this.container.style.top = constrained.y + 'px';
        this.container.style.transform = 'none';
      }

      // 更新鼠标位置
      const rect = this.container.getBoundingClientRect();
      this.mouse.x = (e.clientX - rect.left) / rect.width;
      this.mouse.y = (e.clientY - rect.top) / rect.height;

      // 关键：只有在鼠标被使用时才更新shader
      if (this.mouseUsed) {
        this.updateShader();
      }
    });

    document.addEventListener('mouseup', () => {
      isDragging = false;
      this.container.style.cursor = 'grab';
    });

    window.addEventListener('resize', () => {
      const rect = this.container.getBoundingClientRect();
      const constrained = this.constrainPosition(rect.left, rect.top);

      if (rect.left !== constrained.x || rect.top !== constrained.y) {
        this.container.style.left = constrained.x + 'px';
        this.container.style.top = constrained.y + 'px';
        this.container.style.transform = 'none';
      }
    });
  }

  appendTo(parent: HTMLElement) {
    parent.appendChild(this.svg);
    parent.appendChild(this.container);
  }

  // 完全按照glass.js的方式 - 最简单的实现
  updateShader() {
    const mouseProxy = new Proxy(this.mouse, {
      get: (target, prop) => {
        this.mouseUsed = true;
        return target[prop as keyof Mouse];
      },
    });

    this.mouseUsed = false;

    const w = this.width * this.canvasDPI;
    const h = this.height * this.canvasDPI;
    const data = new Uint8ClampedArray(w * h * 4);

    let maxScale = 0;
    const rawValues: number[] = [];

    for (let i = 0; i < data.length; i += 4) {
      const x = (i / 4) % w;
      const y = Math.floor(i / 4 / w);
      const pos = this.fragment({ x: x / w, y: y / h }, mouseProxy);
      const dx = pos.x * w - x;
      const dy = pos.y * h - y;
      maxScale = Math.max(maxScale, Math.abs(dx), Math.abs(dy));
      rawValues.push(dx, dy);
    }

    maxScale *= 0.5;

    let index = 0;
    for (let i = 0; i < data.length; i += 4) {
      const r = rawValues[index++] / maxScale + 0.5;
      const g = rawValues[index++] / maxScale + 0.5;
      data[i] = r * 255;
      data[i + 1] = g * 255;
      data[i + 2] = 0;
      data[i + 3] = 255;
    }

    this.context.putImageData(new ImageData(data, w, h), 0, 0);
    this.feImage.setAttributeNS(
      'http://www.w3.org/1999/xlink',
      'href',
      this.canvas.toDataURL()
    );
    this.feDisplacementMap.setAttribute(
      'scale',
      (maxScale / this.canvasDPI).toString()
    );
  }

  destroy() {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    if (this.svg && this.svg.parentNode) {
      this.svg.parentNode.removeChild(this.svg);
    }
  }
}

// 导出类型和工具函数
export type { UV, Mouse, TextureResult, FragmentFunction };
export { smoothStep, length, roundedRectSDF, texture, generateId };
