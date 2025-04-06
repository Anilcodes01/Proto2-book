import React, { useState } from "react";

const TextEditor = ({ activeId, textAreas, setTextAreas, onAddText }) => {
  const [fontSize, setFontSize] = useState(10);
  const [font, setFont] = useState("Arial");
  const [color, setColor] = useState("#000000");
  const [fontWeight, setFontWeight] = useState("normal");
  const [fontStyle, setFontStyle] = useState("normal");
  const [textAlign, setTextAlign] = useState("left");

  const activeText = textAreas.find((ta) => ta.id === activeId);

  const handleStyleChange = (key, value) => {
    setTextAreas((prev) =>
      prev.map((ta) => (ta.id === activeId ? { ...ta, [key]: value } : ta))
    );
  };

  return (
    <div className="p-4 border rounded-lg shadow-md bg-white max-w-xs">
      <h3 className="text-lg font-semibold mb-2">Text Editor</h3>

      {/* Font Size Selector */}
      <label className="block mb-1">Font Size</label>
      <select
        className="w-full p-1 border rounded"
        value={activeText ? activeText.fontSize : fontSize}
        onChange={(e) =>
          activeText
            ? handleStyleChange("fontSize", Number(e.target.value))
            : setFontSize(Number(e.target.value))
        }
      >
        {[8, 10, 12, 14, 16, 18, 20, 24, 30, 36, 48, 60, 72, 96].map((size) => (
          <option key={size} value={size}>
            {size}px
          </option>
        ))}
      </select>

      {/* Font Type Selector */}
      <label className="block mt-3 mb-1">Font Type</label>
      <select
        className="w-full p-1 border rounded"
        value={activeText ? activeText.font : font}
        onChange={(e) =>
          activeText ? handleStyleChange("font", e.target.value) : setFont(e.target.value)
        }
      >
        {["Arial", "Times New Roman", "Courier New", "Verdana", "Georgia"].map((f) => (
          <option key={f} value={f}>
            {f}
          </option>
        ))}
      </select>

      {/* Font Color Picker */}
      <label className="block mt-3 mb-1">Font Color</label>
      <input
        type="color"
        className="w-full"
        value={activeText ? activeText.color : color}
        onChange={(e) =>
          activeText ? handleStyleChange("color", e.target.value) : setColor(e.target.value)
        }
      />

      {/* Font Weight Selector */}
      <label className="block mt-3 mb-1">Font Weight</label>
      <select
        className="w-full p-1 border rounded"
        value={activeText ? activeText.fontWeight : fontWeight}
        onChange={(e) =>
          activeText
            ? handleStyleChange("fontWeight", e.target.value)
            : setFontWeight(e.target.value)
        }
      >
        <option value="normal">Normal</option>
        <option value="bold">Bold</option>
        <option value="lighter">Light</option>
      </select>

      {/* Font Style Selector */}
      <label className="block mt-3 mb-1">Font Style</label>
      <select
        className="w-full p-1 border rounded"
        value={activeText ? activeText.fontStyle : fontStyle}
        onChange={(e) =>
          activeText
            ? handleStyleChange("fontStyle", e.target.value)
            : setFontStyle(e.target.value)
        }
      >
        <option value="normal">Normal</option>
        <option value="italic">Italic</option>
      </select>

      {/* Text Alignment Selector */}
      <label className="block mt-3 mb-1">Text Alignment</label>
      <select
        className="w-full p-1 border rounded"
        value={activeText ? activeText.textAlign : textAlign}
        onChange={(e) =>
          activeText
            ? handleStyleChange("textAlign", e.target.value)
            : setTextAlign(e.target.value)
        }
      >
        <option value="left">Left</option>
        <option value="center">Center</option>
        <option value="right">Right</option>
        <option value="justify">Justify</option>
      </select>

      {/* Button to Add Text */}
      <button
        className="mt-4 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        onClick={() =>
          onAddText("title", fontSize, font, color, fontWeight, fontStyle, textAlign)
        }
      >
        Add Text
      </button>
    </div>
  );
};

export default TextEditor;