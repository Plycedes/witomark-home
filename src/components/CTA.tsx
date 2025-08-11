interface Props {
    handleOpen: () => void;
}

const CTA = ({ handleOpen }: Props) => {
    return (
        <section className="bg-white py-30">
            <div className="w-full px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                    Protect your brand against
                    <br />
                    counterfeiting
                </h2>
                <p className="text-xl text-gray-600 mb-8">
                    Add Witomark to your Product packaging now!
                </p>
                <button
                    className="bg-green-500 hover:bg-green-600 text-white font-semibold px-8 py-3 rounded-md transition-colors"
                    onClick={handleOpen}
                >
                    Request a Demo
                </button>
            </div>
        </section>
    );
};

export default CTA;
