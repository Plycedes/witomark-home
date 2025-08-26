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
        <footer className="bg-white border-t border-gray-200">
            <div className="w-full px-4 sm:px-6 md:32 lg:px-40 xl:px-40 py-10 mt-20">
                {/* Top section */}
                <div className="flex flex-col md:flex-row xl:py-20 gap-6 md:gap-10 justify-between items-center text-center md:text-left">
                    {/* Logo */}
                    <motion.img
                        src="/witomark-logo.png"
                        className="w-28 sm:w-32 md:w-40 h-auto"
                        variants={slideUp}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        custom={0}
                        alt="Witomark Logo"
                    />

                    {/* Contact */}
                    <motion.div
                        className="text-sm text-gray-900"
                        variants={slideUp}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        custom={1}
                    >
                        <p className="mb-1">deepak@alemeno.com</p>
                        <p>+91 9618698062</p>
                    </motion.div>

                    {/* Address */}
                    <motion.div
                        className="text-sm text-gray-900"
                        variants={slideUp}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        custom={2}
                    >
                        <p className="mb-1">Majiwada, Thane,</p>
                        <p>Maharashtra, 400601</p>
                    </motion.div>
                </div>

                {/* Bottom copyright */}
                <motion.div
                    className="mt-12 md:mt-20 pt-6 text-center text-xs sm:text-sm text-gray-500"
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
