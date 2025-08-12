import { Shield, Smartphone, Check, BarChart3, Printer, DollarSign } from "lucide-react";
import FeatureCard from "./FeatureCard";
import { motion, type Variants } from "framer-motion";

const FeaturesSection = () => {
    const containerVariants: Variants = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: 0.12, // time between each child animation
                delayChildren: 0.08, // optional initial delay
            },
        },
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: "easeOut" },
        },
    };

    const features = [
        {
            icon: Shield,
            title: "Non-Copiable Technology",
            description:
                "Designed with advanced security features, our QR codes are impossible to duplicate, ensuring true product authenticity.",
        },
        {
            icon: Smartphone,
            title: "Instant Verification",
            description:
                "Consumers can easily scan codes with any smartphone, receiving immediate, accurate verification of authenticity in real time.",
        },
        {
            icon: Check,
            title: "No app required",
            description:
                "Our technology works directly from mobile browser, eliminating the need to download native apps from Play Store or App Store.",
        },
        {
            icon: BarChart3,
            title: "Data Analytics & Insights",
            description:
                "Gain valuable insights into product movements, consumer engagement, and potential counterfeit hotspots through our rhobust analytics dashboard.",
        },
        {
            icon: Printer,
            title: "Integrates with Any Printer",
            description:
                "Consumers can easily scan codes with any smartphone, receiving immediate, accurate verification of authenticity in real time.",
        },
        {
            icon: DollarSign,
            title: "Cost-Effective",
            description:
                "Consumers can easily scan codes with any smartphone, receiving immediate, accurate verification of authenticity in real time.",
        },
    ];

    return (
        <section className="bg-white py-20">
            <div className="w-full px-4 sm:px-6 lg:px-8">
                {/* Parent motion container triggers when scrolled into view */}
                <motion.div
                    className="grid grid-cols-2 xs:grid-cols-1 xs:px-6 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                >
                    {features.map((feature) => (
                        <motion.div key={feature.title} variants={itemVariants}>
                            <FeatureCard
                                icon={feature.icon}
                                title={feature.title}
                                description={feature.description}
                            />
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default FeaturesSection;
