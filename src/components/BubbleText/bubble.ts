import * as utils from "./utils";
import { throttle, debounce } from "lodash";

export interface Point {
    x: number;
    y: number;
}

const _DEFAULT_PROPS = {
    DEBUG: process.env.NODE_ENV === "development", // 是否开启调试模式
    mountElementId: "body",
    positionElementId: "CpsBubble.positionElement", // 用于定位的元素id，泡泡文字会在这个元素的范围内生成
    regionElementId: "CpsBubble.RegionElement",
    disperseElementId: "CpsBubble.disperseElement",

    input: "capsion",
    fontSize: 160,
    fontName: "Arial",
    fontWeight: "bold",
    offsetX: 0,
    offsetY: 0,
    bubbleScale: 1,
    bubbleCount: 10,
    bubbleSizeMin: 5,
    bubbleSizeMax: 15,
    intervalTime: 8000, // 泡泡往复的时间，这里需要重构
    opacity: 0.8,
    opacityMax: 0.9,
    opacityMin: 0.7,
    autoSwitch: true,
    hoverGather: true,
    engine: "dom" as "dom" | "canvas" | "svg",
};

export type BubbleProps = Partial<typeof _DEFAULT_PROPS>;

const bubbleTransitionDuration = 800;
const DEFAULT_BUBBLE_TRANSITION = `all ${bubbleTransitionDuration / 1000}s cubic-bezier(0.4, 0, 0.2, 1) 0s`;
export class CpsBubbleComponent {
    private DEFAULT_PROPS = _DEFAULT_PROPS;
    private BUBBLE_ITEM_CLASS = "CpsBubble__eachBubbleElement";
    private BUBBLE_WRAPPER_CLASS = "CpsBubble__eachBubbleWrapperElement";

    private props: BubbleProps = {};
    private pointArray: Point[] = [];

    private id = "CpsBubble";
    private dom: HTMLElement; // 组成字母的范围参考元素
    private mountElement: HTMLElement; // 挂载泡泡的元素的最外部元素，默认body
    private positionElement: HTMLElement; // 聚合范围，泡泡组合成文字的具体范围元素
    private regionElement: HTMLElement; // 扩散范围：用来批量挂载泡泡的容器，不起到任何作用，但是泡泡都在这个容器内部
    private debugCanvasElementId: string = "CpsBubble.debugCanvas";

    private bubbleElementList: HTMLDivElement[] = []; // 存放所有泡泡div实例
    private isGather = true;

    private resizeGatherTimeoutID: NodeJS.Timeout;
    private observer: MutationObserver; // 监听元素变化，可以修复首次加载时，位置元素会变化的问题
    private observerSize: ResizeObserver;

    private initialWidth = 0;
    private initialHeight = 0;

    private width = 0;
    private height = 0;

    private offscreenCanvas: OffscreenCanvas;
    public isGathering = true;

    private _oldRegion: [number, number, number, number] = [0, 0, 0, 0];

    constructor(props: BubbleProps) {
        this.init(props);
    }

    public test = () => {
        // 按钮1
        const baseStyle = { pointerEvents: "auto", width: "100px", height: "60px", backgroundColor: "green" };
        const testButtonElement = document.createElement("button");
        testButtonElement.innerText = "切换";
        testButtonElement.onclick = () => this.onTest();
        Object.assign(testButtonElement.style, baseStyle);
        this.positionElement.appendChild(testButtonElement);

        // 按钮2
        const testButtonElement2 = document.createElement("button");
        testButtonElement2.innerText = "destroy";
        testButtonElement2.onclick = this.destroy;
        Object.assign(testButtonElement2.style, baseStyle);
        this.positionElement.appendChild(testButtonElement2);
    };

    private onTest = () => {
        if (this.props.DEBUG) console.log("onTest: ");
        const rect = this.positionElement.getBoundingClientRect();
        console.log("rect: ", rect);

        this.switch();
    };

    public init = (props: BubbleProps) => {
        this.props = { ...this.DEFAULT_PROPS, ...props };

        if (this.props.DEBUG) console.log("CpsBubbleComponent constructor");

        // 创建元素
        this.elementInit();

        // 创建事件
        this.eventInit();
        requestAnimationFrame(() => {
            setTimeout(() => {
                // 创建泡泡并挂载到body
                this.createPointData(this.width, this.height);

                // 添加DEBUG控制按钮
                if (this.props.DEBUG) this.test();
            }, 1000);
        });

        return this;
    };

