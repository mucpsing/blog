/*
 * @Author: CPS holy.dandelion@139.com
 * @Date: 2023-03-06 22:25:11
 * @LastEditors: cpasion-office-win10 373704015@qq.com
 * @LastEditTime: 2023-03-15 17:45:23
 * @FilePath: \cps-blog\src\components\HomepageSwiper\index.tsx
 * @Description: 首页轮播组件
 */

import _ from "lodash";
import React from "react";

import BannerAnim from "rc-banner-anim";
import QueueAnim from "rc-queue-anim";
import { TweenOneGroup } from "rc-tween-one";
// import "rc-banner-anim/assets/index.css";
import { RightOutlined, LeftOutlined } from "@ant-design/icons";

// import { dataArray } from "./testData";
import dataArray from "./data";
import HomeTitle from "./rightSide";

const Element = BannerAnim.Element;

/**
 * @description: 左右两边的动画滑动效果
 */
const ANIM_CONFIGS = {
  left: [
    { translateX: [0, -300], opacity: [1, 0] },
    { translateX: [0, 300], opacity: [1, 0] },
  ],
  right: [
    { translateX: [0, 300], opacity: [1, 0] },
    { translateX: [0, -300], opacity: [1, 0] },
  ],
};

/**
 * @description: 因为过渡效果分为左右两边，需要根据每次点击的按钮来重新指定是采用左边的过渡还是右边的过渡效果
 */
let CURRT_ANIM = ANIM_CONFIGS.left;

enum AlignmentMode {
  Vertical = "vertical", // 横向
  Horizontal = "horizontal", // 垂直
}

interface ICpsImgSwiperProps {
  alignmentMode?: AlignmentMode;
  showText?: boolean;
  showImg?: boolean;
}

interface ICpsImgSwiperPropsState {
  showInt: number;
  delay: number;
  oneEnter: boolean;
}
export default class CpsImgSwiper extends React.Component<ICpsImgSwiperProps, ICpsImgSwiperPropsState> {
  bannerImg: any;
  bannerText: any;

  static defaultProps = {
    alignmentMode: AlignmentMode.Horizontal,
    showText: false,
    showImg: true,
  };

  constructor(props) {
    super(props);
    this.state = {
      showInt: 0,
      delay: 0,
      oneEnter: false,
    };

    console.log("判断: ", this.props.alignmentMode == "vertical");
  }

  onChange = () => {
    this.state.showInt;
    if (!this.state.oneEnter) {
      this.setState({ delay: 300, oneEnter: true });
    }
  };

  onLeft = () => {
    let showInt = this.state.showInt;

    CURRT_ANIM = ANIM_CONFIGS.left;

    if (showInt <= 0) {
      showInt = dataArray.length - 1;
    } else {
      showInt -= 1;
    }

    this.setState({ showInt });
    this.bannerImg.prev();
    this.bannerText.prev();
  };

  onRight = () => {
    let showInt = this.state.showInt;

    CURRT_ANIM = ANIM_CONFIGS.right;

    if (showInt >= dataArray.length - 1) {
      showInt = 0;
    } else {
      showInt += 1;
    }

    this.setState({ showInt });
    this.bannerImg.next();
    this.bannerText.next();
  };

  switchPage = (index: number) => {
    console.log({ index });
    const currtPage = this.state.showInt;

    if (currtPage == index) {
      return;
    } else if (currtPage < index) {
      CURRT_ANIM = ANIM_CONFIGS.right;
    } else {
      CURRT_ANIM = ANIM_CONFIGS.left;
    }

    this.setState({ showInt: index });
    this.bannerImg.slickGoTo(index);
    this.bannerText.slickGoTo(index);
  };

  /**
   * @description: 让底图与前景图的动画执行错开，更有视觉效果
   */
  getDuration = (e) => (e.key === "map" ? 800 : 1000);

