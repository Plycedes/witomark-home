import { useEffect, useState, type FC } from "react";
import { ToastContainer } from "react-toastify";
import Home from "./pages/Home";
import CustomMarkerAR from "./pages/CustomMarkerAR";
import MarkerCornerDetector from "./pages/MarkerDetector";

function App() {
    const [path, setPath] = useState<string>("");

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        setPath(params.get("page") || "");
    }, []);

    let Page: FC = Home;

    switch (path) {
        case "ar":
            Page = CustomMarkerAR;
            break;
        case "marker":
            Page = MarkerCornerDetector;
            break;
        case "":
        default:
            Page = Home;
            break;
    }

    return (
        <div className="w-full">
            <Page />
            <ToastContainer />
        </div>
    );
}

export default App;

