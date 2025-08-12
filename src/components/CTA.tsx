import { motion, type Variants } from "framer-motion";

interface Props {
    handleOpen: () => void;
}

const textVariant: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: {
            delay: i * 0.2, // stagger timing
            duration: 0.5,
            ease: "easeOut",
        },
    }),
};

const CTA = ({ handleOpen }: Props) => {
    return (
        <section className="bg-white py-30">
            <div className="w-full px-4 sm:px-6 lg:px-8 text-center">
                <motion.h2
                    className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
                    variants={textVariant}
                    custom={0}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                >
                    Protect your brand against
                    <br />
                    counterfeiting
                </motion.h2>

                <motion.p
                    className="text-xl text-gray-600 mb-8"
                    variants={textVariant}
                    custom={1}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                >
                    Add Witomark to your Product packaging now!
                </motion.p>

                <motion.button
                    className="bg-green-500 hover:bg-green-600 text-white font-semibold px-8 py-3 rounded-md transition-colors"
                    variants={textVariant}
                    custom={2}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    onClick={handleOpen}
                >
                    Request a Demo
                </motion.button>
            </div>
        </section>
    );
};

export default CTA;
