/*
 * @Author: Capsion 373704015@qq.com
 * @Date: 2026-06-18
 * @Description: 基于 Canvas 的气泡文字组件 — 纯 TypeScript，每个气泡零 DOM 节点。
 *   用单个 <canvas> + requestAnimationFrame 循环替代基于 DOM 的 bubble.ts。
 *   外部 API 与 BubbleText 保持一致，实现无缝替换。
 *
 * ============================================================================
 * 使用方式 / Usage
 * ============================================================================
 *
 * --- 方式一：通过 React 组件（推荐，与旧版 BubbleText 接口一致） ---
 *
 *   // 将 import 路径从 BubbleText 替换为 BubbleTextCanvas 即可，Props 完全兼容
 *   import Bubble from "@site/src/components/BubbleTextCanvas";
 *
 *   <Bubble
 *     input="Capsion"               // 文字内容（也支持图片 URL / base64）
 *     fontSize={160}                // 字号
 *     fontName="Arial"              // 字体
 *     fontWeight="bold"             // 字体粗细
 *     bubbleCount={10}              // 像素采样步长（值越大泡泡越稀疏，默认 10）
 *     bubbleSize={10}               // 气泡最大半径（CSS 像素，默认 10）
 *     opacity={0.8}                 // 基础透明度 0-1
 *     opacityMin={0.7}              // 透明度下限
 *     opacityMax={0.9}              // 透明度上限
 *     hoverGather={true}            // 鼠标悬停时聚合气泡
 *     autoSwitch={true}             // 自动切换聚合/扩散
 *     intervalTime={8000}           // 自动切换间隔（毫秒）
 *     canvasZIndex={999}            // Canvas 层级（Canvas 专属配置）
 *     floatAmplitudeRatio={0.4}     // 浮动幅度占半径比例（Canvas 专属）
 *     floatBasePeriod={4000}        // 完整正弦周期（毫秒，Canvas 专属）
 *     dprLimit={2}                  // devicePixelRatio 上限（Canvas 专属）
 *     offsetX={0}                   // X 轴偏移
 *     offsetY={0}                   // Y 轴偏移
 *     bubbleScale={1}               // 气泡缩放比例
 *     autoFit={true}                // 图片模式下自动适配尺寸
 *     DEBUG={false}                 // 开发调试模式
 *   />
 *
 *   注意：上层页面需要有以下 DOM 元素配合：
 *   - positionElementId（默认 "CpsBubble.positionElement"）：气泡聚合范围
 *   - disperseElementId（默认 "CpsBubble.disperseElement"）：气泡扩散范围
 *   - mountElementId（默认 "body"）：Canvas 挂载容器
 *
 * --- 方式二：直接使用 BubbleCanvas 类 ---
 *
 *   import { BubbleCanvas, BubbleCanvasProps, BubbleData } from "./bubbleCanvas";
 *
 *   const bubble = new BubbleCanvas({
 *     input: "Hello",
 *     positionElementId: "myPositionElement",
 *   });
 *
 *   // 手动控制
 *   bubble.gatherData();     // 聚合气泡形成文字
 *   bubble.disperseData();   // 扩散气泡
 *   bubble.switch();         // 切换聚合 ↔ 扩散
 *   bubble.updatePositions();// 窗口大小改变后重新计算位置
 *   bubble.gatherCenter();   // 聚合到中心并淡出
 *   bubble.destroy();        // 销毁实例，释放所有资源
 *
 *   // 状态查询
 *   bubble.isGathering;      // boolean — 当前是否处于聚合状态
 *
 * --- 方式三：替换旧版 BubbleText（无缝迁移） ---
 *
 *   旧版使用方式：
 *     import Bubble from "@site/src/components/BubbleText";
 *
 *   新版 Canvas 版只需改路径，Props 完全不变：
 *     import Bubble from "@site/src/components/BubbleTextCanvas";
 *
 *   关键差异（对调用方透明）：
 *   - 旧版：每个气泡一个 div → 大量 DOM 节点，CSS transition 动画
 *   - 新版：单个 <canvas> + requestAnimationFrame → 零 DOM 开销，JS 动画
 *   - 新版新增 Canvas 专属配置项：canvasZIndex / floatAmplitudeRatio /
 *     floatBasePeriod / dprLimit
 *   - 旧版的 engine / regionElementId 等 DOM 专属配置在新版中忽略
 *
 * ============================================================================
 * 文件结构
 * ============================================================================
 * - bubbleCanvas.ts  本文件 — BubbleCanvas 核心类（气泡数据、渲染循环、API）
 * - index.tsx         React 封装组件（useEffect 中实例化 + 销毁）
 * - utils.ts          工具函数（离屏 Canvas、颜色、图片加载、鼠标调试）
 * - bubble.ts         旧版 DOM 实现（保留兼容，可逐步废弃）
 * - bubble.css        旧版气泡样式（Canvas 版不需要）
 */
