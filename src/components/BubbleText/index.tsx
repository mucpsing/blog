import React, { useEffect } from "react";
import { CpsBubbleComponent, type BubbleProps } from "./bubble";
import * as utils from "./utils";

export default function Bubble() {
    let t;
    useEffect(() => {
        const bubble = new CpsBubbleComponent({ DEBUG: true, width: 400, height: 200, positionElementId: "bubble-target", input: "CCC" });

        t = utils.debugMousePosition("bubble-target");

        return () => {
            t.stop();
            bubble.destroy();
        };
    }, []);

    return (
        <div id="bubble-target" style={{ width: 400, height: 200, backgroundColor: "yellow" }}>
            {" "}
        </div>
    );
}
