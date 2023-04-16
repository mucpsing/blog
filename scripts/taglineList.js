"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractTagline = void 0;
const fs = __importStar(require("fs"));
/**
 * @Description - 提取名人名言生成成字符串列表
 *
 * @param {string} filePath  - 名人名言对应的md文件
 *
 * @returns {string[]} - {description}
 *
 */
function extractTagline(filePath) {
    const data = fs.readFileSync(filePath, { encoding: "utf8" });
    const dataList = data.split(/\r\n|\n|\r/gm);
    let talker = "";
    let context = "";
    const taglineList = [];
    dataList.forEach((eachLine) => {
        if (eachLine.trim().startsWith("### ")) {
            talker = eachLine.replace("### ", "");
        }
        else if (eachLine.trim().startsWith("- ")) {
            context = eachLine.replace("- ", "");
            if (talker && context) {
                context = `${talker}: ${context}`;
            }
            taglineList.push(context);
        }
    });
    return taglineList;
}
exports.extractTagline = extractTagline;
// (async () => {
//   const taglineMdPath = path.resolve("../docs/【07】常识科普/社会真实/名人名言.md");
//   const l = await extractTagline(taglineMdPath);
//   console.log('l: ', l);
// })();
