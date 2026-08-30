/**
 * @file shared/index.ts
 * @description 共用组件模块统一导出入口。
 *
 * 所有跨子应用共用的组件、类型均通过此文件导出，
 * 子应用组件通过 `../shared` 或 `../../shared` 统一引用。
 */

export { NeoSelect } from './NeoSelect';
export type { NeoSelectOption } from './NeoSelect';

export { StatInput } from './StatInput';

export { Header } from './Header';
export type { HeaderTab, SubApp } from './Header';

export { PlaceholderPage } from './Placeholder';

export { Modal } from './Modal';

export { SectionCard } from './SectionCard';