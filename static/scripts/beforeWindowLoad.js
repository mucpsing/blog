/*
 * @Author: CPS holy.dandelion@139.com
 * @Date: 2023-04-04 17:09:26
 * @LastEditors: CPS holy.dandelion@139.com
 * @LastEditTime: 2023-04-06 00:06:03
 * @FilePath: \cps-blog-test\static\cps.js
 * @Description: 用来修复docs中，所有采用了本地服务器图片的链接
 */

/**
 * @description: 替换url中的host为指定的host
 * @param {URL} imgSrc img标签的src内容，必须是url格式
 * @param {string} fixHost 需要替换的url host
 * @return {URL}
 */
function fixLocalHostToSiteHost(imgSrc, fixHost = "localhost:45462") {
  try {
    // 当前host相同，可能是网络原因加载失败，此处进行忽略或者替换成通用cdn再尝试
    if (location.host == fixHost) return "";

    if (imgSrc.indexOf(fixHost) > -1) {
      return imgSrc.replace(fixHost, location.host);
    }
  } catch (error) {
    console.log("图片替换失败：", imgSrc);
    console.log({ error });
    return "";
  }
}

/**
 * @description: 检查url，确保要替换的url跟之前不是同一个url
 * @param {Element} imgElement
 * @return {Boolean}
 */
function checkUrl(imgElement) {
  try {
    return new URL(imgElement.src).host === location.host;
  } catch (error) {
    console.log();
    return false;
  }
}

const REPLACE_URL_HOST = "localhost:45462";

window.addEventListener("DOMContentLoaded", () => {
  console.log("cps-scripts on loaded");
  document.addEventListener(
    "error",

    /* 捕获加载失败的图片标签，判断如果host不是指定的，则进行修正 */
    (e) => {
      const elem = e.target;
      if (elem.tagName.toLowerCase() === "img") {
        if (!checkUrl(elem)) return;

        const newSrc = fixLocalHostToSiteHost(elem.src, REPLACE_URL_HOST);

        // 这里有可能触发无限重新赋值同一个无法加载url的死循环
        if (newSrc && elem.src != newSrc) elem.src = newSrc;
      }
    },
    true
  );
});
