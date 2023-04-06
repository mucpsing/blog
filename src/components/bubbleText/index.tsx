/*
 * @Author: cpasion-office-win10 373704015@qq.com
 * @Date: 2023-03-28 16:25:46
 * @LastEditors: CPS holy.dandelion@139.com
 * @LastEditTime: 2023-04-06 23:01:52
 * @FilePath: \cps-blog\src\pages\test\index.tsx
 * @Description: 泡泡文字聚散效果组建，父级元素必须采用绝对定位，最终泡泡扩散的位置会根据最近一个绝对定位的父级来生成
 */
import React from "react";
import ReactDOM from "react-dom";
import TweenOne from "rc-tween-one";
import ticker from "rc-tween-one/lib/ticker";
import { throttle, type DebouncedFunc } from "lodash";

import "./bubble.css";

interface LogoGatherProps {
  image?: string;
  width?: number;
  height?: number;
  bubbleSize?: number;
  bubbleSizeMin?: number; // 泡泡的最小尺寸
  intervalTime?: number;
  bubbleScale?: number;
  positionElementId?: string;
  opacity?: number;
  opacityMax?: number;
  opacitymin?: number;
}

interface LogoGatherState {
  top: number | string;
  left: number | string;
  right: number | string;
  bottom: number | string;
  transform: string;

  children: any[];
  boxAnim: any;
}
export default class LogoGather extends React.Component<LogoGatherProps, LogoGatherState> {
  static defaultProps = {
    image: "/logo/capsion.png",
    width: 600,
    height: 200,
    bubbleScale: 1,
    bubbleSize: 10,
    bubbleSizeMin: 5,
    intervalTime: 8000,
    positionElementId: "",
    opacityMax: 0.9,
    opacitymin: 0.7,
  };

  public gather: boolean;
  public interval: null | number;
  public intervalTime: number;
  public pointArray: { x: number; y: number }[];

  public dom: Element;
  public sideBox: Element;
  public sideBoxComp: Element;
  public parent: Element;
  public positionElement: Element;
  public IS_CURRT_WEB_PAGE: boolean = true;
  public resizeEvent: DebouncedFunc<() => boolean>;

  constructor(props) {
    super(props);
    this.state = {
      top: 0, // 初始位置进行隐藏
      left: 0, // 初始位置进行隐藏
      bottom: "unset",
      right: "unset",
      children: [],
      boxAnim: {},
      transform: null,
    };

    this.gather = true;
    this.interval = null;
  }

  init = () => {
    let isDone: boolean = false;
    const taskID = setInterval(() => {
      isDone = this.updatePositions();

      console.log("查找定位元素", isDone);

      if (isDone) {
        clearInterval(taskID);
        this.createPointData();

        setTimeout(() => {
          this.onMouseLeave({ target: { id: "LogoGather.init" } });
        }, this.props.intervalTime / 2);
      }
    }, 1000);
  };

  componentDidMount() {
    this.dom = ReactDOM.findDOMNode(this) as Element;

    this.init();

    document.addEventListener("visibilitychange", () => {
      var isHidden = document.hidden;

      if (isHidden) {
        document.title = "死鬼，你去哪儿了！";
        this.IS_CURRT_WEB_PAGE = false;
      } else {
        document.title = "死鬼，你终于回来拉！";
        this.IS_CURRT_WEB_PAGE = true;
      }
    });

    this.resizeEvent = throttle(this.updatePositions, 200);
    window.addEventListener("resize", this.resizeEvent);
  }

  componentWillUnmount() {
    ticker.clear(this.interval);
    this.interval = null;
    this.updateTweenData.cancel();

    window.removeEventListener("resize", this.resizeEvent);
    this.resizeEvent.cancel();
  }

  onMouseEnter = (e) => {
    if (!e || !e.target.id.startsWith("LogoGather")) return;

    if (!this.gather) this.updateTweenData();

    this.componentWillUnmount();
  };

  onMouseLeave = (e) => {
    if (!e || !e.target.id.startsWith("LogoGather")) return;

    if (this.gather) this.updateTweenData();

    if (this.interval == null) {
      this.interval = ticker.interval(this.updateTweenData, this.props.intervalTime);
    }
  };

