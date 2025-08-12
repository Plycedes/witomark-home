import { Check } from "lucide-react";
import { motion, type Variants } from "framer-motion";

interface Props {
    handleOpen: () => void;
}

const HeroSection = ({ handleOpen }: Props) => {
    const fadeUp: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: (custom: number) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: custom,
                duration: 0.5,
                ease: "easeOut",
            },
        }),
    };

    return (
        <section className="relative overflow-hidden">
            <div className="w-full px-4 sm:px-6 lg:px-8 py-20">
                {/* Greeting */}
                <div className="text-center mb-16">
                    <motion.h1
                        className="text-4xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6"
                        variants={fadeUp}
                        initial="hidden"
                        animate="visible"
                        custom={0.1}
                    >
                        Secure non-copiable QR codes
                        <br />
                        to prevent counterfeiting
                    </motion.h1>

                    <motion.p
                        className="text-xl text-gray-600 mb-8"
                        variants={fadeUp}
                        initial="hidden"
                        animate="visible"
                        custom={0.2}
                    >
                        Simply scan the QR and verify authenticity in seconds
                    </motion.p>

                    <motion.button
                        className="bg-green-500 hover:bg-green-600 text-white font-semibold px-8 py-3 rounded-md transition-colors"
                        onClick={handleOpen}
                        variants={fadeUp}
                        initial="hidden"
                        animate="visible"
                        custom={0.3}
                    >
                        Request a Demo
                    </motion.button>
                </div>

                {/* Product Showcase */}
                <div className="flex justify-center items-center mb-20">
                    <div className="relative">
                        {/* Background decorative elements */}
                        <div className="absolute -left-64 top-0 w-64 h-64 bg-green-100 rounded-2xl transform rotate-12 opacity-50"></div>
                        <div className="absolute -right-64 top-0 w-64 h-64 bg-blue-100 rounded-2xl transform -rotate-12 opacity-50"></div>

                        {/* Left image - clothing tag */}
                        <div className="absolute -left-48 top-8 w-48 h-32 bg-gray-200 rounded-lg shadow-lg overflow-hidden">
                            <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                                <div className="text-gray-600 text-sm">Clothing Tag</div>
                            </div>
                        </div>

                        {/* Center phone mockup */}
                        <div className="relative z-10 w-64 h-128 bg-black rounded-3xl p-2 shadow-2xl">
                            <div className="w-full h-full bg-white rounded-2xl overflow-hidden">
                                <div className="bg-gray-50 h-full flex flex-col">
                                    <div className="flex items-center justify-center py-4 border-b">
                                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-2">
                                            <Check className="w-4 h-4 text-white" />
                                        </div>
                                        <span className="font-semibold">Witomark</span>
                                    </div>
                                    <div className="flex-1 p-4">
                                        <div className="bg-white rounded-lg p-4 shadow-sm mb-4">
                                            <div className="text-sm text-gray-600 mb-2">
                                                Product verification
                                            </div>
                                            <div className="bg-red-500 text-white px-3 py-1 rounded text-sm inline-block">
                                                Mesrtin™
                                            </div>
                                        </div>
                                        <button className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold">
                                            Genuine Product
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right image - event ticket */}
                        <div className="absolute -right-48 top-8 w-48 h-32 bg-blue-900 rounded-lg shadow-lg overflow-hidden">
                            <div className="w-full h-full bg-gradient-to-br from-blue-800 to-purple-900 flex items-center justify-center relative">
                                <div className="text-white text-sm text-center">
                                    <div className="font-bold mb-1">MERTON BAND</div>
                                    <div className="text-xs">Concert Ticket</div>
                                </div>
                                <div className="absolute bottom-2 right-2 w-8 h-8 bg-white rounded">
                                    <div className="w-full h-full bg-black opacity-20"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
