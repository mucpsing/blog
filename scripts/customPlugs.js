"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addHeaderTag = void 0;
async function addHeaderTag(context, opts) {
    return {
        name: "cps-plugins",
        injectHtmlTags({ content }) {
            return {
                headTags: [
                    {
                        tagName: "script",
                        attributes: { charset: "utf-8", src: "/scripts/beforeWindowLoad.js" },
                    },
                ],
                // proBodyTags: [
                //   {
                //     tagName: "script",
                //     attributes: { charset: "utf-8", src: "/cps.js" },
                //   },
                // ],
            };
        },
    };
}
exports.addHeaderTag = addHeaderTag;
