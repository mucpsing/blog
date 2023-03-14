/*
 * @Author: CPS holy.dandelion@139.com
 * @Date: 2023-02-07 19:55:02
 * @LastEditors: CPS holy.dandelion@139.com
 * @LastEditTime: 2023-03-15 00:55:29
 * @FilePath: \cps-blog\src\pages\index.tsx
 * @Description: 首页
 */
import React, { useEffect, useRef } from "react";

import Layout from "@theme/Layout";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";

import HomepageFeatures from "@site/src/components/HomepageFeatures";
import HomepageSwiper from "@site/src/components/HomepageSwiper";
import HomePageImgShow from "@site/src/components/HomepageImgShow";
import Test from "@site/src/components/HomepageImgShow/test";

import _ from "lodash";
import clsx from "clsx";
import Typed from "typed.js";

import styles from "./index.module.css";

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
    return () => {
      typed.destroy();
    };
  }, []);
  return (
    <p className="hero__subtitle">
      <span ref={el}></span>
    </p>
  );
}

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx("hero hero--primary flex flex-col", styles.heroBanner)}>
      <HomepageSwiper className={"details-switch-demo"} />
    </header>
  );
}

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout title={`Hello from ${siteConfig.title}`} description="Description will go into a meta tag in <head />">
      <HomepageHeader />
      <HomePageImgShow />
      {/* <Test></Test> */}
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
