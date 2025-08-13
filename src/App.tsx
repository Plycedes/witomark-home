import { ToastContainer } from "react-toastify";
import Home from "./pages/Home";
import CustomMarkerAR from "./pages/CustomMarkerAR";
import MarkerCornerDetector from "./pages/MarkerDetector";
import { type FC } from "react";

function App() {
    const path = window.location.pathname;

    let Page: FC;

    switch (path) {
        case "/ar":
            Page = CustomMarkerAR;
            break;
        case "/marker":
            Page = MarkerCornerDetector;
            break;
        case "/":
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

