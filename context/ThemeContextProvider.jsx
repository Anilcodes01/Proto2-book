"use client";
import React, {
  useState,
  useEffect,
} from "react";
import ThemeContext from "./ThemeContext";
import domtoimage from "dom-to-image-more";
import axios from "axios";
import { useRouter } from "next/navigation";

const ThemeContextProvider = ({ children }) => {
  const [textAreas, setTextAreas] = useState([]);
  const [selectedImage, setSelectedImage] = useState("");
  const [rightPageImage, setRightPageImage] = useState("");
  const [leftPageImage, setLeftPageImage] = useState("");
  const [dragging, setDragging] = useState(false);
  const [draggedId, setDraggedId] = useState(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isTyping, setIsTyping] = useState(false); // Controls typing vs dragging
  // New state for robust drag detection
  const [dragCandidate, setDragCandidate] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [page, setPage] = useState("right");
  const [previewMode, setPreviewMode] = useState(false);
  const [preview, setPreview] = useState(null); // Store captured image
  const [previewFront, setPreviewFront] = useState(null); // Store captured image
  const router = useRouter()
  const defaultPositions = {
    title: { x: 0, y: 20 },
    subtitle: { x: 0, y: 100 },
    regular: { x: 0, y: 180 },
  };
  const addTextArea = (type, selectedFontSize, selectedFont, selectedColor) => {
    const existing = textAreas.find((ta) => ta.type === type);
    const defaultPosition = existing
      ? existing.position
      : defaultPositions[type];

    const defaultFontSize =
      type === "title" ? 40 : type === "subtitle" ? 30 : 20;

    const newTextArea = {
      id: Date.now(), // Unique ID
      type,
      value:
        type === "title"
          ? "Add Title"
          : type === "subtitle"
          ? "Add Subtitle"
          : "Add Regular Text",
      position: { ...defaultPosition },
      fontSize: selectedFontSize || defaultFontSize, // Use selected or default font size
      fontFamily: selectedFont || "Arial", // Default font if none selected
      color: selectedColor || "#000000", // Default color black
      page: page,
      active: true,
    };

    setTextAreas([...textAreas, newTextArea]);
    setActiveId(newTextArea.id);
  };

  const deleteActiveTextArea = () => {
    if (activeId) {
      setTextAreas((prev) => prev.filter((ta) => ta.id !== activeId));
      setActiveId(null);
    }
  };

  const updateTextArea = (id, changes) => {
    setTextAreas((prev) =>
      prev.map((ta) => (ta.id === id ? { ...ta, ...changes } : ta))
    );
  };

  // Handle mousedown to initiate a drag candidate
  const handleMouseDown = (id) => (e) => {
    setActiveId(id);
    const ta = textAreas.find((t) => t.id === id);
    if (!ta) return;
    // Set the drag candidate regardless, so that on a small movement, dragging will initiate
    setDragCandidate({
      id,
      startX: e.clientX,
      startY: e.clientY,
      offsetX: e.clientX - ta.position.x,
      offsetY: e.clientY - ta.position.y,
    });
    // No need to stop propagation or blur immediately;
    // onFocus will allow typing if no drag is initiated.
  };

  const captureCover = async () => {
    const bookProjectId = localStorage.getItem("bookProjectId")
    const element1 = document.getElementById("capture");
    const element2 = document.getElementById("right");

    if (!element1 && !element2) {
      console.error("No element with id 'capture' found");
      return;
    }

    try {
      const dataUrl1 = await domtoimage.toJpeg(element1, {
        quality: 1,
        bgcolor: null,
        style: {
          transform: "scale(1)",
          transformOrigin: "top left",
          border: "none", // ⛔ removes outer border
          boxShadow: "none", // ⛔ kills any shadow weirdness
          outline: "none", // ⛔ removes outlines too
        },
        filter: (node) => {
          // ⚠️ strip all borders unless you intentionally styled them
          if (node instanceof HTMLElement) {
            node.style.border = node.style.border || "none";
            node.style.outline = "none";
            node.style.boxShadow = "none";
          }
          return true;
        },
      });
      console.log("📸 Clean shot captured url.", dataUrl1);
      setPreview(dataUrl1);
      console.log("📸 Clean shot captured.");
      const dataUrl2 = await domtoimage.toJpeg(element2, {
        quality: 1,
        bgcolor: null,
        style: {
          transform: "scale(1)",
          transformOrigin: "top left",
          border: "none", // ⛔ removes outer border
          boxShadow: "none", // ⛔ kills any shadow weirdness
          outline: "none", // ⛔ removes outlines too
        },
        filter: (node) => {
          // ⚠️ strip all borders unless you intentionally styled them
          if (node instanceof HTMLElement) {
            node.style.border = node.style.border || "none";
            node.style.outline = "none";
            node.style.boxShadow = "none";
          }
          return true;
        },
      });
      console.log("📸 Clean shot captured url.", dataUrl2);
      setPreviewFront(dataUrl2);
      console.log("📸 front shot captured.");

      try {
        const save = await axios.post("/api/save-preview", {
          bookProjectId,
          coverPreview: dataUrl1,
          coverFrontImage: dataUrl2,
        });

        if (save.status === 200) {
          console.log("✅ Cover preview saved successfully.");
           router.push('/step2')
        }
      } catch (error) {
        console.log("❌ Error saving cover preview:", error);
      }
    } catch (err) {
      console.error("❌ Could not capture:", err);
    }
  };

  // Handle mousemove: determine if the movement is enough to consider as dragging
  const handleMouseMove = (e) => {
    if (dragCandidate) {
      const dx = e.clientX - dragCandidate.startX;
      const dy = e.clientY - dragCandidate.startY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      // If movement is beyond threshold (5px), consider it a drag.
      if (!dragging && distance > 5) {
        setDragging(true);
        setDraggedId(dragCandidate.id);
      }
      if (dragging && draggedId === dragCandidate.id) {
        const newPos = {
          x: e.clientX - dragCandidate.offsetX,
          y: e.clientY - dragCandidate.offsetY,
        };
        updateTextArea(dragCandidate.id, { position: newPos });
      }
    }
  };

  const handleMouseUp = () => {
    setDragging(false);
    setDraggedId(null);
    setDragCandidate(null);
  };

  // Global click handler to deactivate textareas when clicking outside
  useEffect(() => {
    const handleGlobalClick = (e) => {
      // If click target is not inside one of our textareas (which we mark with a custom class), deactivate all.
      if (!e.target.closest(".custom-textarea")) {
        setTextAreas((prev) => prev.map((ta) => ({ ...ta, active: false })));
      }
    };
    document.addEventListener("click", handleGlobalClick);
    return () => {
      document.removeEventListener("click", handleGlobalClick);
    };
  }, []);

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragCandidate, dragging, draggedId]);

  return (
    <ThemeContext.Provider
      value={{
        previewFront,
        setPreviewFront,
        captureCover,
        preview,
        previewMode,
        setPreviewMode,
        activeId,
        rightPageImage,
        setRightPageImage,
        leftPageImage,
        setLeftPageImage,
        selectedImage,
        setSelectedImage,
        textAreas,
        setTextAreas,
        dragging,
        setDragging,
        draggedId,
        setDraggedId,
        offset,
        setOffset,
        isTyping,
        setIsTyping,
        dragCandidate,
        setDragCandidate,
        activeId,
        setActiveId,
        page,
        setPage,
        addTextArea,
        deleteActiveTextArea,
        updateTextArea,
        handleMouseDown,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContextProvider;
