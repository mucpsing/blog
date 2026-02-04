/*
 * @Author: cpasion-office-win10 373704015@qq.com
 * @Date: 2026-02-04 15:44:49
 * @LastEditors: cpasion-office-win10 373704015@qq.com
 * @LastEditTime: 2026-02-04 15:52:32
 * @FilePath: \docusaurus-v2\scripts\copyDocsProjectFiles.mjs
 * @Description: 为了确保【05】项目经历和【07】常识科普两个重要依赖路由能够每次都最新，这里在package.json中添加启动脚本，每次启动都复制最新的文件到docs文件夹下
 */
import path from "path";
import fse from "fs-extra";

const docsList = [path.resolve("../cps-blog/docs"), "D:/CPS/docs"];

docsList.forEach((docsPath) => {
  console.log(`targetPath: ${docsPath}`);
  if (fse.existsSync(docsPath)) {
    // 这两个文件夹动态生成一些与处理数据
    fse.copySync(path.join(docsPath, "/【05】项目经历"), path.join(path.resolve("./docs"), "/【05】项目经历"));
    fse.copySync(path.join(docsPath, "/【07】常识科普"), path.join(path.resolve("./docs"), "/【07】常识科普"));
  }
});
