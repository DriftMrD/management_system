import { SignupForm } from "./signup-form";
import { ClipboardList } from "lucide-react";

export default function SignupPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "linear-gradient(135deg, #e8eff6 0%, #d4e4f0 50%, #e8eff6 100%)" }}
    >
      {/* 背景装饰圆 */}
      <div
        className="fixed top-[-80px] right-[-80px] w-64 h-64 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgb(91 164 212 / 0.15) 0%, transparent 70%)" }}
      />
      <div
        className="fixed bottom-[-60px] left-[-60px] w-48 h-48 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgb(184 232 216 / 0.20) 0%, transparent 70%)" }}
      />

      <div className="w-full max-w-sm relative">
        {/* 品牌标识 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#5ba4d4] shadow-[0_4px_16px_0_rgb(91_164_212/0.35)] mb-4">
            <ClipboardList className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[#1a2332]">创建账号</h1>
          <p className="text-[#7a96ae] mt-1.5 text-sm">注册后即可录入和管理需求</p>
        </div>

        {/* 注册卡片 */}
        <div
          className="bg-white rounded-2xl p-7"
          style={{ boxShadow: "0 8px 32px 0 rgb(90 140 180 / 0.12), 0 2px 8px 0 rgb(90 140 180 / 0.08)" }}
        >
          <SignupForm />
        </div>

        <p className="text-center text-xs text-[#a0b4c4] mt-6">
          安全注册 · 数据加密保护
        </p>
      </div>
    </div>
  );
}
