import Link from "next/link";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground">需求管理系统</h1>
          <p className="text-muted mt-2">登录以管理需求和排期</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
