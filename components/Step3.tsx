"use client";
import axios from "axios";
import IndiaDistribution from "./IndiaDistribution";
import InternationalDistribution from "./InternationalDistribution";
import PricingCards from "./PricingCards";
import InfoBanner from "./infoBanner";
import { useState } from "react";
import { toast } from "sonner";
import { X } from 'lucide-react';
import { useRouter } from "next/navigation";

export default function Step3() {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [packagePrice, setPackagePrice] = useState<number | null>(null);
  const [packageId, setPackageId] = useState<string | null>(null);
  const [paperBackPriceInd, setPaperBackPriceInd] = useState<number | null>(null);
  const [hardCoverPriceInd, setHardCoverPriceInd] = useState<number | null>(null);
  const [paperBackPriceInt, setPaperBackPriceInt] = useState<number | null>(null);
  const [hardCoverPriceInt, setHardCoverPriceInt] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const calculateTotal = () => {
    let total = 0;
    if (packagePrice) total += packagePrice;
    return total;
  };

  const handleOpenSummary = () => {
    if (!selectedCard || !packageId || packagePrice === null) {
      toast("Please select a distribution package and set the price.");
      return;
    }
    setIsModalOpen(true);
  };

  const handleConfirmAndSave = async () => {
    setIsLoading(true);
    const bookProjectId = localStorage.getItem("bookProjectId");

    if (!bookProjectId) {
      toast("Book project ID is missing.");
      setIsLoading(false);
      setIsModalOpen(false);
      return;
    }

    if (!packageId || packagePrice === null) {
      toast("Please select a distribution package and set the price.");
      setIsLoading(false);
      setIsModalOpen(false);
      return;
    }

    const dataToSave = {
      bookProjectId: bookProjectId,
      packageId: packageId,
      packagePrice: packagePrice,
      paperbackPriceInd: paperBackPriceInd,
      hardcoverPriceInd: hardCoverPriceInd,
      paperbackPriceInternational: paperBackPriceInt,
      hardcoverPriceInternational: hardCoverPriceInt,
    };
    console.log("--- Submitting Data ---");
    console.log(JSON.stringify(dataToSave, null, 2));
    console.log("-----------------------");

    try {
      const res = await axios.post("/api/bookPricing", dataToSave);
      // Consider status 200 or 201 as success
      if (res.status === 200 || res.status === 201) {
        console.log("Book pricing information saved successfully", res.data);
        localStorage.removeItem("bookProjectId");
        toast("Book saved successfully, redirecting you to dashboard page...!");
        router.push("/dashboard");
      } else {
        // Handle unexpected success statuses if necessary
        console.warn("Received non-standard success status:", res.status, res.data);
        toast(`Operation completed with status: ${res.status}`);
      }
    } catch (error: any) {
      console.error("Error occurred while saving data:", error);
      let errorMessage = "An unexpected error occurred while saving.";
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = `Error saving data: ${error.response.data?.message || error.response.statusText || error.message}`;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.error(errorMessage); // Use toast.error for better visibility
    } finally {
      setIsLoading(false);
      setIsModalOpen(false);
    }
  };

  return (
    // --- Responsive Changes ---
    // 1. Remove fixed pl-64 for mobile. Add responsive padding.
    // 2. Add lg:pl-64 (or similar) if you have a large-screen sidebar. Adjust '72' if needed.
    // 3. Use p-4 for base padding, increasing on larger screens (sm:p-6 md:p-8)
    <div className="flex flex-col p-4 sm:p-6 md:p-8 lg:pl-72 min-h-screen bg-white text-black w-full relative"> {/* Adjusted padding */}
      {/* Wrap main content for max-width and centering on larger screens */}
      <div className="w-full max-w-7xl mx-auto">

        {/* Section 1: Title */}
        <div className="mb-8 md:mb-12"> {/* Added responsive margin-bottom */}
          {/* Responsive text size: larger on medium screens and up */}
          <h1 className="text-center text-xl sm:text-2xl font-bold">
            Book Distribution and Price
          </h1>
          {/* Responsive text size */}
          <p className="text-xs sm:text-sm text-center text-gray-600 mt-1">
            Set your book's price, calculate author earnings, decide where to sell
            your book and publish.
          </p>
        </div>

        {/* Section 2: Info Banner */}
        <div className="my-8 md:my-10"> {/* Adjusted margins */}
          <InfoBanner />
        </div>

        {/* Section 3: Pricing Cards */}
        <div className="my-8 md:my-12">
           <h1 className="text-center text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
            Choose Your Distribution Package
           </h1>
           {/* Assuming PricingCards handles its internal responsiveness */}
           <PricingCards
              selectedCard={selectedCard}
              setSelectedCard={setSelectedCard}
              hoveredCard={hoveredCard}
              setHoveredCard={setHoveredCard}
              packagePrice={packagePrice}
              setPackagePrice={setPackagePrice}
              packageId={packageId}
              setPackageId={setPackageId}
           />
        </div>

        {/* Section 4: Distribution & Pricing Inputs */}
        {/* Only show this section if a package is selected for better flow */}
        {selectedCard && (
          <div className="my-8 md:my-12 space-y-8 md:space-y-10"> {/* Add vertical spacing */}
              <div className="text-center">
                <h1 className="text-xl sm:text-2xl font-bold">
                  Select Distribution & Set Pricing
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">Choose where you want to sell your book and set the price (MRP)</p>
              </div>

              {/* Wrap distribution sections in a container if needed for layout */}
              <div className="space-y-6 md:space-y-8">
                 {/* Assuming IndiaDistribution handles its internal responsiveness */}
                 <IndiaDistribution
                    paperBackPriceInd={paperBackPriceInd}
                    hardCoverPriceInd={hardCoverPriceInd}
                    setPaperBackPriceInd={setPaperBackPriceInd}
                    setHardCoverPriceInd={setHardCoverPriceInd}
                 />
                 {/* Assuming InternationalDistribution handles its internal responsiveness */}
                 <InternationalDistribution
                    paperBackPriceInt={paperBackPriceInt}
                    hardCoverPriceInt={hardCoverPriceInt}
                    setPaperBackPriceInt={setPaperBackPriceInt}
                    setHardCoverPriceInt={setHardCoverPriceInt}
                 />
              </div>
          </div>
        )}

      </div> {/* End of max-w-7xl container */}

      {/* Sticky Footer */}
      {/* Ensures it spans the full width regardless of the content's max-width */}
      <div className="mt-auto sticky bottom-0 bg-white border-t border-gray-200 py-3 sm:py-4 z-10 w-full left-0"> {/* Adjust padding, ensure full width */}
        {/* Center the button content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <button
            className={`w-full text-white py-2.5 sm:py-3 px-4 rounded-lg font-medium transition-colors ${
              !selectedCard || !packageId || packagePrice === null // Keep disabling logic
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
            onClick={handleOpenSummary}
            disabled={!selectedCard || !packageId || packagePrice === null} // Explicitly disable
          >
            Review Summary and Continue
          </button>
           <p className="text-xs text-gray-500 mt-2 text-center">
            Click above to review your selections before finalizing.
          </p>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        // Use fixed positioning and cover the screen, centering the content
        <div className="fixed inset-0 bg-white/10 backdrop-blur-md flex items-center justify-center z-50 p-4">

          {/* Modal Panel: responsive max-width, margin auto for centering, overflow-y-auto for scroll on small screens */}
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-auto overflow-y-auto max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200 sticky top-0 bg-white">
              <h2 className="text-lg sm:text-xl font-semibold">Confirm Order Summary</h2> {/* Adjusted size */}
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
                disabled={isLoading}
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 space-y-3 sm:space-y-4"> {/* Adjusted padding/spacing */}
                {packageId && packagePrice !== null && (
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="text-gray-700">Dist. Package ({packageId})</span>
                    <span className="font-medium">₹{packagePrice}</span>
                  </div>
                )}
                {/* Other price items - adjust text size */}
                 {paperBackPriceInd !== null && (
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="text-gray-700">India Paperback MRP</span>
                    <span className="font-medium">₹{paperBackPriceInd}</span>
                  </div>
                )}
                 {hardCoverPriceInd !== null && (
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="text-gray-700">India Hard Cover MRP</span>
                    <span className="font-medium">₹{hardCoverPriceInd}</span>
                  </div>
                )}
                 {paperBackPriceInt !== null && (
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="text-gray-700">Intl. Paperback MRP</span>
                    <span className="font-medium">₹{paperBackPriceInt}</span>
                  </div>
                )}
                 {hardCoverPriceInt !== null && (
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="text-gray-700">Intl. Hard Cover MRP</span>
                    <span className="font-medium">₹{hardCoverPriceInt}</span>
                  </div>
                 )}

                {/* Separator and Total */}
                <div className="border-t border-gray-200 pt-3 sm:pt-4 mt-3 sm:mt-4">
                  <div className="flex justify-between font-bold text-base sm:text-lg">
                    <span>Package Total</span>
                    <span>₹{calculateTotal()}</span>
                  </div>
                   <p className="text-xs text-gray-500 mt-1">
                      This is the one-time package fee. Individual book prices (MRP) determine royalties.
                   </p>
                </div>

                <p className="text-xs text-gray-500 mt-4 text-center">
                    By confirming, you agree to our Terms of Service and Privacy Policy.
                </p>
            </div>

            {/* Modal Footer */}
            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 p-4 bg-gray-50 border-t border-gray-200 sticky bottom-0 bg-white">
               <button
                onClick={() => setIsModalOpen(false)}
                className="w-full sm:w-auto px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50 text-sm sm:text-base"
                disabled={isLoading}
               >
                Cancel
               </button>
               <button
                onClick={handleConfirmAndSave}
                className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                disabled={isLoading}
               >
                 {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 sm:mr-3 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    'Confirm and Save'
                  )}
               </button>
            </div>
          </div>
        </div>
      )}
    </div> 
  );
}