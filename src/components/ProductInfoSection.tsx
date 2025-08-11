const ProductInfoSection = () => {
    return (
        <section className="w-full bg-green-500 text-white py-20">
            <div className="w-full px-4 sm:px-6 lg:px-8">
                <div className="flex  w-full items-center justify-center gap-10">
                    <img src="/qr.png" className="w-40 h-60 border border-black border-2" />
                    <div className="">
                        <h2 className="text-4xl md:text-5xl font-bold mb-6">
                            Unbreakable
                            <br />
                            Protection
                        </h2>
                        <div className="space-y-1 text-lg">
                            <div className="flex items-center">Copy-proof</div>
                            <div className="flex items-center">Authentication accuracy</div>
                            <div className="flex items-center">
                                Instant verification in 2 seconds
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ProductInfoSection;
