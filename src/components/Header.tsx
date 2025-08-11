const Header = () => {
    const handleGetInTouch = () => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    };

    const handleLogin = () => {
        window.location.href = "https://dashboard.witomark.com/login";
    };

    return (
        <header className="bg-white shadow-sm">
            <div className="w-full px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-4">
                    <img src="/witomark-logo.png" className="w-40 h-8" />
                    <div className="flex items-center space-x-4">
                        <button
                            className="text-gray-700 hover:text-gray-900 px-3 py-2"
                            onClick={handleGetInTouch}
                        >
                            Get in touch
                        </button>
                        <button
                            className="text-gray-700 hover:text-gray-900 px-3 py-2"
                            onClick={handleLogin}
                        >
                            Login
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
