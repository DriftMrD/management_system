import { ResetPasswordForm } from "./reset-password-form";
import { ClipboardList } from "lucide-react";

export default function ResetPasswordPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background:
          "linear-gradient(135deg, #e8eff6 0%, #d4e4f0 50%, #e8eff6 100%)",
      }}
    >
      <div
        className="fixed top-[-80px] right-[-80px] w-64 h-64 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgb(91 164 212 / 0.15) 0%, transparent 70%)",
        }}
      />
      <div
        className="fixed bottom-[-60px] left-[-60px] w-48 h-48 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgb(184 232 216 / 0.20) 0%, transparent 70%)",
        }}
      />

      <div className="w-full max-w-sm relative">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#5ba4d4] shadow-[0_4px_16px_0_rgb(91_164_212/0.35)] mb-4">
            <ClipboardList className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[#1a2332]">设置新密码</h1>
          <p className="text-[#7a96ae] mt-1.5 text-sm">完成重置后可用新密码登录</p>
        </div>

        <div
          className="bg-white rounded-2xl p-7"
          style={{
            boxShadow:
              "0 8px 32px 0 rgb(90 140 180 / 0.12), 0 2px 8px 0 rgb(90 140 180 / 0.08)",
          }}
        >
          <ResetPasswordForm />
        </div>
      </div>
    </div>
  );
}
