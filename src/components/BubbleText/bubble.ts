import * as utils from "./utils";
import { throttle, debounce } from "lodash";

const _DEFAULT_PROPS = {
    DEBUG: process.env.NODE_ENV === "development", // 是否开启调试模式
    positionElementId: "CpsBubble.positionElement", // 用于定位的元素id，泡泡文字会在这个元素的范围内生成
    mountElementId: "body",
    input: "capsion" as string,
    fontSize: 160,
    fontName: "Arial",
    fontWeight: "bold",
    offsetX: 0,
    offsetY: 0,
    width: 600,
    height: 200,
    bubbleScale: 1,
    bubbleSize: 10,
    bubbleCount: 10,
    bubbleSizeMin: 5,
    intervalTime: 8000, // 泡泡往复的时间，这里需要重构
    opacity: 0.8,
    opacityMax: 0.9,
    opacityMin: 0.7,
    autoSwitch: true,
    hoverGather: true,
    engine: "dom" as "dom" | "canvas" | "svg",
};

export type BubbleProps = Partial<typeof _DEFAULT_PROPS>;

export class CpsBubbleComponent {
    private DEFAULT_PROPS = _DEFAULT_PROPS;
    private props: BubbleProps = {};
    private pointArray = [];
    public INTERVAL_LIST = [];

    private id = "CpsBubble";
    private dom: HTMLElement; // 组成字母的范围参考元素
    private mountElement: HTMLElement; // 挂载泡泡的元素的最外部元素，默认body
    private positionElement: HTMLElement; // 聚合范围，泡泡组合成文字的具体范围元素
    private bubbleRegionElement: HTMLElement; // 扩散范围：用来批量挂载泡泡的容器，不起到任何作用，但是泡泡都在这个容器内部
    private debugCanvasElementId: string = "CpsBubble.debugCanvas";

    private bubbleElementList: HTMLDivElement[] = []; // 存放所有泡泡div实例
    private isGather = true;

    private resizeGatherIntervalID: NodeJS.Timeout;
    private observer: MutationObserver; // 监听元素变化，可以修复首次加载时，位置元素会变化的问题
    private observerSize: ResizeObserver;

    private initialWidth = 0;
    private initialHeight = 0;

    private width = 0;
    private height = 0;

    private offscreenCanvas: OffscreenCanvas;

    private _oldRegion: [number, number, number, number] = [0, 0, 0, 0];

    constructor(props) {
        this.props = { ...this.DEFAULT_PROPS, ...props };

        if (this.props.DEBUG) console.log("CpsBubbleComponent constructor");

        this.init();
    }

    public test = () => {
        // 按钮1
        const baseStyle = { pointerEvents: "auto", width: "100px", heigh: "60px", backgroundColor: "green" };
        const testButtonElement = document.createElement("button");
        testButtonElement.innerText = "切换";
        testButtonElement.onclick = () => this.onTest();
        Object.assign(baseStyle, testButtonElement.style);
        this.positionElement.appendChild(testButtonElement);

        // 按钮2
        const testButtonElement2 = document.createElement("button");
        testButtonElement2.innerText = "destroy";
        testButtonElement2.onclick = this.destroy;
        Object.assign(baseStyle, testButtonElement2.style);
        this.positionElement.appendChild(testButtonElement2);
    };

    private onTest = () => {
        if (this.props.DEBUG) console.log("onTest: ");
        const rect = this.positionElement.getBoundingClientRect();
        console.log("pointArray: ", this.pointArray);
        console.log("rect: ", rect);

        this.switch();
    };

    public init = () => {
        let errMsg = "CpsBubbleComponent: init() 未找到定位元素:positionElement";
        if (this.props.DEBUG) console.log("CpsBubbleComponent: init()");

        // 这是定位元素，从外部导入，本组件所有定位根据以该元素为基准，默认为body
        this.positionElement = document.getElementById(this.props.positionElementId);
        if (!this.positionElement) {
            console.error(errMsg);
            throw errMsg;
        }

        const rect = this.positionElement.getBoundingClientRect();
        this.width = rect.width;
        this.height = rect.height;

        this.offscreenCanvas = new OffscreenCanvas(this.width, this.height);

        // 创建元素
        this.thisDomInit();

        if (this.props.mountElementId == "body") {
            this.mountElement = document.body;
        } else {
            this.mountElement = document.getElementById(this.props.mountElementId);
        }

        // 创建 MutationObserver 来监听目标元素位置变化，重新修正泡泡位置
        // this.observer = new MutationObserver(this.onRise);
        // this.observer.observe(this.positionElement, { attributes: true, childList: false, subtree: false });

        // 默认将背景挂载到body上
        // document.body.appendChild(this.dom);

        this.eventInit();
        requestAnimationFrame(() => {
            setTimeout(() => {
                // 创建泡泡并挂载到body
                this.createPointData(rect.width, rect.height);

                // 添加DEBUG控制按钮
                if (this.props.DEBUG) this.test();
            }, 1000);
        });

        return this;
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
    };

