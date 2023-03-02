// import fsp from 'node:fs/promises';
// import path from 'path';

const fs = require('fs');
// const fsp = require('node:fs/promises');
const path = require('path');

const taglineMdPath = path.resolve('../docs/【07】常识科普/社会真实/名人名言.md');

/**
 * @Description - 提取名人名言生成成字符串列表
 *
 * @param {string} filePath  - 名人名言对应的md文件
 *
 * @returns {string[]} - {description}
 *
 */
function extractTagline(filePath) {
  const data = fs.readFileSync(filePath, { encoding: 'utf8' });
  const dataList = data.split(/\r\n|\n|\r/gm);

  let talker = '';
  let context = '';
  const taglineList = [];
  dataList.forEach(eachLine => {
    if (eachLine.trim().startsWith('### ')) {
      talker = eachLine.replace('### ', '');
    } else if (eachLine.trim().startsWith('- ')) {
      context = eachLine.replace('- ', '');

      if (talker && context) {
        context = `${talker}: ${context}`;
      }

      taglineList.push(context);
    }
  });

  return taglineList;
}

// (async () => {
//   const l = await extractTagline(taglineMdPath);
//   console.log('l: ', l);
// })();

module.exports = { extractTagline };
