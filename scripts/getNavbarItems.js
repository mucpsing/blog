/*
 * @Author: CPS holy.dandelion@139.com
 * @Date: 2023-02-27 09:37:30
 * @LastEditors: CPS holy.dandelion@139.com
 * @LastEditTime: 2023-02-27 10:04:00
 * @FilePath: \cps-blog\scripts\getNavbarItems.js
 * @Description: 根据docs目录，生成对应的导航栏
 */
const fs = require("fs");
const path = require("path");

function getNavbarItems(docsPathStr, excludeLIst = null) {
  if (!excludeLIst) excludeLIst = Array();

  let resList = fs.readdirSync(docsPathStr);
  let dirname = path.basename(docsPathStr);

  let navbarItemList = [];
  resList.forEach((eachFile) => {
    let fullPath = path.join(docsPathStr, eachFile);
    if (fs.statSync(fullPath).isDirectory() && !excludeLIst.includes(eachFile)) {
      navbarItemList.push({
        to: `${dirname}/${eachFile}`,
        label: eachFile,
      });
    }
  });

  return navbarItemList;
}

module.exports = { getNavbarItems };
