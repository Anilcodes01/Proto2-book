"use client";

interface ActionButtonsProps {
  onSaveDraft: () => void;
  onSaveContinue: () => void;
}

export function ActionButtons({ onSaveDraft, onSaveContinue }: ActionButtonsProps) {
  return (
    <div className="flex justify-end gap-4 mt-8">
      <button
        type="button"
        onClick={onSaveDraft}
        className="border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 cursor-pointer"
      >
        Save as Draft
      </button>
      <button
        type="button"
        onClick={onSaveContinue}
        className="border border-transparent bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 cursor-pointer"
      >
        Save and Continue
      </button>
    </div>
  );
}