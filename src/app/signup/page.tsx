import { SignupForm } from "./signup-form";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground">创建账号</h1>
          <p className="text-muted mt-2">注册后即可录入和管理需求</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
          <SignupForm />
        </div>
      </div>
    </div>
  );
}
