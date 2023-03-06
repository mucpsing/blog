import React from "react";
import { RightOutlined, LeftOutlined } from "@ant-design/icons";

import QueueAnim from "rc-queue-anim";
import BannerAnim, { Element } from "rc-banner-anim";

interface SwiperState {
  show: boolean;
}

function Demo(props: { show: boolean }) {
  return (
    <QueueAnim
      delay={600}
      type={["top", "bottom"]}
      className={["w-full h-[500px]", "flex justify-center items-center bg-red-400"].join(" ")}
    >
      <QueueAnim
        type={["right", "right"]}
        className="relative flex main w-[800px] h-4/5 text-start bg-white rounded-md"
        key="main"
      >
        {props.show
          ? [
              <QueueAnim className="flex items-center justify-center w-1/2 p-4 left" key="left">
                <img src="img/mimi.png" alt="" width={"80%"} />
              </QueueAnim>,

              <QueueAnim type="bottom" className="w-1/2 p-4 right" key="right" duration={600} delay={[300, 2000]}>
                <h2 className="mt-2 text-2xl" key="title">
                  <strong>title</strong>
                </h2>
                <em className="block w-[20%] h-1 bg-yellow-400 mt-2" key="line"></em>
                <p className="mt-2" key="body">
                  context context context context context context context context context context context context{" "}
                </p>
              </QueueAnim>,

              <div className="absolute flex justify-between w-full -translate-y-1/2 top-1/2">
                <LeftOutlined className="cursor-pointer" />
                <RightOutlined className="cursor-pointer" />
              </div>,
            ]
          : null}
      </QueueAnim>
    </QueueAnim>
  );
}

export default class Swiper extends React.Component<any, SwiperState> {
  constructor(props) {
    super(props);

    this.state = {
      show: true,
    };
  }

  test = () => {
    this.setState({ show: !this.state.show });
  };

  render() {
    return (
      <div className="w-full">
        <button onClick={this.test}> switch </button>
        {/* <BannerAnim >
          <Element key="0">
            <Demo show={this.state.show} />
          </Element>
          <Element key="1">
            <Demo show={this.state.show} />
          </Element>
        </BannerAnim> */}
      </div>
    );
  }
}
