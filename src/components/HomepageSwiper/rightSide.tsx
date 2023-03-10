/*
 * @Author: CPS holy.dandelion@139.com
 * @Date: 2023-03-06 23:17:09
 * @LastEditors: cpasion-office-win10 373704015@qq.com
 * @LastEditTime: 2023-03-07 15:05:33
 * @FilePath: \cps-blog\src\components\HomepageSwiper\rightSide.tsx
 * @Description: 首页标题区域
 */

import React, { useEffect, useRef } from "react";
import Typed from "typed.js";
import _ from "lodash";

import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";

import styles from "@site/src/pages/index.module.css";

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

    return () => typed.destroy();
  }, []);
  return (
    <p className="h-28 my-2 hero__subtitle">
      <span className="transform" ref={el}></span>
    </p>
  );
}

export default function HomeTitle() {
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
