'use client'

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter()
  return (
   <div className="flex items-center justify-center bg-white w-full min-h-screen">
    <button onClick={() => router.push('/step1')} className="border bg-yellow-300 px-2 py-2 hover:bg-yellow-400 text-black cursor-pointer rounded-lg ">Click me to Start a new book!</button>
   </div>
  );
}
