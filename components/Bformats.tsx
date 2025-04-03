import { BookOpen, Check } from "lucide-react";
import Image from "next/image";

export default function Bformats() {
  const marketplaces = [
    { image: "/notionpress.png" },
    { image: "/amazon.png" },
    { image: "/flipkart.png" },
  ];

  const countries = [
    { name: "India", flag: "/india.png" },
    { name: "USA", flag: "/usa.png" },
    { name: "Australia", flag: "/australia.png" },
    { name: "Germany", flag: "/germany.png" },
    { name: "Japan", flag: "/japan.png" },
    { name: "France", flag: "/france.png" },
    { name: "Britain", flag: "/united-kingdom.png" },
    { name: "Canada", flag: "/canada.png" },
  ];

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-100">
      <div className="flex items-center gap-2 mb-3">
        <BookOpen className="text-indigo-500" size={18} />
        <h3 className="font-bold text-gray-800">Book Formats and Distribution</h3>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3 ml-1 text-gray-700">
          <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
          <p className="text-sm">Paperback, Hardcase & eBook format</p>
        </div>
        
        <div className="flex items-center gap-3 ml-1 text-gray-700">
          <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
          <p className="text-sm">2 ISBN Numbers Included</p>
        </div>
        
        <div className="ml-1">
          <div className="flex items-center gap-3 text-gray-700">
            <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
            <p className="text-sm">Distribution across India</p>
          </div>
          <div className="flex mt-3 gap-3 justify-start ml-6">
            {marketplaces.map((place) => (
              <div key={place.image} className="p-2 bg-gray-50 rounded-md flex items-center justify-center">
                <Image
                  src={place.image}
                  width={80}
                  height={40}
                  alt="marketplace"
                  className="w-16 h-auto object-contain"
                />
              </div>
            ))}
          </div>
        </div>
        
        <div className="ml-1">
          <div className="flex items-center gap-3 text-gray-700">
            <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
            <p className="text-sm">Availability in 150+ countries</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3 text-xs ml-6">
            {countries.map((country) => (
              <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-md" key={country.name}>
                <Image
                  src={country.flag}
                  width={20}
                  height={20}
                  className="w-4 h-4 object-cover rounded-sm"
                  alt={country.name}
                />
                <p className="text-gray-700">{country.name}</p>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-3 ml-1 text-gray-700">
          <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
          <p className="text-sm">Fast and Free shipping with Amazon - 180 days</p>
        </div>
      </div>
    </div>
  );
}