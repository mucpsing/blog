import React, { useEffect, useRef, useState } from "react";
import { RightOutlined, LeftOutlined } from "@ant-design/icons";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";

import Link from "@docusaurus/Link";

import BannerAnim from "rc-banner-anim";
import QueueAnim from "rc-queue-anim";
import { TweenOneGroup } from "rc-tween-one";

import { dataArray } from "./testData";

import _ from "lodash";
import clsx from "clsx";
import Typed from "typed.js";

import styles from "@site/src/pages/index.module.css";
import "rc-banner-anim/assets/index.css";
import "@site/src/components/HomepageSwiper/index.css";

const Element = BannerAnim.Element;
const COMPONENT_HEIGHT = 400;
const animConfigs = {
  left: [
    { translateX: [0, 300], opacity: [1, 0] },
    { translateX: [0, -300], opacity: [1, 0] },
  ],
  right: [
    { translateX: [0, 300], opacity: [1, 0] },
    { translateX: [0, -300], opacity: [1, 0] },
  ],
};

type ns = number | string;

type ImgAnim = { [key: string]: ns[] };
interface TestState {
  showInt: number;
  delay: number;
  imgAnim: ImgAnim[];
  oneEnter: boolean;
  id: { [ky: string]: string };
}

const InT: { [key: string]: ns[] } = { translateX: [0, 300], opacity: [1, 0] };
const OutT: { [key: string]: ns[] } = { translateX: [0, -300], opacity: [1, 0] };

function TypedTitle() {
  const { siteConfig } = useDocusaurusContext();
  const el = useRef(null);
  useEffect(() => {
    const typed = new Typed(el.current, {
      strings: _.shuffle(siteConfig.tagline.split(",")),
      startDelay: 1000,
      typeSpeed: 120,
      backSpeed: 120,
      backDelay: 4000,
      loop: true,
    });

    // Destroying
    return () => typed.destroy();
  }, []);
  return (
    <p className="my-2 hero__subtitle">
      <span className="transform" ref={el}></span>
    </p>
  );
}

function HomeTitle() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <div className={styles.containerLeft + " text-white"}>
      <h1 className="hero__title">{siteConfig.title}</h1>
      <p className="my-2">在这疯狂的时代，我们听到的名人言论</p>
      <TypedTitle />
      <div className={styles.buttons + " mx-2 mt-4 flex justify-center"}>
        <Link className="button button--secondary button--lg" to="/">
          About Me ⏱️
        </Link>

        <Link className="button button--secondary button--lg" to="/">
          About Me ⏱️
        </Link>
      </div>
    </div>
  );
}

function ImgChildren(props: { color: string; i: number; map: string; pic: string; imgAnim: any; delay: number }) {
  return (
    <Element key={props.i} leaveChildHide>
      <QueueAnim
        style={{ background: props.color, height: "50%" }}
        className="relative flex justify-center w-full h-full"
        animConfig={props.imgAnim}
        duration={(e) => (e.key === "map" ? 800 : 1000)}
        delay={[!props.i ? props.delay : 300, 0]}
        ease={["easeOutCubic", "easeInQuad"]}
        key="img-wrapper"
      >
        <div className="details-switch-demo-map" key="map">
          <img src={props.map} width="100%" alt="" />
        </div>
        <div className="details-switch-demo-pic" key="pic">
          <img src={props.pic} width="100%" alt="" />
        </div>
      </QueueAnim>
    </Element>
  );
}

export default class Test extends React.Component<any, TestState> {
  className: string = "details-switch-demo";
  bannerImg: any;
  bannerText: any;

  constructor(props) {
    super(props);
    this.state = {
      id: {},
      showInt: 0,
      delay: 0,
      imgAnim: [
        { translateX: [0, 300], opacity: [1, 0] }, // 进入
        { translateX: [0, -300], opacity: [1, 0] }, // 离开
      ],
      oneEnter: false,
    };
  }

  onChange = () => {
    this.state.showInt;
    if (!this.state.oneEnter) {
      this.setState({ delay: 300, oneEnter: true });
    }
  };

  onLeft = () => {
    let showInt = this.state.showInt;

    const imgAnim = [
      { translateX: [0, -300], opacity: [1, 0] },
      { translateX: [0, 300], opacity: [1, 0] },
    ];

    if (showInt <= 0) {
      showInt = dataArray.length - 1;
    } else {
      showInt -= 1;
    }

    this.setState({ showInt, imgAnim });
    this.bannerImg.prev();
    this.bannerText.prev();
  };

  onRight = () => {
    let showInt = this.state.showInt;
    const imgAnim = [
      { translateX: [0, 300], opacity: [1, 0] },
      { translateX: [0, -300], opacity: [1, 0] },
    ];

    if (showInt >= dataArray.length - 1) {
      showInt = 0;
    } else {
      showInt += 1;
    }

    this.setState({ showInt, imgAnim });
    this.bannerImg.next();
    this.bannerText.next();
  };

  getDuration = (e) => (e.key === "map" ? 800 : 1000);

  render() {
    // const imgChildren = dataArray.map((item, i) => (
    //   <ImgChildren
    //     imgAnim={this.state.imgAnim}
    //     delay={this.state.delay}
    //     color={item.color}
    //     pic={item.pic}
    //     map={item.map}
    //     i={i}
    //   ></ImgChildren>
    // ));

    const imgChildren = dataArray.map((item, i) => {
      return (
        <Element key={i} leaveChildHide>
          <QueueAnim
            className="relative flex items-center justify-center w-full h-full"
            animConfig={this.state.imgAnim}
            duration={this.getDuration}
            delay={[!i ? this.state.delay : 300, 0]}
            ease={["easeOutCubic", "easeInQuad"]}
            key="img-wrapper"
          >
            <div key="bg" className="absolute top-0 w-full h-1/2" style={{ background: item.color }}></div>
            <div className={`${this.props.className}-map absolute w-4/5`} key="map">
              <img src={item.map} width="100%" alt="" />
            </div>
            <div className={`${this.props.className}-pic absolute w-4/5`} key="pic">
              <img src={item.pic} width="100%" alt="" />
            </div>
          </QueueAnim>
        </Element>
      );
    });

    const textChildren = dataArray.map((item, i) => {
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

    return (
      <div
        className={clsx(
          `${this.props.className}-wrapper`,
          "flex justify-around items-center py-60 px-10 text-gray-700"
        )}
        style={{ background: dataArray[this.state.showInt].background }}
      >
        <div className="home-title w-[600px]">
          <HomeTitle />
        </div>

        <div className={this.props.className}>
          <BannerAnim
            prefixCls={`${this.props.className}-img-wrapper`}
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
            {imgChildren}
          </BannerAnim>
          <BannerAnim
            prefixCls={`${this.props.className}-text-wrapper`}
            sync
            type="across"
            duration={1000}
            arrow={false}
            thumb={false}
            ease="easeInOutExpo"
            ref={(c) => {
              this.bannerText = c;
            }}
            dragPlay={false}
          >
            {textChildren}
          </BannerAnim>

          <TweenOneGroup enter={{ opacity: 0, type: "from" }} leave={{ opacity: 0 }}>
            <LeftOutlined onClick={this.onLeft} />
            <RightOutlined onClick={this.onRight} />
          </TweenOneGroup>
        </div>
      </div>
    );
  }
}
