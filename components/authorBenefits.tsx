import { Check, Award } from "lucide-react";

export default function AuthorBenefits() {
    return (
      <div className="bg-white rounded-lg p-4 border border-gray-100">
        <div className="flex items-center gap-2 mb-3">
          <Award className="text-amber-500" size={18} />
          <h3 className="font-bold text-gray-800">Author Benefits</h3>
        </div>
        
        <div className="flex flex-col gap-3 ml-1">
          <div className="flex items-center gap-3 text-gray-700">
            <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
            <p className="text-sm">Author Profit Share - 80%</p>
          </div>
          
          <div className="flex items-center gap-3 text-gray-700">
            <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
            <p className="text-sm">2 Free Author Copies</p>
          </div>
          
          <div className="flex items-center gap-3 text-gray-700">
            <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
            <p className="text-sm">Up to 20% discount on First Author Copy Order</p>
          </div>
        </div>
      </div>
    );
  }