/**
 * @file useNeumorphicPressScale.ts
 * @description 拟物风格按钮缩放 Hook。
 *
 * 通过 ResizeObserver 动态计算每个拟物交互元素的 `--nm-hover-scale-*` 和
 * `--nm-press-scale-*` CSS 自定义属性，使所有按钮的 hover/press 缩放效果
 * 保持像素级一致（无论元素尺寸如何）。
 *
 * 在 App 根组件中调用一次即可全局生效。
 */

import { useEffect } from 'react';

/** 需要处理的拟物交互元素 CSS 选择器 */
const INTERACTIVE_SELECTOR = '.nm-raised-interactive, .nm-orange-raised-interactive, .nm-raised-active';

/** hover 时每边缩小的像素数 */
const HOVER_SHRINK_PX = 1;

/** press 时每边缩小的像素数 */
const PRESS_SHRINK_PX = 2;

/**
 * 为单个元素设置 CSS 缩放变量
 *
 * 根据元素实际像素尺寸计算 hover 和 press 时的 scale 值，
 * 使不同尺寸的按钮缩放视觉效果一致。
 *
 * @param element - 目标 HTML 元素
 */
function setScaleVariables(element: HTMLElement) {
  const width = element.offsetWidth;
  const height = element.offsetHeight;

  if (!width || !height) return;

  const toScale = (shrinkPx: number, size: number) =>
    Math.max(0, (size - shrinkPx * 2) / size).toFixed(5);

  element.style.setProperty('--nm-hover-scale-x', toScale(HOVER_SHRINK_PX, width));
  element.style.setProperty('--nm-hover-scale-y', toScale(HOVER_SHRINK_PX, height));
  element.style.setProperty('--nm-press-scale-x', toScale(PRESS_SHRINK_PX, width));
  element.style.setProperty('--nm-press-scale-y', toScale(PRESS_SHRINK_PX, height));
}

/**
 * useNeumorphicPressScale — 拟物风格按钮缩放 Hook
 *
 * 使用 ResizeObserver 监听所有拟物交互元素的尺寸变化，
 * 并为每个元素动态设置 CSS 缩放变量。
 * 同时通过 MutationObserver 监听 DOM 变化以处理动态添加的元素。
 *
 * 应在 App 根组件中调用一次。
 */
export function useNeumorphicPressScale() {
  useEffect(() => {
    const observed = new Set<HTMLElement>();
    const resizeObserver = new ResizeObserver((entries) => {
      entries.forEach(({ target }) => setScaleVariables(target as HTMLElement));
    });

    const observeInteractiveElements = () => {
      document.querySelectorAll<HTMLElement>(INTERACTIVE_SELECTOR).forEach((element) => {
        if (observed.has(element)) return;
        observed.add(element);
        setScaleVariables(element);
        resizeObserver.observe(element);
      });
    };

    observeInteractiveElements();
    const mutationObserver = new MutationObserver(observeInteractiveElements);
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => {
      mutationObserver.disconnect();
      resizeObserver.disconnect();
    };
  }, [HOVER_SHRINK_PX, PRESS_SHRINK_PX]);
}