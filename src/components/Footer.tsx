const Footer = () => {
    return (
        <footer className="bg-white border-t border-gray-200 px-40">
            <div className="w-full px-4 sm:px-6 lg:px-8 py-8 mt-20">
                <div className="flex flex-col md:flex-row gap-10 justify-between items-center">
                    <img src="/witomark-logo.png" className="w-40 h-8" />
                    <div className="text-sm text-gray-900 text-center">
                        <div>deepak@alemeno.com</div>
                        <div>+91 9616558502</div>
                    </div>
                    <div className="text-sm text-gray-900 text-center">
                        <div>Majiwada, Thane,</div>
                        <div>Maharashtra, 400601</div>
                    </div>
                </div>
                <div className="mt-20 pt-8 text-center text-sm text-gray-500">
                    Copyright Alemeno Private Limited © 2023. All Rights Reserved
                </div>
            </div>
        </footer>
    );
};

export default Footer;
