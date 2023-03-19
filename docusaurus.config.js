// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion
const path = require("path");

const lightCodeTheme = require("prism-react-renderer/themes/github");
const darkCodeTheme = require("prism-react-renderer/themes/dracula");

const { extractTagline } = require("./scripts/taglineList");
const taglineList = extractTagline(path.resolve("./docs/【07】常识科普/社会真实/名人名言.md"));

const { getNavbarItems } = require("./scripts/getNavbarItems");
const navbarNotebookItems = getNavbarItems(path.resolve("./docs"), ["【18】副业开发"]);

const navbarPersonalProjectItems = [
  {
    to: "/docs/【05】项目经历/02%20个人自用脚手架/",
    label: "【electron】截图软件",
  },
  {
    to: "/docs/【05】项目经历/02%20个人自用脚手架/",
    label: "【nodejs】自用脚手架",
  },
  {
    to: "/docs/【05】项目经历/03%20SublimeText插件/文件头部插入模板",
    label: "【ST插件】插入文件头",
  },
  {
    to: "/docs/【05】项目经历/03%20SublimeText插件/代码格式化",
    label: "【ST插件】代码格式化",
  },
  {
    to: "/docs/【05】项目经历/03%20SublimeText插件/快捷切换输入法为英文",
    label: "【ST插件】自动切换英文输入",
  },
  {
    to: "/docs/【05】项目经历/03%20SublimeText插件/自动生成jsdoc格式注释",
    label: "【ST插件】注释生成",
  },
  {
    to: "/docs/【05】项目经历/03%20SublimeText插件/快捷运行shell命令",
    label: "【ST插件】快捷SHELL命令输入",
  },
  {
    to: "/docs/【05】项目经历/03%20SublimeText插件/自动更新channel_v3文件",
    label: "【ST插件】自动更新Channel_v3",
  },
  {
    type: "html",
    value: '<hr class="dropdown-separator">',
  },
  {
    to: "/SublimeTextPlugs",
    label: "🌟作品汇总🌟",
  },
  {
    href: "https://github.com/Capsion-ST-PLugins",
    label: "Github链接",
  },
  {
    href: "https://gitee.com/Capsion-ST-PLugins",
    label: "Gitee链接",
  },
];

const navbarOpenSourceProjectItems = [
  {
    to: "/docs/【05】项目经历/06%20项目管理系统/项目预览",
    label: "【闭源】项目管理系统",
  },
  {
    to: "/docs/【05】项目经历/01%20全栈小程序/",
    label: "【全栈】全栈小程序",
  },
  {
    to: "/docs/【05】项目经历/01%20全栈小程序/",
    label: "【接口】PSD文件图层实时修改接口",
  },
  {
    type: "html",
    value: '<hr class="dropdown-separator">',
  },
  {
    to: "/SublimeTextPlugs",
    label: "💼项目汇总💼",
  },
];

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Capsion", // 网站主题
  // tagline: '好记性不如烂笔头',
  tagline: taglineList.join(","),
  favicon: "img/favicon.ico",

  // Set the production url of your site here
  url: "https://www.capsion.top",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "capsion", // Usually your GitHub org/user name.
  projectName: "blog", // Usually your repo name.

  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  plugins: [],

  presets: [
    [
      "@docusaurus/preset-classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve("./sidebars.js"),
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          // editUrl: "https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/",
        },
        blog: {
          // routeBasePath: "/",
          showReadingTime: true,
          blogSidebarTitle: "最近更新",
          blogSidebarCount: "ALL",
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          // editUrl: "https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/",
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: "img/docusaurus-social-card.jpg",
      navbar: {
        title: "🍌Capsion Blog🍌",
        logo: {
          alt: "My Site Logo",
          src: "img/mimi.png",
        },

        // 导航栏
        items: [
          { to: "/", label: "首页", position: "left" },
          {
            type: "search",
            position: "left",
          },

          /* 【导航】学习笔记 */
          {
            label: "学习笔记",
            type: "dropdown",
            position: "right",
            items: navbarNotebookItems,
          },

          /* 【导航】个人项目 */
          {
            label: "原创作品",
            type: "dropdown",
            position: "right",
            items: navbarPersonalProjectItems,
          },

          /* 【导航】小工具 */
          {
            type: "dropdown",
            label: "完整项目",
            position: "right",
            items: navbarOpenSourceProjectItems,
          },

          {
            type: "dropdown",
            label: "关于我",
            position: "right",
            items: [
              {
                type: "html",
                className: "dropdown-archived-versions",
                value: "<b>代码托管</b>",
              },
              {
                href: "https://gitee.com/capsion/capsion",
                label: "Gitee",
              },
              {
                href: "https://github.com/mucpsing/mucpsing",
                label: "GitHub",
              },

              {
                type: "html",
                value: '<hr class="dropdown-separator">',
              },
              {
                type: "html",
                className: "dropdown-archived-versions",
                value: "<b>个人信息</b>",
              },
              {
                href: "https://gitee.com/capsion/resume",
                label: "个人简历",
              },
            ],
          },
        ],
      },
      footer: {
        style: "dark",
        links: [
          {
            title: "Community",
            items: [
              {
                label: "Stack Overflow",
                href: "https://stackoverflow.com/questions/tagged/docusaurus",
              },
              {
                label: "Discord",
                href: "https://discordapp.com/invite/docusaurus",
              },
              {
                label: "Twitter",
                href: "https://twitter.com/docusaurus",
              },
            ],
          },
          {
            title: "More",
            items: [
              {
                label: "Blog",
                to: "/blog",
              },
              {
                label: "GitHub",
                href: "https://github.com/facebook/docusaurus",
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} My Project, Inc. Built with Docusaurus.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
