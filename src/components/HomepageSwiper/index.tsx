/*
 * @Author: CPS holy.dandelion@139.com
 * @Date: 2023-03-06 22:25:11
 * @LastEditors: cpasion-office-win10 373704015@qq.com
 * @LastEditTime: 2026-02-10 10:04:39
 * @FilePath: \cps-blog\src\components\HomepageSwiper\index.tsx
 * @Description: 首页轮播组件，抽离自CpsImgSwiper组件，进行了定制化
 */
import React, { useRef, useState } from "react";

import CpsImgSwiper, { ANIM_CONFIGS } from "@site/src/components/CpsImgSwiper/index";
import { isSupportWebp } from "@site/src/components/CpsImgSwiper/utils";
import dataArray, { type ICpsImgSwiperDataItem } from "@site/src/components/CpsImgSwiper/data";
import type { ICpsImgSwiperProps, ICpsImgSwiperState } from "@site/src/components/CpsImgSwiper/index";

import { useWindowAspectRatio, type AlignmentModeType } from "@site/src/utils/useWindowAspectRatioHook";

import HomeTitle from "./rightSide";
import Bubble from "@site/src/components/BubbleText";

const HomeImgSwiper: React.FC = () => {
    const DATA = useRef<ICpsImgSwiperDataItem[]>(dataArray);

    const alignmentMode: AlignmentModeType = useWindowAspectRatio();

    const [state, setState] = useState({
        showInt: 0,
        delay: 0,
        oneEnter: false,
        webp: isSupportWebp(),
    });

    return (
        <div
            className={["overflow-hidden relative w-full h-[600px]", "flex justify-evenly items-center pt-60 pb-64 px-4 text-gray-700"].join(" ")}
            style={{
                background: DATA.current[state.showInt].subColor,
                transition: "background 1s",
            }}
        >
            {/* 左边标题 */}
            <div id="homeTitleComment" className="home-title w-[400px]">
                <HomeTitle />
            </div>

            <Bubble width={600} height={200} bubbleScale={1.5} positionElementId="postitionElement" />

            <CpsImgSwiper
                onLeft={(pageIndex) => setState((s) => ({ ...s, showInt: pageIndex }))}
                onRight={(pageIndex) => setState((s) => ({ ...s, showInt: pageIndex }))}
                classNames={["md:display-none", "w-[600px] h-[450px]", "bg-white rounded-md overflow-hidden relative"].join(" ")}
            />
        </div>
    );
};

export default HomeImgSwiper;
