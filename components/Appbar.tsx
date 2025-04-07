"use client";
import { useRouter } from "next/navigation";

export default function Appbar() {
  const router = useRouter();

  return (
    <div className="bg-white text-black z-50 top-0 fixed border-b border-gray-100 w-full justify-between h-16 flex items-center">
      <button
        onClick={() => router.push("/")}
        className="lg:text-3xl text-2xl ml-4 font-bold lg:ml-8"
      >
        NotionVerse
      </button>
    </div>
  );
}