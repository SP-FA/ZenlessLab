import React from 'react';
import { Github, Mail } from 'lucide-react';

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
    </div>
  );
};
