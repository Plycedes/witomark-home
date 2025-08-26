import { useState } from "react";
import ConsultationForm from "../components/ConsultationForm";
// @ts-ignore
import CTA from "../components/CTA";
// @ts-ignore
import FeaturesSection from "../components/FeaturesSection";
import Footer from "../components/Footer";
import Header from "../components/Header";
// @ts-ignore
import HeroSection from "../components/HeroSection";
// @ts-ignore
import ProductInfoSection from "../components/ProductInfoSection";
import SplitScreenCarousel from "../components/SplitScreenCarousel";

// Main Home Component
const Home = () => {
    const [form, setForm] = useState<boolean>(false);

    // @ts-ignore
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
            {/* <main>
                <HeroSection handleOpen={handleOpen} />
                <FeaturesSection />
                <ProductInfoSection />
                <CTA handleOpen={handleOpen} />
            </main> */}
            <SplitScreenCarousel />
            <Footer />
        </div>
    );
};

export default Home;
