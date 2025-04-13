"use client";
import { useState, useEffect, useRef } from "react";
import FormatSidebar from "@/components/format-book/FormatSidebar";
import FormatCanvas from "@/components/format-book/Format-canvas";
import axios from "axios";
import { useBookStructureManager } from "../hooks/useBookStructureManager";
import { Edit3, Eye } from "lucide-react";
import {
  ChapterOption,
  PartData,
  OtherOptionData,
  isChapterOption,
  isOtherOptionData,
} from "@/app/lib/types";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination, Mousewheel, Keyboard } from "swiper/modules";
import Image from "next/image";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const LOCAL_STORAGE_CHAPTER_PREFIX = "tinymce-chapter-";
const LOCAL_STORAGE_PART_PREFIX = "tinymce-part-";
const LOCAL_STORAGE_OTHER_PREFIX = "tinymce-other-";

const styleOptions = [
  { id: "classic", name: "Classic Style", preview: "/Blanco.png" },
  { id: "modern", name: "Modern Style", preview: "/Jazmin.png" },
  { id: "minimalist", name: "Minimalist Style", preview: "/one.png" },
];

export default function Step3Page() {
  const [selectedChapterInfo, setSelectedChapterInfo] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [selectedPartInfo, setSelectedPartInfo] = useState<{
    id: string;
    name: string;
    chapterId: string;
  } | null>(null);
  const [selectedOtherOptionInfo, setSelectedOtherOptionInfo] = useState<{
    id: string;
    name: string;
    sectionTitle: string;
  } | null>(null);
  const [bookProjectId, setBookProjectId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [selectedStyle, setSelectedStyle] = useState<string>("classic");
  const [isStylePickerOpen, setIsStylePickerOpen] = useState<boolean>(false);
  const stylePickerRef = useRef<HTMLDivElement>(null);
  const styleButtonRef = useRef<HTMLButtonElement>(null);
  const [loading, setLoading] = useState(false);
const router = useRouter();

  useEffect(() => {
    const id = localStorage.getItem("bookProjectId");
    setBookProjectId(id);
  }, []);

  const bookTitle = "My Sample Book";
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const {
    sections,
    isLoading: isStructureLoading,
    error: structureError,
  } = useBookStructureManager(bookProjectId);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        isStylePickerOpen &&
        stylePickerRef.current &&
        !stylePickerRef.current.contains(event.target as Node) &&
        styleButtonRef.current &&
        !styleButtonRef.current.contains(event.target as Node)
      ) {
        setIsStylePickerOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isStylePickerOpen]);

  const handleStyleSelect = (styleId: string) => {
    setSelectedStyle(styleId);
    setIsStylePickerOpen(false);
  };

  const toggleStylePicker = () => {
    setIsStylePickerOpen(!isStylePickerOpen);
  };

  const handleSelectChapter = (
    chapterInfo: { id: string; name: string } | null
  ) => {
    setSelectedChapterInfo(chapterInfo);
    setSelectedPartInfo(null);
    setSelectedOtherOptionInfo(null);
    setShowPreview(false);
  };

  const handleSelectPart = (
    partInfo: { id: string; name: string; chapterId: string } | null
  ) => {
    let nextChapterInfo = selectedChapterInfo;
    let nextPartInfo = partInfo;
    let nextOtherOptionInfo = null;

    if (partInfo) {
      if (
        !selectedChapterInfo ||
        selectedChapterInfo.id !== partInfo.chapterId
      ) {
        const chapterSection = sections.find((s) => s.title === "Chapters");
        const chapter = chapterSection?.options.find(
          (opt) => isChapterOption(opt) && opt.id === partInfo.chapterId
        ) as ChapterOption | undefined;
        nextChapterInfo = {
          id: partInfo.chapterId,
          name: chapter?.name || "Chapter (lookup failed)",
        };
      }
    }

    setSelectedChapterInfo(nextChapterInfo);
    setSelectedPartInfo(nextPartInfo);
    setSelectedOtherOptionInfo(nextOtherOptionInfo);
    setShowPreview(false);
  };

  const handleSelectOtherOption = (
    optionInfo: { id: string; name: string; sectionTitle: string } | null
  ) => {
    setSelectedOtherOptionInfo(optionInfo);
    setSelectedChapterInfo(null);
    setSelectedPartInfo(null);
    setShowPreview(false);
  };

  const handleAddChapter = (name: string) => {};

  const handleDeleteChapter = (id: string) => {
    if (selectedChapterInfo?.id === id) {
      setSelectedChapterInfo(null);
      setSelectedPartInfo(null);
    }
  };

  const handleAddPart = (chapterId: string, partId: string) => {};

  const handleDeletePart = (chapterId: string, partId: string) => {
    if (selectedPartInfo?.id === partId) {
      setSelectedPartInfo(null);
    }
  };

  const handleAddOtherOption = (sectionTitle: string, optionName: string) => {};

  const handleDeleteOtherOption = (sectionTitle: string, optionId: string) => {
    if (selectedOtherOptionInfo?.id === optionId) {
      setSelectedOtherOptionInfo(null);
    }
  };

  const handleGeneratePreview = async (style: string) => {
    setIsPreviewLoading(true);
    setPreviewError(null);
    setPreviewUrl(null);
    setShowPreview(false);

    if (typeof window === "undefined") {
      setPreviewError("Preview generation requires a browser environment.");
      setIsPreviewLoading(false);
      return;
    }

    const frontMatterSection = sections.find((s) => s.title === "Front Matter");
    const chaptersSection = sections.find((s) => s.title === "Chapters");
    const endMatterSection = sections.find((s) => s.title === "End Matter");

    const getOptionContent = (prefix: string, id: string) => {
      return localStorage.getItem(`${prefix}${id}`) || "";
    };

    const frontMatterData =
      frontMatterSection?.options.filter(isOtherOptionData).map((opt) => ({
        id: opt.id,
        name: opt.name,
        content: getOptionContent(LOCAL_STORAGE_OTHER_PREFIX, opt.id),
      })) || [];

    const chaptersData =
      chaptersSection?.options.filter(isChapterOption).map((chapter) => ({
        id: chapter.id,
        name: chapter.name,
        content: getOptionContent(LOCAL_STORAGE_CHAPTER_PREFIX, chapter.id),
        parts: chapter.parts.map((part) => ({
          id: part.id,
          name: part.name,
          content: getOptionContent(LOCAL_STORAGE_PART_PREFIX, part.id),
        })),
      })) || [];

    const endMatterData =
      endMatterSection?.options
        .filter(isOtherOptionData)
        .filter((opt) => opt.id && !opt.id.startsWith("default-"))
        .map((opt) => ({
          id: opt.id,
          name: opt.name,
          content: getOptionContent(LOCAL_STORAGE_OTHER_PREFIX, opt.id),
        })) || [];

    if (chaptersData.length === 0) {
      setPreviewError("No chapters found in the book structure.");
      setIsPreviewLoading(false);
      return;
    }

    const payload = {
      style: style,
      bookTitle: bookTitle,
      frontMatter: frontMatterData,
      chapters: chaptersData,
      endMatter: endMatterData,
    };

    try {
      const response = await axios.post("/api/generate-preview", payload);
      if (response.data && response.data.pdfUrl) {
        setPreviewUrl(response.data.pdfUrl);
        setShowPreview(true);
        setPreviewError(null);
      } else {
        throw new Error("Invalid response from server.");
      }
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.error ||
        error.message ||
        "An unknown error occurred.";
      const errorDetails = error.response?.data?.details;
      setPreviewError(
        `Failed to generate preview: ${errorMsg}${
          errorDetails ? ` (${errorDetails})` : ""
        }`
      );
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const togglePreview = () => {
    if (previewUrl) {
      setShowPreview((prev) => !prev);
    } else if (!isPreviewLoading) {
      alert("Please generate a preview first.");
    }
  };

  if (isStructureLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading Book Structure...
      </div>
    );
  }

  if (structureError) {
    return (
      <div className="flex justify-center items-center h-screen text-red-600">
        Error loading book structure: {structureError}
      </div>
    );
  }

  const activeCanvasItem = selectedOtherOptionInfo
    ? {
        type: "other",
        id: selectedOtherOptionInfo.id,
        name: selectedOtherOptionInfo.name,
        sectionTitle: selectedOtherOptionInfo.sectionTitle,
      }
    : selectedPartInfo
    ? {
        type: "part",
        id: selectedPartInfo.id,
        name: selectedPartInfo.name,
        chapterId: selectedPartInfo.chapterId,
      }
    : selectedChapterInfo
    ? {
        type: "chapter",
        id: selectedChapterInfo.id,
        name: selectedChapterInfo.name,
      }
    : null;

    const handleSubmit = async () => {
        setLoading(true)
        const bookProjectId = localStorage.getItem('bookProjectId')
          
        try {

            const res = await axios.post('/api/save-url', {bookProjectId, previewUrl})

            if(res.status === 200){
                toast.success("Preview saved successfully...!")
                router.push("/step2")
                console.log("preview saved successfully")
            }
        } catch (error) {
            console.error('error while submitting file...!')
            setLoading(false)
        } finally {
            setLoading(false)
        }
    }

  return (
    <div className="flex h-screen">
      <div className="w-1/4 flex-shrink-0 overflow-y-auto border-r">
        <FormatSidebar
          selectedChapter={selectedChapterInfo?.id || null}
          selectedChapterId={selectedChapterInfo?.id || null}
          selectedChapterName={selectedChapterInfo?.name || null}
          selectedPartId={selectedPartInfo?.id || null}
          selectedOtherOptionId={selectedOtherOptionInfo?.id || null}
          selectedOtherOptionName={selectedOtherOptionInfo?.name || null}
          onSelectChapter={handleSelectChapter}
          onSelectPart={handleSelectPart}
          onSelectOtherOption={handleSelectOtherOption}
          onAddOtherOption={handleAddOtherOption}
          onDeleteOtherOption={handleDeleteOtherOption}
          onAddChapter={handleAddChapter}
          onDeleteChapter={handleDeleteChapter}
          onAddPart={handleAddPart}
          onDeletePart={handleDeletePart}
        />
      </div>

      <div className="w-3/4 flex mt-16 flex-col">
        <div className="p-4 border-b bg-gray-50 flex flex-wrap items-center gap-4 sticky top-0 z-10">
          <span className="font-semibold">Preview:</span>

          <div className="relative">
            <button
              ref={styleButtonRef}
              onClick={toggleStylePicker}
              className="px-4 py-2 border rounded bg-sky-100 hover:bg-sky-200 flex items-center gap-2 transition-colors duration-150"
              disabled={isPreviewLoading}
            >
              {styleOptions.find((s) => s.id === selectedStyle)?.name ||
                "Select Style"}
            </button>

            {isStylePickerOpen && (
              <div
                ref={stylePickerRef}
                className="absolute top-full mt-2 bg-white rounded-lg shadow-xl p-4 z-20 border border-gray-200 w-80"
              >
                <h4 className="text-sm font-medium text-gray-600 mb-3 text-center">
                  Choose a Style
                </h4>
                <Swiper
                  modules={[Navigation, Pagination, Mousewheel, Keyboard]}
                  spaceBetween={15}
                  slidesPerView={1}
                  navigation
                  pagination={{ clickable: true }}
                  mousewheel={true}
                  keyboard={true}
                  className="style-swiper"
                  style={
                    {
                      "--swiper-navigation-color": "#0ea5e9",
                      "--swiper-pagination-color": "#0ea5e9",
                      "--swiper-navigation-size": "25px",
                    } as React.CSSProperties
                  }
                >
                  {styleOptions.map((style) => (
                    <SwiperSlide key={style.id}>
                      <div
                        onClick={() => handleStyleSelect(style.id)}
                        className={`flex flex-col items-center justify-center border rounded-md h-60 bg-gray-50 hover:bg-gray-100 hover:border-sky-400 cursor-pointer p-2 transition-colors duration-150 ${
                          selectedStyle === style.id
                            ? "border-sky-500 ring-2 ring-sky-300"
                            : "border-gray-300"
                        }`}
                      >
                        <Image
                          src={style.preview}
                          width={200}
                          height={200}
                          alt={style.name}
                          className="w-full h-4/5 object-contain mb-2 border-gray-300"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                            const parent = target.parentElement;
                            if (
                              parent &&
                              !parent.querySelector(".fallback-text")
                            ) {
                              const fallback = document.createElement("div");
                              fallback.textContent = "Preview N/A";
                              fallback.className =
                                "text-sm text-gray-400 fallback-text h-4/5 flex items-center justify-center";
                              parent.insertBefore(fallback, target.nextSibling);
                            }
                          }}
                        />
                        <span className="text-sm font-medium text-gray-700 text-center mt-auto">
                          {style.name}
                        </span>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            )}
          </div>

          <button
            onClick={() => handleGeneratePreview(selectedStyle)}
            disabled={isPreviewLoading || isStructureLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {isPreviewLoading ? "Generating..." : "Generate Preview"}
          </button>

          <button
            onClick={togglePreview}
            disabled={!previewUrl || isPreviewLoading}
            className={`px-4 py-2 border rounded flex items-center gap-2 ${
              !previewUrl || isPreviewLoading
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-white hover:bg-gray-100"
            }`}
            title={
              !previewUrl
                ? "Generate a preview first"
                : showPreview
                ? "Show Editor"
                : "Show Preview"
            }
          >
            {showPreview ? (
              <>
                <Edit3 size={16} /> Show Editor
              </>
            ) : (
              <>
                <Eye size={16} /> Show Preview
              </>
            )}
          </button>
          <button 
          onClick={handleSubmit}
          disabled={loading} 
          className="px-4 py-2 border rounded flex bg-gray-200 hover:bg-gray-300 items-center gap-2"
          >
            {loading ? "Saving" : "Save"}
          </button>

          <div className="flex-grow text-right">
            {previewError && (
              <span className="text-red-600 text-sm">{previewError}</span>
            )}
            {previewUrl && !previewError && !isPreviewLoading && (
              <span className="text-green-600 text-sm">Preview generated.</span>
            )}
          </div>
        </div>

        <div className="flex-grow overflow-y-auto bg-gray-100 p-4">
          {showPreview && previewUrl ? (
            <div className="w-full h-full bg-white shadow-lg">
              <iframe
                src={previewUrl}
                title="PDF Preview"
                className="w-full h-full border-none"
              />
            </div>
          ) : (
            <FormatCanvas
              selectedChapterId={selectedChapterInfo?.id || null}
              selectedChapterName={selectedChapterInfo?.name || null}
              selectedPartId={selectedPartInfo?.id || null}
              selectedPartName={selectedPartInfo?.name || null}
              selectedOtherOptionId={selectedOtherOptionInfo?.id || null}
              selectedOtherOptionName={
                activeCanvasItem?.type === "other"
                  ? activeCanvasItem.name
                  : null
              }
              selectedOtherOptionSectionTitle={
                activeCanvasItem?.type === "other"
                  ? activeCanvasItem.sectionTitle ?? null
                  : null
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}
