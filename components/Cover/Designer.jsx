'use client'
import React, { useContext, useEffect, useState } from "react";
import PageFrame from "./PageFrame";
import BookSpine from "./BookSpine";
import ThemeContext from "../../context/ThemeContext";
import { Loader, Trash2, Eye, EyeOff, Save } from "lucide-react";

export default function Book() {
  const {
    loading, textAreas, preview, previewFront, captureCover, previewMode, setPreviewMode,
    dragging, draggedId, isTyping, setIsTyping, activeId, setActiveId, page, setPage,
    deleteActiveTextArea, updateTextArea, handleMouseDown, rightPageImage, leftPageImage,
  } = useContext(ThemeContext);
  
  const [viewportWidth, setViewportWidth] = useState(0);
  
  useEffect(() => {
    // Set initial viewport width
    setViewportWidth(window.innerWidth);
    
    // Update on resize
    const handleResize = () => {
      setViewportWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Calculate responsive values
  const isMobile = viewportWidth < 768;
  const bookWidth = isMobile ? '100%' : viewportWidth < 1024 ? '90%' : viewportWidth < 1440 ? '75%' : '50%';
  const bookHeight = isMobile ? 'auto' : '65vh';
  const scaleFactor = isMobile ? 0.8 : 1; // Scale text down on mobile

  return (
    <div 
      onClick={() => setActiveId(null)} 
      className="flex flex-col w-full min-h-screen justify-start items-center bg-[#f0f0f0] p-4 sm:p-6"
    >
      {/* Top toolbar - full width on mobile, contained on desktop */}
      <div className="flex mb-4 w-full sm:w-[90%] md:w-[85%] lg:w-[75%] xl:w-[50%] justify-between items-center">
        <h2 className="text-lg font-medium hidden sm:block">Book Editor</h2>
        
        <div className="flex gap-2">
          <button 
            className="h-10 cursor-pointer px-3 py-2 border border-green-300 rounded-md bg-green-100 flex items-center gap-2 hover:bg-green-200 transition-colors"
            onClick={captureCover}
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader className="animate-spin" size={16} />
                <span className="hidden sm:inline">Saving...</span>
              </div>
            ) : (
              <>
                <Save size={16} />
                <span className="hidden sm:inline">Save Cover</span>
              </>
            )}
          </button>
          
          <button 
            className="h-10 px-3 py-2 border border-blue-300 rounded-md bg-blue-100 flex items-center gap-2 hover:bg-blue-200 transition-colors"
            onClick={() => setPreviewMode(!previewMode)}
          >
            {previewMode ? (
              <>
                <EyeOff size={16} />
                <span className="hidden sm:inline">Edit</span>
              </>
            ) : (
              <>
                <Eye size={16} />
                <span className="hidden sm:inline">Preview</span>
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Mobile page selector - only show on mobile */}
      {isMobile && (
        <div className="w-full mb-4">
          <div className="flex w-full gap-2 justify-center">
            <button 
              className={`flex-1 max-w-[150px] h-10 py-2 border rounded-md ${page === 'left' ? 'bg-blue-200 border-blue-300 font-medium' : 'bg-gray-100'}`}
              onClick={(e) => {
                e.stopPropagation();
                setPage('left');
              }}
            >
              Left Page
            </button>
            <button 
              className={`flex-1 max-w-[150px] h-10 py-2 border rounded-md ${page === 'right' ? 'bg-blue-200 border-blue-300 font-medium' : 'bg-gray-100'}`}
              onClick={(e) => {
                e.stopPropagation();
                setPage('right');
              }}
            >
              Right Page
            </button>
          </div>
        </div>
      )}
      
      {/* Book container */}
      <div 
        id='capture' 
        className={`flex ${isMobile ? 'flex-col' : 'flex-row'} relative shadow-lg`}
        style={{ 
          width: bookWidth,
          height: bookHeight,
          minHeight: isMobile ? '50vh' : 'auto'
        }}
        onClick={() => setActiveId(null)}
      >
        {/* Edit mode highlight - EXACTLY as in original code */}
        {!previewMode && (
          <div 
            className={`absolute w-[52%] h-[105%] top-[-10px] border-[2px] z-10 border-dashed border-red-600 ${
              isMobile 
                ? `w-[105%] h-[52%] ${page === 'right' ? 'bottom-[-10px]' : 'top-[-10px]'}`
                : page === 'right' ? 'right-[-10px]' : 'left-[-10px]'
            }`}
          ></div>
        )}
        
        {/* Left page - only show on desktop or when selected on mobile */}
        <div
          id="left"
          onClick={() => setPage('left')}
          className={`bg-white relative flex justify-center items-center ${
            isMobile ? (page === 'left' ? 'block' : 'hidden') : 'w-1/2'
          }`}
          style={{
            backgroundImage: `url(/${leftPageImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            aspectRatio: isMobile ? '2/3' : 'auto',
            height: isMobile ? 'auto' : '100%'
          }}
        >
          <div id="left-page-content-area" className="w-full h-full">
            {textAreas
              .filter((ta) => ta.page === "left")
              .map((ta) => (
                <textarea
                  key={ta.id}
                  rows="1"
                  value={ta.value}
                  onClickCapture={(e) => {
                    e.stopPropagation();
                    setActiveId(ta.id);
                  }}
                  onChange={(e) => updateTextArea(ta.id, { value: e.target.value })}
                  onClick={(e) => {
                    if (!ta.active) {
                      updateTextArea(ta.id, { active: true });
                      e.stopPropagation();
                    }
                  }}
                  onFocus={() => setIsTyping(true)}
                  onBlur={() => setIsTyping(false)}
                  onMouseDown={handleMouseDown(ta.id)}
                  className={`custom-textarea ${
                    activeId === ta.id
                      ? "border-[2px] border-dashed border-red-500"
                      : "border-[2px] border-transparent"
                  } resize-none w-full text-center z-10 focus:outline-none overflow-hidden p-1`}
                  style={{
                    height: "auto",
                    left: `${ta.position.x}px`,
                    top: `${ta.position.y}px`,
                    position: "absolute",
                    fontSize: `${Math.max(12, ta.fontSize * scaleFactor)}px`,
                    fontFamily: ta.fontFamily,
                    color: ta.color,
                    fontWeight: ta.fontWeight,
                    fontStyle: ta.fontStyle,
                    cursor: dragging && draggedId === ta.id ? "grabbing" : isTyping ? "text" : "grab",
                    userSelect: dragging && draggedId === ta.id ? "none" : "auto",
                  }}
                  ref={(el) => {
                    if (el) {
                      el.style.height = "auto";
                      el.style.height = el.scrollHeight + "px";
                    }
                  }}
                ></textarea>
              ))
            }
          </div>
          {!previewMode && <PageFrame />}
        </div>
        
        {/* Book spine - only show in desktop layout */}
        {!isMobile && (
          <BookSpine color={previewMode ? "border-transparent" : "border-red-600"} />
        )}
        
        {/* Right page - only show on desktop or when selected on mobile */}
        <div
          id="right"
          onClick={() => setPage('right')}
          className={`bg-white relative flex justify-center items-center ${
            isMobile ? (page === 'right' ? 'block' : 'hidden') : 'w-1/2'
          }`}
          style={{
            backgroundImage: `url(/${rightPageImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            aspectRatio: isMobile ? '2/3' : 'auto',
            height: isMobile ? 'auto' : '100%'
          }}
        >
          <div id="right-page-content-area" className="w-full relative h-full">
            {textAreas
              .filter((ta) => ta.page === "right")
              .map((ta) => (
                <textarea
                  key={ta.id}
                  rows="1"
                  value={ta.value}
                  onClickCapture={(e) => {
                    e.stopPropagation();
                    setActiveId(ta.id);
                  }}
                  onChange={(e) => updateTextArea(ta.id, { value: e.target.value })}
                  onClick={(e) => {
                    if (!ta.active) {
                      updateTextArea(ta.id, { active: true });
                      e.stopPropagation();
                    }
                  }}
                  onFocus={() => setIsTyping(true)}
                  onBlur={() => setIsTyping(false)}
                  onMouseDown={handleMouseDown(ta.id)}
                  className={`custom-textarea ${
                    activeId === ta.id
                      ? "border-[2px] border-dashed border-red-500"
                      : "border-[2px] border-transparent"
                  } resize-none z-10 w-full text-center focus:outline-none overflow-hidden p-1`}
                  style={{
                    height: "auto",
                    left: `${ta.position.x}px`,
                    top: `${ta.position.y}px`,
                    position: "absolute",
                    fontSize: `${Math.max(12, ta.fontSize * scaleFactor)}px`,
                    fontFamily: ta.fontFamily,
                    color: ta.color,
                    fontWeight: ta.fontWeight,
                    fontStyle: ta.fontStyle,
                    cursor: dragging && draggedId === ta.id ? "grabbing" : isTyping ? "text" : "grab",
                    userSelect: dragging && draggedId === ta.id ? "none" : "auto",
                  }}
                  ref={(el) => {
                    if (el) {
                      el.style.height = "auto";
                      el.style.height = el.scrollHeight + "px";
                    }
                  }}
                ></textarea>
              ))
            }
          </div>
          {!previewMode && <PageFrame />}
        </div>
      </div>
      
      {/* Actions toolbar */}
      <div className="w-full sm:w-[90%] md:w-[85%] lg:w-[75%] xl:w-[50%] h-fit flex justify-end items-center pt-4">
        {activeId && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteActiveTextArea();
            }}
            className="h-10 flex justify-center items-center border rounded-md bg-red-100 hover:bg-red-200 px-3 gap-2 transition-colors"
            aria-label="Delete selected text area"
          >
            <Trash2 size={16} />
            <span className="hidden sm:inline">Delete</span>
          </button>
        )}
      </div>
      
      {/* Preview images */}
      {preview && (
        <div className="mt-6 flex flex-col sm:flex-row items-center sm:items-start gap-6 justify-center w-full">
          <div className="flex flex-col items-center gap-2">
            <h3 className="text-sm font-semibold">Whole Book:</h3>
            <img
              src={preview}
              alt="Whole Book Preview"
              className="w-[200px] h-auto rounded shadow-md"
            />
          </div>
        
          <div className="flex flex-col items-center gap-2">
            <h3 className="text-sm font-semibold">Front Cover:</h3>
            <img
              src={previewFront}
              alt="Front Cover Preview"
              className="w-[95px] h-auto rounded shadow-md"
            />
          </div>
        </div>
      )}
    </div>
  );
}