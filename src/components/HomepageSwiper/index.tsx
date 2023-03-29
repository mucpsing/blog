/*
 * @Author: CPS holy.dandelion@139.com
 * @Date: 2023-03-06 22:25:11
 * @LastEditors: CPS holy.dandelion@139.com
 * @LastEditTime: 2023-03-30 00:57:21
 * @FilePath: \cps-blog\src\components\HomepageSwiper\index.tsx
 * @Description: 首页轮播组件
 */
import React from "react";
import ReactDOM from "react-dom";

import BannerAnim from "rc-banner-anim";
import QueueAnim from "rc-queue-anim";
import { TweenOneGroup } from "rc-tween-one";
// import "rc-banner-anim/assets/index.css";
import { RightOutlined, LeftOutlined } from "@ant-design/icons";

import dataArray, { ICpsImgSwiperDataItem } from "./data";
import HomeTitle from "./rightSide";
import Logo from "@site/src/pages/test";

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

enum AlignmentMode {
  Vertical = "vertical", // 横向
  Horizontal = "horizontal", // 垂直
}

interface ICpsImgSwiperProps {
  alignmentMode?: AlignmentMode;
  showText?: boolean;
  showImg?: boolean;
  showArrow?: boolean; // 是否显示切换的箭头
  autoSwitch?: number; // 是否自动切换，默认0不开启，单位为ms
}

interface ICpsImgSwiperPropsState {
  showInt: number;
  delay: number;
  oneEnter: boolean;
  logoX: number;
  logoY: number;
  logoOffsetX: number;
  logoOffsetY: number;
}
export default class CpsImgSwiper extends React.Component<ICpsImgSwiperProps, ICpsImgSwiperPropsState> {
  bannerImg: any;
  bannerText: any;
  titleElement: Element;

  autoSwitchInterID: any;

  // 因为过渡效果分为左右两边，需要根据每次点击的按钮来重新指定是采用左边的过渡还是右边的过渡效果
  currtAnim: any = ANIM_CONFIGS.right;
  DATA: ICpsImgSwiperDataItem[] = [];