  render() {
    /**
     * @description: 根据数据渲染左边【图片展示】区域
     */
    const leftChildrens = dataArray.map((item, i) => {
      const { color, map, pic } = item;
      return (
        <Element key={i} leaveChildHide>
          <QueueAnim
            className="relative flex items-center justify-center w-full h-full"
            animConfig={CURRT_ANIM}
            duration={(e) => (e.key === "map" ? 800 : 1000)}
            delay={[!i ? this.state.delay : 300, 0]}
            ease={["easeOutCubic", "easeInQuad"]}
            key="img-wrapper"
          >
            <div
              key="bg"
              className={["absolute top-0 w-full", this.props.alignmentMode == "vertical" ? "h-1/2" : "h-2/3"].join(
                " "
              )}
              style={{ background: color }}
            ></div>
            <div className="absolute w-4/5 top-[20%]" key="pic">
              <img src={pic} width="100%" height="100%" alt="" />
            </div>
            <div
              className={[
                this.props.alignmentMode == "vertical" ? "bottom-[20%] w-4/5" : "h-5/6 w-auto",
                "absolute cursor-pointer",
              ].join(" ")}
              key="map"
            >
              {/* <img src={map} width="100%" height="100%" alt="" /> */}
              <img src={map} className="object-fill w-full h-full" alt="" />
            </div>
          </QueueAnim>
        </Element>
      );
    });

    /**
     * @description: 根据数据渲染右边【文字描述】区域
     */
    const rightChildrens = dataArray.map((item, i) => {
      const { title, content, background } = item;
      return (
        <Element key={i} prefixCls="p-6">
          <QueueAnim
            className="flex flex-col items-start"
            type="bottom"
            duration={800}
            delay={[!i ? this.state.delay + 500 : 800, 0]}
          >
            <h2 key="title" className="py-2 text-xl">
              {title}
            </h2>
            <em key="line" style={{ background }} className="inline-block rounded-sm w-16 h-[2px]" />
            <p key="content" className="mt-3 text-sm">
              {content}
            </p>
          </QueueAnim>
        </Element>
      );
    });

    /**
     * @description: 位于组件中央的彩色轮播切换按钮
     */
    const Items = () => {
      return (
        <div className="absolute w-full h-10 bottom-0 z-[999] flex items-center justify-center gap-4">
          {dataArray.map((item, index) => {
            const { color } = item;
            const key = index.toString();
            return (
              <div
                key={key}
                onClick={(e) => this.switchPage(index)}
                style={{ background: color }}
                className={["w-5 h-5 rounded-full cursor-pointer", "hover:w-10 transition-all duration-300"].join(" ")}
              ></div>
            );
          })}
        </div>
      );
    };

    return (
      <div
        className={[
          `overflow-hidden relative h-[450px] w-full`,
          "flex justify-evenly items-center pt-60 pb-64 px-4 text-gray-700",
        ].join(" ")}
        style={{ background: dataArray[this.state.showInt].background, transition: "background 1s" }}
      >
        <div className="home-title w-[500px]">
          <HomeTitle />
        </div>
        <div className={"w-[700px] h-[400px] bg-white rounded-md overflow-hidden relative"}>
          {/* 图片 */}
          <BannerAnim
            prefixCls={[
              "cps-swiper-img relative overflow-hidden",
              this.props.alignmentMode == "vertical"
                ? `w-1/2 h-full inline-block z-[1]`
                : "w-full h-full block absolute z-[2]",
            ].join(" ")}
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
            {leftChildrens}
          </BannerAnim>

          {/* 文字 */}
          <BannerAnim
            prefixCls={[
              "cps-swiper-text overflow-hidden z-[3]",
              this.props.alignmentMode == "vertical"
                ? `w-1/2 h-full inline-block relative`
                : "w-full h-1/3 block absolute bottom-0 bg-white/50",
            ].join(" ")}
            sync
            type="across"
            duration={1000}
            arrow={false}
            thumb={false}
            ease="easeInOutExpo"
            ref={(c) => (this.bannerText = c)}
            dragPlay={false}
          >
            {rightChildrens}
          </BannerAnim>

          <TweenOneGroup enter={{ opacity: 0, type: "from" }} leave={{ opacity: 0 }}>
            <LeftOutlined className="z-[3] absolute text-2xl left-1 -mt-[20px] top-1/2" onClick={this.onLeft} />
            <RightOutlined className="z-[3] right-1 absolute text-2xl -mt-[20px] top-1/2" onClick={this.onRight} />
          </TweenOneGroup>
        </div>

        <Items key="items" />
      </div>
    );
  }
}
