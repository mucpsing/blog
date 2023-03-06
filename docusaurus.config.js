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
    href: "https://github.com/mucpsing/mucpsing",
    label: "GitHub",
  },
  {
    href: "https://gitee.com/capsion/resume",
    label: "Gitee",
  },
];

const navbarOpenSourceProjectItems = [
  {
    href: "https://github.com/mucpsing/mucpsing",
    label: "GitHub",
  },
  {
    href: "https://gitee.com/capsion/resume",
    label: "Gitee",
  },
];

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Capsion的博客", // 网站主题
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

  plugins: [
    // 这里是导入tailwindcss的其中一个步骤，可能没生效，这里进行屏蔽
    // async function myPlugin(context, options) {
    //   return {
    //     name: "docusaurus-tailwindcss",
    //     configurePostCss(postcssOptions) {
    //       // Appends TailwindCSS and AutoPrefixer.
    //       postcssOptions.plugins.push(require("tailwindcss"));
    //       postcssOptions.plugins.push(require("autoprefixer"));
    //       return postcssOptions;
    //     },
    //   };
    // },
  ],
  presets: [
    [
      "classic",
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
            label: "开源项目",
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
          // {
          //   title: "Docs",
          //   items: [
          //     {
          //       label: "Tutorial",
          //       to: "/docs/intro",
          //     },
          //   ],
          // },
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
