/*
 * @Author: cpasion-office-win10 373704015@qq.com
 * @Date: 2025-11-13 09:13:08
 * @LastEditors: cpasion-office-win10 373704015@qq.com
 * @LastEditTime: 2026-02-06 10:02:39
 * @FilePath: \docusaurus-v2\src\pages\project\_components\useWindowAspectRatioHook.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { useState, useEffect, useRef } from "react";

export type AlignmentModeType = "portrait" | "landscape" | "square";

/**
 * 监控浏览器视区纵横比
 * @param threshold 横竖屏阈值，默认1.1
 * @param squareThreshold 正方形阈值，默认0.05
 * @returns 当前的显示模式
 */
export const useWindowAspectRatio = (
    squareEnter: number = 0.05, // 进入 square 的区间
    squareExit: number = 0.08, // 离开 square 的区间（必须 > enter）
    landscapeEnter: number = 1.1,
    landscapeExit: number = 1.05, // 必须 < enter
): AlignmentModeType => {
    const getRatio = () => (typeof window === "undefined" ? 1 : window.innerWidth / window.innerHeight);

    const [mode, setMode] = useState<AlignmentModeType>("portrait");
    const modeRef = useRef<AlignmentModeType>(mode);

    useEffect(() => {
        modeRef.current = mode;
    }, [mode]);

    useEffect(() => {
        if (typeof window === "undefined") return;

        let rafId: number | null = null;

        const update = () => {
            const ratio = getRatio();
            const prev = modeRef.current;
            let next = prev;

            switch (prev) {
                case "portrait":
                    if (Math.abs(ratio - 1) <= squareEnter) {
                        next = "square";
                    } else if (ratio >= landscapeEnter) {
                        next = "landscape";
                    }
                    break;

                case "square":
                    if (Math.abs(ratio - 1) >= squareExit) {
                        next = ratio > 1 ? "landscape" : "portrait";
                    }
                    break;

                case "landscape":
                    if (ratio <= landscapeExit) {
                        if (Math.abs(ratio - 1) <= squareEnter) {
                            next = "square";
                        } else {
                            next = "portrait";
                        }
                    }
                    break;
            }

            if (next !== prev) {
                modeRef.current = next;
                setMode(next);
            }

            rafId = null;
        };

        const onResize = () => {
            if (rafId == null) {
                rafId = requestAnimationFrame(update);
            }
        };

        window.addEventListener("resize", onResize);

        if (window.screen.orientation) {
            window.screen.orientation.addEventListener("change", onResize);
        } else {
            window.addEventListener("orientationchange", onResize);
        }

        // 初始化一次
        onResize();

        return () => {
            window.removeEventListener("resize", onResize);

            if (window.screen.orientation) {
                window.screen.orientation.removeEventListener("change", onResize);
            } else {
                window.removeEventListener("orientationchange", onResize);
            }

            if (rafId != null) {
                cancelAnimationFrame(rafId);
            }
        };
    }, [squareEnter, squareExit, landscapeEnter, landscapeExit]);

    return mode;
};
