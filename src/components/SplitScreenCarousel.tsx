import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
// @ts-ignore
import { ChevronLeft, ChevronRight } from "lucide-react";

const SplitScreenCarousel = () => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Sample images - using placeholder images
    const images = ["/apparel.jpg", "/diamond.jpg", "/medicine.jpg", "/ticket.jpg", "/wine.jpg"];

    useEffect(() => {
        images.forEach((src) => {
            const img = new Image();
            img.src = src;
        });
    }, []);

    // Auto-advance carousel every 4 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % images.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [images.length]);
    // @ts-ignore
    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };
    // @ts-ignore
    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const goToImage = (index: number) => {
        setCurrentImageIndex(index);
    };

    return (
        <div className="flex px-20 py-5">
            {/* Left Half - Animated Text */}
            <div className="w-1/2 flex items-center p-8 pl-16">
                <div className="text-left text-black">
                    <motion.h1
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="text-4xl font-bold mb-6"
                    >
                        Secure non-copiable QR codes <br /> to prevent counterfeiting
                    </motion.h1>

                    <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
                        className="text-lg text-gray-700 leading-relaxed"
                    >
                        Simply scan the QR and verify <br /> authenticity in seconds
                    </motion.p>

                    {/* <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.4, delay: 0.6, ease: "easeOut" }}
                        className="mt-8"
                    >
                        <button className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105">
                            Explore Gallery
                        </button>
                    </motion.div> */}
                </div>
            </div>

            {/* Right Half - Image Carousel */}
            <div className="w-1/2 relative h-[550px] overflow-hidden flex items-center justify-center p-8">
                <div className="relative w-6/7 perspective-1000">
                    <AnimatePresence mode="wait">
                        <motion.img
                            key={currentImageIndex}
                            src={images[currentImageIndex]}
                            alt={`Nature scene ${currentImageIndex + 1}`}
                            initial={{ rotateY: 90, opacity: 0 }}
                            animate={{ rotateY: 0, opacity: 1 }}
                            exit={{ rotateY: -90, opacity: 0 }}
                            transition={{ duration: 0.6, ease: "easeInOut" }}
                            className="w-full h-full object-cover"
                            style={{ transformStyle: "preserve-3d" }}
                        />
                    </AnimatePresence>
                </div>

                {/* Navigation Arrows */}
                {/* <button
                    onClick={prevImage}
                    className="absolute left-8 top-1/2 transform -translate-y-1/2 bg-black/30 backdrop-blur-sm text-white p-3 rounded-full hover:bg-black/50 transition-all duration-300 group z-10"
                >
                    <ChevronLeft className="w-6 h-6 group-hover:scale-110 transition-transform" />
                </button>

                <button
                    onClick={nextImage}
                    className="absolute right-8 top-1/2 transform -translate-y-1/2 bg-black/30 backdrop-blur-sm text-white p-3 rounded-full hover:bg-black/50 transition-all duration-300 group z-10"
                >
                    <ChevronRight className="w-6 h-6 group-hover:scale-110 transition-transform" />
                </button> */}

                {/* Dot Indicators */}
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-3 z-10">
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

                {/* Image Counter */}
                {/* <div className="absolute top-8 right-8 bg-black/30 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium z-10">
                    {currentImageIndex + 1} / {images.length}
                </div> */}
            </div>
        </div>
    );
};

export default SplitScreenCarousel;
