/**
 * @file Modal.tsx
 * @description 通用弹窗组件。
 *
 * 提供统一的弹窗交互模式：半透明遮罩层 + 居中卡片 + 入场/出场动画。
 * 点击遮罩层或按 Escape 键可关闭弹窗。
 *
 * 主要用于驱动盘编辑、以及未来各子应用的二级编辑页面。
 *
 * @example
 * <Modal isOpen={!!editingId} onClose={handleCancelEdit}>
 *   <DriveEditor ... />
 * </Modal>
 */

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

/** Modal 组件 Props */
interface ModalProps {
  /** 是否显示弹窗 */
  isOpen: boolean;
  /**
   * 关闭弹窗回调
   */
  onClose: () => void;
  /** 弹窗内容 */
  children: React.ReactNode;
  /** 弹窗最大宽度（Tailwind CSS 类名），默认 max-w-5xl */
  maxWidth?: string;
}

/**
 * Modal — 通用弹窗组件
 *
 * 特性：
 * - 遮罩层点击关闭
 * - Escape 键关闭
 * - 入场缩放 + 淡入动画（spring）
 * - 内容区最大高度 90vh，超出滚动
 *
 * @param props - 组件属性
 * @returns JSX 元素
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  maxWidth = 'max-w-5xl',
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Dark blur backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-zinc-950/50"
          />

          {/* Modal Dialog Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className={`relative w-full ${maxWidth} bg-[#f0f3f6] rounded-2xl p-6 border border-zinc-200 overflow-y-auto max-h-[90vh] custom-scrollbar z-10`}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};