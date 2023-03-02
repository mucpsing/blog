/*
 * @Author: CPS-surfacePro7 holy.dandelion@139.com
 * @Date: 2023-01-30 00:13:35
 * @LastEditors: CPS-surfacePro7 holy.dandelion@139.com
 * @LastEditTime: 2023-01-30 00:16:10
 * @FilePath: \blog-Docusaurus2\src\pages\project\index.jsx
 * @Description: 个人项目页
 */

import React from "react";
import Layout from "@theme/Layout";

const messages = "展示一些个人项目";

export default function Hello() {
  return (
    <Layout title="Hello" description="Hello React Page">
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
          fontSize: "20px",
        }}
      >
        {messages}
      </div>
    </Layout>
  );
}
