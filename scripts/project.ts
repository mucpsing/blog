/*
 * @Author: cpasion-office-win10 373704015@qq.com
 * @Date: 2023-04-03 16:34:21
 * @LastEditors: cpasion-office-win10 373704015@qq.com
 * @LastEditTime: 2023-04-12 18:54:45
 * @FilePath: \cps-blog\scripts\project.ts
 * @Description: 创建项目页的动态数据
 */

import path from "path";
import { createNavItemByDir } from "./utils";
import { Tags } from "../src/pages/project/_components/data/project";
import type { TagType, Project, Tag } from "../src/pages/project/_components/data/project";
// import type { IprojectData } from "../src/dataTypes.d";

const PATH_OPENSOURCE = path.resolve("./docs/【05】项目经历/完整项目");

console.log({ PATH_OPENSOURCE });
