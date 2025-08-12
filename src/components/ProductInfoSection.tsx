import { motion, type Variants } from "framer-motion";

const ProductInfoSection = () => {
    // Container variant to stagger heading + p tags
    const containerVariants: Variants = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.1,
            },
        },
    };

    // Fade-up for heading & paragraphs
    const fadeUpVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: "easeOut" },
        },
    };

    // Slide-in for image
    const slideInLeftVariants: Variants = {
        hidden: { opacity: 0, x: -20 },
        visible: {
            opacity: 1,
            x: 0,
            transition: { duration: 0.5, ease: "easeOut" },
        },
    };

    return (
        <section className="w-full bg-green-500 text-white py-20">
            <div className="w-full px-4 sm:px-6 lg:px-8">
                <div className="flex w-full items-center justify-center gap-10">
                    {/* Animated Image */}
                    <motion.img
                        src="/qr.png"
                        alt="QR code example"
                        className="w-40 h-60 border border-black border-2"
                        variants={slideInLeftVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.3 }}
                    />

                    {/* Animated Info */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.3 }}
                    >
                        <motion.h2
                            variants={fadeUpVariants}
                            className="text-4xl md:text-5xl font-bold mb-6"
                        >
                            Unbreakable
                            <br />
                            Protection
                        </motion.h2>

                        <div className="space-y-1 text-lg">
                            <motion.p variants={fadeUpVariants} className="flex items-center">
                                Copy-proof
                            </motion.p>
                            <motion.p variants={fadeUpVariants} className="flex items-center">
                                Authentication accuracy
                            </motion.p>
                            <motion.p variants={fadeUpVariants} className="flex items-center">
                                Instant verification in 2 seconds
                            </motion.p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default ProductInfoSection;
