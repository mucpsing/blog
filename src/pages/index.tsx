/*
 * @Author: CPS holy.dandelion@139.com
 * @Date: 2023-02-07 19:55:02
 * @LastEditors: cpasion-office-win10 373704015@qq.com
 * @LastEditTime: 2023-03-17 16:21:10
 * @FilePath: \cps-blog\src\pages\index.tsx
 * @Description: 首页
 */
import React from "react";

import Layout from "@theme/Layout";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";

import HomepageFeatures from "@site/src/components/HomepageFeatures";
import HomepageSwiper from "@site/src/components/HomepageSwiper";
import HomePageImgShow from "@site/src/components/HomepageImgShow";

import "./index.css";

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout title={`Hello from ${siteConfig.title}`} description="Description will go into a meta tag in <head />">
      <header className="flex flex-col">
        <HomepageSwiper />
      </header>

      <main>
        <HomePageImgShow />

        <HomepageFeatures />
      </main>
    </Layout>
  );
}
