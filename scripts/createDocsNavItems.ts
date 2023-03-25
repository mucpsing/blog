/*
 * @Author: CPS holy.dandelion@139.com
 * @Date: 2023-02-27 09:37:30
 * @LastEditors: CPS holy.dandelion@139.com
 * @LastEditTime: 2023-03-25 12:45:52
 * @FilePath: \cps-blog\scripts\getNavbarItems.js
 * @Description: 根据docs目录，生成对应的导航栏
 */
import * as fs from "fs";
import * as path from "path";

export interface NavbarItem {
  to: string;
  label: string;
}

export function createDocsNavItems(docsPathStr: string, excludeLIst: string[] | null = null) {
  if (!excludeLIst) excludeLIst = Array();

  let resList = fs.readdirSync(docsPathStr);
  let dirname = path.basename(docsPathStr);

  let navbarItemList: NavbarItem[] = [];
  resList.forEach((eachFile) => {
    let fullPath = path.join(docsPathStr, eachFile);
    if (fs.statSync(fullPath).isDirectory() && !(excludeLIst as string[]).includes(eachFile)) {
      navbarItemList.push({
        to: `${dirname}/${eachFile}`,
        label: eachFile,
      });
    }
  });

  return navbarItemList;
}
