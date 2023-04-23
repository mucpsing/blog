import React from "react";
import ReactDOM from "react-dom";
import type { ICpsImgSwiperDataItem } from "./data";

export interface ImagePreviewProps {
  src?: string;
}
export interface ImagePreviewState {
  show?: boolean;
}

const IMG_CACHE = [];
let SHOW: boolean = false;

class ImagePreview extends React.Component<ImagePreviewProps, ImagePreviewState> {
  constructor(props) {
    super(props);
  }

  close = () => {
    console.log("关闭");
    this.setState({ show: false });
    SHOW = false;
  };

  render(): React.ReactNode {
    return (
      <div
        className={[
          "overlay z-[1000]",
          SHOW ? "" : "hidden",
          "absolute w-full h-full top-0 left-0 flex justify-center items-center",
          "bg-black/70",
        ].join(" ")}
        onClick={this.close}
      >
        <img className="" src={this.props.src} alt="img" />
      </div>
    );
  }
}

export default (target: ICpsImgSwiperDataItem) => {
  console.log({ target });

  // 单例
  const createImgPreviewElement = () => {
    let div = document.createElement("div");
    div.id = "cps-img-preview";
    div.style.position = "absolute";
    div.style.top = "0";
    div.style.left = "0";
    div.style.width = "100%";
    div.style.height = "100%";
    // div.style.pointerEvents = "none"

    document.body.appendChild(div);
    return div;
  };

  let element: HTMLElement | undefined;

  try {
    element = document.getElementById("cps-img-preview");
  } catch (err) {
    console.log("需要重新创建");
  }

  if (!element) {
    element = createImgPreviewElement();
  }

  SHOW = true;
  ReactDOM.render(<ImagePreview src={target.gif ? target.gif : target.mainImg} />, element);
};
