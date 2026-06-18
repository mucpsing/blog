/*
 * @Author: Capsion 373704015@qq.com
 * @Date: 2025-02-17 22:18:58
 * @LastEditors: cpasion-office-win10 373704015@qq.com
 * @LastEditTime: 2026-03-12 14:34:07
 * @FilePath: \cps-blog-docusaurus-v3\src\components\BubbleText\utils.ts
 * @Description: Bubble组件要用到的一些工具函数
 */
import { throttle, debounce } from "lodash";

/**
 * 将矩形区域分成四个区域：左上、右上、左下、右下
 *
 * @param {DOMRect} rect - 由getBoundingClientRect()返回的矩形对象
 * @returns {Object} 返回一个对象，包含四个区域的坐标
 */
export const getRectangleIntoFour = (rect) => {
    const { left, top, right, bottom, width, height } = rect;

    // 计算每个区域的宽度和高度（分成四个区域）
    const midX = left + width / 2; // 矩形的水平中心线
    const midY = top + height / 2; // 矩形的垂直中心线

    return {
        LeftTop: [
            [left, top],
            [midX, midY],
        ],
        RightTop: [
            [midX, top],
            [right, midY],
        ],
        LeftBottom: [
            [left, midY],
            [midX, bottom],
        ],
        RightBottom: [
            [midX, midY],
            [right, bottom],
        ],
    };
};

/**
 * @description: 快速获取一个随机颜色
 */
export const getRandomColor = () => {
    const R = Math.round(Math.random() * 95 + 160);
    const G = Math.round(Math.random() * 95 + 160);
    const B = Math.round(Math.random() * 95 + 160);

    return `rgb(${R},${G},${B})`;
};

export type Point = [number, number];
export type PositionT = "LeftBottom" | "RightBottom" | "LeftTop" | "RightTop";

/**
 * @description: 判断一个点与一个矩形的位置关系，如果都不存在，则返回"RightBottom"
 * @param {Point} point
 * @param {DOMRect} rect
 * @param {PositionT} defaultReturn
 */
export function getRegionPosition(point: Point, rect: DOMRect, defaultReturn: PositionT = "RightBottom"): PositionT {
    const [x, y] = point;
    const { left, top, right, bottom, width, height } = rect;

    // 判断点是否在矩形内部
    if (x >= left && x <= right && y >= top && y <= bottom) {
        // 计算矩形的中心点
        const centerX = left + width / 2;
        const centerY = top + height / 2;

        // 判断点相对于矩形中心的位置并返回相应区域
        if (x < centerX && y < centerY) {
            return "LeftTop"; // 左上
        } else if (x > centerX && y < centerY) {
            return "RightTop"; // 右上
        } else if (x < centerX && y > centerY) {
            return "LeftBottom"; // 左下
        } else if (x > centerX && y > centerY) {
            return "RightBottom"; // 右下
        }
    }

    // 如果点不在矩形内部
    return defaultReturn;
}

export type Region = [Point, Point];
/**
 * @description: 从一个矩形区域内随机取点
 * @param {Region} region
 */
export function getRandomPoint(region: Region): Point {
    const [[startX, startY], [endX, endY]] = region;

    // 确保 startX, startY 是矩形左下角，endX, endY 是右上角
    const [minX, maxX] = startX < endX ? [startX, endX] : [endX, startX];
    const [minY, maxY] = startY < endY ? [startY, endY] : [endY, startY];

    // 生成随机的 x 和 y 坐标
    const x = Math.floor(Math.random() * (maxX - minX + 1)) + minX;
    const y = Math.floor(Math.random() * (maxY - minY + 1)) + minY;

    return [x, y];
}

/**
 * @description: 从一个矩形区域内随机取点
 * @param {DOMRect} rect - 矩形区域
 * @returns {Point} - 随机点坐标
 */
// export function getRandomPointByDOMRect(rect: DOMRect): Point {
//     const { left, top, right, bottom } = rect;

//     // 生成随机的 x 和 y 坐标
//     const x = Math.floor(Math.random() * (right - left + 1)) + left;
//     const y = Math.floor(Math.random() * (bottom - top + 1)) + top;

//     return [x, y];
// }

export function getRandomPointByDOMRect(rect: DOMRect, elementSize: number = 0): Point {
    const { left, top, right, bottom } = rect;

    // 右边和下边减去元素尺寸，确保左上角坐标不会导致元素超出边界
    const x = Math.floor(Math.random() * (right - left - elementSize + 1)) + left;
    const y = Math.floor(Math.random() * (bottom - top - elementSize + 1)) + top;

    return [x, y];
}

/**
 * @description: 随机数获取
 * @param {*} min
 * @param {*} max
 */
export function getR(min, max) {
    return Math.random() * (max - min) + min;
}

export function isBase64(str: string): boolean {
    if (!str) return false;

    const base64Regex = /^data:image\/(png|jpg|jpeg|gif|webp|svg\+xml);base64,/;

    return base64Regex.test(str);
}

export function isUrl(str: string): boolean {
    if (!str) return false;

    try {
        new URL(str);
        return true;
    } catch {
        return false;
    }
}

