# ZENLESS LAB ANALYZER - 纯原生桌面客户端

项目已重构为 **Electron + React** 架构，可生成真正的桌面原生程序 (.exe / .app)。

## 🚀 为什么使用桌面版？
- **离线使用**：完全不依赖网络，数据本地存储。
- **独立窗口**：无需打开浏览器，像游戏一样从桌面启动。
- **高性能**：直接调用系统资源，响应速度极快。

## 🛠️ 如何生成您的专属 .exe 文件？
由于云端环境限制，您需要在本地进行最后一步打包：

1. **下载项目 ZIP** 并解压到您的电脑。
2. 在项目文件夹内打开终端/命令行，输入：
   ```bash
   npm install
   npm run build
   ```
3. **完成！**
   - 检查生成的 `release` 文件夹。
   - 您会发现一个名为 `ZenlessLab.exe` (Windows) 或类似的文件。
   - **双击即可运行**，这个文件可以发给任何朋友直接使用，无需安装任何额外软件。

## 📂 技术架构
- **Main Process** (`electron/main.ts`)：控制原生窗口逻辑。
- **Renderer Process** (`src/`)：基于 React 的 Urban Tech UI 界面。
- **Persistence** (`src/services/storage.ts`)：原生级 LocalStorage 数据持久化。

---
*已保持所有计算逻辑与原本一致，UI 风格完美继承。*
