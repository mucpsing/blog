/*
 * @Author: CPS holy.dandelion@139.com
 * @Date: 2023-02-07 19:55:02
 * @LastEditors: CPS holy.dandelion@139.com
 * @LastEditTime: 2023-04-06 21:47:28
 * @FilePath: \cps-blog\src\pages\index.tsx
 * @Description: 首页
 */
import React, { useEffect } from "react";

import Layout from "@theme/Layout";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";

import HomepageFeatures from "@site/src/components/HomepageFeatures";
import HomepageSwiper from "@site/src/components/HomepageSwiper";
// import HomePageImgShow from "@site/src/components/HomepageImgShow";

import "./index.css";

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout title={`Hello from ${siteConfig.title}`} description="Description will go into a meta tag in <head />">
      <header className="relative flex flex-col">
        <HomepageSwiper />
      </header>

      <main>
        {/* <HomePageImgShow /> */}

        <HomepageFeatures />
      </main>
    </Layout>
  );
}
