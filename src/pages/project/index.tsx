/*
 * @Author: CPS-surfacePro7 holy.dandelion@139.com
 * @Date: 2023-01-30 00:13:35
 * @LastEditors: CPS holy.dandelion@139.com
 * @LastEditTime: 2023-04-03 00:23:20
 * @FilePath: \blog-Docusaurus2\src\pages\project\index.jsx
 * @Description: 个人项目页
 */

import React from "react";
import Layout from "@theme/Layout";

const TITLE = "展示一些个人项目";
const DESCRIPTION = "以下展示的项目均由本人独立开发，商业产品类型的项目均已取得甲方同意方才展示或开源。";
const GITHUB_URL = "https://github.com/muccppss";
const GITEE_URL = "https://gitee.com/capsion";

function ProjectHeader() {
  return (
    <section className="my-10 text-center">
      <h1>{TITLE}</h1>
      <p>
        <strong>重要声明：</strong>
        {DESCRIPTION}
      </p>
      <div>
        <a className="mr-2 button button--primary" href={GITHUB_URL} target="_blank" rel="noreferrer">
          前往 Github
        </a>
        <a className="button button--primary" href={GITEE_URL} target="_blank" rel="noreferrer">
          前往 Gitee
        </a>
      </div>
    </section>
  );
}

export default function ProjectPage() {
  return (
    <Layout title={TITLE} description={DESCRIPTION}>
      <main>
        <ProjectHeader />
      </main>
    </Layout>
  );
}