export function isString(tar: any, max = 100): boolean {
    return typeof tar === "string" && tar.length > 0 && tar.length <= max;
}

/**
 * 新增：判断是否为相对路径（基于你的基础函数扩展）
 * 核心逻辑：不是base64、不是完整URL，但符合路径特征（/开头 | 包含./|../ | 有图片扩展名）
 */
export function isRelativePath(str: string): boolean {
    // 相对路径的核心特征（覆盖/xxxxx/xxx.png、./xxx.png、../xxx.png等场景）
    const relativePathRegex = /^(\/|\.\/|\.\.\/)|(\.(png|jpg|jpeg|gif|webp|svg\+xml))$/i;
    // 排除纯符号的异常情况（比如单独的/、../，避免误判为相对路径）
    const isPureSymbol = /^(\/|\.\/|\.\.\/)+$/.test(str);

    return relativePathRegex.test(str) && !isPureSymbol;
}

/**
 * 独立的图片加载函数：仅负责加载图片，不绑定任何渲染逻辑
 * @param imageSrc 图片地址（base64/URL/相对路径）
 * @returns 成功返回 Image 实例，失败返回 false
 */
export function loadImage(imageSrc: string): Promise<HTMLImageElement | false> {
    return new Promise((resolve) => {
        // 空值/非字符串直接返回失败
        if (!imageSrc || typeof imageSrc !== "string") {
            resolve(false);
            return;
        }

        const img = new Image();
        img.crossOrigin = "anonymous";

        // 加载成功：返回 Image 实例
        img.onload = () => {
            resolve(img);
        };

        // 加载失败（网络错误/路径错误/格式错误等）：返回 false
        img.onerror = () => {
            resolve(false);
        };

        // 触发加载（放在最后，避免 onload/onerror 未绑定完成就加载）
        img.src = imageSrc;
    });
}
export function resetOffscreenCanvas(canvas: HTMLCanvasElement | OffscreenCanvas) {
    canvas.width = canvas.width;
    canvas.height = canvas.height;

    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
    // 增加空值校验（避免 getContext 返回 null 的情况）
    if (!ctx) {
        throw new Error("无法获取 2D 上下文，当前环境不支持 OffscreenCanvas/Canvas 2D");
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 在读取像素前建议关闭抗锯齿
    ctx.imageSmoothingEnabled = false;

    return { canvas, ctx };
}

/**
 * 计算图片在目标渲染区域内按比例缩放后的尺寸
 * 当图片实际尺寸大于渲染尺寸时，按宽度 100% 缩放，保持比例
 */
export function fitImageSize(
    imgNaturalWidth: number,
    imgNaturalHeight: number,
    renderWidth: number,
    renderHeight: number,
    autoFit: boolean, // ✅ 显式传入，不再隐式引用 this
): { drawWidth: number; drawHeight: number; clipped: boolean } {
    const widthOverflow = imgNaturalWidth > renderWidth;
    const heightOverflow = imgNaturalHeight > renderHeight;
    const clipped = widthOverflow || heightOverflow;

    if (clipped) {
        console.warn(
            `[Bubble] 图片实际尺寸 (${imgNaturalWidth}x${imgNaturalHeight}) ` +
                `大于渲染尺寸 (${renderWidth}x${renderHeight})，` +
                `图片可能显示不完整。` +
                (autoFit ? "已启用 autoFit 自动缩放。" : "可开启 autoFit 自动适配。"),
        );
    }

    if (clipped && autoFit) {
        // 以宽度为基准做等比缩放
        const scale = renderWidth / imgNaturalWidth;
        return {
            drawWidth: renderWidth,
            drawHeight: Math.round(imgNaturalHeight * scale),
            clipped,
        };
    }

    return {
        drawWidth: imgNaturalWidth,
        drawHeight: imgNaturalHeight,
        clipped, // 是否裁剪了
    };
}

/**
 * 实时打印鼠标距离body的位置（相对body的坐标，而非视口）
 * @returns {Object} 包含stop方法的对象，用于停止监听
 */
export function debugMousePosition(elementID: string) {
    // 存储鼠标位置的变量
    let mouseX = 0;
    let mouseY = 0;

    // 鼠标移动事件处理函数
    const handleMouseMove = throttle((e) => {
        // 获取body元素的位置信息（解决body可能有margin/padding的情况）
        const bodyRect = document.body.getBoundingClientRect();

        // 计算鼠标相对于body的坐标（核心：视口坐标 - body的视口偏移）
        mouseX = e.clientX - bodyRect.left;
        mouseY = e.clientY - bodyRect.top;

        if (elementID) {
            console.log(document.getElementById(elementID).getBoundingClientRect());
        }

        // 格式化打印（清晰区分X/Y轴，便于调试）
        console.log(`[鼠标位置] 相对于body → X: ${mouseX.toFixed(2)}px, Y: ${mouseY.toFixed(2)}px`);
    }, 500);

    // 监听鼠标移动事件（绑定到document，确保全局生效）
    document.addEventListener("mousemove", handleMouseMove);

    // 返回停止监听的方法，方便手动终止
    return {
        stop: () => {
            document.removeEventListener("mousemove", handleMouseMove);
            console.log("[鼠标位置监听] 已停止");
        },
    };
}
