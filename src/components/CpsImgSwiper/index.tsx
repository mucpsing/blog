/*
 * @Author: cpasion-office-win10 373704015@qq.com
 * @Date: 2023-04-21 09:15:12
 * @LastEditors: cpasion-office-win10 373704015@qq.com
 * @LastEditTime: 2026-02-06 10:15:47
 * @FilePath: \cps-blog\src\components\CpsImgSwiper\index.tsx
 * @Description: 这是一个图片轮播组件，支持横屏和竖屏排版，目前仅支持网页端浏览器，没做移动适配
 */
import React from "react";

import BannerAnim from "rc-banner-anim";
import QueueAnim from "rc-queue-anim";
import { TweenOneGroup } from "rc-tween-one";
import { RightOutlined, LeftOutlined } from "@ant-design/icons";
import { isSupportWebp, imgUrl2Webp } from "./utils";

import defaultData, { type ICpsImgSwiperDataItem } from "./data";
import ImgPreview from "./imagePreview";
import type { AlignmentModeType } from "@site/src/pages/project/_components/useWindowAspectRatioHook";

const Element = BannerAnim.Element;

/**
 * @description: 左右两边的动画滑动效果
 */
export const ANIM_CONFIGS = {
    left: [
        { translateX: [0, -300], opacity: [1, 0] },
        { translateX: [0, 300], opacity: [1, 0] },
    ],
    right: [
        { translateX: [0, 300], opacity: [1, 0] },
        { translateX: [0, -300], opacity: [1, 0] },
    ],
};

export interface ICpsImgSwiperProps {
    // alignmentMode?: "horizontal" | "portrait"; // 横向|垂直
    alignmentMode?: AlignmentModeType; // 横向|垂直
    showText?: boolean;
    showImg?: boolean;
    showArrow?: boolean; // 是否显示切换的箭头
    autoSwitch?: number; // 是否自动切换，默认0不开启，单位为ms
    data?: ICpsImgSwiperDataItem[];
    classNames?: string;
    imgPreview?: boolean; // 是否开启点击放大展示gif
    useWebp?: boolean; // 是否使用webp
}

export interface ICpsImgSwiperState {
    showInt: number;
    delay: number;
    oneEnter: boolean;
    webp: boolean; // 是否启用webp，首先通过props确定是否使用，在通过函数判断环境是否支持，最终生成布尔值状态存储
}

export default class CpsImgSwiper extends React.Component<ICpsImgSwiperProps, ICpsImgSwiperState> {
    bannerImg: any;
    bannerText: any;
    titleElement: Element;
    autoSwitchInterID: any;

    // 因为过渡效果分为左右两边，需要根据每次点击的按钮来重新指定是采用左边的过渡还是右边的过渡效果
    currtAnim = ANIM_CONFIGS.right;
    DATA: ICpsImgSwiperDataItem[] = [];

    static defaultProps: ICpsImgSwiperProps = {
        alignmentMode: "landscape",
        showText: false,
        showImg: true,
        showArrow: true,
        autoSwitch: 30000,
        // classNames: "md:w-[500px] md:h-[400px] lg:w-[500px] lg:h-[350px] xl:w-[950px] xl:h-[650px]",
        classNames: [].join(" "),
        data: defaultData,
        imgPreview: false,
        useWebp: false,
    };

    constructor(props: ICpsImgSwiperProps) {
        super(props);
        this.state = {
            showInt: 0,
            delay: 0,
            oneEnter: false,
            webp: props.useWebp ? isSupportWebp() : false,
        };
    }

    componentWillUnmount(): void {
        if (this.autoSwitchInterID) clearInterval(this.autoSwitchInterID);

        this.setState = (state, callback) => null;
    }

    componentDidMount(): void {
        if (this.props.autoSwitch > 0) {
            setTimeout(() => {
                this.onRight("autoSwitch");
                this.autoSwitchInterID = setInterval(() => {
                    this.onRight("autoSwitch");
                }, this.props.autoSwitch);
            }, 1000);
        }
    }

    onChange = () => {
        this.state.showInt;
        if (!this.state.oneEnter) {
            this.setState({ delay: 300, oneEnter: true });
        }
    };

    onLeft = (e?) => {
        if (typeof e != "string" && this.autoSwitchInterID) {
            clearInterval(this.autoSwitchInterID);
            this.autoSwitchInterID = 0;
        }

        let showInt = this.state.showInt;

        this.currtAnim = ANIM_CONFIGS.left;

        if (showInt <= 0) {
            showInt = this.props.data.length - 1;
        } else {
            showInt -= 1;
        }

        this.setState({ showInt });
        this.bannerImg.prev();
        this.bannerText.prev();
    };

    onRight = (e?) => {
        if (typeof e != "string" && this.autoSwitchInterID) {
            clearInterval(this.autoSwitchInterID);
            this.autoSwitchInterID = 0;
        }

        let showInt = this.state.showInt;

        this.currtAnim = ANIM_CONFIGS.right;

        if (showInt >= this.props.data.length - 1) {
            showInt = 0;
        } else {
            showInt += 1;
        }

        this.setState({ showInt });
        this.bannerImg.next();
        this.bannerText.next();
    };

    switchPage = (index: number) => {
        const currtPage = this.state.showInt;

        if (currtPage == index) {
            return;
        } else if (currtPage < index) {
            this.onRight();
        } else {
            this.onLeft();
        }
    };

    showImg = (target: ICpsImgSwiperDataItem) => {
        if (this.props.imgPreview) ImgPreview(target);
    };

