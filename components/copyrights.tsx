import { ShieldCheck, Check } from "lucide-react";

export default function Copyrights() {
    return (
      <div className="bg-white rounded-lg p-4 border border-gray-100">
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="text-green-500" size={18} />
          <h3 className="font-bold text-gray-800">Copyrights Registration</h3>
        </div>
        <div className="flex items-center gap-3 ml-1 text-gray-700">
          <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
          <p className="text-sm">Register for your book's copyrights with the Govt. of India</p>
        </div>
      </div>
    );
  }