// @ts-nocheck
import React, { useRef, useEffect, useState } from "react";
import { AR } from "js-aruco";

export default function MarkerCornerDetector() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [corners, setCorners] = useState([]);

    useEffect(() => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas?.getContext("2d");

        const detector = new AR.Detector();

        async function startCamera() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: { exact: "environment" }, // Back-facing camera
                    },
                });
                if (video) {
                    video.srcObject = stream;
                    video.onloadedmetadata = () => {
                        // Keep canvas in same aspect ratio as video
                        const ratio = video.videoWidth / video.videoHeight;
                        canvas.width = 640;
                        canvas.height = 640 / ratio;
                        video.play();
                        tick();
                    };
                }
            } catch (err) {
                console.error("Error accessing camera:", err);
            }
        }

        function tick() {
            setTimeout(() => {
                if (video && canvas && context && video.readyState === video.HAVE_ENOUGH_DATA) {
                    context.drawImage(video, 0, 0, canvas.width, canvas.height);

                    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                    const detectedMarkers = detector.detect(imageData);

                    if (detectedMarkers.length > 0) {
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
            }, 10); // 10ms delay
        }

        startCamera();
    }, []);

    return (
        <div>
            <video ref={videoRef} style={{ display: "none" }} playsInline />
            <canvas ref={canvasRef} style={{ border: "1px solid black" }} />
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
