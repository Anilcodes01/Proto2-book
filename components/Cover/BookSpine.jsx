import React from 'react';
export default function BookSpine({color}) {
    return (
        <div
    id="spine"
    className="w-[8%] bg-white  h-full border-[2px] border-t-[0px] border-b-[0px] relative"
  >
    <div className={`w-full h-[7%] border-0 border-b-[3px] ${color} absolute top-0`}></div>
    <div className={`w-full h-[7%] border-0 border-t-[3px] ${color} absolute bottom-0`}></div>
  </div>
    )
}