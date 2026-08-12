import { useEffect } from 'react';

const INTERACTIVE_SELECTOR = '.nm-raised-interactive, .nm-orange-raised-interactive, .nm-raised-active';
const HOVER_SHRINK_PX = 0;
const PRESS_SHRINK_PX = 1;

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
 * Converts fixed pixel shrink distances into per-element scale values.
 * Scaling remains centered, so layout position never changes.
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
  // Include the tuning values so Vite hot updates recalculate existing buttons,
  // whose dimensions do not otherwise change and therefore do not notify ResizeObserver.
  }, [HOVER_SHRINK_PX, PRESS_SHRINK_PX]);
}