    /**
     * @description: 在指定的id元素上，创建一个覆盖元素，尺寸和位置保持一致，默认在body中生成
     */
    private elementInit = () => {
        let errMsg = "CpsBubbleComponent: init() 未找到定位元素:positionElement";
        if (this.props.DEBUG) console.log("CpsBubbleComponent: init()");

        // 这是定位元素，从外部导入，本组件所有定位根据以该元素为基准，默认为body
        this.positionElement = document.getElementById(this.props.positionElementId);
        if (!this.positionElement) {
            console.error(errMsg);
            throw errMsg;
        }

        const rect = this.positionElement.getBoundingClientRect();
        this.width = Math.floor(rect.width);
        this.height = Math.floor(rect.height);

        this.offscreenCanvas = new OffscreenCanvas(this.width, this.height);

        this.regionElement = document.getElementById(this.props.regionElementId);
        if (!this.regionElement) {
            this.regionElement = document.createElement("div");
            this.regionElement.id = this.props.regionElementId;
        }
        Object.assign(this.regionElement.style, {
            position: "absolute",
            transition: DEFAULT_BUBBLE_TRANSITION,
            pointerEvents: "none",
            top: 0,
            left: 0,
            width: "100vw",
            height: "0", // TODO 为什么设置0? 视觉完全隐藏（opacity）布局不占空间（height: 0） 为后续动画提供从0到实际高度的过渡效果
            opacity: 0,
        });

        if (this.props.mountElementId == "body") {
            this.mountElement = document.body;
        } else {
            this.mountElement = document.getElementById(this.props.mountElementId);
        }
    };

    private eventInit = () => {
        // 创建尺寸改变事件，重新修正拼凑的尺寸
        this.observerSize = new ResizeObserver((entries) => {
            entries.forEach((entry) => {
                const { width, height } = entry.contentRect;
                console.log(`positionElement元素新尺寸：${width}px x ${height}px`);
            });
        });
        this.observerSize.observe(this.positionElement);

        // 监听窗口大小变化，确保新元素尺寸同步更新
        window.addEventListener("resize", this.onRise);

        if (this.props.hoverGather) {
            this.positionElement.addEventListener("mouseenter", this.gatherData);
            this.positionElement.addEventListener("mouseleave", this.disperseData);
        }
    };

    public onRise = throttle(() => this.updatePositions(), 200);

    /**
     * @description: 更新整个组件的位置，组件位置与传入的props.positionElementId 绑定
     */
    public updatePositions = () => {
        if (this.props.DEBUG) console.log("触发  updatePositions");
        if (this.resizeGatherTimeoutID) clearTimeout(this.resizeGatherTimeoutID);

        // 延迟聚合（resize 稳定后再计算泡泡位置）
        this.resizeGatherTimeoutID = setTimeout(() => {
            this.gatherData(); // 仅聚合，避免扩散导致闪烁
        }, 500); // 缩短延迟，提升响应性
    };

    /**
     * @description: 因为init采用了settime调用，所以吧必须将width和height在调入时动态传入，否则这里读取到的this.width和this.height为0
     * @param {number} width
     * @param {number} height
     */
    private createPointData = async (width: number, height: number) => {
        if (this.props.DEBUG) console.log("触发  updateBubblePosition");
        width = Math.floor(width);
        height = Math.floor(height);

        const input = this.props.input;
        let data: Uint8ClampedArray;

        const { canvas, ctx } = utils.resetOffscreenCanvas(this.offscreenCanvas);

        if (utils.isBase64(input) || utils.isUrl(input)) {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.src = input;

            data = await this.loadImage(img, width, height, ctx);
        } else if (utils.isString(input)) {
            data = this.renderTextToImageData(input, width, height);
        } else {
            throw new Error("Unsupported input type");
        }

        // 使用 Promise 封装图片加载过程
        this.createBubble(data, width, height);

        // canvas.remove();
    };

