import React from 'react';
import { Github, Mail, Square, SquareCheckBig } from 'lucide-react';

export const Me: React.FC = () => {
  return (
    <div className="prose prose-invert max-w-none p-8 bg-zinc-900/50 rounded-xl border border-zinc-800">
      <div className="mb-8" align="center">
        <h2 className="text-[30px] font-bold text-zinc-100 mb-2">About Me</h2>
        <p className="text-sm text-zinc-500">👋 我是 SPFA，感谢使用本工具，有任何意见建议欢迎随时与我联系！</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">

        <div className="p-6 bg-zinc-900/50 rounded-xl border border-zinc-800">
          <h2 className="text-[20px] font-bold text-zinc-100 flex items-center gap-2">
            项目链接
          </h2>
          <h2 className="pl-8 pt-3 text-[18px]">
            <Github className="inline text-zzz-orange" size={18} />: <a href="https://github.com/SP-FA/ZenlessLab">ZenlessLab</a>
          </h2>
        </div>
        <div className="p-6 bg-zinc-900/50 rounded-xl border border-zinc-800">
          <h2 className="text-[20px] font-bold text-zinc-100 flex items-center gap-2">
            Contact With Me
          </h2>
          <h2 className="pl-8 pt-3 text-[18px]">
            <Mail className="inline text-zzz-orange" size={18} />: <a href="mailto:2997839760@qq.com">2997839760@qq.com</a>
          </h2>
          <h2 className="pl-8 pt-3 text-[18px]">
            <Github className="inline text-zzz-orange" size={18} />: <a href="https://github.com/SP-FA">SP-FA</a>
          </h2>
        </div>
      </div>

      <br />
      <div className="mb-8" align="center">
        <h2 className="text-[30px] font-bold text-zinc-100 mb-2">TODO</h2>
        <p className="text-sm text-zinc-500">💪 我会尽量完成</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <div className="p-6 bg-zinc-900/50 rounded-xl border border-zinc-800">
          <h2 className="pl-8 pt-3 text-[18px]">
            <SquareCheckBig className="inline text-[#00aa00]" size={18} /> 完成边际效益曲线
          </h2>
          <h2 className="pl-8 pt-3 text-[18px]">
            <SquareCheckBig className="inline text-[#00aa00]" size={18} /> 展示计算公式
          </h2>
          <h2 className="pl-8 pt-3 text-[18px]">
            <SquareCheckBig className="inline text-[#00aa00]" size={18} /> 使用指南
          </h2>
          <h2 className="pl-8 pt-3 text-[18px]">
            <SquareCheckBig className="inline text-[#00aa00]" size={18} /> 添加配队信息
          </h2>
          <h2 className="pl-8 pt-3 text-[18px]">
            <Square className="inline text-zzz-orange" size={18} /> 加入异放机制
          </h2>
        </div>
      </div>
      <br />
      <br />
      <br />
      <br />
      <div className="mb-2" align="center">
        <h2 className="text-[30px] font-bold text-zinc-100">- 新艾利都，永不落幕 -</h2>
      </div>
    </div>
  );
};
