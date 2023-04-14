/*
 * @Author: CPS holy.dandelion@139.com
 * @Date: 2023-03-25 16:10:31
 * @LastEditors: cpasion-office-win10 373704015@qq.com
 * @LastEditTime: 2023-04-14 17:57:13
 * @FilePath: \cps-blog\scripts\utils.ts
 * @Description: 一些会被重复调用的工具函数
 */

import * as fs from "fs";
import * as fsp from "fs/promises";
import * as path from "path";
import * as yaml from "yaml";

import type { NavbarItem } from "@docusaurus/theme-common/src/utils/useThemeConfig";

type NewNavbarItem = {
  title?: string;
  tags?: string[];
  description?: string;
  website?: string;
  github?: string;
  gitee?: string;
} & NavbarItem;
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

  let navbarItemList: NewNavbarItem[] = [];
  resList.forEach((rootDirFile) => {
    let fullPath = path.join(targetPath, rootDirFile);
    let stat = fs.statSync(fullPath);

    // 存在与排除列表，不进行添加
    if ((excludeDirList as string[]).includes(rootDirFile)) return;

    // inDeep空值是否展开目录，目前仅支持2层读取，不想处理太多递归问题
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
            to: prefixUrl ? `${prefixUrl}/${rootDirFile}` : `${rootDirFile}`,
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
                to: prefixUrl ? `${prefixUrl}/${rootDirFile}/${basename}` : `${rootDirFile}/${basename}`,
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

export function readMdMetaData() {}

const res = createNavItemByDir({
  targetPath: path.resolve("./docs/【05】项目经历/原创作品/"),
  excludeDirList: ["index.md"],
  prefixUrl: "docs/【05】项目经历/原创作品",
  inDeep: true,
});

const ret = createNavItemByDir({
  targetPath: path.resolve("./docs/【05】项目经历/完整项目/"),
  excludeDirList: ["index.md"],
  prefixUrl: "docs/【05】项目经历/完整项目",
  inDeep: true,
});

export async function readMarkdownInfo(filePaths: string) {
  const data = await fsp.readFile(filePaths, { encoding: "utf8" });
  let dataList = data.split(/[(\r\n)\r\n]+/);
  console.log(dataList.length);

  const FIND_FLAG = "---";
  let regionLine: number[] = [];
  let hasStartFlag = false;

  dataList.forEach((eachLine, index) => {
    if (eachLine.trim().includes(FIND_FLAG)) {
      // 查找头部
      if (!hasStartFlag) {
        console.log(`${index}行找到flag, ${FIND_FLAG}`);
        regionLine.push(index);
        hasStartFlag = true;
        return;
      }

      if (hasStartFlag) {
        // 查找尾部
        regionLine.push(index);
        hasStartFlag = false;
        return;
      }
    }
  });

  try {
    if (regionLine.length != 2) return {};

    const infoData = dataList.slice(regionLine[0] + 1, regionLine[1] - regionLine[0]).join("\n");
    const yaml2Json = yaml.parse(infoData);

    return yaml2Json;
  } catch (error) {
    console.log({ error });
    return {};
  }

  return {};
}

(async () => {
  const output_js = path.resolve("./data/project.js");
  const target = path.resolve("./docs/【05】项目经历/原创作品/ST插件/生成文件头.md");

  const data = await readMarkdownInfo(target);

  const output_data = ["exports.projects = [", JSON.stringify(data, undefined, "  "), "];"].join("\n");

  await fsp.writeFile(output_js, output_data);

  console.log(output_data);
})();
