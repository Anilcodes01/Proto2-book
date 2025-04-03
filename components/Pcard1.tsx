import AuthorBenefits from "./authorBenefits";
import Bformats from "./Bformats";
import Inventory from "./Inventory";
import Marketing from "./Marketing";
import Copyrights from "./copyrights";
import { useState, useEffect } from "react";
import { Check, BookOpen, Shield, Megaphone, Globe, Award, ChevronRight } from "lucide-react";

export default function Pcard1() {
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const handleCardSelect = (index: number) => {
    setSelectedCard(selectedCard === index ? null : index);
  };

  const pricingOptions = [
    {
      title: "Global Distribution",
      price: "Rs 3,990",
      tax: "+ gst",
      icon: <Globe className="text-blue-500" size={28} />,
      description: "Launch your Paperback & Hardcase in India and globally across 150+ countries through 30,000+ online stores, including * Kindle.",
      features: ["Global Distribution", "Multiple Book Formats", "Author Benefits", "Inventory Management"],
      components: [<Bformats key="b1" />, <AuthorBenefits key="ab1" />, <Inventory key="i1" />]
    },
    {
      title: "Global Distribution + Copyrights",
      price: "Rs 6,920",
      tax: "+ gst",
      popular: true,
      icon: <Shield className="text-green-500" size={28} />,
      description: "Secure your rights with Copyright Registration while we manage printing and shipping, enabling your Paperback & Hardcase in India and globally across 150 countries through 30,000+ online stores, including * Kindle.",
      features: ["Copyright Protection", "Global Distribution", "Multiple Book Formats", "Author Benefits", "Inventory Management"],
      components: [<Copyrights key="c1" />, <Bformats key="b2" />, <AuthorBenefits key="ab2" />, <Inventory key="i2" />]
    },
    {
      title: "Global Distribution + Copyrights + Amazon Ads",
      price: "Rs 10,870",
      tax: "+ gst",
      icon: <Megaphone className="text-purple-500" size={28} />,
      description: "Boost sales with Amazon Sponsored Ads. Safeguard your rights with Copyright Registration. We handle printing and shipping, enabling your Paperback & Hardcase in India and globally across 150 countries through 30,000+ online stores, including * Kindle.",
      features: ["Amazon Sponsored Ads", "Marketing Support", "Copyright Protection", "Global Distribution", "Multiple Book Formats", "Author Benefits", "Inventory Management"],
      components: [<Marketing key="m1" />, <Copyrights key="c2" />, <Bformats key="b3" />, <AuthorBenefits key="ab3" />, <Inventory key="i3" />]
    }
  ];

  return (
    <div className="flex justify-center w-full py-8 px-4">
      <div className="grid lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-6 max-w-6xl w-full">
        {pricingOptions.map((card, index) => (
          <div
            key={index}
            className={`flex flex-col rounded-2xl shadow-lg transition-all duration-300 overflow-hidden
              ${hoveredCard === index ? 'transform scale-[1.02]' : ''}
              ${selectedCard === index ? 'ring-4 ring-green-400 bg-green-50' : 'bg-white'}`}
            onMouseEnter={() => setHoveredCard(index)}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => handleCardSelect(index)}
          >
            {/* Card Header */}
            <div className="relative bg-gradient-to-r from-blue-50 to-blue-100 p-6">
              {card.popular && (
                <div className="absolute top-0 right-0 bg-green-500 text-white px-4 py-1 rounded-bl-lg text-sm font-medium">
                  Popular
                </div>
              )}
              <div className="flex items-center gap-3 mb-4">
                {card.icon}
                <h3 className="text-xl font-bold text-gray-800">{card.title}</h3>
              </div>
              
              <div className="flex items-baseline mb-2">
                <span className="text-3xl font-extrabold text-gray-900">{card.price}</span>
                <span className="ml-1 text-lg text-gray-500">{card.tax}</span>
              </div>
              
              <div className="flex items-center text-sm gap-4 text-gray-600">
                <div className="flex items-center gap-1">
                  <Award size={15} />
                  <span>One-time fee</span>
                </div>
                <div className="flex items-center gap-1">
                  <Check size={15} className="text-green-500" />
                  <span>No Renewal Charges</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="p-6 border-t border-gray-100">
              <p className="text-sm text-gray-600">{card.description}</p>
            </div>

            {/* Features List */}
            <div className="px-6 py-4 flex-grow">
              <h4 className="font-medium text-gray-800 mb-3">Includes:</h4>
              <ul className="space-y-2">
                {card.features.map((feature, i) => (
                  <li key={i} className="flex items-center text-sm text-gray-600">
                    <Check size={16} className="mr-2 text-green-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Selection Button */}
            <div className="p-6 border-t border-gray-100 mt-auto">
              <button
                className={`w-full flex items-center justify-center py-3 px-4 rounded-lg font-medium transition-all duration-300
                  ${selectedCard === index
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleCardSelect(index);
                }}
              >
                {selectedCard === index ? (
                  <>
                    <Check size={18} className="mr-2" /> Selected
                  </>
                ) : (
                  <>
                    Select Package <ChevronRight size={16} className="ml-2" />
                  </>
                )}
              </button>
            </div>

            <div className={`overflow-hidden transition-all duration-500 ${selectedCard === index ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="p-6 border-t border-gray-100">
                <div className="space-y-6">
                  {card.components}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}