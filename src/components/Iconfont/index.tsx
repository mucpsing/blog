import React from "react";
import BrowserOnly from "@docusaurus/BrowserOnly";

import classnames from "classnames";
import "./iconfont.css";

interface IconfontProps {
  iconName: string;
  className?: string;
  iconPrefix?: string;
  [restProps: string]: any;
}

declare global {
  interface Window {
    CPS_ICONFONT_INIT: boolean;
  }
}

export function IconfontInit(src: string = "") {
  return (
    <BrowserOnly>
      {() => {
        if (window.CPS_ICONFONT_INIT) return;
        const ICONFIGT_SRC = src || "//at.alicdn.com/t/c/font_3959151_f86s1etjfv.js";
        const scriptElem = document.createElement("script");
        scriptElem.src = ICONFIGT_SRC;
        document.body.appendChild(scriptElem);
        window.CPS_ICONFONT_INIT = true;
        return <div className="hidden">{window.CPS_ICONFONT_INIT}</div>;
      }}
    </BrowserOnly>
  );
}

export default function Iconfont({ iconName, className = "", iconPrefix = "", ...restProps }: IconfontProps) {
  IconfontInit();
  return (
    <svg className={classnames("iconfontDefault", className)} aria-hidden="true" {...restProps}>
      <use xlinkHref={`#${iconPrefix}${iconName}`} />
    </svg>
  );
}