    render() {
        /**
         * @description: 根据数据渲染左边【图片展示】区域
         */
        const elementImgs = this.props.data.map((item, i) => {
            let preview = item.gif ? item.gif : item.preview;
            let logo = item.logo;

            if (this.state.webp) {
                preview = imgUrl2Webp(item.preview);
                logo = imgUrl2Webp(item.logo);
            }

            return (
                <Element key={i} leaveChildHide>
                    <QueueAnim
                        className={["relative flex items-center w-full h-full justify-center"].join("")}
                        animConfig={this.currtAnim}
                        duration={(e) => (e.key === "map" ? 800 : 1000)}
                        delay={[!i ? this.state.delay : 300, 0]}
                        ease={["easeOutCubic", "easeInQuad"]}
                        key="img-wrapper"
                    >
                        <div key="bg" className={["absolute top-0 w-full", "h-2/3"].join(" ")} style={{ background: item.mainColor }}></div>

                        {/* 小图片 */}
                        {/* <div className={["absolute", "top-4"].join(" ")} key="pic">
                            <img src={logo} width="100%" height="100%" alt="" loading="lazy" crossOrigin="anonymous" />
                        </div> */}

                        {/* 主图片 */}
                        <div className={["cursor-pointer", "w-4/5"].join(" ")} key="map">
                            <img
                                src={preview}
                                className={["object-fill w-full h-full"].join(" ")}
                                alt=""
                                onClick={(e) => this.showImg(item)}
                                crossOrigin="anonymous"
                            />
                        </div>
                    </QueueAnim>
                </Element>
            );
        });

        /**
         * @description: 根据数据渲染右边【文字描述】区域
         */
        const elementTexts = this.props.data.map((item, i) => {
            const { title, content, subColor } = item;
            return (
                <Element key={i} prefixCls={this.props.alignmentMode == "portrait" ? "" : "px-10 py-4 md:px-5 md:py-2"}>
                    <QueueAnim
                        className={[
                            this.props.alignmentMode == "portrait" ? "justify-start p-1" : "justify-center",
                            "flex flex-col items-start text-gray-700",
                        ].join(" ")}
                        type="bottom"
                        duration={800}
                        delay={[!i ? this.state.delay + 500 : 800, 0]}
                    >
                        <h2
                            key="title"
                            className={[this.props.alignmentMode == "portrait" ? "my-1" : "py-2 my-1"].join(" ")}
                            style={{ fontSize: "var(--ifm-h4-font-size)" }}
                        >
                            {title}
                        </h2>
                        <em
                            key="line"
                            style={{ background: subColor }}
                            className={[this.props.alignmentMode == "portrait" ? "" : "", " inline-block rounded-sm w-16 h-[2px]"].join(" ")}
                        />
                        <p
                            key="content"
                            className={[this.props.alignmentMode == "portrait" ? "mt-1" : "mt-3"].join(" ")}
                            style={{ fontSize: "smaller" }}
                        >
                            {content}
                        </p>
                    </QueueAnim>
                </Element>
            );
        });

        return (
            <div
                id="warppp"
                className={[
                    this.props.classNames,
                    this.props.alignmentMode == "portrait"
                        ? [
                              "w-full min-h-[300px]",
                              "xxs:min-h-[350px]",
                              "xs:min-h-[400px]",
                              "sm:min-h-[450px]",
                              "md:min-h-[550px]",
                              "lg:min-h-[600px]",
                              "xl:min-h-[650px]",
                              "2xl:min-h-[750px]",
                          ].join(" ")
                        : ["min-w-[300px] min-h-[250px] w-3/4 py-10", "md:min-h-[550px]", "lg:min-h-[600px]", "xl:min-h-[700px]"].join(" "),
                    "shadow-xl",
                    "transition-all duration-300 ease-out",
                    "bg-white rounded-md overflow-hidden relative",
                ].join(" ")}
            >
                {/* 图片 */}
                <BannerAnim
                    className={["cps-swiper-img relative overflow-hidden", "w-full h-full block absolute z-[2]"].join(" ")}
                    sync
                    type="across"
                    duration={1000}
                    ease="easeInOutExpo"
                    arrow={false}
                    thumb={false}
                    ref={(c) => (this.bannerImg = c)}
                    onChange={this.onChange}
                    dragPlay={false}
                >
                    {elementImgs}
                </BannerAnim>

                {/* 文字 */}
                <BannerAnim
                    style={{ backdropFilter: "blur(5px)" }}
                    className={["cps-swiper-text overflow-hidden z-[3]", "font", "w-full h-1/3 block absolute bottom-0 bg-white/50"].join(" ")}
                    sync
                    type="across"
                    duration={1000}
                    arrow={false}
                    thumb={false}
                    ease="easeInOutExpo"
                    ref={(c) => (this.bannerText = c)}
                    dragPlay={false}
                >
                    {elementTexts}
                </BannerAnim>

                {/* 左右切换的箭头 */}
                {this.props.showArrow ? (
                    <TweenOneGroup enter={{ opacity: 0, type: "from" }} leave={{ opacity: 0 }}>
                        <LeftOutlined className="z-[3] absolute text-2xl left-1 -mt-[20px] top-1/2" onClick={this.onLeft} />
                        <RightOutlined className="z-[3] right-1 absolute text-2xl -mt-[20px] top-1/2" onClick={this.onRight} />
                    </TweenOneGroup>
                ) : null}
            </div>
        );
    }
}
