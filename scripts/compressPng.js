"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * @Author: cpasion-office-win10 373704015@qq.com
 * @Date: 2023-04-23 16:10:50
 * @LastEditors: cpasion-office-win10 373704015@qq.com
 * @LastEditTime: 2023-04-23 17:04:57
 * @FilePath: \cps-blog\scripts\compressPng.ts
 * @Description: 压缩指定目录的png图片，build后执行的脚本
 */
const path_1 = __importDefault(require("path"));
const glob_1 = __importDefault(require("glob"));
const PNG_QUANT_PATH = path_1.default.resolve("./scripts/tools/pngquant/bin/ongquant.exe");
const targetDir = path_1.default.resolve(".");
(async () => {
    glob_1.default.sync("build/**/*.png").forEach((png) => {
        const fullPath = path_1.default.resolve(png);
        console.log(fullPath);
    });
})();
