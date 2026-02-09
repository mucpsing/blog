/*
 * @Author: CPS holy.dandelion@139.com
 * @Date: 2023-03-06 22:25:11
 * @LastEditors: cpasion-office-win10 373704015@qq.com
 * @LastEditTime: 2026-02-06 15:01:55
 * @FilePath: \cps-blog\src\components\HomepageSwiper\index.tsx
 * @Description: 首页轮播组件，抽离自CpsImgSwiper组件，进行了定制化
 */
import React from "react";

import CpsImgSwiper, { ANIM_CONFIGS } from "@site/src/components/CpsImgSwiper/index";
import { isSupportWebp } from "@site/src/components/CpsImgSwiper/utils";
import dataArray, { type ICpsImgSwiperDataItem } from "@site/src/components/CpsImgSwiper/data";
import type { ICpsImgSwiperProps, ICpsImgSwiperState } from "@site/src/components/CpsImgSwiper/index";

import HomeTitle from "./rightSide";
import Bubble from "@site/src/components/BubbleText";

export default class HomeImgSwiper extends React.Component<ICpsImgSwiperProps, ICpsImgSwiperState> {
    bannerImg: any;
    bannerText: any;
    titleElement: Element;

    autoSwitchInterID: any;

    // 因为过渡效果分为左右两边，需要根据每次点击的按钮来重新指定是采用左边的过渡还是右边的过渡效果
    currtAnim: any = ANIM_CONFIGS.right;
    DATA: ICpsImgSwiperDataItem[] = [];

    static defaultProps = {
        alignmentMode: "horizontal",
        showText: false,
        showImg: true,
        showArrow: true,
        autoSwitch: 30000,
    };

    constructor(props) {
        super(props);

        this.DATA = dataArray;
        this.state = {
            showInt: 0,
            delay: 0,
            oneEnter: false,
            webp: props.useWebp ? isSupportWebp() : false,
        };
    }

    componentWillUnmount(): void {}

    componentDidMount(): void {}

    render() {
        return (
            <div
                className={[`overflow-hidden relative w-full h-[600px]`, "flex justify-evenly items-center pt-60 pb-64 px-4 text-gray-700"].join(" ")}
                style={{ background: this.DATA[this.state.showInt].subColor, transition: "background 1s" }}
            >
                {/* 左边标题 */}
                <div id="homeTitleComment" className="home-title w-[400px]">
                    <HomeTitle />
                </div>

                <Bubble width={600} height={200} bubbleScale={1.5} positionElementId="postitionElement"></Bubble>

                <CpsImgSwiper classNames={["w-[600px] h-[450px]", "bg-white rounded-md overflow-hidden relative"].join(" ")}></CpsImgSwiper>
            </div>
        );
    }
}
