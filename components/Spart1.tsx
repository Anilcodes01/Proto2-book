import Image from "next/image"


export default function Spart1() {
    const detail = [
        {
            title: 'ISBN',
            description: 'We provide an International ISBN to enable global access to your book.',
            image: '/barcode-product.png'
        },
        {
            title: 'Own your Copyrights',
            description: 'Retain 100% of your content rights when publishing with Notion Press.',
            image: '/copyright.png'
        },
        {
            title: 'Printing & Shipping',
            description: 'We handle your printing, stocking, and distribution to all applicable channels, ensuring availability worldwide.',
            image: '/fast-delivery.png'
        },
        {
            title: 'Sales report',
            description: 'Gain insight into every copy sold by accessing your Author Dashboards Sales Report section.',
            image: '/market-share.png'
        },
        {
            title: 'Royalty',
            description: 'Earn 80% of net profits from your book sales and withdraw to your bank account directly.',
            image: '/money.png'
        },
        {
            title: 'Marketing tools',
            description: 'Boost book visibility with our marketing tools: Coupon Code Manager and Amazon Ads Manager.',
            image: '/social-media.png'
        },
        
    ]


    return <div className="w-full px-5 border rounded-2xl p-8 ml-4 " >
           <div className="grid grid-cols-3 gap-8">
           {detail.map((item, index) => (
                <div  className="flex gap-4" key={index}>
                    <Image src={item.image} alt={item.title} width={200} height={200} className="w-12 h-12"/>
                    <div>
                        <h1 className="text-md font-bold">{item.title}</h1>
                        <p className="text-sm">
                            {item.description}
                        </p>
                    </div>
                </div>
            ))}
           </div>
    </div>
}