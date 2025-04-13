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

  const handleAddbook = async () => {
        const removeId = localStorage.removeItem("bookProjectId");
        console.log("bookid removed successfully")
        router.push("/step1")

  }

  return (
    <div className="w-full min-h-screen bg-gray-100 flex items-start justify-center py-6 sm:py-10 px-4 sm:px-6">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg p-4 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-16 mb-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800">📚 Book Dashboard</h1>
          <button 
            onClick={handleAddbook}
            className="border px-4 py-2 hover:bg-sky-100 cursor-pointer rounded-lg text-sm sm:text-base w-full sm:w-auto text-center"
          >
            Add new Book
          </button>
        </div>

        {loading ? (
          <div className="text-gray-500">Loading your masterpieces...</div>
        ) : books.length > 0 ? (
          <div className="space-y-6 sm:space-y-8">
            {books.map((book) => (
              <div key={book.id} className="flex flex-col sm:flex-row gap-4 sm:gap-8 border-b pb-6 sm:pb-8 last:border-b-0 last:pb-0">
                <div className="flex-shrink-0 mx-auto sm:mx-0">
                  <Image
                    src={book.design?.coverFrontImage || "/img1.jpeg"}
                    alt="Cover Image"
                    width={200}
                    height={300}
                    className="rounded-xl object-cover w-36 h-56 sm:w-48 sm:h-72"
                  />
                </div>

                <div className="flex flex-col justify-between mt-4 sm:mt-0 text-center sm:text-left">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-1 sm:mb-2">{book.title}</h2>
                    <p className="text-base sm:text-lg text-gray-600 mb-2 sm:mb-4">
                      By <span className="font-medium">{book.authorName}</span>
                    </p>
                  </div>

                  <div className="mt-2 sm:mt-0">
                    <button className="mt-2 sm:mt-4 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-all text-sm sm:text-base w-full sm:w-auto">
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