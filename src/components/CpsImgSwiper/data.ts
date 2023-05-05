import rawData from "@site/data/project";

export interface ICpsImgSwiperDataItem {
  example?: any;
  title: string;
  content: string;
  logo?: string;
  preview: string;
  mainColor: string;
  subColor: string;
  gif?: string;
  website?: string;
}

/* 配色 */
const COLOR_LIST = [
  {
    mainColor: "#FFF43D",
    subColor: "#F6B429",
  },
  {
    mainColor: "#FC1E4F",
    subColor: "#FF4058",
  },
  {
    mainColor: "#9FDA7F",
    subColor: "#64D487",
  },
];

function createData(): ICpsImgSwiperDataItem[] {
  return rawData.map((item, index): ICpsImgSwiperDataItem => {
    // 因为颜色的数量不一定能与项目数据一一对上
    let colorIndex = index % COLOR_LIST.length;
    let res = {
      title: item.title,
      content: item.description,
      preview: item.preview,
      mainColor: COLOR_LIST[colorIndex].mainColor,
      subColor: COLOR_LIST[colorIndex].subColor,
    };

    if (item.logo) res["logo"] = item.logo;
    if (item.gif) res["gif"] = item.gif;
    if (item.website) res["website"] = item.website;

    return res;
  });
}

export default createData();
