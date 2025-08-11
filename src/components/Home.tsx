import Header from "./Header";
import Footer from "./Footer";
import HeroSection from "./HeroSection";
import FeaturesSection from "./FeaturesSection";
import ProductInfoSection from "./ProductInfoSection";
import CTA from "./CTA";
import { useState } from "react";
import ConsultationForm from "./ConsultationForm";

// Main Home Component
const Home = () => {
    const [form, setForm] = useState<boolean>(false);

    const handleOpen = () => {
        setForm(true);
    };

    const handleClose = () => {
        setForm(false);
    };

    return (
        <div className="min-h-screen bg-white w-full font-roboto">
            {form && <ConsultationForm onClose={handleClose} />}
            <Header />
            <main>
                <HeroSection handleOpen={handleOpen} />
                <FeaturesSection />
                <ProductInfoSection />
                <CTA handleOpen={handleOpen} />
            </main>
            <Footer />
        </div>
    );
};

export default Home;
