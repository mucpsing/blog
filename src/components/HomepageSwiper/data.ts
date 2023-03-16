export interface ICpsImgSwiperDataItem {
  title: string;
  content: string;
  subImg: string;
  mainImg: string;
  mainColor: string;
  subColor: string;
}

const COLOR_LIST = [
  {
    mainColor: "#FFF43D",
    subColor: "#F6B429",
  },
  {
    mainColor: "#FC1E4F",
    subColor: "#FF4058",
  },
];

const rawData = [
  {
    title: "cps-fileheader",
    content: "快速插入文件头部信息，根据后缀名关联模板，一种后缀名可关联多个模板（vue2 和 vue3）",
    subImg: "/logo/nodejs.svg",
    mainImg: "/screenshot/sublimeTextPlugs/cps-fileheader/fileheader1.gif",
  },
  {
    title: "cps-fileheader",
    content: "快速插入文件头部信息，根据后缀名关联模板，一种后缀名可关联多个模板（vue2 和 vue3）",
    subImg: "/logo/nodejs.svg",
    mainImg: "/screenshot/sublimeTextPlugs/cps-fileheader/fileheader1.gif",
  },
];

function createData(): ICpsImgSwiperDataItem[] {
  return rawData.map((item, index) => {
    return {
      ...item,
      ...COLOR_LIST[index],
    };
  });
}

export default createData();
