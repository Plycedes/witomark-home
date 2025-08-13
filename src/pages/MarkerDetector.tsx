// @ts-nocheck
import React, { useRef, useEffect, useState } from "react";
import { AR } from "js-aruco";

export default function MarkerCornerDetector() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [corners, setCorners] = useState([]);

    useEffect(() => {
        let video = videoRef.current;
        let canvas = canvasRef.current;
        let context = canvas?.getContext("2d");

        const detector = new AR.Detector();

        async function startCamera() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (video) {
                    video.srcObject = stream;
                    video.play();
                }
            } catch (err) {
                console.error("Error accessing camera:", err);
            }
        }

        function tick() {
            if (video && canvas && context && video.readyState === video.HAVE_ENOUGH_DATA) {
                // Draw the current video frame to canvas
                context.drawImage(video, 0, 0, canvas.width, canvas.height);

                // Get imageData for detection
                const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

                // Detect markers
                const detectedMarkers = detector.detect(imageData);

                if (detectedMarkers.length > 0) {
                    // Get corner points of the first marker
                    const markerCorners = detectedMarkers[0].corners.map((corner) => ({
                        x: corner.x,
                        y: corner.y,
                    }));
                    setCorners(markerCorners);
                } else {
                    setCorners([]);
                }
            }
            requestAnimationFrame(tick);
        }

        startCamera().then(() => tick());
    }, []);

    return (
        <div>
            <video ref={videoRef} style={{ display: "none" }} />
            <canvas
                ref={canvasRef}
                width={640}
                height={480}
                style={{ border: "1px solid black" }}
            />
            <div style={{ marginTop: "10px" }}>
                {corners.length > 0 ? (
                    <pre>{JSON.stringify(corners, null, 2)}</pre>
                ) : (
                    <p>No marker detected</p>
                )}
            </div>
        </div>
    );
}
