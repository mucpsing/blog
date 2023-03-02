/*
 * @Author: CPS holy.dandelion@139.com
 * @Date: 2023-02-07 19:55:02
 * @LastEditors: cpasion-office-win10 373704015@qq.com
 * @LastEditTime: 2023-03-01 17:24:20
 * @FilePath: \cps-blog\src\pages\index.tsx
 * @Description: 首页
 */
import React, { useEffect, useRef } from "react";


import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";

import HomepageFeatures from "@site/src/components/HomepageFeatures";
import HomepageSwiper from '@site/src/components/HomepageSwiper'

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
    <header className={clsx("hero hero--primary", styles.heroBanner)}>
      <div className={clsx(styles.containerLeft)}>
        <h1 className="hero__title">{siteConfig.title}</h1>
        <p>在这疯狂的时代，我们听到的名人言论</p>
        <TypedTitle />
        <div className={styles.buttons}>
          <Link className="button button--secondary button--lg" to="/">
            Docusaurus Tutorial - 5min ⏱️
          </Link>
        </div>
      </div>

    <div className={clsx(styles.containerRight)}>
      <HomepageSwiper />
    </div>
    </header>
  );
}

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout title={`Hello from ${siteConfig.title}`} description="Description will go into a meta tag in <head />">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
