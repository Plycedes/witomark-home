import { motion, type Variants } from "framer-motion";

const slideUp: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            delay: i * 0.2,
            ease: "easeOut",
        },
    }),
};

const Footer = () => {
    return (
        <footer className="bg-white border-t border-gray-200 px-40">
            <div className="w-full px-4 sm:px-6 lg:px-8 py-8 mt-20">
                <div className="flex flex-col md:flex-row gap-10 justify-between items-center">
                    <motion.img
                        src="/witomark-logo.png"
                        className="w-40 h-8"
                        variants={slideUp}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }} // Trigger when 20% visible
                        custom={0}
                    />
                    <motion.div
                        className="text-sm text-gray-900 text-center"
                        variants={slideUp}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        custom={1}
                    >
                        <p>deepak@alemeno.com</p>
                        <p>+91 9618698062</p>
                    </motion.div>
                    <motion.div
                        className="text-sm text-gray-900 text-center"
                        variants={slideUp}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        custom={2}
                    >
                        <p>Majiwada, Thane,</p>
                        <p>Maharashtra, 400601</p>
                    </motion.div>
                </div>
                <motion.div
                    className="mt-20 pt-8 text-center text-sm text-gray-500"
                    variants={slideUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    custom={3}
                >
                    Copyright Alemeno Private Limited © 2025. All Rights Reserved
                </motion.div>
            </div>
        </footer>
    );
};

export default Footer;
