import React from "react";

import QueueAnim from "rc-queue-anim";
import TweenOne, { TweenOneGroup } from "rc-tween-one";
import { CloseOutlined } from "@ant-design/icons";

// import "rc-banner-anim/assets/index.css";
// import "./index.css";

import dataArray from "./data";

interface PicDetailsProps {
  title: string;
}

interface PicDetailsState {
  picOpen: { [key: string]: boolean }; // 是否有图片被展开
  title: string; // 组件标题
  subTitle: string; // 副标题
  currtOpenIndex: number; // 当前展开的图片容器
  splitCol: number;
  gap: number; // 图片的间距 默认20
  width: number;
  imgHeight: number; // 图片要展示的尺寸
}

export default class PicDetailsDemo extends React.Component<any, PicDetailsState> {
  constructor(props) {
    super(props);
    this.state = {
      currtOpenIndex: -1,
      picOpen: {},
      title: "项目展示",
      subTitle: "以下项目中的所有商业项目均通过甲方同意公开后才展示",
      splitCol: 6,
      gap: 20,
      width: 800,
      imgHeight: 130,
    };
  }

  onImgClick = (e, i: number) => {
    const { picOpen } = this.state;

    Object.keys(picOpen).forEach((key) => {
      // 如果当前未被点击过，则需要创建对应的字段
      if (key !== i.toString() && picOpen[key]) {
        // false表示当前容器还没展开
        picOpen[key] = false;
      }
    });

    picOpen[i] = true; // 容器状态改为展开

    this.setState({ picOpen });
  };

  onClose = (e, i) => {
    const { picOpen } = this.state;
    picOpen[i] = false;
    this.setState({ picOpen });
  };

  onTweenEnd = (i) => {
    const { picOpen } = this.state;
    delete picOpen[i];
    this.setState({ picOpen });
  };

  getDelay = (e) => {
    const i = e.index + (dataArray.length % this.state.splitCol);
    return (i % this.state.splitCol) * 100 + Math.floor(i / this.state.splitCol) * 100 + 200;
  };

  getLiChildren = () => {
    const gap = this.state.gap;
    const splitCol = this.state.splitCol;
    const containerWidth = this.state.width;

    const imgWidth = (containerWidth - gap * (splitCol - 1)) / splitCol;
    const imgHeight = this.state.imgHeight;

    const imgBoxWidth = imgWidth + gap;
    const imgBoxHeight = imgHeight + gap;

    const imgOpenHeight = gap + imgHeight * 2;

    return dataArray.map((item, i) => {
      const { image, title, content } = item;
      const isEnter = typeof this.state.picOpen[i] === "boolean";
      const isOpen = this.state.picOpen[i];

      const left = isEnter ? 0 : imgBoxWidth * (i % splitCol);
      const imgLeft = isEnter ? imgBoxWidth * (i % splitCol) : 0;

      const isRight = Math.floor((i % splitCol) / 2);
      const isTop = Math.floor(i / splitCol);

      let top = isTop ? (isTop - 1) * imgBoxHeight : 0;
      top = isEnter ? top : imgBoxHeight * isTop;
      let imgTop = isTop ? imgBoxHeight : 0;
      imgTop = isEnter ? imgTop : 0;

      const liStyle = isEnter ? { width: "100%", height: imgOpenHeight, zIndex: 1 } : null;

      const liAnimation = isOpen
        ? { boxShadow: "0 2px 8px rgba(140, 140, 140, .35)" }
        : { boxShadow: "0 0px 0px rgba(140, 140, 140, 0)" };

      let aAnimation: any = isEnter
        ? {
            delay: 400,
            ease: "easeInOutCubic",
            width: imgWidth,
            height: imgHeight,
            onComplete: this.onTweenEnd.bind(this, i),
            left: imgBoxWidth * (i % splitCol),
            top: isTop ? imgBoxHeight : 0,
          }
        : null;
      aAnimation = isOpen
        ? {
            ease: "easeInOutCubic",
            left: isRight ? imgBoxWidth * 2 - this.state.gap / 2 : 0,
            width: "50%",
            height: imgOpenHeight,
            top: 0,
          }
        : aAnimation;

      // 位置 js 控制；
      return (
        <TweenOne
          key={i}
          style={{ left, top, ...liStyle }}
          component="li"
          className={[isOpen ? "open block" : "block", "z-[0] inline-block absolute"].join(" ")}
          animation={liAnimation}
        >
          <TweenOne
            component="a"
            onClick={(e) => this.onImgClick(e, i)}
            style={{ left: imgLeft, top: imgTop, width: imgWidth, height: imgHeight }}
            className="block z-[1] absolute overflow-hidden"
            animation={aAnimation}
          >
            <img className="block object-cover w-full h-full" src={image} width="100%" height="100%" alt="" />
          </TweenOne>

          <TweenOneGroup
            enter={[
              { opacity: 0, duration: 0, type: "from", delay: 400 },
              { ease: "easeOutCubic", type: "from", left: isRight ? "50%" : "0%" },
            ]}
            leave={{ ease: "easeInOutCubic", left: isRight ? "50%" : "0%" }}
            component="section"
          >
            {isOpen && (
              <div
                className={[
                  `pic-details-demo-text-wrapper`,
                  "text-gray-500 w-1/2 bg-white px-4 py-3 inline-block absolute align-top",
                ].join(" ")}
                key="text"
                style={{ left: isRight ? "0%" : "50%", height: `${imgOpenHeight}px` }}
              >
                <h1 className="mx-auto my-1 text-lg">{title}</h1>
                <CloseOutlined className="top-[20px] absolute right-[20px]" onClick={(e) => this.onClose(e, i)} />
                <em className="h-[2px] w-16 bg-red-500 block" />
                <p className="mt-2 text-xs">{content}</p>
              </div>
            )}
          </TweenOneGroup>
        </TweenOne>
      );
    });
  };

  componentDidMount() {
    const targetElement = document.getElementById("cps-pic-details-wrapper");

    if (targetElement) {
      console.log({ targetElement });

      console.log({ width: targetElement.clientWidth });
    }
  }

  render() {
    return (
      <div
        className={[
          `pic-details-demo`,
          "my-[40px] mx-auto",
          "w-4/5 min-w-[550px] h-[800px]",
          "overflow-hidden rounded-sm",
        ].join(" ")}
      >
        {/* 标题部分 */}
        <QueueAnim type="bottom" className={["text-gray-500", "w-full my-[20px] mx-auto text-center"].join(" ")}>
          <h1 key="h1" className="text-4xl ">
            {this.state.title}
          </h1>
          <p key="p" className="mt-5 text-lg">
            {this.state.subTitle}
          </p>
        </QueueAnim>

        {/* 图片展示部分 */}
        <QueueAnim
          delay={this.getDelay}
          id="cps-pic-details-wrapper"
          component="ul"
          style={{ width: `${this.state.width}px` }}
          className={["relative list-none h-[300px] m-auto bg-yellow-600"].join(" ")}
          interval={0}
          type="bottom"
        >
          {this.getLiChildren()}
        </QueueAnim>
      </div>
    );
  }
}
