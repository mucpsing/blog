/*
 * @Author: Capsion 373704015@qq.com
 * @Date: 2026-03-10 21:16:41
 * @LastEditors: Capsion 373704015@qq.com
 * @LastEditTime: 2026-03-10 23:08:14
 * @FilePath: \docusaurus-v2\src\components\BubbleText\index.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React, { useEffect, useRef } from "react";
import { CpsBubbleComponent, type BubbleProps } from "./bubble";
import * as utils from "./utils";
import Interact from "interactjs";

export default function Bubble() {
    let t;
    const draggableRef = useRef(null);

    useEffect(() => {
        Interact;

        const bubble = new CpsBubbleComponent({ DEBUG: true, width: 400, height: 200, positionElementId: "bubble-target", input: "CCC", disperseElementId: "headRegion" });

        t = utils.debugMousePosition("bubble-target");

        return () => {
            t.stop();
            bubble.destroy();
        };
    }, []);

    useEffect(() => {
        Interact(draggableRef.current)
            .draggable({
                inertia: true,
                modifiers: [
                    Interact.modifiers.restrict({
                        restriction: "parent",
                        endOnly: true,
                    }),
                ],
            })
            .on("dragmove", (event) => {
                const target = event.target;
                const x = (parseFloat(target.getAttribute("data-x")) || 0) + event.dx;
                const y = (parseFloat(target.getAttribute("data-y")) || 0) + event.dy;

                target.style.transform = `translate(${x}px, ${y}px)`;
                target.setAttribute("data-x", x);
                target.setAttribute("data-y", y);
            });
    }, []);

    return (
        <div ref={draggableRef} id="bubble-target" style={{ width: 400, height: 200, backgroundColor: "yellow" }}>
            Drag Me
        </div>
    );
}
