/*
 * @Author: Capsion 373704015@qq.com
 * @Date: 2026-03-10 21:16:41
 * @LastEditors: cpasion-office-win10 373704015@qq.com
 * @LastEditTime: 2026-06-18 15:17:43
 * @FilePath: \docusaurus-v2\src\components\BubbleText\index.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React, { useEffect, useRef } from "react";
import { BubbleText, type BubbleProps } from "./bubble";
import * as utils from "./utils";
export default function Bubble(props: BubbleProps) {
    const draggableRef = useRef(null);
    
    useEffect(() => {
        const bubble = new BubbleText(props);
        // const t = utils.debugMousePosition("bubble-target");

        return () => {
            bubble.destroy();
            // t.stop();
        };
    }, []);

    return (
        <div ref={draggableRef} id="bubble-target" className="px-4 py-2" style={{ width: 600, height: 200, backgroundColor: "yellow" }}>
            <div className="w-full h-full bg-red-300"> 123 </div>
        </div>
    );
}
