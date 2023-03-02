import React from "react";
import "@site/src/pages/test/test.css";

import { Test } from "./demo";

export default class Demo extends React.Component {
  render() {
    return (
      <div>
        <Test className={"details-switch-demo"} />
      </div>
    );
  }
}
