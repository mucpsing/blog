/*
 * @Author: cpasion-office-win10 373704015@qq.com
 * @Date: 2025-11-13 09:13:08
 * @LastEditors: cpasion-office-win10 373704015@qq.com
 * @LastEditTime: 2026-02-09 15:27:46
 * @FilePath: \docusaurus-v2\tailwind.config.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
/** @type {import('tailwindcss').Config} */
// module.exports = {
//   purge: ["./src/**/*.html", "./src/**/*.js", "./src/**/*.tsx"],
//   darkMode: false,
//   theme: {},
//   variants: {
//     extend: {},
//   },
//   plugins: [],
// };
/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{js,jsx,ts,tsx}"],
    theme: {
        extend: {
            // 在 screens 中扩展断点，不会覆盖默认值
            screens: {
                xss: "420px", // 可选，适配极小屏幕
                xs: "520px", // 核心，适配小屏手机
                // 默认的 sm, md, lg, xl, 2xl 断点依然存在
            },
        },
    },
    plugins: [],
};