  setDataToDom(data: Uint8ClampedArray, w: number, h: number) {
    this.pointArray = [];
    const number = this.props.bubbleSize;
    for (let i = 0; i < w; i += number) {
      for (let j = 0; j < h; j += number) {
        if (data[(i + j * w) * 4 + 3] > 150) {
          this.pointArray.push({ x: i, y: j });
        }
      }
    }
    const children = [];
    this.pointArray.forEach((item, i) => {
      const r = (Math.random() * this.props.bubbleSizeMin + this.props.bubbleSizeMin) * this.props.bubbleScale;
      const opacity = this.props.opacity
        ? this.props.opacity
        : Math.random() * this.props.opacitymin + this.props.opacitymin;

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
    const { width, height } = this.props;
    let canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, width, height);
    canvas.width = width;
    canvas.height = height;
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, width, height);
      const data = ctx.getImageData(0, 0, width, height).data;
      this.setDataToDom(data, width, height);
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
    const children = this.state.children.map((item) => {
      const r = (Math.random() * this.props.bubbleSizeMin + this.props.bubbleSizeMin) * 2;

      return React.cloneElement(item, {
        animation: {
          width: r,
          height: r,
          x: Math.random() * rect.width - sideLeft - item.props.style.left,
          y: Math.random() * rect.height - sideTop - item.props.style.top,
          opacity: this.props.opacity
            ? this.props.opacity
            : Math.random() * this.props.opacitymin + this.props.opacitymin,
          scale: Math.random() * 2.4 + 0.1,
          duration: Math.random() * 500 + 500,
          ease: "easeInOutQuint",
        },
      });
    });

    this.setState({ children });
  };

  updatePositions = (): boolean => {
    // console.log("updatePositions");

    // 不需要获取定位信息
    if (!this.props.positionElementId) {
      // console.log("不需要定位");
      return true;
    }

    if (!this.positionElement) {
      this.positionElement = document.getElementById(this.props.positionElementId);

      if (!this.positionElement) {
        console.log("获取元素失败");
        return false;
      }
    }

    if (!this.dom) {
      console.log("父级包裹元素实例读取失败");
      return false;
    }

    const { top, left, transform } = this.state;

    const refElement = this.positionElement.getBoundingClientRect();
    const parent = this.dom.getBoundingClientRect();

    const translateX = this.props.width / 2 - refElement.width / 2;
    const translateY = this.props.height / 2 - refElement.height / 2;
    const newTransform = `translate(-${translateX}px, -${translateY}px)`;

    const newTop = refElement.y - parent.y;
    const newLeft = refElement.x - parent.x;

    const newState = { top: newTop, left: newLeft, transform: newTransform };

    const oldStateString = JSON.stringify({ top, left, transform });
    const newStateString = JSON.stringify(newState);

    if (oldStateString != newStateString) this.setState(newState);

    return true;
  };

  updateTweenData = throttle(() => {
    try {
      if (!this.IS_CURRT_WEB_PAGE) return;

      this.dom = ReactDOM.findDOMNode(this) as Element;
      this.sideBox = ReactDOM.findDOMNode(this.sideBoxComp) as Element;

      if (this.gather) {
        this.disperseData();
      } else {
        this.gatherData();
      }

      this.gather = !this.gather;
    } catch (error) {
      // console.log("更新数据失败: ", error);
      this.updateTweenData.cancel();
      this.updateTweenData = null;
    }
  }, 1000);

  render() {
    const { top, left, bottom, right, transform } = this.state;
    return (
      <div id="logoContainer" className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <TweenOne
          animation={this.state.boxAnim}
          className="absolute pointer-events-auto bg-orange-300/10 rounded-2xl shadow-slate-700"
          style={{
            width: `${this.props.width}px`,
            height: `${this.props.height}px`,
            top,
            left,
            bottom,
            right,
            transform,
          }}
          onMouseEnter={this.onMouseEnter}
          onMouseLeave={this.onMouseLeave}
          id="LogoGather.hoverZone"
          ref={(c) => (this.sideBoxComp = c as any)}
        >
          {this.state.children}
        </TweenOne>
      </div>
    );
  }
}
