"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/requirements");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#e8eff6]">
      <p className="text-sm text-[#7a96ae]">跳转中...</p>
    </div>
  );
}
