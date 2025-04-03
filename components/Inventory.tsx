import { Package, Check } from "lucide-react";

export default function Inventory() {
    return (
      <div className="bg-white rounded-lg p-4 border border-gray-100">
        <div className="flex items-center gap-2 mb-3">
          <Package className="text-blue-500" size={18} />
          <h3 className="font-bold text-gray-800">Inventory Management</h3>
        </div>
        <div className="flex items-center gap-3 ml-1 text-gray-700">
          <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
          <p className="text-sm">Unlimited Inventory Management</p>
        </div>
      </div>
    );
  }