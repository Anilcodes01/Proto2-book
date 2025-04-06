import React from 'react';
export default function PageFrame() {
    return (
        <div className="absolute bg-transparent w-full h-full">
            <div className="relative w-full h-full flex justify-center items-center">
              <div className="absolute border-[0px] border-red-600 border-b-[3px] w-full h-[7%] top-0"></div>
              <div className="absolute border-[0px] border-red-600 w-[9%] h-full left-0 border-r-[3px]"></div>
              <div className="absolute border-[0px] border-red-600 w-full h-[7%] bottom-0 border-t-[3px]"></div>
              <div className="absolute border-[0px] border-red-600 w-[9%] h-full right-0  border-l-[3px]"></div>
            </div>
          </div>
    )
}