import * as utils from "./utils";
import { throttle } from "lodash";

// ============================================================================
// 类型定义
// ============================================================================

/** 二维坐标点（对应 utils.Point 元组） */
interface Pt {
  x: number;
  y: number;
}

/** 每个气泡粒子的运行时数据 */
export interface BubbleData {
  // --- 身份属性（创建时设定，之后不变） ---
  originX: number;       // 相对于 positionElement 的像素采样 X 坐标
  originY: number;       // 相对于 positionElement 的像素采样 Y 坐标
  radius: number;        // 圆形半径（CSS 像素）
  color: string;         // 颜色值，如 "rgb(200,180,220)"
  opacity: number;       // 透明度 0-1
  floatPhase: number;    // 浮动正弦波的相位偏移（毫秒）
  floatSpeed: number;    // 浮动速度倍率（0.5-1.5× 基础周期）
  floatDir: 1 | -1;      // 1 = 先向上，-1 = 先向下

  // --- 可变位置（过渡期间每帧更新） ---
  startX: number;        // 当前过渡开始时的文档 X 坐标
  startY: number;
  currentX: number;      // 实时插值后的文档 X 坐标
  currentY: number;
  targetX: number;       // 过渡目标位置（文档坐标）
  targetY: number;
}

/** 公开属性，与 BubbleProps 保持一致，调用方无需修改 */
const _DEFAULT_PROPS = {
  DEBUG: process.env.NODE_ENV === "development",

  // 元素 ID
  mountElementId: "body",
  positionElementId: "CpsBubble.positionElement",
  regionElementId: "CpsBubble.RegionElement",
  disperseElementId: "CpsBubble.disperseElement",

  // 内容
  input: "capsion",
  inputType: "text" as "text" | "image" | "base64" | "url" | "path",
  fontSize: 160,
  fontName: "Arial",
  fontWeight: "bold",

  // 布局
  offsetX: 0,
  offsetY: 0,
  bubbleScale: 1,
  autoFit: true,

  // 气泡外观
  bubbleCount: 10,       // 像素采样步长（值越大泡泡越稀疏）
  bubbleSize: 10,        // 最大半径（CSS 像素）
  opacity: 0.8,
  opacityMax: 0.9,
  opacityMin: 0.7,

  // 行为
  intervalTime: 8000,
  autoSwitch: true,
  hoverGather: true,

  // ---- Canvas 专属配置项 ----
  canvasZIndex: 999,
  floatAmplitudeRatio: 0.4,  // 浮动幅度占半径的比例（与 CSS 40% 一致）
  floatBasePeriod: 4000,     // 完整正弦周期时长（毫秒）
  dprLimit: 2,               // devicePixelRatio 上限，兼顾性能
};

export type BubbleCanvasProps = Partial<typeof _DEFAULT_PROPS>;

// ============================================================================
// 常量
// ============================================================================

