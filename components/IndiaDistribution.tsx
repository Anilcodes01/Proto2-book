'use client';

interface IndiaDistributionProps {
  paperBackPriceInd: number | null;
  hardCoverPriceInd: number | null;
  setPaperBackPriceInd: (value: number | null) => void;
  setHardCoverPriceInd: (value: number | null) => void;
}

export default function IndiaDistribution({
  paperBackPriceInd,
  hardCoverPriceInd,
  setPaperBackPriceInd,
  setHardCoverPriceInd
}: IndiaDistributionProps) {
  const handlePaperBackPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPaperBackPriceInd(value ? parseInt(value) : null);
  };

  const handleHardCoverPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setHardCoverPriceInd(value ? parseInt(value) : null);
  };

  // Calculate author earnings (80% of retail price minus production cost)
  const calculateAuthorEarnings = (price: number | null, productionCost: number) => {
    if (!price || price < productionCost) return 0;
    return Math.round((price - productionCost) * 0.8);
  };

  const paperbackEarningsNP = calculateAuthorEarnings(paperBackPriceInd, 61.98);
  const paperbackEarningsOther = calculateAuthorEarnings(paperBackPriceInd, 31.65);
  const hardcoverEarningsNP = calculateAuthorEarnings(hardCoverPriceInd, 148.43);
  const hardcoverEarningsOther = calculateAuthorEarnings(hardCoverPriceInd, 98.69);

  return (
    <div className="p-5 flex flex-col items-center border rounded-2xl m-5 justify-center w-full">
      <div className="w-full">
        <h1 className="text-xl font-bold">India Distribution</h1>
        <p className="text-sm">
          Set selling price for your Paperback & Hardcase to sell across India
          with Amazon, Flipkart & Notionpress
        </p>
      </div>

      <div className="w-full mt-4 border rounded-lg">
        <div className="bg-sky-100 rounded-lg p-4 w-full">
          <h1 className="font-bold">Paperback*</h1>
          <div className="flex justify-between gap-20 mt-4">
            <div className="flex justify-between w-full">
              <h2>Production cost(18 Pages)</h2>
              <h2>: Rs 31.65</h2>
            </div>
            <div className="flex justify-between w-full">
              <h1>for direct sales - at subsidized price</h1>
              <h2>: Rs.61.98</h2>
            </div>
          </div>
        </div>
        <div className="flex p-5 mt-4 gap-20">
          <div className="flex flex-col w-full">
            <div className="flex justify-between w-full">
              <p>Set Retail Price</p>
              <p className="text-sm">(Minimum Recommended Price is Rs 150)</p>
            </div>
            <div>
              <div className="border rounded flex items-center px-4">
                <p>Rs</p>
                <input
                  type="number"
                  min="150"
                  className="rounded outline-none w-full px-4 py-1"
                  placeholder="Enter your amount"
                  value={paperBackPriceInd || ''}
                  onChange={handlePaperBackPriceChange}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col w-full">
            <p>Author Earnings(80%)</p>
            <div className="flex gap-16 items-center justify-center mt-4">
              <div className="flex justify-between w-full">
                <p className="text-sm">Notion Press Store</p>
                <p className="text-sm">Rs {paperbackEarningsNP}</p>
              </div>
              <div className="flex justify-between w-full">
                <p className="text-sm">Other stores</p>
                <p className="text-sm">Rs {paperbackEarningsOther}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full mt-4 border rounded-lg">
        <div className="bg-sky-100 rounded-lg p-4 w-full">
          <h1 className="font-bold">
            Hardcase (optional) (only available if your book exceeds 55 pages)
          </h1>
          <div className="flex justify-between gap-20 mt-4">
            <div className="flex justify-between w-full">
              <h2>Production cost(18 Pages)</h2>
              <h2>: Rs 98.69</h2>
            </div>
            <div className="flex justify-between w-full">
              <h1>for direct sales - at subsidized price</h1>
              <h2>: Rs.148.43</h2>
            </div>
          </div>
        </div>
        <div className="flex p-5 mt-4 gap-20">
          <div className="flex flex-col w-full">
            <div className="flex justify-between w-full">
              <p>Set Retail Price</p>
              <p className="text-sm">(Minimum Recommended Price is Rs 250)</p>
            </div>
            <div>
              <div className="border rounded flex items-center px-4">
                <p>Rs</p>
                <input
                  type="number"
                  min="250"
                  className="rounded outline-none w-full px-4 py-1"
                  placeholder="Enter your amount"
                  value={hardCoverPriceInd || ''}
                  onChange={handleHardCoverPriceChange}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col w-full">
            <p>Author Earnings(80%)</p>
            <div className="flex gap-16 items-center justify-center mt-4">
              <div className="flex justify-between w-full">
                <p className="text-sm">Notion Press Store</p>
                <p className="text-sm">Rs {hardcoverEarningsNP}</p>
              </div>
              <div className="flex justify-between w-full">
                <p className="text-sm">Other stores</p>
                <p className="text-sm">Rs {hardcoverEarningsOther}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}