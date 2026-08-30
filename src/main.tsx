/**
 * @file main.tsx
 * @description 应用入口文件。
 *
 * 挂载 React 根组件到 DOM，启用 StrictMode 进行开发期检查。
 * 导入全局样式 index.css。
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);