const TRANSITION_DURATION = 800; // 毫秒 — 需与 CSS transition 保持一致
const DEFAULT_DELAY = 12000;     // 毫秒 — 用于随机化（与 DOM 版本一致）

// ============================================================================
// 缓动函数与数学工具（内联以保持文件自包含）
// ============================================================================

/** 用 ease-in-out-cubic 近似 cubic-bezier(0.4, 0, 0.2, 1) */
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

function randRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

// ============================================================================
// BubbleCanvas 类
// ============================================================================

export class BubbleCanvas {
  // ---- 公开属性（与 BubbleText API 兼容） ----
  public isGathering = true;

  // ---- 配置 ----
  private props: Required<BubbleCanvasProps>;

  // ---- Canvas ----
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;

  // ---- 数据 ----
  /** 原始像素采样点（相对于 positionElement） */
  private pointArray: (Pt & { r: number })[] = [];
  private bubbleDataList: BubbleData[] = [];

  // ---- DOM 引用 ----
  private positionElement!: HTMLElement;
  private mountElement!: HTMLElement;

  // ---- 动画状态 ----
  private rafId = 0;
  private animationStartTime = 0;   // 动画循环启动时间戳
  private transitionStartTime = 0;  // 最近一次 gather/disperse 调用时间戳
  private isTransitioning = false;
  private isGather = true;
  private isPageVisible = true;

  // ---- 尺寸 ----
  private baseWidth = 0;
  private baseHeight = 0;
  private offscreenCanvas!: OffscreenCanvas;
  private bubbleSizeMin = 0;
  private bubbleSizeMax = 0;

  // ---- 观察器 / 定时器 ----
  private observerSize!: ResizeObserver;
  private resizeGatherTimeoutID?: ReturnType<typeof setTimeout>;
  private autoSwitchInterval?: ReturnType<typeof setInterval>;

  // ==========================================================================
  // 构造函数与初始化
  // ==========================================================================

  constructor(props: BubbleCanvasProps) {
    this.props = { ..._DEFAULT_PROPS, ...props } as Required<BubbleCanvasProps>;
    this.bubbleSizeMin = this.props.bubbleSize * 0.5;
    this.bubbleSizeMax = this.props.bubbleSize;

    if (this.props.DEBUG) console.log("BubbleCanvas constructor");
    this.init();
  }

  // ==========================================================================
  // 调试（兼容旧版）
  // ==========================================================================

  public test = () => {
    const btn1 = document.createElement("button");
    btn1.innerText = "切换(Canvas)";
    btn1.onclick = () => this.switch();
    this.positionElement.appendChild(btn1);

    const btn2 = document.createElement("button");
    btn2.innerText = "destroy(Canvas)";
    btn2.onclick = () => this.destroy();
    this.positionElement.appendChild(btn2);
  };

  // ==========================================================================
  // 初始化
  // ==========================================================================

  public init = () => {
    this.elementInit();
    this.eventInit();

    requestAnimationFrame(() => {
      setTimeout(() => {
        this.createPointData(this.baseWidth, this.baseHeight);
        if (this.props.DEBUG) this.test();
      }, 1000);
    });

    return this;
  };

  /** 定位 DOM 元素，测量 positionElement，创建并挂载 Canvas */
  private elementInit = () => {
    const errMsg = "BubbleCanvas: init() 未找到定位元素: positionElement";
    this.positionElement = document.getElementById(this.props.positionElementId)!;
    if (!this.positionElement) {
      console.error(errMsg);
      throw new Error(errMsg);
    }

    const rect = this.positionElement.getBoundingClientRect();
    if (this.props.DEBUG) console.log("初始化 rect: ", rect);
    this.baseWidth = Math.floor(rect.width);
    this.baseHeight = Math.floor(rect.height);

    this.offscreenCanvas = new OffscreenCanvas(this.baseWidth, this.baseHeight);

    // 创建全视口 Canvas
    this.canvas = this.createCanvas();

    // 挂载
    if (this.props.mountElementId === "body") {
      this.mountElement = document.body;
    } else {
      this.mountElement = document.getElementById(this.props.mountElementId)!;
      if (!this.mountElement) throw new Error(`BubbleCanvas: 未找到挂载元素 "${this.props.mountElementId}"`);
    }
    this.mountElement.appendChild(this.canvas);
  };

