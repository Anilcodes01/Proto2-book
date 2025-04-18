"use client";
import axios from "axios";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface Contributor {
  role: string;
  name: string;
}

export default function Step1() {
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [inputFields, setInputFields] = useState<Contributor[]>([]);
  const [title, setTitle] = useState<string>("");
  const [subtitle, setSubtitle] = useState<string>("");
  const [authorName, setAuthorName] = useState<string>("");
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const roles = [
    { id: "Coauthor", label: "Co-author" },
    { id: "Editor", label: "Editor" },
    { id: "Illustrator", label: "Illustrator" },
  ];

  const languages = [
    "English",
    "Hindi",
    "Gujarati",
    "Bengali",
    "Tamil",
    "Telugu",
  ];

  const genres = [
    "Fiction",
    "NonFiction",
    "Academic",
    "Poetry",
    "Cookbook",
    "Childrenbook",
    "Others",
  ];

  const handleLanguageSelect = (language: string) => {
    setSelectedLanguage(prev => prev === language ? null : language);
  };

  const handleGenreSelect = (genre: string) => {
    setSelectedGenre(prev => prev === genre ? null : genre);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!selectedLanguage || !title || !authorName || !selectedGenre) {
      alert("Please fill all required fields");
      return;
    }
  
    try {
      setLoading(true);
      const res = await axios.post("/api/bookInfo", {
        language: selectedLanguage,
        title,
        subtitle: subtitle,
        authorName,
        genre: selectedGenre,
        contributors: inputFields,
      });
  
      if (res.status === 201) {
        toast.success("📘 Book info added successfully!");
        setLoading(false);
        const bookProjectId = res.data.data;
  
        if (bookProjectId) {
          localStorage.setItem("bookProjectId", bookProjectId);
          console.log("✅ bookProjectId saved to localStorage:", bookProjectId);
        }

        router.push("/step2");
        console.log("📘 Book info added successfully!");
      }
    } catch (error) {
      toast.error("Error adding book info");
      setLoading(false);
    }
  };

  const handleRoleSelect = (roleId: string) => {
    setSelectedRoles(prev =>
      prev.includes(roleId)
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    );
  };

  const handleAddClick = () => {
    if (selectedRoles.length === 0) return;

    const newContributors = selectedRoles.map(role => ({
      role,
      name: "",
    }));

    setInputFields([...inputFields, ...newContributors]);
    setSelectedRoles([]);
  };

  const handleInputChange = (index: number, value: string) => {
    const updatedFields = [...inputFields];
    updatedFields[index].name = value;
    setInputFields(updatedFields);
  };

  const removeInputField = (index: number) => {
    setInputFields(inputFields.filter((_, i) => i !== index));
  };

  return (
    <div className="flex items-center justify-center bg-white w-full min-h-screen p-4 md:p-8 md:pl-24 lg:pl-64 text-black">
      <form onSubmit={handleSubmit} className="flex flex-col px-4 py-6 md:px-8 md:py-8 rounded-2xl w-full max-w-3xl">
        <h1 className="text-xl md:text-2xl text-center font-bold">Book Information</h1>

        <div className="mt-8 md:mt-12">
          <h2 className="font-medium mb-2">Book Language*</h2>
          <div className="flex flex-wrap gap-2 mb-5">
            {languages.map((language) => (
              <button
                key={language}
                type="button"
                className={`px-3 py-1 rounded border text-sm md:text-base transition-colors ${
                  selectedLanguage === language
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200"
                }`}
                onClick={() => handleLanguageSelect(language)}
              >
                {language}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-6 md:gap-8">
          <div className="flex flex-col gap-1">
            <label htmlFor="title">Book Title*</label>
            <input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              type="text"
              className="border rounded-lg px-2 py-2 text-sm placeholder:text-gray-400"
              required
              placeholder="Enter your book's title"
            />
          </div>
          
          <div className="flex flex-col gap-1">
            <label htmlFor="subtitle">Book Subtitle</label>
            <input
              id="subtitle"
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="border rounded-lg px-2 py-2 text-sm placeholder:text-gray-400"
              placeholder="Enter your book's subtitle"
            />
          </div>
          
          <div className="flex flex-col gap-1">
            <label htmlFor="author">Author Name*</label>
            <input
              id="author"
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="border rounded-lg px-2 py-2 text-sm placeholder:text-gray-400"
              required
              placeholder="Enter author's name"
            />
          </div>
        </div>

        <div className="mt-6 md:mt-8">
          <h2 className="text-lg font-medium mb-4">Enter Contributors</h2>
          
          <div className="space-y-3 mb-4">
            {roles.map((role) => (
              <div key={role.id} className="flex items-center">
                <input
                  type="checkbox"
                  id={role.id}
                  checked={selectedRoles.includes(role.id)}
                  onChange={() => handleRoleSelect(role.id)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 rounded"
                />
                <label htmlFor={role.id} className="ml-3 block text-gray-700">
                  {role.label}
                </label>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddClick}
            disabled={selectedRoles.length === 0}
            className={`px-4 py-1 rounded mb-6 ${
              selectedRoles.length === 0
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
          >
            Add
          </button>

          <div className="space-y-4">
            {inputFields.map((field, index) => {
              const roleLabel = roles.find(r => r.id === field.role)?.label || field.role;
              return (
                <div key={`${field.role}-${index}`} className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                  <span className="w-full sm:w-24 font-medium">{roleLabel}:</span>
                  <input
                    type="text"
                    value={field.name}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    placeholder={`Enter ${roleLabel} name`}
                    className="w-full sm:flex-1 px-3 py-2 border rounded"
                  />
                  <button
                    type="button"
                    onClick={() => removeInputField(index)}
                    className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-8 md:mt-12">
          <h2 className="font-medium mb-2">Book Genre*</h2>
          <div className="flex flex-wrap gap-2 mb-5">
            {genres.map((genre) => (
              <button
                key={genre}
                type="button"
                className={`px-3 py-1 rounded border text-sm md:text-base transition-colors ${
                  selectedGenre === genre
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200"
                }`}
                onClick={() => handleGenreSelect(genre)}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 mt-8">
          <button
            type="button"
            className="border px-4 py-2 rounded-lg cursor-pointer hover:bg-sky-100 w-full sm:w-auto"
          >
            Save as Draft
          </button>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 w-full sm:w-auto"
          >
           {loading ? <div className="flex items-center justify-center gap-2">
            <Loader className="animate-spin w-6 h-6" />
            <span>Saving...</span>
           </div> : "Save and Continue"}
          </button>
        </div>
      </form>
    </div>
  );
}