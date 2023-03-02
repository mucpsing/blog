import React from "react";
import Layout from "@theme/Layout";

import BannerAnim from "rc-banner-anim";
import QueueAnim from "rc-queue-anim";
import { TweenOneGroup } from "rc-tween-one";

import { dataArray } from "./testData";

import "rc-banner-anim/assets/index.css";
import "@site/src/pages/test/test.css";

const Element = BannerAnim.Element;

type imgAnim = {
  translateX: number[];
  opacity: number[];
};
interface TestState {
  showInt: number;
  delay: number;
  imgAnim: imgAnim[];
  oneEnter: boolean;
}

export class Test extends React.Component<any, TestState> {
  className: string = "details-switch-demo";
  bannerImg: any;
  bannerText: any;

  constructor(props) {
    super(props);
    this.state = {
      showInt: 0,
      delay: 0,
      imgAnim: [
        { translateX: [0, 300], opacity: [1, 0] },
        { translateX: [0, -300], opacity: [1, 0] },
      ],
      oneEnter: false,
    };
    // this.oneEnter = false;
  }

  onChange() {
    this.state.showInt;
    if (!this.state.oneEnter) {
      this.setState({ delay: 300, oneEnter: true });
    }
  }

  onLeft = () => {
    let showInt = this.state.showInt;
    showInt -= 1;
    const imgAnim = [
      { translateX: [0, -300], opacity: [1, 0] },
      { translateX: [0, 300], opacity: [1, 0] },
    ];
    if (showInt <= 0) {
      showInt = 0;
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
    showInt += 1;
    if (showInt > dataArray.length - 1) {
      showInt = dataArray.length - 1;
    }
    this.setState({ showInt, imgAnim });
    this.bannerImg.next();
    this.bannerText.next();
  };

  getDuration = (e) => {
    if (e.key === "map") {
      return 800;
    }
    return 1000;
  };

  render() {
    const imgChildren = dataArray.map((item, i) => (
      <Element
        key={i}
        style={{
          background: item.color,
          height: "50%",
        }}
        leaveChildHide
      >
        <QueueAnim
          animConfig={this.state.imgAnim}
          duration={this.getDuration}
          delay={[!i ? this.state.delay : 300, 0]}
          ease={["easeOutCubic", "easeInQuad"]}
          key="img-wrapper"
        >
          <div className={`${this.props.className}-map map${i}`} key="map">
            <img src={item.map} width="100%" alt="" />
          </div>
          <div className={`${this.props.className}-pic pic${i}`} key="pic">
            <img src={item.pic} width="100%" alt="" />
          </div>
        </QueueAnim>
      </Element>
    ));

    const textChildren = dataArray.map((item, i) => {
      const { title, content, background } = item;
      return (
        <Element key={i}>
          <QueueAnim type="bottom" duration={1000} delay={[!i ? this.state.delay + 500 : 800, 0]}>
            <h1 key="h1">{title}</h1>
            <em key="em" style={{ background }} />
            <p key="p">{content}</p>
          </QueueAnim>
        </Element>
      );
    });

    return (
      <div
        className={`${this.props.className}-wrapper`}
        style={{ background: dataArray[this.state.showInt].background }}
      >
        <div className={this.props.className}>
          <BannerAnim
            prefixCls={`${this.props.className}-img-wrapper`}
            sync
            type="across"
            duration={1000}
            ease="easeInOutExpo"
            arrow={false}
            thumb={false}
            ref={(c) => {
              this.bannerImg = c;
            }}
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
            {this.state.showInt && (
              <div key="left" onClick={this.onLeft}>
                1
              </div>
            )}
            {this.state.showInt < dataArray.length - 1 && (
              <div key="right" onClick={this.onRight}>
                2
              </div>
            )}
          </TweenOneGroup>
        </div>
      </div>
    );
  }
}

// export default function Hello() {
//   return (
//     <Layout title="Hello" description="Hello React Page">
//       <Test className={"details-switch-demo"} />
//     </Layout>
//   );
// }