    private loadImage = (img: HTMLImageElement, width: number, height: number, ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D) => {
        return new Promise<Uint8ClampedArray>((resolve, reject) => {
            img.onload = () => {
                try {
                    // 图片加载完成后，绘制到 canvas 上并获取 image data
                    ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, width, height);
                    const data = ctx.getImageData(0, 0, width, height).data;
                    resolve(data);
                } catch (error) {
                    reject("Error loading image data");
                }
            };

            img.onerror = (error) => {
                reject("Error loading image");
            };
        });
    };

    private renderTextToImageData = (text: string, width: number, height: number): Uint8ClampedArray => {
        const { canvas, ctx } = utils.resetOffscreenCanvas(this.offscreenCanvas);

        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.font = `${this.props.fontWeight} ${this.props.fontSize}px ${this.props.fontName}`;

        ctx.fillText(text, width / 2, height / 2);

        const data = ctx.getImageData(0, 0, width, height).data;

        // canvas?.remove();
        return data;
    };

    private createBubble = (data: Uint8ClampedArray, w: number, h: number) => {
        this.clearAllBubbles();

        if (this.props.DEBUG) console.log("触发  createBubble");
        const DEFAULT_DELAY = 12000;
        const number = this.props.bubbleCount;
        for (let i = 0; i < w; i += number) {
            for (let j = 0; j < h; j += number) {
                if (data[(i + j * w) * 4 + 3] > 150) {
                    this.pointArray.push({ x: Math.floor(i), y: Math.floor(j) });
                }
            }
        }

        const rect = this.positionElement.getBoundingClientRect();
        this.initialWidth = Math.floor(rect.width);
        this.initialHeight = Math.floor(rect.height);
        const offsetX = Math.floor(rect.left + this.props.offsetX);
        const offsetY = Math.floor(rect.top + this.props.offsetY);

        // TODO 记录历史范围
        this._oldRegion = [offsetX, offsetY, rect.width, rect.height];

        this.pointArray.forEach((item, i) => {
            const r = (Math.random() * (this.props.bubbleSizeMax - this.props.bubbleSizeMin) + this.props.bubbleSizeMin) * this.props.bubbleScale;
            const opacity = Math.random() * (this.props.opacityMax - this.props.opacityMin) + this.props.opacityMin;

            const delay = Math.floor(Math.random() * (DEFAULT_DELAY / 3));
            const start = DEFAULT_DELAY / 2 - delay;

            // 泡泡外层容器，主要用来保证泡泡扩散和聚合位置移动
            const eachBubbleWarpStyle = {
                position: "absolute",
                borderRadius: "50%",
                left: `${item.x + offsetX}px`,
                top: `${item.y + offsetY}px`,
                transition: DEFAULT_BUBBLE_TRANSITION,
                pointerEvents: "none",
                willChange: "transform",
                opacity: 1,
            };

            // 泡泡内层容器，主要用来保证泡泡自身上下浮动和大小比例变动
            const eachBubbleStyle = {
                width: `${r}px`,
                height: `${r}px`,
                opacity,
                backgroundColor: utils.getRandomColor(),
                borderRadius: "50%",
                animation: `up-and-down-${(i % 2) + 1} ${start}ms ease-in-out ${delay}ms infinite`,
                pointerEvents: "none",
            };

            const eachBubbleElement = document.createElement("div");
            eachBubbleElement.classList.add(this.BUBBLE_ITEM_CLASS);
            Object.assign(eachBubbleElement.style, eachBubbleStyle);

            const eachBubbleWarpElement = document.createElement("div");
            eachBubbleWarpElement.classList.add(this.BUBBLE_WRAPPER_CLASS);
            Object.assign(eachBubbleWarpElement.style, eachBubbleWarpStyle);

            eachBubbleWarpElement.appendChild(eachBubbleElement);

            this.bubbleElementList.push(eachBubbleWarpElement);
            this.regionElement.appendChild(eachBubbleWarpElement);
        });

        // this.mountElement.appendChild(this.regionElement);
        document.body.appendChild(this.regionElement);

        setTimeout(() => (this.regionElement.style.opacity = "1"));
    };

    private clearAllBubbles = () => {
        if (this.props.DEBUG) {
            console.log("清理所有泡泡元素");
        }

        // 1. 清空内存中的元素列表（避免引用残留）
        this.bubbleElementList.forEach((el) => {
            if (el && el.parentNode) {
                el.parentNode.removeChild(el); // 从DOM移除
            }
        });
        this.bubbleElementList = []; // 清空数组
        this.pointArray = []; // 清空坐标数组

        // 2. 兜底：通过类名删除所有残留元素（防止内存列表和DOM不同步）
        const allBubbleWrappers = document.querySelectorAll(`.${this.BUBBLE_WRAPPER_CLASS}`);
        allBubbleWrappers.forEach((el) => {
            if (el.parentNode) el.parentNode.removeChild(el);
        });
    };

    public gatherCenter = () => {
        const newStyle: any = {
            transform: `translate(0,0)`,
            opacity: 0,
        };

        requestAnimationFrame(() => {
            this.bubbleElementList.forEach((bubbleElement, i) => {
                Object.assign(bubbleElement.style, newStyle);
            });
        });
    };

    public switch = throttle(() => (this.isGather ? this.disperseData() : this.gatherData()), bubbleTransitionDuration * 1.1);

    public gatherData = throttle(() => {
        // this.isGathering = true;
        requestAnimationFrame(() => {
            const rect = this.positionElement.getBoundingClientRect();

            this.bubbleElementList.forEach((bubbleElement, i) => {
                const newStyle: any = {
                    transform: `translate(${0},${0})`,
                };

                const oldLeft = this.pointArray[i].x;
                const newLeft = this.pointArray[i].x + rect.left;

                const oldTop = this.pointArray[i].y;
                const newTop = this.pointArray[i].y + rect.top;
                const isPositionChanged = oldTop != newTop || oldLeft != newLeft;

                if (isPositionChanged) {
                    newStyle.left = `${this.pointArray[i].x + rect.left}px`;
                    newStyle.top = `${this.pointArray[i].y + rect.top}px`;
                }

                Object.assign(bubbleElement.style, newStyle);
            });

            this.isGather = true;
        });
    }, bubbleTransitionDuration);

    // BUG 快速切换存在坐标混乱
    public disperseData = throttle(() => {
        // if (this.isGathering) return console.log("无法打散，当前聚合中");
        if (!this.mountElement) return console.warn("bubble: 无法获取dom或者positionElement");

        // 获取泡泡的扩散范围
        const disperseElement = document.getElementById(this.props.disperseElementId);
        const sideRect = disperseElement.getBoundingClientRect();
        const bubbleSizeMax = this.props.bubbleSizeMax * 2;

        // 计算样式
        const newStyleList = this.bubbleElementList.map((item) => {
            const { left, top } = item.getBoundingClientRect();

            // 2. 配置最大重试次数（关键兜底）
            let coords = utils.getRandomPointByDOMRect(sideRect);

            const MAX_RETRY = 50; // 推荐值：50次（平衡性能和成功率）
            let retryCount = 0;
            let isInSafeArea = false;

            while (retryCount < MAX_RETRY && !isInSafeArea) {
                const isOutOfRightSide = coords[0] > sideRect.right - bubbleSizeMax;
                const isOutOfBottomSide = coords[1] > sideRect.bottom - bubbleSizeMax;
                const isOutOfLeftSide = coords[0] < sideRect.left + bubbleSizeMax;
                const isOutOfTopSide = coords[1] < sideRect.top + bubbleSizeMax;

                isInSafeArea = !isOutOfRightSide && !isOutOfBottomSide && !isOutOfLeftSide && !isOutOfTopSide;

                // 未在安全区域则重新生成坐标，并重试+1
                if (!isInSafeArea) {
                    //不合法坐标
                    coords = utils.getRandomPointByDOMRect(sideRect);
                    retryCount++;
                }
            }

            // 4. 兜底处理：若重试耗尽仍无合规坐标，取容器中心（避免样式异常）
            if (!isInSafeArea) {
                console.warn("泡泡坐标生成失败（重试次数耗尽），使用容器中心坐标");
                coords = [
                    sideRect.left + (sideRect.right - sideRect.left - bubbleSizeMax) / 2,
                    sideRect.top + (sideRect.bottom - sideRect.top - bubbleSizeMax) / 2,
                ];
            }

            // BUG 坐标混乱元凶，真是坐标再这里最后才进行-left -top的计算，如果当前泡泡还在聚合中途坐标属于聚合与打散的中间态，此时进行再打散，导致坐标必然超出边界，且此处没有进行边界处理
            const offsetX = coords[0] - left;
            const offsetY = coords[1] - top;

            return { transform: `translate(${offsetX}px, ${offsetY}px)` };
        });

        // 更新样式
        requestAnimationFrame(() => {
            this.bubbleElementList.forEach((bubbleElement, i) => {
                Object.assign(bubbleElement.style, newStyleList[i]);
            });

            this.isGather = false;
        });
    }, bubbleTransitionDuration);

    public destroy = () => {
        try {
            if (this.props.DEBUG) console.log("destroy::start");
            this.clearAllBubbles();

            window.removeEventListener("resize", this.onRise);
            if (this.observer) this.observer.disconnect();
            if (this.observerSize) this.observerSize.disconnect();

            if (this.dom) {
                this.mountElement.removeChild(this.dom);
                this.dom = null;
            }

            if (this.regionElement) {
                if (this.regionElement.style) this.regionElement.style.opacity = "0";
                // this.mountElement.removeChild(this.regionElement);
                document.body.removeChild(this.regionElement);
                this.regionElement = null;
            }

            if (this.positionElement) {
                this.positionElement.removeEventListener("mouseenter", this.gatherData);
                this.positionElement.removeEventListener("mouseleave", this.disperseData);
            }

            this.offscreenCanvas.getContext("2d").clearRect(0, 0, this.offscreenCanvas.width, this.offscreenCanvas.height);

            // 额外防护：清空DOM引用
            this.mountElement = null;
            this.positionElement = null;
            this.regionElement = null;
            this.bubbleElementList = [];

            if (this.props.DEBUG) console.log("destroy::end");
        } catch (err) {
            console.error("destroy::err", err);
        }
    };
}
