import { Check, Tags } from "lucide-react";

export default function Marketing() {
    return (
      <div className="bg-white rounded-lg p-4 border border-gray-100">
        <div className="flex items-center gap-2 mb-3">
          <Tags className="text-purple-500" size={18} />
          <h3 className="font-bold text-gray-800">Marketing & Promotions</h3>
        </div>
        <div className="flex items-center gap-3 ml-1 text-gray-700">
          <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
          <p className="text-sm">Amazon Sponsored Ads (1 year + Rs 2,000 Free credits)</p>
        </div>
      </div>
    );
  }