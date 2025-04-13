"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Navigation, Pagination, Mousewheel, Keyboard } from 'swiper/modules';
import Image from 'next/image';

const sampleLayouts = [
    { id: 'layout1', name: 'Classic Novel', preview: '/Blanco.png' },
    { id: 'layout2', name: 'Modern Magazine', preview: '/Jazmin.png' },
    { 'id': 'layout3', name: 'Academic Paper', preview: '/one.png' },
    { 'id': 'layout4', name: 'Photo Book', preview: '/two.png' },
    { 'id': 'layout5', name: 'Minimalist Blog', preview: '/three.png' },
];

export default function LayoutOptions() {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const handleLayoutSelect = (layoutId: string) => {
        console.log("Selected layout:", layoutId);
        setIsOpen(false);
    };

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                isOpen &&
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div className="relative flex items-center h-16 justify-center w-full">
            <button
                ref={buttonRef}
                onClick={toggleDropdown}
                className="border rounded-lg bg-sky-100 px-4 py-1 cursor-pointer hover:bg-sky-200 w-fit transition-colors duration-150"
            >
                Change Layout
            </button>

            {isOpen && (
                <div
                    ref={dropdownRef}
                    className="absolute top-full mt-2 w-full max-w-2xl bg-white rounded-lg shadow-xl p-4 z-20 border border-gray-200"
                >
                    <h4 className="text-sm font-medium text-gray-600 mb-3 text-center">Choose a Layout Style</h4>
                    <Swiper
                        modules={[Navigation, Pagination, Mousewheel, Keyboard]}
                        spaceBetween={15}
                        slidesPerView={'auto'}
                        navigation
                        pagination={{ clickable: true,  }}
                        mousewheel={true}
                        keyboard={true}
                        className="layout-swiper"
                        style={{
                            '--swiper-navigation-color': '#0ea5e9',
                            '--swiper-pagination-color': '#0ea5e9',
                            '--swiper-navigation-size': '25px',
                        } as React.CSSProperties}
                    >
                        {sampleLayouts.map((layout) => (
                            <SwiperSlide key={layout.id} className="!w-40 !h-56">
                                <div
                                    onClick={() => handleLayoutSelect(layout.id)}
                                    className="flex flex-col items-center justify-center border border-gray-300 rounded-md h-full bg-gray-50 hover:bg-gray-100 hover:border-sky-400 cursor-pointer p-2 transition-colors duration-150"
                                >
                                    <Image
                                        src={layout.preview}
                                        width={400} height={400}
                                        alt={layout.name}
                                        className="w-full h-4/5 object-contain mb-1 border-gray-300"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.style.display = 'none';
                                            const parent = target.parentElement;
                                            if(parent && !parent.querySelector('.fallback-text')) {
                                                const fallback = document.createElement('div');
                                                fallback.textContent = 'Preview N/A';
                                                fallback.className = 'text-xs text-gray-400 fallback-text';
                                                parent.insertBefore(fallback, target.nextSibling);
                                            }
                                        }}
                                    />
                                    <span className="text-xs font-medium text-gray-700 text-center mt-auto">
                                        {layout.name}
                                    </span>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            )}
        </div>
    );
}