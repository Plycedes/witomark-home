import { useState } from "react";

interface Props {
    onZoomChange: (newZoom: number) => void;
}

const ZoomSlider = ({ onZoomChange }: Props) => {
    const [zoom, setZoom] = useState(4);

    const handleZoomChange = (e: any) => {
        const newZoom = parseFloat(e.target.value);
        setZoom(newZoom);
        onZoomChange(newZoom);
    };

    return (
        <div className="flex items-center space-x-2 p-2">
            <label className="text-sm">Zoom: {zoom.toFixed(1)}x</label>
            <input
                type="range"
                min="2"
                max="6"
                step="0.1"
                value={zoom}
                onChange={handleZoomChange}
                className="w-48"
            />
        </div>
    );
};

export default ZoomSlider;