    public switch = () => {
        this.isGather ? this.disperseData() : this.gatherData();

        this.isGather = !this.isGather;
    };

    public onRise = throttle(() => this.updatePositions(), 200);

    /**
     * @description: 更新整个组件的位置，组件位置与传入的props.positionElementId 绑定
     */
    public updatePositions = () => {
        if (this.props.DEBUG) console.log("触发  updatePositions");
        if (this.resizeGatherIntervalID) clearTimeout(this.resizeGatherIntervalID);

        // 进行扩散，然后重新计算元素位置
        const rect = this.positionElement.getBoundingClientRect();
        // this.dom.style.width = `${rect.width}px`;
        // this.dom.style.height = `${rect.height}px`;
        // this.dom.style.left = `${rect.left + this.props.offsetX}px`;
        // this.dom.style.top = `${rect.top + this.props.offsetY}px`;

        if (this.props.DEBUG) {
            console.log("updatePositions:  debug");
            const debugCanvas = document.getElementById(this.debugCanvasElementId);

            if (debugCanvas) {
                debugCanvas.style.width = `${rect.width}px`;
                debugCanvas.style.height = `${rect.height}px`;
                debugCanvas.style.left = `${rect.left + this.props.offsetX}px`;
                debugCanvas.style.top = `${rect.top + this.props.offsetY}px`;
            }
        }

        // 进行聚合，在聚合中会根据实际元素是否改变而重新计算泡泡位置
        // this.resizeGatherIntervalID = setTimeout(() => {
        //     // this.gatherData();
        //     this.disperseData();
        // }, 1000);

        // 延迟聚合（resize 稳定后再计算泡泡位置）
        this.resizeGatherIntervalID = setTimeout(() => {
            this.gatherData(); // 仅聚合，避免扩散导致闪烁
        }, 500); // 缩短延迟，提升响应性
    };

    /**
     * @description: 在指定的id元素上，创建一个覆盖元素，尺寸和位置保持一致，默认在body中生成
     */
    private thisDomInit = () => {
        // const positionElementRect = this.positionElement.getBoundingClientRect();

        // const style = {
        //     position: "absolute",
        //     left: positionElementRect.x,
        //     top: positionElementRect.y,
        //     width: `${positionElementRect.width}px`,
        //     height: `${positionElementRect.height}px`,
        // };

        // const targetId = this.props.positionElementId;

        // // 创建覆盖层元素
        // const thisDomID = `${targetId}.coverDiv`;
        // const thisDom = document.getElementById(thisDomID) || document.createElement(thisDomID);

        // // 计算目标元素的准确位置和尺寸
        // const scrollX = window.scrollX || window.pageXOffset;
        // const scrollY = window.scrollY || window.pageYOffset;
        // // 设置覆盖层样式
        // Object.assign(
        //     thisDom.style,
        //     {
        //         left: `${positionElementRect.left + scrollX}px`,
        //         top: `${positionElementRect.top + scrollY}px`,
        //         width: `${positionElementRect.width}px`,
        //         height: `${positionElementRect.height}px`,
        //     },
        //     style,
        // );

        // // 处理可能影响定位的父级元素
        // const isFixedPosition = getComputedStyle(this.positionElement).position === "fixed";
        // if (isFixedPosition) {
        //     thisDom.style.position = "fixed";
        //     thisDom.style.left = `${positionElementRect.left}px`;
        //     thisDom.style.top = `${positionElementRect.top}px`;
        // }

        // // 处理边界溢出情况
        // const viewportWidth = document.documentElement.clientWidth;
        // const viewportHeight = document.documentElement.clientHeight;

        // // 检查元素是否部分在可视区域外
        // const isPartiallyVisible =
        //     positionElementRect.top < viewportHeight &&
        //     positionElementRect.bottom > 0 &&
        //     positionElementRect.left < viewportWidth &&
        //     positionElementRect.right > 0;

        // if (!isPartiallyVisible) {
        //     console.warn("Target element is completely outside the viewport");
        // }

        // // 添加到文档
        // this.positionElement.appendChild(thisDom);

        // // 返回引用以便后续操作
        // this.dom = thisDom;
        // this.dom.id = this.id;
        if (this.props.hoverGather) {
            // this.dom.className = "bubbleWarp";
            this.positionElement.onmouseenter = this.gatherData;
            this.positionElement.onmouseleave = this.disperseData;
        }
    };

