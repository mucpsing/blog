/*
 * @Author: CPS-surfacePro7 holy.dandelion@139.com
 * @Date: 2023-01-30 00:13:35
 * @LastEditors: cpasion-office-win10 373704015@qq.com
 * @LastEditTime: 2023-04-06 18:12:34
 * @FilePath: \blog-Docusaurus2\src\pages\project\index.jsx
 * @Description: 个人项目展示页
 */
// import type { IprojectData } from "@site/src/typings";

import React from "react";
import Layout from "@theme/Layout";
import CpsImgSwiper from "@site/src/components/CpsImgSwiper";
import CpsImgCards from "@site/src/components/HomepageImgShow";

import ExecutionEnvironment from "@docusaurus/ExecutionEnvironment";

const TITLE = "项目作品展示";
const DESCRIPTION = "以下展示的项目均由本人独立开发，商业产品类型的项目均已取得甲方同意方才展示或开源。";
const GITHUB_URL = "https://github.com/muccppss";
const GITEE_URL = "https://gitee.com/capsion";

const SearchNameQueryKey = "name";
function readSearchName(search: string) {
  return new URLSearchParams(search).get(SearchNameQueryKey);
}

type ProjectState = {
  scrollTopPosition: number;
  focusedElementId: string | undefined;
};

function restoreProjectState(projectState: ProjectState | null) {
  const { scrollTopPosition, focusedElementId } = projectState ?? {
    scrollTopPosition: 0,
    focusedElementId: undefined,
  };

  // ts-expect-error: if focusedElementId is undefined it returns null
  document.getElementById(focusedElementId)?.focus();
  window.scrollTo({ top: scrollTopPosition });
}

export function prepareUserState(): ProjectState | undefined {
  if (ExecutionEnvironment.canUseDOM) {
    return {
      scrollTopPosition: window.scrollY,
      focusedElementId: document.activeElement?.id,
    };
  }

  return undefined;
}

// function filterUsers(
//   users: Project[],
//   selectedTags: TagType[],
//   operator: Operator,
//   searchName: string | null,
// ) {
//   if (searchName) {
//     users = users.filter((user) =>
//       user.title.toLowerCase().includes(searchName.toLowerCase()),
//     );
//   }
//   if (selectedTags.length === 0) {
//     return users;
//   }
//   return users.filter((user) => {
//     if (user.tags.length === 0) {
//       return false;
//     }
//     if (operator === 'AND') {
//       return selectedTags.every((tag) => user.tags.includes(tag));
//     } else {
//       return selectedTags.some((tag) => user.tags.includes(tag));
//     }
//   });
// }

function ProjectHeader() {
  return (
    <section className="my-10 text-center">
      <h1>{TITLE}</h1>
      <p>
        <strong>重要声明：</strong>
        {DESCRIPTION}
      </p>
      <div>
        <a className="mr-2 button button--primary" href={GITHUB_URL} target="_blank" rel="noreferrer">
          前往 Github
        </a>
        <a className="button button--primary" href={GITEE_URL} target="_blank" rel="noreferrer">
          前往 Gitee
        </a>
      </div>
    </section>
  );
}

export default function ProjectPage() {
  return (
    <Layout title={TITLE} description={DESCRIPTION}>
      <header className="flex justify-center my-20">
        <CpsImgSwiper></CpsImgSwiper>
      </header>
      <main>
        <ProjectHeader />
        <section className="w-[1000px] mx-auto"></section>
      </main>
    </Layout>
  );
}
