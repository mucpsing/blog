/*
 * @Author: CPS holy.dandelion@139.com
 * @Date: 2023-02-07 19:55:02
 * @LastEditors: CPS holy.dandelion@139.com
 * @LastEditTime: 2023-04-17 21:10:02
 * @FilePath: \cps-blog\src\pages\index.tsx
 * @Description: 首页
 */
import React from "react";
import Head from "@docusaurus/Head";

import Layout from "@theme/Layout";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";

import HomepageFeatures from "@site/src/components/HomepageFeatures";
import HomepageSwiper from "@site/src/components/HomepageSwiper";

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout title={`Hello from ${siteConfig.title}`} description="Description will go into a meta tag in <head />">
      <Head>
        {/* 修复css不加载的问题 */}
        <link rel="stylesheet" href="/css/globalcss.css" />
      </Head>
      <header className="relative flex flex-col">
        <HomepageSwiper />
      </header>

      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
