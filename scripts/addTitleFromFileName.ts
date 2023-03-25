/*!
 * @Author: CPS
 * @email: 373704015@qq.com
 * @Date: 2023-01-30 22:32:44.617352
 * @Last Modified by: CPS
 * @Last Modified time: 2023-01-30 22:32:44.617352
 * @Projectname
 * @file_path "D:\CPS\MyProject\test\cps-scripts\markdown"
 * @Filename "文件名注入为标题.ts"
 * @Description: 判断文件夹是否存在index.md文件，如果没有则创建同时以文件加名字作为一级标题注入，再生成二级标题的目录列表
 */

import fsp from "node:fs/promises";
import path from "path";

export let SAFE_DEEP = 100; // 防止内存溢出，这里设置一个全局的最大递归深度

async function addTitle(mdPath: string, dataList: string[]) {
  const basename = path.basename(path.dirname(mdPath));

  // 创建标题，同时过滤一些图书符号
  const title = `# ${basename}`.replace(/【.*】/g, "");

  // 获取第一行
  if (dataList.length > 0) {
    const firstLine = dataList[0].trim();

    // 合法，不作任何改动
    if (firstLine.startsWith("# ") && firstLine.includes(title)) return;

    // 插入
    dataList.unshift(title);
  }

  return;
}

/**
 * @Description - 创建该文件夹的目录索引，如果已存在，则进行更新
 *
 * @param {string} mdPath      - {description}
 * @param {string} mdDataList  - {description}
 *
 */
async function addIndex(mdPath: string, mdDataList: string[]) {
  const indexTitle = "## 文章列表: ";

  let indexStart = mdDataList.length;
  let indexCount = 0;

  let findFlag = false;
  let hasTitle = false;
  let currtIndexItems = [];
  const newIndexItems: string[] = [];

  for (let i = 0; i < mdDataList.length; ++i) {
    let eachLine = mdDataList[i].trim();
    if (eachLine.includes(indexTitle.trim())) {
      findFlag = true;
      hasTitle = true;

      indexStart = i + 1;
      continue;
    }

    if (findFlag) {
      if (eachLine.startsWith("- ")) {
        currtIndexItems.push(mdDataList[i]);
        indexCount += 1;
        continue;
      }

      if (eachLine.length == 0) continue;

      findFlag = false;
    }
  }

  const dirname = path.dirname(mdPath);

  // 插入 title 目录标题
  if (!hasTitle) newIndexItems.splice(0, 0, indexTitle);

  (await fsp.readdir(dirname)).forEach((eachFile) => {
    if (eachFile != "index.md") {
      // 去掉后缀名
      let indexItem = `- ${path.basename(eachFile, ".md")}`;
      newIndexItems.push(indexItem);
    }
  });

  mdDataList.splice(indexStart, indexCount, ...newIndexItems);
}

/**
 * @Description - {description}
 *
 * @param {number} currtDeep=0  - {description}
 * @param {number} maxDeep=100  - {description}
 * @param {string} dirPath      - {description}
 *
 * @returns {} - {description}
 *
 */
async function walk({
  dirPath,
  currtDeep = 0,
  maxDeep = 100,
}: {
  dirPath: string;
  currtDeep?: number;
  maxDeep?: number;
}) {
  // console.log('超过最大递归次数', maxDeep);
  if (currtDeep >= maxDeep || currtDeep >= SAFE_DEEP) return;

  dirPath = path.resolve(dirPath);

  // 进入目录遍历，添加递归次数
  if ((await fsp.stat(dirPath)).isDirectory()) currtDeep += 1;

  const dirList = await fsp.readdir(dirPath);

  // 当前目录不存在index.md 创建空文件
  if (!dirList.includes("index.md")) await fsp.writeFile(path.join(dirPath, "index.md"), "", { encoding: "utf8" });

  dirList.forEach(async (eachFile) => {
    const fullPath = path.join(dirPath, eachFile);
    const fileInfo = await fsp.stat(fullPath);
    const basename = path.basename(eachFile);
    const dirname = path.basename(path.dirname(fullPath));

    // 查找 index.md 文件
    if (fileInfo.isFile() && basename == "index.md") {
      const mdData = await fsp.readFile(fullPath, { encoding: "utf8" });
      const mdDataList = mdData.split(/\r\n|\n|\r/gm);

      // 注入标题
      await addTitle(fullPath, mdDataList);

      // 注入目录
      await addIndex(fullPath, mdDataList);

      const newMdData = mdDataList.join("\n");

      // index.md 写入新内容
      await fsp.writeFile(fullPath, newMdData, { encoding: "utf8" });
      // console.log(newMdData);
    } else if (fileInfo.isDirectory()) {
      // 递归调用
      await walk({ dirPath: fullPath, currtDeep, maxDeep });
    }
  });
}

// async function main() {
//   const p = path.resolve(target);

//   const opts: IOptions = { cwd: p, root: p };

//   glob(`/**/*.md`, opts, async (err, files) => {
//     if (err) return console.log(err);

//     console.log(files.length);

//     files.forEach(async (mdFilePath: string) => {
//       const res = await fsp.readFile(mdFilePath, {
//         encoding: 'utf8',
//         flag: 'r',
//       });

//       const basename = path.basename(mdFilePath, '.md');
//       console.log('basename: ', basename);
//       const title = `# ${basename}`;

//       if (res.length > 0) {
//         let firstLine = res.split('\n')[0].trim();

//         if (firstLine.startsWith('# ') && firstLine.includes(`# ${basename}`)) {
//           console.log(`【合法】${basename}.md`);
//         } else {
//           console.log(`【不合法】${basename}.md`);
//           console.log(`${firstLine} => ${title}`);
//         }
//       }
//     });
//   });
// }

const target = path.resolve("../docs");

walk({ dirPath: target, maxDeep: 2 });
