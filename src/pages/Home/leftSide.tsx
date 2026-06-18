/*
 * @Author: CPS holy.dandelion@139.com
 * @Date: 2023-03-06 23:17:09
 * @LastEditors: cpasion-office-win10 373704015@qq.com
 * @LastEditTime: 2026-06-18 17:11:34
 * @FilePath: \cps-blog\src\components\HomepageSwiper\rightSide.tsx
 * @Description: 首页标题区域
 */

import React, { useEffect, useRef } from "react";
import Typed from "typed.js";
import _ from "lodash";

import Link from "@docusaurus/Link";
import QueueAnim from "rc-queue-anim";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";

import Iconfont from "@site/src/components/Iconfont";
import styles from "@site/src/pages/index.module.css";
// import Bubble from "@site/src/components/BubbleText";
import { BubbleText, type BubbleProps } from "@site/src/components/BubbleText/bubble";

function TypedTitle() {
    const { siteConfig } = useDocusaurusContext();
    const el = useRef(null);
    useEffect(() => {
        const typed = new Typed(el.current, {
            strings: _.shuffle(siteConfig.tagline.split(",")),
            startDelay: 1000,
            typeSpeed: 120,
            backSpeed: 120,
            backDelay: 4000,
            loop: true,
        });

        return () => typed.destroy();
    }, []);

    return (
        <p className="my-2 min-h-[10rem] hero__subtitle">
            <span className="transform" ref={el}></span>
        </p>
    );
}

export default function HomeTitle() {
    const { siteConfig } = useDocusaurusContext();

    const positionRef = useRef(null);
    let bubble: BubbleText | null = null;

    useEffect(() => {
        if (positionRef.current) {
            console.log({ positionRef });
            bubble = new BubbleText();

            // const t = utils.debugMousePosition("bubble-target");
        }

        return () => {
            if (bubble) bubble.destroy();

            // t.stop();
        };
    }, []);

    return (
        <QueueAnim type="left" duration={800} className="px-4 text-center text-white">
            {/* 仅作定位使用 */}
            <div
                ref={positionRef}
                id="CpsBubble.positionElement"
                className="hero__title h-[200px] bg-gray-200/30 shadow-slate-200 rounded-md"
                key="title"
            ></div>

            <p className="my-6 underline decoration-dotted" key="content">
                <a href="docs/【07】常识科普/社会真实/名人名言">这些年我们听到的名人疯言</a>
            </p>

            <TypedTitle />

            <div className={`${styles.buttons} mx-2 mt-4 flex justify-center gap-2`} key="btns">
                <Link key="b1" className="button button--secondary button--lg" to="/project">
                    作品案例 💼
                </Link>

                <Link key="b2" className="button button--secondary button--lg" to="https://gitee.com/capsion/resume">
                    个人简介 📄
                </Link>
            </div>

            <QueueAnim
                delay={1000}
                duration={1400}
                type={["bottom", "top"]}
                ease={["easeOutQuart", "easeInOutQuart"]}
                className="flex justify-center gap-3 my-3 text-2xl"
                component="footer"
            >
                <div key="a">
                    <Iconfont className="home-swiper-icon-default" iconName={"logoicon-bilibili-line"}></Iconfont>
                </div>
                <div key="b">
                    <Iconfont className="home-swiper-icon-default" iconName={"logoicon-juejin"}></Iconfont>
                </div>
                <div key="c">
                    <Iconfont className="home-swiper-icon-default" iconName={"logoicon-github-fill"}></Iconfont>
                </div>
                <div key="d">
                    <Iconfont className="home-swiper-icon-default" iconName={"logoicon-gitee"}></Iconfont>
                </div>
                <div key="e">
                    <Iconfont className="home-swiper-icon-default" iconName={"logoicon-QQ-circle-fill"}></Iconfont>
                </div>
                <div key="f">
                    <Iconfont className="home-swiper-icon-default" iconName={"logoicon-weixin"}></Iconfont>
                </div>
            </QueueAnim>
        </QueueAnim>
    );
}
