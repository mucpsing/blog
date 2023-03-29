/*
 * @Author: cpasion-office-win10 373704015@qq.com
 * @Date: 2023-03-28 16:25:46
 * @LastEditors: CPS holy.dandelion@139.com
 * @LastEditTime: 2023-03-30 00:49:31
 * @FilePath: \cps-blog\src\pages\test\index.tsx
 * @Description: 父级元素必须采用绝对定位
 */
import React from "react";
import ReactDOM from "react-dom";

import TweenOne from "rc-tween-one";
import ticker from "rc-tween-one/lib/ticker";

interface LogoGatherProps {
  image?: string;
  w?: number;
  h?: number;
  pixSize?: number;
  pointSizeMin?: number;
  intervalTime?: number;
  x?: number;
  y?: number;
  offsetX?: number;
  offsetY?: number;
}
export default class LogoGather extends React.Component<LogoGatherProps, any> {
  static defaultProps = {
    image: "logo/capsion.png",
    x: 0,
    y: 0,
    offsetX: 0,
    offsetY: 0,
    w: 600,
    h: 200,
    pixSize: 10,
    pointSizeMin: 5,
    intervalTime: 10000,
  };

  public gather: boolean;
  public interval: null | number;
  public intervalTime: number;
  public pointArray: { x: number; y: number }[];
  public sideBox: any;

  public dom: Element;
  public findDOMNode: Element;
  public sideBoxComp: Element;

  constructor(props) {
    super(props);
    this.state = {};

    this.gather = true;
    this.interval = null;
  }

  componentDidMount() {
    this.dom = ReactDOM.findDOMNode(this) as Element;
    this.createPointData();

    setTimeout(() => {
      this.onMouseLeave();
    }, 2000);
  }

  componentWillUnmount() {
    ticker.clear(this.interval);
    this.interval = null;
    console.log("in 3");
  }

  onMouseEnter = () => {
    // !this.gather && this.updateTweenData();

    if (!this.gather) this.updateTweenData();

    this.componentWillUnmount();
  };

  onMouseLeave = () => {
    // this.gather && this.updateTweenData();

    if (this.gather) this.updateTweenData();

    if (this.interval == null) {
      this.interval = ticker.interval(this.updateTweenData, this.props.intervalTime);
    }
  };

  setDataToDom(data, w, h) {
    console.log({ data });
    this.pointArray = [];
    const number = this.props.pixSize;
    for (let i = 0; i < w; i += number) {
      for (let j = 0; j < h; j += number) {
        if (data[(i + j * w) * 4 + 3] > 150) {
          this.pointArray.push({ x: i, y: j });
        }
      }
    }
    const children = [];
    this.pointArray.forEach((item, i) => {
      const r = Math.random() * this.props.pointSizeMin + this.props.pointSizeMin;
      const opacity = Math.random() * 0.4 + 0.2;
      const delay = Math.floor(Math.random() * (this.props.intervalTime / 3));
      const start = this.props.intervalTime / 2 - delay;

      const R = Math.round(Math.random() * 95 + 160);
      const G = Math.round(Math.random() * 95 + 160);
      const B = Math.round(Math.random() * 95 + 160);

      children.push(
        <TweenOne className="absolute rounded-[100%]" key={i} style={{ left: item.x, top: item.y }}>
          <div
            className="point rounded-[100%]"
            style={{
              width: r,
              height: r,
              opacity,
              backgroundColor: `rgb(${R},${G},${B})`,
              animation: `up-and-down-${(i % 2) + 1} ${start}ms ease-in-out ${delay}ms infinite`,
            }}
          ></div>

          {/* 这里使用的是js控制，由于性能原因，尝试改成css3控制 */}
          {/* <TweenOne
            className="point"
            style={{
              width: r,
              height: r,
              opacity: b,
              backgroundColor: `rgb(${Math.round(Math.random() * 95 + 160)},255,255)`,
            }}
            animation={{
              y: (Math.random() * 2 - 1) * 10 || 5,
              x: (Math.random() * 2 - 1) * 5 || 2.5,
              delay: Math.random() * 1000,
              repeat: -1,
              duration: 3000,
              yoyo: true,
              ease: "easeInOutQuad",
            }}
          /> */}
        </TweenOne>
      );
    });
    this.setState(
      {
        children,
        boxAnim: { opacity: 0, type: "from", duration: 800 },
      },
      () => {
        this.interval = ticker.interval(this.updateTweenData, this.props.intervalTime);
      }
    );
  }

  createPointData = () => {
    const { w, h } = this.props;
    let canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, w, h);
    canvas.width = this.props.w;
    canvas.height = h;
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, w, h);
      const data = ctx.getImageData(0, 0, w, h).data;
      this.setDataToDom(data, w, h);
      canvas.remove();
    };
    img.crossOrigin = "anonymous";
    img.src = this.props.image;
  };

  gatherData = () => {
    const children = this.state.children.map((item) =>
      React.cloneElement(item, {
        animation: {
          x: 0,
          y: 0,
          opacity: 1,
          scale: 1,
          delay: Math.random() * 500,
          duration: 800,
          ease: "easeInOutQuint",
        },
      })
    );
    this.setState({ children });
  };

  disperseData = () => {
    const rect = this.dom.getBoundingClientRect();
    const sideRect = this.sideBox.getBoundingClientRect();
    const sideTop = sideRect.top - rect.top;
    const sideLeft = sideRect.left - rect.left;
    const children = this.state.children.map((item) =>
      React.cloneElement(item, {
        animation: {
          x: Math.random() * rect.width - sideLeft - item.props.style.left,
          y: Math.random() * rect.height - sideTop - item.props.style.top,
          opacity: Math.random() * 0.4 + 0.1,
          scale: Math.random() * 2.4 + 0.1,
          duration: Math.random() * 500 + 500,
          ease: "easeInOutQuint",
        },
      })
    );

    this.setState({ children });
  };

  updateTweenData = () => {
    this.dom = ReactDOM.findDOMNode(this) as Element;
    this.sideBox = ReactDOM.findDOMNode(this.sideBoxComp);
    ((this.gather && this.disperseData) || this.gatherData)();
    this.gather = !this.gather;
  };

  render() {
    return (
      <div className="absolute w-full h-full overflow-hidden">
        <TweenOne
          animation={this.state.boxAnim}
          className="absolute"
          style={{
            width: `${this.props.w}px`,
            height: `${this.props.h}px`,
            top: this.props.y,
            left: this.props.x,
            transform: `translate(-${this.props.w / 2 - this.props.offsetX / 2}px,${
              this.props.y / 2 - this.props.offsetY / 2
            }px)`,
            // transform: `translateX(-${this.props.w / 2}px`,
          }}
          onMouseEnter={this.onMouseEnter}
          onMouseLeave={this.onMouseLeave}
          ref={(c) => (this.sideBoxComp = c as any)}
        >
          {this.state.children}
        </TweenOne>
      </div>
    );
  }
}
