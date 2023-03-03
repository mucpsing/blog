import React from "react";
import "@site/src/pages/test/test.css";

import { Test } from "./demo";

export default class Demo extends React.Component {
  render() {
    return (
      <div>
        <Test className={"details-switch-demo"} />
        <p className="p-3 bg-red-2 rounded-sm h-4"> 112233 </p>
      </div>
    );
  }
}
