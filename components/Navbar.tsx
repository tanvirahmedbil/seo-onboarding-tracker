"use client";

import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  const { user, signOutUser } = useAuth();

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="SEO Onboarding" width={28} height={28} className="rounded-md" />
          <span className="font-semibold text-gray-900 text-sm tracking-tight">SEO Onboarding</span>
        </Link>
        {user && (
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400">{user.email}</span>
            <button
              onClick={signOutUser}
              className="text-xs text-gray-500 hover:text-gray-900 transition-colors"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
