import projects from "@site/data/project";

export type Tag = {
  label: string;
  description: string;
  color: string;
};

/**
 * @description: 仅支持必须小写
 */
export type TagType =
  | "favorite"
  | "opensource"
  | "product"
  | "design"
  | "javascript"
  | "typescript"
  | "python"
  | "sublimetext"
  | "vscode"
  | "vue"
  | "reactjs"
  | "nodejs";

export type Project = {
  title: string;
  description: string;
  preview?: any;
  website: string;
  source?: string | null;
  tags: TagType[];
  filepath?: string;
};

export const Tags: Record<TagType, Tag> = {
  vue: {
    label: "Vue",
    description: "好用又容易上手的SAP框架",
    color: "#327959",
  },
  reactjs: {
    label: "Reactjs",
    description: "React最受欢迎的web框架之一",
    color: "#087ea4",
  },
  nodejs: {
    label: "nodejs",
    description: "前端coder最友好的后端切入点",
    color: "#43853d",
  },
  python: {
    label: "python",
    description: "py相关项目，人工智能，ai模型等，赶上时代步伐，学起来",
    color: "#4281b3",
  },
  vscode: {
    label: "VS插件",
    description: "原创VSCode插件，大大提供团队搬砖效率",
    color: "#2376ae",
  },
  sublimetext: {
    label: "ST插件",
    description: "原创SublimeText插件，大大提供团队搬砖效率",
    color: "#ff8000",
  },
  favorite: {
    label: "喜爱",
    description: "我最喜欢的网站，一定要去看看!",
    color: "#ff0000",
  },
  opensource: {
    label: "开源",
    description: "开源项目可以提供灵感!",
    color: "#33ccb9",
  },
  product: {
    label: "产品",
    description: "与产品相关的项目!",
    color: "#dfd545",
  },
  design: {
    label: "设计",
    description: "设计漂亮的网站!",
    color: "#a44fb7",
  },
  javascript: {
    label: "JavaScript",
    description: "JavaScript 项目",
    color: "#dfd545",
  },
  typescript: {
    label: "TypeScript",
    description: "TypeScript 项目",
    color: "#3178c6",
  },
};

const Projects: Project[] = projects as Project[];

export const TagList = Object.keys(Tags) as TagType[];

function sortProject() {
  const result = Projects;
  // Sort by site name
  // result = sortBy(result, (user) => user.title.toLowerCase());
  // Sort by favorite tag, favorites first
  // result = sortBy(result, (user) => !user.tags.includes('javascript'));
  return result;
}

export const sortedProjects = sortProject();
