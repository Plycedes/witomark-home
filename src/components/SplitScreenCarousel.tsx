import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SplitScreenCarousel = () => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const images = ["/apparel.jpg", "/diamond.jpg", "/medicine.jpg", "/ticket.jpg", "/wine.jpg"];

    // Preload images
    useEffect(() => {
        images.forEach((src) => {
            const img = new Image();
            img.src = src;
        });
    }, []);

    // Auto-advance carousel every 4s
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % images.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [images.length]);

    const goToImage = (index: number) => setCurrentImageIndex(index);

    return (
        <div className="flex flex-col md:flex-row px-6 md:px-20 py-5 gap-8">
            {/* Text Section */}
            <div className="w-full md:w-1/2 flex items-center p-4 md:p-8 md:pl-16">
                <div className="text-left text-black">
                    <motion.h1
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="text-2xl md:text-4xl font-bold mb-4 md:mb-6"
                    >
                        Secure non-copiable QR codes <br className="hidden md:block" />
                        to prevent counterfeiting
                    </motion.h1>

                    <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
                        className="text-base md:text-lg text-gray-700 leading-relaxed"
                    >
                        Simply scan the QR and verify <br className="hidden md:block" />
                        authenticity in seconds
                    </motion.p>
                </div>
            </div>

            {/* Carousel Section */}
            <div className="w-full md:w-1/2 overflow-hidden flex items-center justify-center p-4 md:p-8">
                <div className="flex flex-col">
                    <div className="w-full perspective-1000">
                        <AnimatePresence mode="wait">
                            <motion.img
                                key={currentImageIndex}
                                src={images[currentImageIndex]}
                                alt={`Slide ${currentImageIndex + 1}`}
                                initial={{ rotateY: 90, opacity: 0 }}
                                animate={{ rotateY: 0, opacity: 1 }}
                                exit={{ rotateY: -90, opacity: 0 }}
                                transition={{ duration: 0.6, ease: "easeInOut" }}
                                className="w-full h-full object-cover"
                                style={{ transformStyle: "preserve-3d" }}
                            />
                        </AnimatePresence>
                    </div>

                    {/* Dot Indicators */}
                    <div className="z-10 flex gap-2 justify-center pt-4">
                        {images.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goToImage(index)}
                                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                    index === currentImageIndex
                                        ? "bg-gray-700 scale-125"
                                        : "bg-gray-200 border hover:bg-white/75"
                                }`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SplitScreenCarousel;
