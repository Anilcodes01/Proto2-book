"use client";

import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface BookData {
  id: string;
  title: string;
  authorName: string;
  design: {
    coverFrontImage: string;
  } | null;
}

export default function DashboardComp() {
  const [books, setBooks] = useState<BookData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const fetchBookData = async () => {
      try {
        const res = await axios.get("/api/dashboard");
        const data = res.data?.data;

        if (data) {
          setBooks(data);
        }
      } catch (error) {
        console.error("Error fetching book data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookData();
  }, []);

  return (
    <div className="w-full min-h-screen bg-gray-100 flex items-start justify-center py-10 px-6">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-lg p-8">
       <div className="flex items-center gap-16">
       <h1 className="text-4xl font-bold mb-6 text-gray-800">📚 Book Dashboard</h1>
       <button onClick={() => router.push("/step1")} className="border px-4 py-2 mb-6 hover:bg-sky-100 cursor-pointer rounded-lg">Add new Book</button>
       </div>

        {loading ? (
          <div className="text-gray-500">Loading your masterpieces...</div>
        ) : books.length > 0 ? (
          <div className="space-y-8">
            {books.map((book) => (
              <div key={book.id} className="flex flex-col md:flex-row gap-8 border-b pb-8 last:border-b-0 last:pb-0">
                <div className="flex-shrink-0">
                  <Image
                    src={book.design?.coverFrontImage || "/img1.jpeg"}
                    alt="Cover Image"
                    width={200}
                    height={300}
                    className="rounded-xl object-cover w-48 h-72"
                  />
                </div>

                <div className="flex flex-col justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-2">{book.title}</h2>
                    <p className="text-lg text-gray-600 mb-4">By <span className="font-medium">{book.authorName}</span></p>
                  </div>

                  <div>
                    <button className="mt-4 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-all">
                      ✏️ Edit Book
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500">No books found. Try adding a new book.</div>
        )}
      </div>
    </div>
  );
}