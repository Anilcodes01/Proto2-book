'use client'
import React, { useState, useContext, useEffect } from 'react';
import ThemeContext from "../../context/ThemeContext";
import TextEditor from './TextStyleEditor';
import { X } from 'lucide-react';

export default function SideBar() {
    const [activeTab, setActiveTab] = useState('background');
    const [isOpen, setIsOpen] = useState(false);
    const { addTextArea, page, setRightPageImage, setLeftPageImage, textAreas, setTextAreas, activeId } = useContext(ThemeContext);
    
    // Close sidebar on screen resize if moving from mobile to desktop
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 768) {
                setIsOpen(true);
            }
        };
        
        // Set initial state based on screen size
        handleResize();
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    
    return (
        <div className=''>
            {/* Toggle button for mobile */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="fixed top-4 right-4 z-50 md:hidden m bg-white rounded-full p-2 shadow-lg"
            >
                {isOpen ? <X size={24} /> : <span className="block w-6 h-6 text-center font-bold">+</span>}
            </button>
            
            {/* Sidebar */}
            <div 
                className={`fixed md:static top-0 right-0 mt-16 w-[85%] md:w-[22%] bg-white h-full flex text-black flex-col shadow-lg transition-transform duration-300 z-40 ${
                    isOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'
                }`}
            >
                {/* Tab buttons */}
                <div className='flex w-full h-fit flex-row justify-center'>
                    <button 
                        onClick={() => setActiveTab('background')} 
                        className={`p-2 h-10 w-full border ${activeTab === "background" ? "bg-gray-300" : "bg-white"} flex justify-center items-center text-sm md:text-base`}
                    >
                        Background
                    </button>
                    <button 
                        onClick={() => setActiveTab('text')} 
                        className={`p-2 h-10 w-full border ${activeTab === "text" ? "bg-gray-300" : "bg-white"} flex justify-center items-center text-sm md:text-base`}
                    >
                        Text
                    </button>
                    <button 
                        onClick={() => setActiveTab('shapes')} 
                        className={`p-2 h-10 w-full border ${activeTab === "shapes" ? "bg-gray-300" : "bg-white"} flex justify-center items-center text-sm md:text-base`}
                    >
                        Shapes
                    </button>
                </div>
                
                {/* Tab content container - common styles */}
                <div className="flex-1 overflow-y-auto">
                    {/* Background tab */}
                    {activeTab === 'background' && 
                        <div id='background' className='w-full bg-white h-full p-2'>
                            <div className='flex flex-wrap gap-2 justify-center md:justify-start'>
                                <button onClick={() => {
                                    if (page === "right") {
                                        setRightPageImage("img2.jpeg");
                                    } else {
                                        setLeftPageImage("img2.jpeg");
                                    }
                                }} className='w-[100px] h-[100px] md:w-[115px] md:h-[115px] border rounded overflow-hidden'>
                                    <img src="/img2.jpeg" alt="icon" className="w-full h-full object-cover" />
                                </button>
                                <button onClick={() => {
                                    if (page === "right") {
                                        setRightPageImage("img3.jpeg");
                                    } else {
                                        setLeftPageImage("img3.jpeg");
                                    }
                                }} className='w-[100px] h-[100px] md:w-[115px] md:h-[115px] border rounded overflow-hidden'>
                                    <img src="/img3.jpeg" alt="icon" className="w-full h-full object-cover" />
                                </button>
                                <button onClick={() => {
                                    if (page === "right") {
                                        setRightPageImage("img4.jpeg");
                                    } else {
                                        setLeftPageImage("img4.jpeg");
                                    }
                                }} className='w-[100px] h-[100px] md:w-[115px] md:h-[115px] border rounded overflow-hidden'>
                                    <img src="/img4.jpeg" alt="icon" className="w-full h-full object-cover" />
                                </button>
                                <button onClick={() => {
                                    if (page === "right") {
                                        setRightPageImage("img5.jpeg");
                                    } else {
                                        setLeftPageImage("img5.jpeg");
                                    }
                                }} className='w-[100px] h-[100px] md:w-[115px] md:h-[115px] border rounded overflow-hidden'>
                                    <img src="/img5.jpeg" alt="icon" className="w-full h-full object-cover" />
                                </button>
                                <button onClick={() => {
                                    if (page === "right") {
                                        setRightPageImage("img6.jpeg");
                                    } else {
                                        setLeftPageImage("img6.jpeg");
                                    }
                                }} className='w-[100px] h-[100px] md:w-[115px] md:h-[115px] border rounded overflow-hidden'>
                                    <img src="/img6.jpeg" alt="icon" className="w-full h-full object-cover" />
                                </button>
                                <button onClick={() => {
                                    if (page === "right") {
                                        setRightPageImage("img7.jpeg");
                                    } else {
                                        setLeftPageImage("img7.jpeg");
                                    }
                                }} className='w-[100px] h-[100px] md:w-[115px] md:h-[115px] border rounded overflow-hidden'>
                                    <img src="/img7.jpeg" alt="icon" className="w-full h-full object-cover" />
                                </button>
                                <button onClick={() => {
                                    if (page === "right") {
                                        setRightPageImage("img8.jpeg");
                                    } else {
                                        setLeftPageImage("img8.jpeg");
                                    }
                                }} className='w-[100px] h-[100px] md:w-[115px] md:h-[115px] border rounded overflow-hidden'>
                                    <img src="/img8.jpeg" alt="icon" className="w-full h-full object-cover" />
                                </button>
                                <button onClick={() => {
                                    if (page === "right") {
                                        setRightPageImage("img9.jpeg");
                                    } else {
                                        setLeftPageImage("img9.jpeg");
                                    }
                                }} className='w-[100px] h-[100px] md:w-[115px] md:h-[115px] border rounded overflow-hidden'>
                                    <img src="/img9.jpeg" alt="icon" className="w-full h-full object-cover" />
                                </button>
                                <button onClick={() => {
                                    if (page === "right") {
                                        setRightPageImage("img10.jpeg");
                                    } else {
                                        setLeftPageImage("img10.jpeg");
                                    }
                                }} className='w-[100px] h-[100px] md:w-[115px] md:h-[115px] border rounded overflow-hidden'>
                                    <img src="/img10.jpeg" alt="icon" className="w-full h-full object-cover" />
                                </button>
                                <button onClick={() => {
                                    if (page === "right") {
                                        setRightPageImage("img1.jpeg");
                                    } else {
                                        setLeftPageImage("img1.jpeg");
                                    }
                                }} className='w-[100px] h-[100px] md:w-[115px] md:h-[115px] border rounded overflow-hidden'>
                                    <img src="/img1.jpeg" alt="icon" className="w-full h-full object-cover" />
                                </button>
                            </div>
                        </div>
                    }
                    
                    {/* Text tab */}
                    {activeTab === 'text' && 
                        <div id='text' className='w-full border bg-gray-300 h-full'>
                            <TextEditor 
                                activeId={activeId} 
                                textAreas={textAreas} 
                                setTextAreas={setTextAreas} 
                                onAddText={addTextArea} 
                            />
                        </div>
                    }
                    
                    {/* Shapes tab */}
                    {activeTab === 'shapes' && 
                        <div id='shapes' className='w-full bg-gray-300 h-full'>
                            {/* Shapes content */}
                        </div>
                    }
                </div>
            </div>
            
            {/* Overlay for mobile when sidebar is open */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-[rgba(0,0,0,0.3)] bg-opacity-50 z-30 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
}