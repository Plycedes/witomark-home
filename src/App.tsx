import Home from "./components/Home";
import { ToastContainer } from "react-toastify";

function App() {
    return (
        <>
            <div className="w-full">
                <Home />
                <ToastContainer />
            </div>
        </>
    );
}

export default App;

