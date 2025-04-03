"use client";
import IndiaDistribution from "./IndiaDistribution";
import InternationalDistribution from "./InternationalDistribution";
import Pcard1 from "./Pcard1";
import Spart1 from "./Spart1";

export default function Step3() {
  return (
    <div className="flex flex-col  pl-64 p-8 min-h-screen bg-white text-black w-full ">
      <div>
        <h1 className="text-center text-2xl font-bold">
          Book Distribution and Price
        </h1>
        <p className="text-sm text-center">
          Set your book's price, calculate author earnings, decide where to sell
          your book and publish.
        </p>
      </div>
      <div className="mt-16">
        <Spart1 />
      </div>
      <div className="">
        <h1 className="text-center mt-8 text-2xl font-bold mb-4">
          Choose Your Distribution
        </h1>
      </div>
      <div>
        <Pcard1 />
      </div>

      <div>
       <div className="flex flex-col mt-4 items-center justify-center">
       <h1 className="text-2xl font-bold">Select distribution & Set Pricing</h1>
       <p>Choose where you want to sell your book and set price</p>
       </div>
          <div className="w-full">
            <IndiaDistribution />
          </div>
          <div className="w-full">
            <InternationalDistribution />
          </div>
      </div>

      <div>
        <div className="flex justify-center items-center mt-4">
          <button className="bg-blue-500 cursor-pointer hover:bg-blue-600 text-white px-4 py-2 rounded-lg">
            Pay and Continue
          </button>
        </div>
      </div>
    </div>
  );
}