    private createPointData = async (width: number, height: number) => {
        if (this.props.DEBUG) console.log("触发  updateBubblePosition");
        width = Math.trunc(width);
        height = Math.trunc(height);

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
        if (this.props.DEBUG) console.log("触发  createBubble");
        const DEFAULT_DELAY = 12000;
        const number = this.props.bubbleCount;
        for (let i = 0; i < w; i += number) {
            for (let j = 0; j < h; j += number) {
                if (data[(i + j * w) * 4 + 3] > 150) {
                    this.pointArray.push({ x: Math.trunc(i), y: Math.trunc(j) });
                }
            }
        }

        this.bubbleRegionElement = document.createElement("div");
        this.bubbleRegionElement.id = "CpsBubble.bubbleRegionElement";
        const transition = "all .8s cubic-bezier(0.4, 0, 0.2, 1) 0s";
        Object.assign(this.bubbleRegionElement.style, {
            position: "absolute",
            transition,
            pointerEvents: "none",
            top: 0,
            left: 0,
            width: "100vw",
            height: "0", // TODO 为什么设置0?
            opacity: 0,
        });

        const rect = this.positionElement.getBoundingClientRect();
        this.initialWidth = Math.floor(rect.width);
        this.initialHeight = Math.floor(rect.height);
        const offsetX = Math.floor(rect.left + this.props.offsetX);
        const offsetY = Math.floor(rect.top + this.props.offsetY);
        this._oldRegion = [offsetX, offsetY, rect.width, rect.height];

        this.pointArray.forEach((item, i) => {
            const r = (Math.random() * this.props.bubbleSizeMin + this.props.bubbleSizeMin) * this.props.bubbleScale;
            const opacity = this.props.opacity ? this.props.opacity : Math.random() * this.props.opacityMin + this.props.opacityMin;

            const delay = Math.floor(Math.random() * (DEFAULT_DELAY / 3));
            const start = DEFAULT_DELAY / 2 - delay;

            // 泡泡外层容器，主要用来保证泡泡扩散和聚合位置移动
            const eachBubbleWarpStyle = {
                position: "absolute",
                borderRadius: "50%",
                left: `${item.x + offsetX}px`,
                top: `${item.y + offsetY}px`,
                transition,
                pointerEvents: "none",
                willChange: "transform",
                opacity: 1,
            };

            // 泡泡内层容器，主要用来保证泡泡自身上下浮动和比例大小
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
            Object.assign(eachBubbleElement.style, eachBubbleStyle);

            const eachBubbleWarpElement = document.createElement("div");
            Object.assign(eachBubbleWarpElement.style, eachBubbleWarpStyle);

            eachBubbleWarpElement.appendChild(eachBubbleElement);

            this.bubbleElementList.push(eachBubbleWarpElement);
            this.bubbleRegionElement.appendChild(eachBubbleWarpElement);
        });

        // document.body.appendChild(this.bubbleRegionElement);
        this.mountElement.appendChild(this.bubbleRegionElement);
        setTimeout(() => (this.bubbleRegionElement.style.opacity = "1"));
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

    public gatherData = () => {
        requestAnimationFrame(() => {
            const rect = this.positionElement.getBoundingClientRect();

            this.bubbleElementList.forEach((bubbleElement, i) => {
                const newStyle: any = {
                    transform: `translate(${0},${0})`,
                };

                const oldTop = this.pointArray[i].x;
                const newTop = this.pointArray[i].x + rect.left;
                const oldLeft = this.pointArray[i].y;
                const newLeft = this.pointArray[i].y + rect.top;
                const isPositionChanged = oldTop != newTop || oldLeft != newLeft;

                if (isPositionChanged) {
                    newStyle.left = `${this.pointArray[i].x + rect.left}px`;
                    newStyle.top = `${this.pointArray[i].y + rect.top}px`;
                }

                Object.assign(bubbleElement.style, newStyle);
            });

            this.isGather = true;
        });
    };
    public disperseData = () => {
        if (!this.mountElement) return console.warn("bubble: 无法获取dom或者positionElement");

        // 获取泡泡的扩散范围
        const sideRect = this.mountElement.getBoundingClientRect();

        // 计算样式
        const newStlyeList = this.bubbleElementList.map((item) => {
            const { left, top } = item.getBoundingClientRect();

            let coords = utils.getRandomPointByDOMRect(sideRect);
            while (
                coords[0] > sideRect.width + sideRect.left + this.props.bubbleSizeMin ||
                coords[1] > sideRect.height + sideRect.top + this.props.bubbleScale
            ) {
                coords = utils.getRandomPointByDOMRect(sideRect);
            }
            const offsetX = coords[0] - left;
            const offsetY = coords[1] - top;

            return { transform: `translate(${offsetX}px, ${offsetY}px)` };
        });

        // 更新样式
        requestAnimationFrame(() => {
            this.bubbleElementList.forEach((bubbleElement, i) => {
                Object.assign(bubbleElement.style, newStlyeList[i]);
                this.isGather = false;
            });
        });
    };

    public destroy() {
        try {
            if (this.props.DEBUG) console.log("destroy::start");

            window.removeEventListener("resize", this.onRise);
            if (this.observer) this.observer.disconnect();
            if (this.observerSize) this.observerSize.disconnect();

            if (this.dom) {
                this.mountElement.removeChild(this.dom);
                this.dom = null;
            }

            if (this.bubbleRegionElement) {
                if (this.bubbleRegionElement.style) this.bubbleRegionElement.style.opacity = "0";
                this.mountElement.removeChild(this.bubbleRegionElement);
                this.bubbleRegionElement = null;
            }

            setTimeout(() => {
                if (this.props.DEBUG) console.log("destroy::end");
            }, 100);
        } catch (err) {
            console.log("destroy::err", err);
        }
    }
}
