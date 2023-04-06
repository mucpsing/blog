import React from "react";

import BannerAnim from "rc-banner-anim";
import QueueAnim from "rc-queue-anim";
import { TweenOneGroup } from "rc-tween-one";
import { RightOutlined, LeftOutlined } from "@ant-design/icons";

export interface ICpsImgSwiperDataItem {
  title: string;
  content: string;
  subImg: string;
  mainImg: string;
  mainColor: string;
  subColor: string;
}

export interface ICpsImgSwiperProps {
  alignmentMode?: "horizontal" | "vertical"; // 横向|垂直
  showText?: boolean;
  showImg?: boolean;
  showArrow?: boolean; // 是否显示切换的箭头
  autoSwitch?: number; // 是否自动切换，默认0不开启，单位为ms
  data: ICpsImgSwiperDataItem[];
  classNames?: string;
}

export interface ICpsImgSwiperPropsState {
  showInt: number;
  delay: number;
  oneEnter: boolean;
}

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

const Element = BannerAnim.Element;

export default class CpsImgSwiper extends React.Component<ICpsImgSwiperProps, ICpsImgSwiperPropsState> {
  bannerImg: any;
  bannerText: any;
  titleElement: Element;
  autoSwitchInterID: any;

  // 因为过渡效果分为左右两边，需要根据每次点击的按钮来重新指定是采用左边的过渡还是右边的过渡效果
  currtAnim = ANIM_CONFIGS.right;
  DATA: ICpsImgSwiperDataItem[] = [];

  static defaultProps: ICpsImgSwiperProps = {
    alignmentMode: "horizontal",
    showText: false,
    showImg: true,
    showArrow: true,
    autoSwitch: 30000,
    classNames: "md:w-[500px] md:h-[400px] lg:w-[500px] lg:h-[350px] xl:w-[950px] xl:h-[650px]",
    data: [
      {
        title: "cps-fileheader",
        content: "快速插入文件头部信息，根据后缀名关联模板，一种后缀名可关联多个模板（vue2 和 vue3）",
        subImg: "/logo/nodejs.svg",
        mainImg: "/screenshot/sublimeTextPlugs/cps-fileheader/fileheader1.gif",
        mainColor: "#FFF43D",
        subColor: "#F6B429",
      },
      {
        title: "cps-fileheader",
        content: "快速插入文件头部信息，根据后缀名关联模板，一种后缀名可关联多个模板（vue2 和 vue3）",
        subImg: "/logo/nodejs.svg",
        mainImg: "/screenshot/sublimeTextPlugs/cps-fileheader/fileheader1.gif",
        mainColor: "#FC1E4F",
        subColor: "#FF4058",
      },
    ],
  };

  constructor(props) {
    super(props);
    this.state = {
      showInt: 0,
      delay: 0,
      oneEnter: false,
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

  render() {
    /**
     * @description: 根据数据渲染左边【图片展示】区域
     */
    const elementImgs = this.props.data.map((item, i) => {
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
    const elementTexts = this.props.data.map((item, i) => {
      const { title, content, subColor } = item;
      return (
        <Element
          key={i}
          prefixCls={
            this.props.alignmentMode == "vertical" ? "px-6 py-12 md:px-3 md:py-6" : "px-10 py-4 md:px-5 md:py-2"
          }
        >
          <QueueAnim
            className="flex flex-col items-start text-gray-700"
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

    return (
      <div
        className={[
          this.props.classNames,
          "shadow-xl",
          "w-[450px] h-[550px] min-w-[300px]",
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
          {elementImgs}
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
