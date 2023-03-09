import React, { useState } from "react";
import QueueAnim from "rc-queue-anim";

import data from "./data";

let CURRT_HOVER_INDRX = -1;

/**
 * @description: 用来保留tailwindcss的grid-cols类名
 */
function TempClass() {
  return (
    <ul className="hidden grid-cols-1 grid-cols-2 grid-cols-3 grid-cols-4 grid-cols-5 grid-cols-6 grid-cols-7 grid-cols-8 grid-cols-9 grid-cols-10 grid-cols-11 grid-cols-12 grid-cols-13"></ul>
  );
}

function onHover(index: number) {
  console.log({ index });

  CURRT_HOVER_INDRX = index;
}

function ImageList(props: { clos: number }) {
  const [currtIndex, setCurrtIndex] = useState(-1);
  const [baseWidth, setBaseWidth] = useState(-1);
  const [baseHeight, setBaseHeight] = useState(-1);

  const onHover = (e: any, index: number) => {
    const target = e.target;

    if (baseWidth === -1 && target.clientWidth) setBaseWidth(target.clientWidth);
    if (baseHeight === -1 && target.clientHeight) setBaseHeight(target.clientHeight);

    setCurrtIndex(index);

    console.log({ w: target.clientWidth, h: target.clientHeight, x: target.x, y: target.y });
  };

  return (
    <QueueAnim component="div" type="bottom" className={[`grid-cols-${props.clos}`, "grid gap-10 relative"].join(" ")}>
      {data.map((item, i) => {
        let key = i.toString();
        return (
          <div className="w-full cursor-pointer" key={key} onMouseEnter={(e) => onHover(e, i)}>
            <img src={item.image} alt={key} />
          </div>
        );
      })}

      <div className="absolute bg-white opacity-50" style={{ width: `${baseWidth}px`, height: `${baseHeight}px` }}>
        {currtIndex}
      </div>
    </QueueAnim>
  );
}

export default function Test(props) {
  return (
    <section className="w-full p-10 bg-red-400">
      {/* <TempClass></TempClass> */}
      <QueueAnim component="header" delay={300} type="bottom" className="text-center">
        <h2 className="my-4 text-4xl" key="title">
          项目展示
        </h2>
        <p className="my-5 text-lg" key="subTitle">
          以下项目中的所有商业项目均通过甲方同意公开后才展示
        </p>
      </QueueAnim>
      {ImageList({ clos: 4 })}
    </section>
  );
}