  static defaultProps = {
    alignmentMode: AlignmentMode.Horizontal,
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
      logoX: 0,
      logoY: 0,
      logoOffsetX: 0,
      logoOffsetY: 0,
    };
  }

  componentWillUnmount(): void {
    if (this.autoSwitchInterID) clearInterval(this.autoSwitchInterID);

    document.removeEventListener("resize", this.onRise);
  }

  componentDidMount(): void {
    this.titleElement = document.getElementById("homeTitleComment");
    window.addEventListener("resize", this.onRise);

    if (this.props.autoSwitch > 0) {
      setTimeout(() => {
        this.onRise();
        this.onRight("autoSwitch");
        this.autoSwitchInterID = setInterval(() => {
          this.onRight("autoSwitch");
        }, this.props.autoSwitch);
      }, 1000);
    }
  }

  onRise = () => {
    const { top, left, width, height, y } = this.titleElement.getBoundingClientRect();
    const newState = { logoX: left, logoY: y, logoOffsetX: width, logoOffsetY: height };
    console.log({ newState });
    this.setState(newState);
  };

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
      showInt = dataArray.length - 1;
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
    const currtPage = this.state.showInt;

    if (currtPage == index) {
      return;
    } else if (currtPage < index) {
      this.onRight();
    } else {
      this.onLeft();
    }
  };

  render() {
    /**
     * @description: 根据数据渲染左边【图片展示】区域
     */
    const leftChildrens = this.DATA.map((item, i) => {
      const { mainColor, mainImg, subImg } = item;
      return (
        <Element key={i} leaveChildHide>
          <QueueAnim
            className="relative flex items-center justify-center w-full h-full"
            animConfig={this.currtAnim}
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
              style={{ background: mainColor }}
            ></div>

            {/* 主图片 */}
            <div
              className={[
                "absolute",
                this.props.alignmentMode == "vertical" ? "w-4/5 top-[10%]" : "w-[10%] top-4 right-4",
              ].join(" ")}
              key="pic"
            >
              <img src={subImg} width="100%" height="100%" alt="" loading="lazy" />
            </div>
            <div
              className={[
                this.props.alignmentMode == "vertical" ? "bottom-[15%] w-4/5" : "w-4/5",
                "absolute cursor-pointer",
              ].join(" ")}
              key="map"
            >
              <img src={mainImg} className="object-fill w-full h-full" alt="" />
            </div>
          </QueueAnim>
        </Element>
      );
    });

    /**
     * @description: 根据数据渲染右边【文字描述】区域
     */
    const rightChildrens = this.DATA.map((item, i) => {
      const { title, content, subColor } = item;
      return (
        <Element
          key={i}
          prefixCls={
            this.props.alignmentMode == "vertical" ? "px-6 py-12 md:px-3 md:py-6" : "px-10 py-4 md:px-5 md:py-2"
          }
        >
          <QueueAnim
            className="flex flex-col items-start"
            type="bottom"
            duration={800}
            delay={[!i ? this.state.delay + 500 : 800, 0]}
          >
            <h2 key="title" className="py-2 my-1 text-xl">
              {title}
            </h2>
            <em key="line" style={{ background: subColor }} className="inline-block rounded-sm w-16 h-[2px]" />
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
        <div className="absolute w-full h-10 bottom-0 z-[1] flex items-center justify-center gap-4">
          {this.DATA.map((item, index) => {
            const { mainColor } = item;
            const key = index.toString();
            return (
              <div
                key={key}
                onClick={(e) => this.switchPage(index)}
                style={{ background: mainColor }}
                className={[
                  "border-2 border-solid border-white",
                  "w-5 h-5 rounded-full cursor-pointer",
                  "hover:w-10 transition-all duration-300",
                ].join(" ")}
              ></div>
            );
          })}
        </div>
      );
    };

    return (
      <div
        className={[
          `overflow-hidden relative w-full h-[600px]`,
          "md:h-[650px]",
          "lg:h-[750px]",
          "xl:h-[900px]",
          "flex justify-evenly items-center pt-60 pb-64 px-4 text-gray-700",
        ].join(" ")}
        style={{ background: this.DATA[this.state.showInt].subColor, transition: "background 1s" }}
      >
        <Logo
          w={600}
          h={200}
          x={this.state.logoX}
          // y={160}
          y={this.state.logoY}
          offsetX={this.state.logoOffsetX}
          offsetY={this.state.logoOffsetY}
        ></Logo>

        {/* 左边标题 */}
        <div id="homeTitleComment" className="home-title w-[400px]" ref={(element) => (this.titleElement = element)}>
          <HomeTitle />
        </div>

        {/* 右边轮播 */}
        <div
          className={[
            "md:w-[500px] md:h-[400px]",
            "lg:w-[500px] lg:h-[350px]",
            "xl:w-[950px] xl:h-[650px]",
            "w-[4 50px] h-[550px] min-w-[300px]",
            "bg-white rounded-md overflow-hidden relative",
          ].join(" ")}
        >
          {/* 图片 */}
          <BannerAnim
            className={[
              "cps-swiper-img relative overflow-hidden",
              this.props.alignmentMode == "vertical"
                ? `w-1/2 h-full inline-block z-[1]`
                : "w-full min-w-[450px] h-full block absolute z-[2]",
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
            style={{ backdropFilter: "blur(5px)" }}
            className={[
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

          {this.props.showArrow ? (
            <TweenOneGroup enter={{ opacity: 0, type: "from" }} leave={{ opacity: 0 }}>
              <LeftOutlined className="z-[3] absolute text-2xl left-1 -mt-[20px] top-1/2" onClick={this.onLeft} />
              <RightOutlined className="z-[3] right-1 absolute text-2xl -mt-[20px] top-1/2" onClick={this.onRight} />
            </TweenOneGroup>
          ) : null}
        </div>

        <Items key="items" />
      </div>
    );
  }
}
