import { Shield, Smartphone, Check, BarChart3, Printer, DollarSign } from "lucide-react";
import FeatureCard from "./FeatureCard";

const FeaturesSection = () => {
    return (
        <section className="bg-white py-20">
            <div className="w-full px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 xs:grid-cols-1 xs:px-6 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    <FeatureCard
                        icon={Shield}
                        title="Non-Copiable Technology"
                        description="Designed with advanced security features, our QR codes are impossible to duplicate, ensuring true product authenticity."
                    />
                    <FeatureCard
                        icon={Smartphone}
                        title="Instant Verification"
                        description="Consumers can easily scan codes with any smartphone, receiving immediate, accurate verification of authenticity in real time."
                    />
                    <FeatureCard
                        icon={Check}
                        title="No app required"
                        description="Our technology works directly from mobile browser, eliminating the need to download native apps from Play Store or App Store."
                    />
                    <FeatureCard
                        icon={BarChart3}
                        title="Data Analytics & Insights"
                        description="Gain valuable insights into product movements, consumer engagement, and potential counterfeit hotspots through our rhobust analytics dashboard."
                    />
                    <FeatureCard
                        icon={Printer}
                        title="Integrates with Any Printer"
                        description="Consumers can easily scan codes with any smartphone, receiving immediate, accurate verification of authenticity in real time."
                    />
                    <FeatureCard
                        icon={DollarSign}
                        title="Cost-Effective"
                        description="Consumers can easily scan codes with any smartphone, receiving immediate, accurate verification of authenticity in real time."
                    />
                </div>
            </div>
        </section>
    );
};

export default FeaturesSection;
