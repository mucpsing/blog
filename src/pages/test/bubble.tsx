/*
 * @Author: cpasion-office-win10 373704015@qq.com
 * @Date: 2023-03-17 17:30:35
 * @LastEditors: cpasion-office-win10 373704015@qq.com
 * @LastEditTime: 2023-03-28 16:23:33
 * @FilePath: \cps-blog\src\pages\test\index.tsx
 * @Description: 性能太差
 */
import React from "react";
import TweenOne from "rc-tween-one";

import "./test.css";

class GridLayout {
  public gridX: number;
  public gridY: number;
  public cellWidth: number;
  public cellHeight: number;
  public grid: any[];

  constructor(rect, width, height) {
    this.gridX = Math.floor(width / rect);
    this.gridY = Math.floor(height / rect);
    this.cellWidth = width / this.gridX;
    this.cellHeight = height / this.gridY;
    this.grid = [];
    for (let i = 0; i < this.gridY; i += 1) {
      this.grid[i] = [];
      for (let s = 0; s < this.gridX; s += 1) {
        this.grid[i][s] = [];
      }
    }
  }

  getCells = (e) => {
    const gridArray = [];
    const w1 = Math.floor((e.x - e.radius) / this.cellWidth);
    const w2 = Math.ceil((e.x + e.radius) / this.cellWidth);
    const h1 = Math.floor((e.y - e.radius) / this.cellHeight);
    const h2 = Math.ceil((e.y + e.radius) / this.cellHeight);
    for (let c = h1; c < h2; c += 1) {
      for (let l = w1; l < w2; l += 1) {
        gridArray.push(this.grid[c][l]);
      }
    }
    return gridArray;
  };

  hasCollisions = (t) => this.getCells(t).some((e) => e.some((v) => this.collides(t, v)));

  collides = (t, a) => {
    if (t === a) return false;

    const n = t.x - a.x;
    const i = t.y - a.y;
    const r = t.radius + a.radius;
    return n * n + i * i < r * r;
  };

  add = (value) => {
    this.getCells(value).forEach((item) => {
      item.push(value);
    });
  };
}

interface Pos {
  x: number;
  y: number;
  radius: number;
}

const getPointPos = (width: number, height: number, count: number) => {
  const grid = new GridLayout(150, width, height);
  const posArray: Pos[] = [];
  const num = 500;
  const radiusArray = [20, 35, 60];
  for (let i = 0; i < count; i += 1) {
    let radius: number;
    let pos: Pos;
    let j = 0;

    for (let j = 0; j < num; j += 1) {
      radius = radiusArray[Math.floor(Math.random() * radiusArray.length)];
      pos = {
        x: Math.random() * (width - radius * 2) + radius,
        y: Math.random() * (height - radius * 2) + radius,
        radius,
      };

      if (!grid.hasCollisions(pos)) break;
    }
    posArray.push(pos);
    grid.add(pos);
  }
  return posArray;
};

const getDistance = (t, a) => Math.sqrt((t.x - a.x) * (t.x - a.x) + (t.y - a.y) * (t.y - a.y));

interface PointProps {
  tx: number;
  ty: number;
  x: number;
  y: number;
  opacity: number;
  backgroundColor: string;
  radius: number;
  className?: string;
}

class Point extends React.PureComponent<PointProps, any> {
  render() {
    const { tx, ty, x, y, opacity, backgroundColor, radius, ...props } = this.props;
    let transform: string;
    let zIndex = 0;
    let animation: any = {
      y: (Math.random() * 2 - 1) * 20 || 15,
      duration: 3000,
      delay: Math.random() * 1000,
      yoyo: true,
      repeat: -1,
    };

    if (tx && ty) {
      if (tx !== x && ty !== y) {
        const distance = getDistance({ x, y }, { x: tx, y: ty });
        const g = Math.sqrt(2000000 / (0.1 * distance * distance));
        transform = `translate(${(g * (x - tx)) / distance}px, ${(g * (y - ty)) / distance}px)`;
      } else if (tx === x && ty === y) {
        transform = `scale(${80 / radius})`;
        animation = { y: 0, yoyo: false, repeat: 0, duration: 300 };
        zIndex = 1;
      }
    }

    return (
      <div
        id="keys"
        className="rounded-[50%] w-full h-full"
        style={{
          left: x - radius,
          top: y - radius,
          width: radius * 1.8,
          height: radius * 1.8,
          opacity,
          zIndex,
          transform,
        }}
        {...props}
      >
        <TweenOne
          animation={animation}
          style={{ backgroundColor }}
          className="rounded-[50%] w-full h-full cursor-pointer"
        />
      </div>
    );
  }
}

interface LinkedAnimateProps {
  className?: string;
  count?: number; // 点的个数
}
interface LinkedAnimateState {
  data: any;
  tx: number;
  ty: number;
}

export default class LinkedAnimate extends React.Component<LinkedAnimateProps, LinkedAnimateState> {
  box: any;

  static defaultProps = {
    className: "linked-animate-demo",
    count: 50,
  };

  constructor(props) {
    super(props);
    this.state = {
      data: getPointPos(500, 300, this.props.count).map((item) => ({
        ...item,
        opacity: Math.random() * 0.2 + 0.05,
        backgroundColor: `rgb(${Math.round(Math.random() * 95 + 160)},255,255)`,
      })),
      tx: 0,
      ty: 0,
    };
  }

  componentDidMount(): void {
    const { width, height } = this.box.getBoundingClientRect();
    const newState = {
      data: getPointPos(width, height, this.props.count).map((item) => ({
        ...item,
        opacity: Math.random() * 0.2 + 0.05,
        backgroundColor: `rgb(${Math.round(Math.random() * 95 + 160)},255,255)`,
      })),
      tx: 0,
      ty: 0,
    };

    this.setState(newState);
  }

  onMouseMove = (e) => {
    const cX = e.clientX;
    const cY = e.clientY;
    const boxRect = this.box.getBoundingClientRect();
    const pos = this.state.data
      .map((item) => {
        const { x, y, radius } = item;
        return { x, y, distance: getDistance({ x: cX - boxRect.x, y: cY - boxRect.y }, { x, y }) - radius };
      })
      .reduce((a, b) => {
        if (!a.distance || a.distance > b.distance) {
          return b;
        }
        return a;
      });
    if (pos.distance < 60) {
      this.setState({
        tx: pos.x,
        ty: pos.y,
      });
    } else {
      this.onMouseLeave();
    }
  };

  onMouseLeave = () => {
    this.setState({
      tx: 0,
      ty: 0,
    });
  };

  render() {
    const { data, tx, ty } = this.state;
    return (
      <div
        className="overflow-hidden h-[500px] relative flex justify-center"
        style={{ background: "linear-gradient(150deg,#d299c2,#fef9d7)" }}
      >
        <div
          className={`absolute w-4/5 h-full block`}
          ref={(c) => (this.box = c)}
          onMouseMove={this.onMouseMove}
          onMouseLeave={this.onMouseLeave}
        >
          {data.map((item, i) => (
            <Point
              {...item}
              tx={tx}
              ty={ty}
              key={i.toString()}
              className="absolute transition-transform duration-[0.45s] ease-in-out"
            />
          ))}
        </div>
      </div>
    );
  }
}
