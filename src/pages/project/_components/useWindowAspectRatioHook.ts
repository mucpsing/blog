/*
 * @Author: cpasion-office-win10 373704015@qq.com
 * @Date: 2025-11-13 09:13:08
 * @LastEditors: cpasion-office-win10 373704015@qq.com
 * @LastEditTime: 2026-02-04 16:01:16
 * @FilePath: \docusaurus-v2\src\pages\project\_components\useWindowAspectRatioHook.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { useState, useEffect } from "react";

export type AlignmentModeType = "portrait" | "landscape" | "square";

/**
 * 监控浏览器视区纵横比
 * @param threshold 横竖屏阈值，默认1.1
 * @param squareThreshold 正方形阈值，默认0.05
 * @returns 当前的显示模式
 */
export const useWindowAspectRatio = (threshold: number = 1.1, squareThreshold: number = 0.05): AlignmentModeType => {
    const [mode, setMode] = useState<AlignmentModeType>(() => {
        if (typeof window === "undefined") return "landscape";

        const ratio = window.innerWidth / window.innerHeight;
        const diff = Math.abs(ratio - 1);

        if (diff < squareThreshold) return "square";
        return ratio > threshold ? "landscape" : "portrait";
    });

    useEffect(() => {
        if (typeof window === "undefined") return;

        let rafId: number;
        let frameRequested = false;

        const updateMode = () => {
            const ratio = window.innerWidth / window.innerHeight;
            const diff = Math.abs(ratio - 1);

            let newMode: AlignmentModeType = "portrait"; // （纵向/竖屏）​ - 高度大于宽度，就像肖像画一样
            if (diff < squareThreshold) {
                newMode = "square"; // 宽度和高度接近相等
            } else if (ratio > threshold) {
                newMode = "landscape"; // （横向/横屏）​ - 宽度大于高度，就像风景画一样
            }

            setMode(newMode);
            frameRequested = false;
        };

        const handleResize = () => {
            if (!frameRequested) {
                frameRequested = true;
                rafId = requestAnimationFrame(updateMode);
            }
        };

        window.addEventListener("resize", handleResize);

        // 移动设备方向变化
        const handleOrientationChange = () => {
            handleResize(); // 复用相同的更新逻辑
        };

        if (window.screen.orientation) {
            window.screen.orientation.addEventListener("change", handleOrientationChange);
        } else {
            // 兼容旧设备
            window.addEventListener("orientationchange", handleOrientationChange);
        }

        return () => {
            window.removeEventListener("resize", handleResize);

            if (window.screen.orientation) {
                window.screen.orientation.removeEventListener("change", handleOrientationChange);
            } else {
                window.removeEventListener("orientationchange", handleOrientationChange);
            }

            if (rafId) cancelAnimationFrame(rafId);
        };
    }, [threshold, squareThreshold]);

    return mode;
};
