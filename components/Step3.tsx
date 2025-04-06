"use client";
import axios from "axios";
import IndiaDistribution from "./IndiaDistribution";
import InternationalDistribution from "./InternationalDistribution";
import PricingCards from "./PricingCards";
import InfoBanner from "./infoBanner";
import { useState } from "react";
import { toast } from "sonner"
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
      toast("Please select a distribution package and set the price.")
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
      if (res.status === 200 || res.status === 201) { 
        console.log("Book pricing information saved successfully", res.data);
        localStorage.removeItem("bookProjectId");
        toast("Book saved successfully, redirecting you to dashboard page...!")
        router.push("/dashboard")
        
      } else {
         console.warn("Received non-standard success status:", res.status, res.data);
         alert(`Operation completed with status: ${res.status}`);
      }
    } catch (error: any) { // Type assertion for error object
      console.error("Error occurred while saving data:", error);
      let errorMessage = "An unexpected error occurred while saving.";
      if (axios.isAxiosError(error) && error.response) {
       
        errorMessage = `Error saving data: ${error.response.data?.message || error.response.statusText || error.message}`;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      alert(errorMessage);
    } finally {
      setIsLoading(false); 
      setIsModalOpen(false); 
    }
  };

  return (
    <div className="flex flex-col pl-64 p-8 min-h-screen bg-white text-black w-full relative"> {/* Added relative for modal positioning context */}
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
        <InfoBanner />
      </div>

      <div className="">
        <h1 className="text-center mt-8 text-2xl font-bold mb-4">
          Choose Your Distribution
        </h1>
      </div>

      <div>
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

      <div>
        <div className="flex flex-col mt-4 items-center justify-center">
          <h1 className="text-2xl font-bold">
            Select distribution & Set Pricing
          </h1>
          <p>Choose where you want to sell your book and set price</p>
        </div>

        <div className="w-full">
          <IndiaDistribution
            paperBackPriceInd={paperBackPriceInd}
            hardCoverPriceInd={hardCoverPriceInd}
            setPaperBackPriceInd={setPaperBackPriceInd}
            setHardCoverPriceInd={setHardCoverPriceInd}
          />
        </div>

        <div className="w-full">
          <InternationalDistribution
            paperBackPriceInt={paperBackPriceInt}
            hardCoverPriceInt={hardCoverPriceInt}
            setPaperBackPriceInt={setPaperBackPriceInt}
            setHardCoverPriceInt={setHardCoverPriceInt}
          />
        </div>
      </div>

      {/* Sticky Footer - Now only contains the button to open the summary modal */}
      <div className="mt-8 sticky bottom-0 bg-white border-t border-gray-200 py-4 z-10">
        <div className="max-w-4xl mx-auto px-6"> {/* Added padding */}
          <button
            className={`w-full text-white py-3 px-4 rounded-lg font-medium transition-colors ${
              !selectedCard
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
            onClick={handleOpenSummary} // Changed onClick to open modal
            disabled={!selectedCard}
          >
            Review Summary and Continue
          </button>
           <p className="text-xs text-gray-500 mt-2 text-center">
            Click above to review your selections before finalizing.
          </p>
        </div>
      </div>

      {/* --- Modal --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-transparent bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full overflow-hidden">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h2 className="text-xl font-bold">Confirm Order Summary</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
                disabled={isLoading} // Disable close button while loading
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body - Contains the summary */}
            <div className="p-6 space-y-4">
                {packageId && packagePrice !== null && (
                  <div className="flex justify-between">
                    <span className="text-gray-700">Distribution Package ({packageId})</span>
                    <span className="font-medium">₹{packagePrice}</span>
                  </div>
                )}

                {paperBackPriceInd !== null && (
                  <div className="flex justify-between">
                    <span className="text-gray-700">India Paperback MRP</span>
                    <span className="font-medium">₹{paperBackPriceInd}</span>
                  </div>
                )}

                {hardCoverPriceInd !== null && (
                  <div className="flex justify-between">
                    <span className="text-gray-700">India Hard Cover MRP</span>
                    <span className="font-medium">₹{hardCoverPriceInd}</span>
                  </div>
                )}

                {paperBackPriceInt !== null && (
                  <div className="flex justify-between">
                    <span className="text-gray-700">International Paperback MRP</span>
                    <span className="font-medium">₹{paperBackPriceInt}</span>
                  </div>
                )}

                {hardCoverPriceInt !== null && (
                  <div className="flex justify-between">
                    <span className="text-gray-700">International Hard Cover MRP</span>
                    <span className="font-medium">₹{hardCoverPriceInt}</span>
                  </div>
                )}

                {/* Separator and Total */}
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Package Total</span>
                    <span>₹{calculateTotal()}</span>
                  </div>
                   <p className="text-xs text-gray-500 mt-1">
                      This is the one-time package fee. Individual book prices (MRP) are set separately and determine your royalties.
                   </p>
                </div>

                <p className="text-xs text-gray-500 mt-2 text-center">
                    By confirming, you agree to our Terms of Service and Privacy Policy.
                </p>
            </div>

            {/* Modal Footer - Actions */}
            <div className="flex justify-end gap-3 p-4 bg-gray-50 border-t border-gray-200">
               <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50"
                disabled={isLoading} // Disable cancel button while loading
               >
                Cancel
               </button>
               <button
                onClick={handleConfirmAndSave} // Call the save function
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading} // Disable confirm button while loading
               >
                 {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
      {/* --- End Modal --- */}
    </div>
  );
}