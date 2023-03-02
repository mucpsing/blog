const __textData = {
  content:
    "Taiwan called motorcycle, motor bike [1] or a motorcycle," +
    " the motorcycle referred to in the mainland, " +
    "Hong Kong and Southeast Asia known as motorcycles [2], " +
    "is a driven by the engine, " +
    "operated by a hand or two directions three-wheeled vehicles, is a means of transport. " +
    "In some military or police applications, will add a side compartment and a secondary wheel, " +
    "become a special three-wheeled motorcycle, mobility Zheyi common plug-in auxiliary wheels.",
  title: "Motorcycle",
};

const __dataArray = [
  {
    pic: "https://zos.alipayobjects.com/rmsportal/ogXcvssYXpECqKG.png",
    map: "https://zos.alipayobjects.com/rmsportal/HfBaRfhTkeXFwHJ.png",
    color: "#FFF43D",
    background: "#F6B429",
  },
  {
    pic: "https://zos.alipayobjects.com/rmsportal/iCVhrDRFOAJnJgy.png",
    map: "https://zos.alipayobjects.com/rmsportal/XRfQxYENhzbfZXt.png",
    color: "#FF4058",
    background: "#FC1E4F",
  },
  {
    pic: "https://zos.alipayobjects.com/rmsportal/zMswSbPBiQKvARY.png",
    map: "https://zos.alipayobjects.com/rmsportal/syuaaBOvttVcNks.png",
    color: "#9FDA7F",
    background: "#64D487",
  },
];

export const dataArray = __dataArray.map((item) => ({ ...item, ...__textData }));
