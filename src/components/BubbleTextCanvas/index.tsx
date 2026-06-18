/*
 * @Author: Capsion 373704015@qq.com
 * @Date: 2026-03-10 21:16:41
 * @LastEditors: cpasion-office-win10 373704015@qq.com
 * @LastEditTime: 2026-06-18 14:50:04
 * @FilePath: \docusaurus-v2\src\components\BubbleTextCanvas\index.tsx
 * @Description: React wrapper for BubbleCanvas — same API as the old BubbleText component.
 *   Importers don't need to change anything except the import path.
 */
import React, { useEffect, useRef } from "react";
import { BubbleCanvas, type BubbleCanvasProps } from "./bubbleCanvas";
import * as utils from "./utils";

/**
 * React component wrapping the Canvas-based bubble engine.
 * Props are identical to the old DOM-based BubbleText — drop-in compatible.
 */
export default function Bubble(props: BubbleCanvasProps) {
  const draggableRef = useRef<HTMLDivElement>(null);
  const t = utils.debugMousePosition("bubble-target");

  useEffect(() => {
    const bubble = new BubbleCanvas(props);

    return () => {
      bubble.destroy();
      t.stop();
    };
    // Only run on mount / unmount (mimics old behaviour)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={draggableRef}
      id="bubble-target"
      className="px-4 py-2"
      style={{ width: 600, height: 200, backgroundColor: "yellow" }}
    >
      <div className="w-full h-full bg-red-300"> 123 </div>
    </div>
  );
}
