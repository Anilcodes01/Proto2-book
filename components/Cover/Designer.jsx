'use client'
import React, {  useContext } from "react";
import PageFrame from "./PageFrame";
import BookSpine from "./BookSpine";
import ThemeContext from "../../context/ThemeContext";
import { Loader } from "lucide-react";


export default function Book() {
  const {loading,  textAreas, preview, previewFront, captureCover,  previewMode, setPreviewMode, dragging,  draggedId,  isTyping, setIsTyping,  activeId, setActiveId, page, setPage,  deleteActiveTextArea, updateTextArea, handleMouseDown,  rightPageImage,  leftPageImage, } = useContext(ThemeContext);

  

  return (
    <div onClick={()=>setActiveId(null)} className="flex flex-col w-full h-full justify-center items-center bg-[#f0f0f0]">
      <div className="flex mb-4 flex-row w-[45%] h-fit justify-end items-center ">
        <button className="h-10 cursor-pointer p-2 border border-green-300 rounded bg-green-100" onClick={captureCover}>
          {loading ?  <div className="flex items-center justify-center gap-2">
            <Loader className="animate-spin" size={16} />
            <span>Saving...</span>
          </div>: "Save Cover"}  
        </button>
      </div>
      <div id='capture' className="flex flex-row w-[45%] h-[55%] relative" onClick={() => setActiveId(null)}>
        {!previewMode && <div className={`absolute w-[52%] h-[450px] top-[-10px] border-[2px] z-10 border-dashed border-red-600 ${page == 'right'? "right-[-10px]": "left-[-10px]"}`}></div>}
        <div
          id="left"
          onClick={() => setPage('left')}
          className={`w-full h-full bg-white relative flex justify-center items-center`}
          style={{
            backgroundImage: `url(/${leftPageImage})`,
            backgroundSize: "cover",         // makes image cover the whole div
            backgroundPosition: "center",    // centers the image
            backgroundRepeat: "no-repeat",   // prevents repeating
          }}
        >
          <div
            id="left-page-content-area"
            className="w-full h-full"
          >
            {textAreas
              .filter((ta) => ta.page === "left")
              .map((ta) => (
                <textarea
                  key={ta.id}
                  rows="1"
                  value={ta.value}
                  onClickCapture={(e) => setActiveId(ta.id)}
                  onChange={(e) => updateTextArea(ta.id, { value: e.target.value })}
                  // If inactive, activate on click without interfering with the focus event
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
                  } resize-none w-full text-center z-10 focus:outline-none focus:ring-none overflow-hidden p-1`}
                  style={{
                    height: "auto",
                    left: `${ta.position.x}px`,
                    top: `${ta.position.y}px`,
                    position: "absolute",
                    fontSize: `${ta.fontSize}px`,
                    fontFamily: ta.fontFamily,
                    color: ta.color,
                    fontWeight: ta.fontWeight,
                    fontStyle: ta.fontStyle,
                                    cursor:
                      dragging && draggedId === ta.id ? "grabbing" : isTyping ? "text" : "grab",
                    userSelect:
                      dragging && draggedId === ta.id ? "none" : "auto",
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
            <BookSpine color={previewMode ? "border-transparent" : "border-red-600"} />
        <div
          id="right"
          onClick={() => setPage('right')}
          className={`w-full h-full bg-white relative flex justify-center items-center`}
          style={{
            backgroundImage: `url(/${rightPageImage})`,
            backgroundSize: "cover",         // makes image cover the whole div
            backgroundPosition: "center",    // centers the image
            backgroundRepeat: "no-repeat",   // prevents repeating
          }}
        >
          <div
            id="right-page-content-area"
            className="w-full relative h-full"
          >
            {textAreas
              .filter((ta) => ta.page === "right")
              .map((ta) => (
                <textarea
                  key={ta.id}
                  rows="1"
                  value={ta.value}
                  onClickCapture={(e) => setActiveId(ta.id)}
                  onChange={(e) => updateTextArea(ta.id, { value: e.target.value })}
                  // If inactive, activate on click without interfering with the focus event
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
                      : ""
                  } resize-none z-10 w-full text-center focus:outline-none focus:ring-none overflow-hidden p-1`}
                  style={{
                    height: "auto",
                    left: `${ta.position.x}px`,
                    top: `${ta.position.y}px`,
                    position: "absolute",
                    fontSize: `${ta.fontSize}px`,
                    fontFamily: ta.fontFamily,
                    color: ta.color,
                    fontWeight: ta.fontWeight,
                    fontStyle: ta.fontStyle,
                    cursor:
                      dragging && draggedId === ta.id ? "grabbing" : isTyping ? "text" : "grab",
                    userSelect:
                      dragging && draggedId === ta.id ? "none" : "auto",
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
      <div className="w-[47%] h-fit gap-2 flex justify-end items-center pt-4">
      <button
          onClick={deleteActiveTextArea}
          className="w-fit h-10 flex justify-center items-center border rounded bg-red-200"
        >
          Delete
        </button>
        <button className="h-10 w-20 p-2 border rounded" onClick={() => setPreviewMode(!previewMode)}>Preview</button>
      </div>
      {preview && (
        <div className="mt-4 flex flex-row items-start gap-6 flex-wrap">
      
        <div className="flex flex-col items-center gap-2">
          <h3 className="text-sm font-semibold">Whole Book:</h3>
          <img
            src={preview}
            alt="Whole Book Preview"
            className="w-[200px] h-auto rounded shadow"
          />
        </div>
      
        <div className="flex flex-col items-center gap-2">
          <h3 className="text-sm font-semibold">Front Cover:</h3>
          <img
            src={previewFront}
            alt="Front Cover Preview"
            className="w-[95px] h-auto rounded shadow"
          />
        </div>
      </div>
      
      )}
    </div>
  );
}