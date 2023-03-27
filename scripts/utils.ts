/*
 * @Author: CPS holy.dandelion@139.com
 * @Date: 2023-03-25 16:10:31
 * @LastEditors: CPS holy.dandelion@139.com
 * @LastEditTime: 2023-03-25 21:47:32
 * @FilePath: \cps-blog\scripts\utils.ts
 * @Description: 一些会被重复调用的工具函数
 */

import * as fs from "fs";
import * as path from "path";

import type { NavbarItem } from "@docusaurus/theme-common/src/utils/useThemeConfig";

export interface NavItemParams {
  targetPath: string;
  excludeDirList?: string[] | null;
  inDeep?: boolean;
  prefixUrl?: string;
}

/**
 * @description: 根据指定的文件夹生成菜单：学习笔记 【子菜单】
 * @param {string} targetPath 指定的文件夹
 * @param {string} excludeDirList 一些不想包含在内的目录
 * @param {boolean} inDeep 是否递归读取，如果递归，则列出所有md文件，否则仅列出顶层的目录
 * @param {string} prefixUrl url的前缀，如果使用inDeep，这个是必须的
 */
export function createNavItemByDir({
  targetPath,
  excludeDirList = null,
  inDeep = false,
  prefixUrl = "",
}: NavItemParams) {
  if (!excludeDirList) excludeDirList = Array();

  let resList = fs.readdirSync(targetPath);
  let dirname = path.basename(targetPath);

  let navbarItemList: NavbarItem[] = [];
  resList.forEach((rootDirFile) => {
    let fullPath = path.join(targetPath, rootDirFile);
    let stat = fs.statSync(fullPath);

    // 存在与排除列表，不进行添加
    if ((excludeDirList as string[]).includes(rootDirFile)) return;

    // 展开目录，仅支持2层
    if (!inDeep) {
      if (stat.isDirectory()) {
        navbarItemList.push({
          to: prefixUrl ? `${prefixUrl}/${rootDirFile}` : `${dirname}/${rootDirFile}`,
          label: rootDirFile,
        });
      }
    } else {
      if (stat.isDirectory()) {
        let fileSubList = fs.readdirSync(fullPath);

        // 该目录存在index.md的话，仅将index.md暴露出来
        if (fileSubList.includes("index.md")) {
          navbarItemList.push({
            to: prefixUrl ? `${prefixUrl}/${rootDirFile}/index.md` : `${rootDirFile}/index.md`,
            label: `${rootDirFile}`,
          });
        } else {
          // 不存在index.md 将生成 【目录名】+ 文件名 的方式进行暴露
          fileSubList.forEach((eachSubFile) => {
            let fullSubPath = path.join(fullPath, eachSubFile);

            if ((excludeDirList as string[]).includes(eachSubFile)) return;

            if (fs.statSync(fullSubPath).isFile() && eachSubFile.endsWith(".md")) {
              const basename = eachSubFile.split(".")[0];

              navbarItemList.push({
                to: prefixUrl ? `${prefixUrl}/${rootDirFile}/${eachSubFile}` : `${rootDirFile}/${eachSubFile}`,
                label: `【${rootDirFile}】${basename}`,
              });
            }
          });
        }
      }
    }
  });

  return navbarItemList;
}

// const res = createNavItemByDir({
//   targetPath: path.resolve("D:/CPS/MyProject/Projects_Personal/cps-blog/docs/【05】项目经历/原创作品/"),
//   excludeDirList: ["index.md"],
//   prefixUrl: "docs/【05】项目经历/原创作品",
//   inDeep: true,
// });

// console.log(res);
