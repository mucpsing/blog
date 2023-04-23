/*
 * @Author: cpasion-office-win10 373704015@qq.com
 * @Date: 2023-04-23 16:10:50
 * @LastEditors: cpasion-office-win10 373704015@qq.com
 * @LastEditTime: 2023-04-23 17:04:57
 * @FilePath: \cps-blog\scripts\compressPng.ts
 * @Description: 压缩指定目录的png图片，build后执行的脚本
 */
import path from "path";
import glob from "glob";

const PNG_QUANT_PATH = path.resolve("./scripts/tools/pngquant/bin/ongquant.exe");
const targetDir = path.resolve(".");

(async () => {
  glob.sync("build/**/*.png").forEach((png) => {
    const fullPath = path.resolve(png);

    console.log(fullPath);
  });
})();
