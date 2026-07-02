import type { CSSProperties } from "react";

export const DROPDOWN_GAP = 4;
export const DROPDOWN_VIEWPORT_PADDING = 8;
export const DROPDOWN_ITEM_HEIGHT = 32;
export const DROPDOWN_MENU_PADDING = 8;

export function getDropdownMenuPosition(
  rect: DOMRect,
  optionCount: number,
  minWidth = 112
): CSSProperties {
  const estimatedMenuHeight =
    optionCount * DROPDOWN_ITEM_HEIGHT + DROPDOWN_MENU_PADDING;
  const spaceBelow = window.innerHeight - rect.bottom - DROPDOWN_VIEWPORT_PADDING;
  const spaceAbove = rect.top - DROPDOWN_VIEWPORT_PADDING;
  const openUpward =
    spaceBelow < estimatedMenuHeight && spaceAbove > spaceBelow;
  const availableSpace = (openUpward ? spaceAbove : spaceBelow) - DROPDOWN_GAP;
  const maxHeight = Math.max(
    120,
    Math.min(estimatedMenuHeight, availableSpace)
  );
  const menuWidth = Math.max(rect.width, minWidth);

  let left = rect.left;
  if (left + menuWidth > window.innerWidth - DROPDOWN_VIEWPORT_PADDING) {
    left = window.innerWidth - DROPDOWN_VIEWPORT_PADDING - menuWidth;
  }
  left = Math.max(DROPDOWN_VIEWPORT_PADDING, left);

  const style: CSSProperties = {
    position: "fixed",
    left,
    minWidth: menuWidth,
    maxHeight,
    zIndex: 1000,
    overflowY: "auto",
  };

  if (openUpward) {
    style.bottom = window.innerHeight - rect.top + DROPDOWN_GAP;
  } else {
    style.top = rect.bottom + DROPDOWN_GAP;
  }

  return style;
}

export function scrollSelectedOptionIntoMenu(menu: HTMLElement) {
  const selectedOption = menu.querySelector<HTMLElement>(
    '[aria-selected="true"]'
  );
  if (!selectedOption) return;

  const menuTop = menu.scrollTop;
  const menuBottom = menuTop + menu.clientHeight;
  const optionTop = selectedOption.offsetTop;
  const optionBottom = optionTop + selectedOption.offsetHeight;

  if (optionTop < menuTop) {
    menu.scrollTop = optionTop;
  } else if (optionBottom > menuBottom) {
    menu.scrollTop = optionBottom - menu.clientHeight;
  }
}