  /** 创建覆盖整个视口的 <canvas> 元素 */
  private createCanvas(): HTMLCanvasElement {
    const canvas = document.createElement("canvas");
    canvas.id = "CpsBubbleCanvas";
    Object.assign(canvas.style, {
      position: "fixed",
      top: "0",
      left: "0",
      width: "100vw",
      height: "100vh",
      pointerEvents: "none",
      zIndex: String(this.props.canvasZIndex),
    });

    const dpr = this.getDPR();
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;

    const ctx = canvas.getContext("2d")!;
    if (!ctx) throw new Error("BubbleCanvas: 无法获取 2d 上下文");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // 以 CSS 像素为单位绘制
    this.ctx = ctx;

    return canvas;
  }

  private getDPR(): number {
    return Math.min(window.devicePixelRatio || 1, this.props.dprLimit);
  }

  /** 绑定 resize / hover / visibility 事件监听 */
  private eventInit = () => {
    // 监听 positionElement 尺寸变化
    this.observerSize = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (this.props.DEBUG) {
          console.log(`positionElement 尺寸: ${entry.contentRect.width}x${entry.contentRect.height}`);
        }
      }
    });
    this.observerSize.observe(this.positionElement);

    // 窗口大小改变 → 短暂防抖后重新聚合
    window.addEventListener("resize", this.onRise);

    // 悬停 → 聚合 / 扩散
    if (this.props.hoverGather) {
      this.positionElement.addEventListener("mouseenter", this.gatherData);
      this.positionElement.addEventListener("mouseleave", this.disperseData);
    }

    // 自动切换定时器
    if (this.props.autoSwitch) {
      this.autoSwitchInterval = setInterval(() => {
        this.switch();
      }, this.props.intervalTime);
    }

    // 页面切后台时暂停 RAF
    document.addEventListener("visibilitychange", this.handleVisibilityChange);
  };

  // ==========================================================================
  // 数据管线（文本 / 图片 → 像素 → BubbleData[]）
  // ==========================================================================

  private createPointData = async (width: number, height: number) => {
    if (this.props.DEBUG) console.log("触发 createPointData");
    width = Math.floor(width);
    height = Math.floor(height);

    const input = this.props.input;
    let data: Uint8ClampedArray;

    const { ctx } = utils.resetOffscreenCanvas(this.offscreenCanvas);

    if (utils.isBase64(input) || utils.isUrl(input) || utils.isRelativePath(input)) {
      const img = await utils.loadImage(input);
      if (!img) throw new Error(`[图片加载失败] 无效的图片地址: ${input}`);
      data = await this.renderImageToImageData(img, width, height, ctx);
    } else if (utils.isString(input)) {
      if (this.props.DEBUG) console.log("输入为纯文本");
      data = await this.renderTextToImageData(input, width, height);
    } else {
      throw new Error("不支持的输入类型");
    }

    this.createBubbleData(data, width, height);
  };

  private renderImageToImageData = (
    img: HTMLImageElement,
    width: number,
    height: number,
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  ): Promise<Uint8ClampedArray> => {
    return new Promise((resolve, reject) => {
      const draw = () => {
        if (this.props.DEBUG) console.log("图片尺寸: ", img.width, img.height);
        try {
          const { drawWidth, drawHeight } = utils.fitImageSize(
            img.naturalWidth, img.naturalHeight, width, height, this.props.autoFit,
          );
          const offsetX = Math.floor((width - drawWidth) / 2);
          const offsetY = Math.floor((height - drawHeight) / 2);

          if (this.props.DEBUG) {
            console.log("绘制尺寸: ", drawWidth, drawHeight);
            console.log("绘制偏移: ", offsetX, offsetY);
          }

          ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, drawWidth, drawHeight);
          const pixelData = ctx.getImageData(0, 0, width, height).data;
          resolve(pixelData);
        } catch (error) {
          reject("图片数据加载失败");
        }
      };

      if (img.complete && img.naturalWidth !== 0) {
        draw();
      } else {
        img.onload = draw;
        img.onerror = () => reject("图片加载失败");
      }
    });
  };

  private renderTextToImageData = async (text: string, width: number, height: number): Promise<Uint8ClampedArray> => {
    const { ctx } = utils.resetOffscreenCanvas(this.offscreenCanvas);
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `${this.props.fontWeight} ${this.props.fontSize}px ${this.props.fontName}`;
    ctx.fillText(text, width / 2, height / 2);
    return ctx.getImageData(0, 0, width, height).data;
  };

  // ==========================================================================
  // 气泡数据创建（替代旧版 createBubble DOM 工厂方法）
  // ==========================================================================

  private createBubbleData = (pixelData: Uint8ClampedArray, w: number, h: number) => {
    this.clearAllBubbles();

    if (this.props.DEBUG) console.log("触发 createBubbleData");

    const step = this.props.bubbleCount;
    const bubbleScale = this.props.bubbleScale;
    const sizeMin = this.bubbleSizeMin * bubbleScale;
    const sizeMax = this.bubbleSizeMax * bubbleScale;

    // 采集像素采样点
    this.pointArray = [];
    for (let i = 0; i < w; i += step) {
      for (let j = 0; j < h; j += step) {
        if (pixelData[(i + j * w) * 4 + 3] > 150) {
          this.pointArray.push({ x: i, y: j, r: 0 });
        }
      }
    }

    if (this.props.DEBUG) console.log(`采样到 ${this.pointArray.length} 个像素点`);

    // 计算初始文档坐标位置
    const rect = this.positionElement.getBoundingClientRect();
    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;
    const originLeft = rect.left + scrollX + this.props.offsetX;
    const originTop = rect.top + scrollY + this.props.offsetY;

    this.bubbleDataList = this.pointArray.map((pt, i) => {
      const r = randRange(sizeMin, sizeMax);
      pt.r = r; // 回存到 pointArray 以保持向后兼容

      const opacity = randRange(this.props.opacityMin, this.props.opacityMax);
      const delay = Math.floor(randRange(0, DEFAULT_DELAY / 3));
      const start = DEFAULT_DELAY / 2 - delay;

      // 文档坐标
      const docX = originLeft + pt.x;
      const docY = originTop + pt.y;

      return {
        originX: pt.x,
        originY: pt.y,
        radius: r,
        color: utils.getRandomColor(),
        opacity,
        floatPhase: delay,                          // 随机初始相位（毫秒）
        floatSpeed: 0.6 + Math.random() * 0.9,      // 0.6 – 1.5 倍基础周期
        floatDir: (i % 2 === 0 ? 1 : -1) as 1 | -1,
        startX: docX,
        startY: docY,
        currentX: docX,
        currentY: docY,
        targetX: docX,
        targetY: docY,
      } satisfies BubbleData;
    });

    this.isGather = true;
    this.isGathering = true;

    // 启动渲染循环
    this.startRenderLoop();
  };

  private clearAllBubbles = () => {
    this.bubbleDataList = [];
    this.pointArray = [];
    this.isTransitioning = false;
  };

  // ==========================================================================
  // 渲染循环
  // ==========================================================================

  private startRenderLoop = () => {
    if (this.rafId) return; // 已在运行中
    this.animationStartTime = performance.now();
    this.rafId = requestAnimationFrame(this.renderFrame);
  };

  private stopRenderLoop = () => {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = 0;
    }
  };

  private renderFrame = (timestamp: number) => {
    if (!this.rafId) return; // 已停止

    // --- 过渡进度 ---
    let progress = 1;
    let eased = 1;
    if (this.isTransitioning) {
      const elapsed = timestamp - this.transitionStartTime;
      progress = clamp(elapsed / TRANSITION_DURATION, 0, 1);
      eased = easeInOutCubic(progress);
      if (progress >= 1) {
        this.isTransitioning = false;
      }
    }

    // --- 更新位置 ---
    const floatElapsed = timestamp - this.animationStartTime;
    const basePeriod = this.props.floatBasePeriod;
    const ampRatio = this.props.floatAmplitudeRatio;
    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;

    for (const b of this.bubbleDataList) {
      // 向目标位置插值（仅在过渡期间）
      if (this.isTransitioning && progress < 1) {
        b.currentX = lerp(b.startX, b.targetX, eased);
        b.currentY = lerp(b.startY, b.targetY, eased);
      } else if (!this.isTransitioning) {
        // 过渡完成后直接吸附到目标位置
        b.currentX = b.targetX;
        b.currentY = b.targetY;
      }
      // 否则：transitioning 且 progress >= 1 — 下一帧由 !isTransitioning 分支处理
    }

    // --- 绘制 ---
    const dpr = this.getDPR();
    const ctx = this.ctx;
    const cw = this.canvas.width / dpr;   // CSS 像素宽度
    const ch = this.canvas.height / dpr;

    ctx.clearRect(0, 0, cw, ch);

    for (const b of this.bubbleDataList) {
      // 浮动偏移（正弦波，每个气泡独立的速度/相位/方向）
      const floatRad = ((floatElapsed * b.floatSpeed + b.floatPhase) / basePeriod) * Math.PI * 2;
      const floatY = Math.sin(floatRad) * ampRatio * b.radius * b.floatDir;

      // 文档坐标 → Canvas（视口）坐标转换
      const cx = b.currentX - scrollX;
      const cy = b.currentY - scrollY + floatY;

      // 跳过屏幕外的气泡
      if (cx + b.radius < -50 || cx - b.radius > cw + 50 ||
          cy + b.radius < -50 || cy - b.radius > ch + 50) {
        continue;
      }

      this.drawBubble(ctx, cx, cy, b.radius, b);
    }

    // 继续循环
    this.rafId = requestAnimationFrame(this.renderFrame);
  };

  // ==========================================================================
  // 气泡绘制（CSS 效果的 Canvas 实现）
  // ==========================================================================

  /**
   * 在 (x, y) 位置绘制半径为 r 的单个气泡。
   *
   * CSS 参考（bubble.css）：
   *   .wrapper { bg: rgb(253 186 116 / 0.1); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
   *   .inner   { radial-gradient(circle at 75% 30%, #fff 5px, …, …); 多层内阴影; }
   *
   * 我们模拟关键的视觉层次：
   *   1. 柔和投影
   *   2. 径向渐变主体（颜色来自 BubbleData.color）
   *   3. 右上角小高光点
   */
  private drawBubble(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    r: number,
    bubble: BubbleData,
  ) {
    ctx.save();
    ctx.globalAlpha = bubble.opacity;

    // --- 第 1 层：投影（对应 wrapper box-shadow） ---
    ctx.shadowColor = "rgba(0, 0, 0, 0.1)";
    ctx.shadowBlur = 6;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 4;

    // --- 第 2 层：主体径向渐变 ---
    // CSS: circle at 75% 30% → 渐变中心偏右上
    const gx = x - r * 0.25; // 直径的 75% = 中心 + 0.25r 向右 → 故左移 0.25r
    const gy = y - r * 0.4;  // 直径的 30% = 中心 - 0.4r → 上移

    const grad = ctx.createRadialGradient(gx, gy, r * 0.02, x, y, r);
    grad.addColorStop(0, "#fff");
    grad.addColorStop(0.08, bubble.color);
    grad.addColorStop(0.6, "#2a2a2a");   // 深色中间环（模拟 #5b5b5b）
    grad.addColorStop(1, bubble.color);

    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // 重置阴影，避免影响后续绘制
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // --- 第 3 层：外发光（对应 CSS 0 0 90px #fff） ---
    ctx.beginPath();
    ctx.arc(x, y, r * 1.15, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255, 255, 255, 0.06)";
    ctx.fill();

    // --- 第 4 层：高光点（模拟内阴影高光） ---
    const hx = x - r * 0.28;
    const hy = y - r * 0.35;
    const hg = ctx.createRadialGradient(hx, hy, 0, hx, hy, r * 0.45);
    hg.addColorStop(0, "rgba(255, 255, 255, 0.5)");
    hg.addColorStop(1, "rgba(255, 255, 255, 0)");

    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = hg;
    ctx.fill();

    ctx.restore();
  }

  // ==========================================================================
  // 公开 API — 位置管理
  // ==========================================================================

  /**
   * 聚合气泡，形成文字/图片的轮廓形状。
   * 使用 throttle 节流，与 CSS transition 时长保持一致。
   */
  public gatherData = throttle(() => {
    if (!this.positionElement) return;

    const rect = this.positionElement.getBoundingClientRect();
    const currentWidth = Math.floor(rect.width);
    const currentHeight = Math.floor(rect.height);
    const scaleX = currentWidth / this.baseWidth;
    const scaleY = currentHeight / this.baseHeight;

    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;
    const originLeft = rect.left + scrollX + this.props.offsetX;
    const originTop = rect.top + scrollY + this.props.offsetY;

    if (this.props.DEBUG) {
      console.log("gatherData rect:", rect);
      console.log("baseWidth/Height:", this.baseWidth, this.baseHeight);
      console.log("scaleX/Y:", scaleX, scaleY);
      console.log("originLeft/Top:", originLeft, originTop);
    }

    for (let i = 0; i < this.bubbleDataList.length; i++) {
      const b = this.bubbleDataList[i];
      const pt = this.pointArray[i];
      if (!pt) continue;

      // 记录当前位置作为过渡起点
      b.startX = b.currentX;
      b.startY = b.currentY;

      // 计算新的目标文档位置
      b.targetX = originLeft + pt.x * scaleX;
      b.targetY = originTop + pt.y * scaleY;
    }

    this.transitionStartTime = performance.now();
    this.isTransitioning = true;
    this.isGather = true;
    this.isGathering = true;
  }, TRANSITION_DURATION);

  /**
   * 扩散气泡，在 disperseElement 范围内随机分布。
   * 使用 throttle 节流，与 CSS transition 时长保持一致。
   */
  public disperseData = throttle(() => {
    const disperseElement = document.getElementById(this.props.disperseElementId);
    if (!disperseElement) {
      console.warn("BubbleCanvas: 无法获取 disperseElement");
      return;
    }

    const sideRect = disperseElement.getBoundingClientRect();
    const bubbleMaxR = this.bubbleSizeMax * this.props.bubbleScale;

    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;

    // 文档坐标下的安全边界（向内收缩一个气泡半径的距离）
    const safeLeft = sideRect.left + scrollX + bubbleMaxR;
    const safeRight = sideRect.right + scrollX - bubbleMaxR;
    const safeTop = sideRect.top + scrollY + bubbleMaxR;
    const safeBottom = sideRect.bottom + scrollY - bubbleMaxR;

    const randomDocX = () => safeLeft + Math.random() * Math.max(0, safeRight - safeLeft);
    const randomDocY = () => safeTop + Math.random() * Math.max(0, safeBottom - safeTop);

    for (const b of this.bubbleDataList) {
      // 记录当前位置作为过渡起点
      b.startX = b.currentX;
      b.startY = b.currentY;

      let docX = randomDocX();
      let docY = randomDocY();

      // 兜底：如果边界塌缩，使用中心点
      if (safeRight <= safeLeft || safeBottom <= safeTop) {
        docX = (safeLeft + safeRight) / 2;
        docY = (safeTop + safeBottom) / 2;
      }

      b.targetX = docX;
      b.targetY = docY;
    }

    this.transitionStartTime = performance.now();
    this.isTransitioning = true;
    this.isGather = false;
    this.isGathering = false;
  }, TRANSITION_DURATION);

  /** 切换聚合 ↔ 扩散 */
  public switch = throttle(
    () => (this.isGather ? this.disperseData() : this.gatherData()),
    TRANSITION_DURATION * 1.1,
  );

  /** 聚合到中心并淡出（API 兼容） */
  public gatherCenter = () => {
    for (const b of this.bubbleDataList) {
      b.startX = b.currentX;
      b.startY = b.currentY;
      b.targetX = b.targetX;  // 保持目标位置不变，但淡出
      b.targetY = b.targetY;
      b.opacity = 0;
    }
  };

  /**
   * 窗口 resize 时调用，防抖后重新聚合。
   */
  public onRise = throttle(() => this.updatePositions(), 200);

  /**
   * 根据当前 positionElement 的 rect 重新计算气泡位置。
   */
  public updatePositions = () => {
    if (this.props.DEBUG) console.log("触发 updatePositions");
    if (this.resizeGatherTimeoutID) clearTimeout(this.resizeGatherTimeoutID);

    // 更新 Canvas 尺寸
    this.resizeCanvas();

    this.resizeGatherTimeoutID = setTimeout(() => {
      this.gatherData();
    }, 500);
  };

  /** 根据视口和 DPR 调整 Canvas 尺寸 */
  private resizeCanvas = () => {
    const dpr = this.getDPR();
    this.canvas.width = window.innerWidth * dpr;
    this.canvas.height = window.innerHeight * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  // ==========================================================================
  // 页面可见性处理
  // ==========================================================================

  private handleVisibilityChange = () => {
    this.isPageVisible = !document.hidden;
    if (this.isPageVisible) {
      // 页面可见时重启渲染循环
      this.startRenderLoop();
    } else {
      // 页面隐藏时暂停以节省 CPU
      this.stopRenderLoop();
    }
  };

  // ==========================================================================
  // 销毁
  // ==========================================================================

  public destroy = () => {
    try {
      if (this.props.DEBUG) console.log("destroy::start");

      // 停止动画
      this.stopRenderLoop();

      // 清空数据
      this.clearAllBubbles();

      // 移除事件监听
      window.removeEventListener("resize", this.onRise);
      document.removeEventListener("visibilitychange", this.handleVisibilityChange);

      if (this.observerSize) this.observerSize.disconnect();
      if (this.resizeGatherTimeoutID) clearTimeout(this.resizeGatherTimeoutID);
      if (this.autoSwitchInterval) clearInterval(this.autoSwitchInterval);

      // 移除悬停监听
      if (this.positionElement) {
        this.positionElement.removeEventListener("mouseenter", this.gatherData);
        this.positionElement.removeEventListener("mouseleave", this.disperseData);
      }

      // 从 DOM 中移除 Canvas
      if (this.canvas && this.canvas.parentNode) {
        this.canvas.parentNode.removeChild(this.canvas);
      }

      // 清理 OffscreenCanvas
      if (this.offscreenCanvas) {
        this.offscreenCanvas.getContext("2d")?.clearRect(0, 0, this.offscreenCanvas.width, this.offscreenCanvas.height);
      }

      // 清空引用
      (this as any).canvas = null;
      (this as any).ctx = null;
      (this as any).positionElement = null;
      (this as any).mountElement = null;
      (this as any).offscreenCanvas = null;

      if (this.props.DEBUG) console.log("destroy::end");
    } catch (err) {
      console.error("destroy::err", err);
    }
  };
}

export default BubbleCanvas;
