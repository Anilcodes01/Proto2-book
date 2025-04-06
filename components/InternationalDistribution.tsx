'use client';

interface InternationalDistributionProps {
  paperBackPriceInt: number | null;
  hardCoverPriceInt: number | null;
  setPaperBackPriceInt: (value: number | null) => void;
  setHardCoverPriceInt: (value: number | null) => void;
}

export default function InternationalDistribution({
  paperBackPriceInt,
  hardCoverPriceInt,
  setPaperBackPriceInt,
  setHardCoverPriceInt
}: InternationalDistributionProps) {
  const handlePaperBackPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPaperBackPriceInt(value ? parseInt(value) : null);
  };

  const handleHardCoverPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setHardCoverPriceInt(value ? parseInt(value) : null);
  };

  // Calculate author earnings (80% of retail price minus production cost)
  const calculateAuthorEarnings = (price: number | null, productionCost: number) => {
    if (!price || price < productionCost) return 0;
    return Math.round((price - productionCost) * 0.8);
  };

  const paperbackEarningsInt = calculateAuthorEarnings(paperBackPriceInt, 10); // Example production cost
  const hardcoverEarningsInt = calculateAuthorEarnings(hardCoverPriceInt, 20); // Example production cost

  return (
    <div className="p-5 flex flex-col items-center border rounded-2xl m-5 justify-center w-full">
      <div className="w-full">
        <h1 className="text-xl font-bold">International Distribution</h1>
        <p className="text-sm">
          Set selling price for your Paperback & Hardcase for international markets
        </p>
      </div>

      <div className="w-full mt-4 border rounded-lg">
        <div className="bg-sky-100 rounded-lg p-4 w-full">
          <h1 className="font-bold">Paperback*</h1>
          <div className="flex justify-between gap-20 mt-4">
            <div className="flex justify-between w-full">
              <h2>Production cost</h2>
              <h2>: $10</h2>
            </div>
          </div>
        </div>
        <div className="flex p-5 mt-4 gap-20">
          <div className="flex flex-col w-full">
            <div className="flex justify-between w-full">
              <p>Set Retail Price</p>
              <p className="text-sm">(Minimum Recommended Price is $15)</p>
            </div>
            <div>
              <div className="border rounded flex items-center px-4">
                <p>$</p>
                <input
                  type="number"
                  min="15"
                  className="rounded outline-none w-full px-4 py-1"
                  placeholder="Enter your amount"
                  value={paperBackPriceInt || ''}
                  onChange={handlePaperBackPriceChange}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col w-full">
            <p>Author Earnings(80%)</p>
            <div className="flex items-center justify-center mt-4">
              <div className="flex justify-between w-full">
                <p className="text-sm">International Stores</p>
                <p className="text-sm">$ {paperbackEarningsInt}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full mt-4 border rounded-lg">
        <div className="bg-sky-100 rounded-lg p-4 w-full">
          <h1 className="font-bold">
            Hardcase (optional)
          </h1>
          <div className="flex justify-between gap-20 mt-4">
            <div className="flex justify-between w-full">
              <h2>Production cost</h2>
              <h2>: $20</h2>
            </div>
          </div>
        </div>
        <div className="flex p-5 mt-4 gap-20">
          <div className="flex flex-col w-full">
            <div className="flex justify-between w-full">
              <p>Set Retail Price</p>
              <p className="text-sm">(Minimum Recommended Price is $25)</p>
            </div>
            <div>
              <div className="border rounded flex items-center px-4">
                <p>$</p>
                <input
                  type="number"
                  min="25"
                  className="rounded outline-none w-full px-4 py-1"
                  placeholder="Enter your amount"
                  value={hardCoverPriceInt || ''}
                  onChange={handleHardCoverPriceChange}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col w-full">
            <p>Author Earnings(80%)</p>
            <div className="flex items-center justify-center mt-4">
              <div className="flex justify-between w-full">
                <p className="text-sm">International Stores</p>
                <p className="text-sm">$ {hardcoverEarningsInt}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}