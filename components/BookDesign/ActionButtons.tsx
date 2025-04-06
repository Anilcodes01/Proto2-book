"use client";

import { Loader } from "lucide-react";

interface ActionButtonsProps {
  onSaveDraft: () => void;
  onSaveContinue: () => void;
  loading?: boolean;
}

export function ActionButtons({ 
  onSaveDraft, 
  onSaveContinue, 
  loading = false 
}: ActionButtonsProps) {
  return (
    <div className="flex justify-end gap-4 mt-8">
      <button
        type="button"
        onClick={onSaveDraft}
        className="border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 cursor-pointer"
        disabled={loading}
      >
        Save as Draft
      </button>
      <button
        type="button"
        onClick={onSaveContinue}
        className="border border-transparent bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 cursor-pointer flex items-center justify-center gap-2 min-w-[140px]"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader className="animate-spin w-6 h-6" />
            <span>Saving...</span>
          </>
        ) : (
          "Save and Continue"
        )}
      </button>
    </div>
  );
}