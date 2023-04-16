import rawData from "@site/data/project";

export interface ICpsImgSwiperDataItem {
  title: string;
  content: string;
  subImg?: string;
  mainImg: string;
  mainColor: string;
  subColor: string;
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
  return rawData.map((item, index) => {
    // 因为颜色的数量不一定能与项目数据一一对上
    let colorIndex = index % COLOR_LIST.length;

    return {
      title: item.title,
      content: item.description,
      mainImg: item.preview,
      mainColor: COLOR_LIST[colorIndex].mainColor,
      subColor: COLOR_LIST[colorIndex].subColor,
    };
  });
}

export default createData();
