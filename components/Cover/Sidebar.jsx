'use client'
import React, {useState, useContext} from 'react';
import ThemeContext from "../../context/ThemeContext";
import TextEditor from './TextStyleEditor';

export default function SideBar() {
    const [activeTab, setActiveTab] = useState('background');
    const { addTextArea, page, setRightPageImage, setLeftPageImage, textAreas, setTextAreas, activeId} = useContext(ThemeContext);
    return (
        <div className='w-[22%] bg-white h-full flex text-black flex-col'>
            <div className='flex w-full h-fit flex-row justify-center'>
                <button onClick={()=>{setActiveTab('background')}} className={`p-2 h-10 w-full border ${activeTab === "background" ? "bg-gray-300" : "bg-white"} flex justify-center items-center`}>Background</button>
                <button onClick={()=>{setActiveTab('text')}} className={`p-2 h-10 w-full border ${activeTab === "text" ? "bg-gray-300" : "bg-white"} flex justify-center items-center`}>Text</button>
                <button onClick={()=>{setActiveTab('shapes')}} className={`p-2 h-10 w-full border ${activeTab === "shapes" ? "bg-gray-300" : "bg-white"} flex justify-center items-center`}>Shapes</button>
            </div>
            {activeTab === 'background' && 
                <div id='background' className='w-full bg-gray-300 h-full p-2'>
                    <div className='flex flex-wrap gap-2'>
                        <button onClick={() => {
  if (page === "right") {
    setRightPageImage("img2.jpeg");
  } else {
    setLeftPageImage("img2.jpeg");
  }
}} className='w-[115px] h-[115px] border rounded overflow-hidden'>
                            <img src="/img2.jpeg" alt="icon" className="w-full h-full object-cover" />
                        </button>                                                                                                            
                        <button onClick={() => {
  if (page === "right") {
    setRightPageImage("img3.jpeg");
  } else {
    setLeftPageImage("img3.jpeg");
  }
}} className='w-[115px] h-[115px] border rounded overflow-hidden'>
                            <img src="/img3.jpeg" alt="icon" className="w-full h-full object-cover" />
                        </button>                                                                                                            
                        <button onClick={() => {
  if (page === "right") {
    setRightPageImage("img4.jpeg");
  } else {
    setLeftPageImage("img4.jpeg");
  }
}} className='w-[115px] h-[115px] border rounded overflow-hidden'>
                            <img src="/img4.jpeg" alt="icon" className="w-full h-full object-cover" />
                        </button>                                                                                                            
                        <button onClick={() => {
  if (page === "right") {
    setRightPageImage("img5.jpeg");
  } else {
    setLeftPageImage("img5.jpeg");
  }
}} className='w-[115px] h-[115px] border rounded overflow-hidden'>
                            <img src="/img5.jpeg" alt="icon" className="w-full h-full object-cover" />
                        </button>                                                                                                            
                        <button onClick={() => {
  if (page === "right") {
    setRightPageImage("img6.jpeg");
  } else {
    setLeftPageImage("img6.jpeg");
  }
}} className='w-[115px] h-[115px] border rounded overflow-hidden'>
                            <img src="/img6.jpeg" alt="icon" className="w-full h-full object-cover" />
                        </button>                                                                                                            
                        <button onClick={() => {
  if (page === "right") {
    setRightPageImage("img7.jpeg");
  } else {
    setLeftPageImage("img7.jpeg");
  }
}} className='w-[115px] h-[115px] border rounded overflow-hidden'>
                            <img src="/img7.jpeg" alt="icon" className="w-full h-full object-cover" />
                        </button>                                                                                                            
                        <button onClick={() => {
  if (page === "right") {
    setRightPageImage("img8.jpeg");
  } else {
    setLeftPageImage("img8.jpeg");
  }
}} className='w-[115px] h-[115px] border rounded overflow-hidden'>
                            <img src="/img8.jpeg" alt="icon" className="w-full h-full object-cover" />
                        </button>                                                                                                            
                        <button onClick={() => {
  if (page === "right") {
    setRightPageImage("img9.jpeg");
  } else {
    setLeftPageImage("img9.jpeg");
  }
}} className='w-[115px] h-[115px] border rounded overflow-hidden'>
                            <img src="/img9.jpeg" alt="icon" className="w-full h-full object-cover" />
                        </button>                                                                                                            
                        <button onClick={() => {
  if (page === "right") {
    setRightPageImage("img10.jpeg");
  } else {
    setLeftPageImage("img10.jpeg");
  }
}} className='w-[115px] h-[115px] border rounded overflow-hidden'>
                            <img src="/img10.jpeg" alt="icon" className="w-full h-full object-cover" />
                        </button>                                                                                                            
                        <button onClick={() => {
  if (page === "right") {
    setRightPageImage("img1.jpeg");
  } else {
    setLeftPageImage("img1.jpeg");
  }
}} className='w-[115px] h-[115px] border rounded overflow-hidden'>
                            <img src="/img1.jpeg" alt="icon" className="w-full h-full object-cover" />
                        </button>                                                                                                            
                    </div>
                </div>
            }
            {activeTab === 'text' && 
            <div id='text' className='w-full border flex flex-col bg-gray-300 h-full'>
                <TextEditor activeId={activeId} textAreas={textAreas} setTextAreas={setTextAreas} onAddText={addTextArea} />
            </div>
            }
            {activeTab === 'shapes' && <div id='shapes' className='w-full bg-gray-300 h-full'></div>}
        </div>
    )
}