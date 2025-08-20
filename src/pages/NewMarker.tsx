import { useEffect, useRef, useState } from "react";

declare global {
    interface Window {
        cv: any;
    }
}

export default function PatternDetector() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const openCVLoadedRef = useRef(false);
    const [isOpenCVReady, setIsOpenCVReady] = useState(false);
    const [snippedSrc, setSnippedSrc] = useState<string | null>(null);
    const [message, setMessage] = useState<string>("");

    const DELAY = 50;

    const openCVInit = () => {
        if (openCVLoadedRef.current) return;
        openCVLoadedRef.current = true;

        if (window.cv && window.cv.onRuntimeInitialized) {
            setIsOpenCVReady(true);
            return;
        }

        const script = document.createElement("script");
        script.src = "https://docs.opencv.org/4.8.0/opencv.js";
        script.async = true;
        script.onload = () => {
            if (window.cv) {
                window.cv.onRuntimeInitialized = () => {
                    setIsOpenCVReady(true);
                };
            }
        };
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    };

    useEffect(() => {
        const cleanup = openCVInit();
        return cleanup;
    }, []);

    useEffect(() => {
        if (!isOpenCVReady) return;

        async function startCamera() {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: { ideal: "environment" },
                    width: { ideal: 1000 },
                    height: { ideal: 1000 },
                },
            });
            videoRef.current!.srcObject = stream;
            videoRef.current!.play();

            const track = stream.getVideoTracks()[0];
            const capabilities = track.getCapabilities();
            if ("zoom" in capabilities) {
                try {
                    await track.applyConstraints({ advanced: [{ zoom: 4 } as any] });
                } catch (error) {
                    console.error("Failed to set zoom:", error);
                }
            }

            videoRef.current!.onloadeddata = () => {
                processVideo();
            };
        }

        function processVideo() {
            const cv = window.cv;
            const video = videoRef.current!;
            const overlay = canvasRef.current!;
            const overlayCtx = overlay.getContext("2d")!;

            const captureCanvas = document.createElement("canvas");
            const ctx = captureCanvas.getContext("2d");

            const gray = new cv.Mat();
            const thresh = new cv.Mat();
            const contours = new cv.MatVector();
            const hierarchy = new cv.Mat();

            function detect() {
                captureCanvas.width = video.videoWidth;
                captureCanvas.height = video.videoHeight;
                overlay.width = video.videoWidth;
                overlay.height = video.videoHeight;

                ctx!.drawImage(video, 0, 0, captureCanvas.width, captureCanvas.height);

                const imageData = ctx!.getImageData(
                    0,
                    0,
                    captureCanvas.width,
                    captureCanvas.height
                );
                const src = cv.matFromImageData(imageData);

                cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
                cv.threshold(gray, thresh, 120, 255, cv.THRESH_BINARY);

                cv.findContours(
                    thresh,
                    contours,
                    hierarchy,
                    cv.RETR_EXTERNAL,
                    cv.CHAIN_APPROX_SIMPLE
                );

                let biggestSquare: any = null;
                let maxArea = 0;

                for (let i = 0; i < contours.size(); i++) {
                    const cnt = contours.get(i);
                    const peri = cv.arcLength(cnt, true);
                    const approx = new cv.Mat();
                    cv.approxPolyDP(cnt, approx, 0.02 * peri, true);

                    if (approx.rows === 4) {
                        const area = cv.contourArea(approx);
                        if (area > maxArea) {
                            maxArea = area;
                            biggestSquare = approx.clone();
                        }
                    }

                    cnt.delete();
                }

                overlayCtx.clearRect(0, 0, overlay.width, overlay.height);

                if (maxArea > 100000) {
                    setMessage("Pattern detected");

                    const pts: { x: number; y: number }[] = [];
                    for (let i = 0; i < 4; i++) {
                        pts.push({
                            x: biggestSquare.intPtr(i, 0)[0],
                            y: biggestSquare.intPtr(i, 0)[1],
                        });
                    }

                    // Draw square outline
                    overlayCtx.strokeStyle = "lime";
                    overlayCtx.lineWidth = 4;
                    overlayCtx.beginPath();
                    overlayCtx.moveTo(pts[0].x, pts[0].y);
                    for (let i = 1; i < pts.length; i++) {
                        overlayCtx.lineTo(pts[i].x, pts[i].y);
                    }
                    overlayCtx.closePath();
                    overlayCtx.stroke();

                    // Order points top-left -> top-right -> bottom-right -> bottom-left
                    pts.sort((a, b) => a.y - b.y);
                    const top = pts.slice(0, 2).sort((a, b) => a.x - b.x);
                    const bottom = pts.slice(2, 4).sort((a, b) => a.x - b.x);
                    const ordered = [top[0], top[1], bottom[1], bottom[0]];

                    const dstSize = new cv.Size(300, 300);
                    const srcTri = cv.matFromArray(
                        4,
                        1,
                        cv.CV_32FC2,
                        ordered.flatMap((p) => [p.x, p.y])
                    );
                    const dstTri = cv.matFromArray(
                        4,
                        1,
                        cv.CV_32FC2,
                        [0, 0, 300, 0, 300, 300, 0, 300]
                    );
                    const M = cv.getPerspectiveTransform(srcTri, dstTri);
                    const dst = new cv.Mat();
                    cv.warpPerspective(src, dst, M, dstSize);

                    const snipCanvas = document.createElement("canvas");
                    snipCanvas.width = dstSize.width;
                    snipCanvas.height = dstSize.height;
                    cv.imshow(snipCanvas, dst);
                    setSnippedSrc(snipCanvas.toDataURL());

                    dst.delete();
                    M.delete();
                    srcTri.delete();
                    dstTri.delete();
                    biggestSquare.delete();
                } else {
                    setMessage("Looking for pattern...");
                    setSnippedSrc(null);
                }

                src.delete();

                setTimeout(detect, DELAY);
            }

            detect();
        }

        startCamera();
    }, [isOpenCVReady]);

    return (
        <div className="flex flex-col items-center">
            <div className="relative rounded-xl overflow-hidden mt-10 mx-4">
                <video ref={videoRef} playsInline className="w-96 h-96 object-cover" />
                <canvas
                    ref={canvasRef}
                    className="absolute top-0 left-0 w-96 h-96 pointer-events-none"
                />
            </div>
            <p className="my-5">{message}</p>
            {snippedSrc ? (
                <img
                    src={snippedSrc}
                    alt="Detected pattern"
                    style={{ border: "2px solid green" }}
                />
            ) : (
                <p>No pattern detected yet...</p>
            )}
        </div>
    );
}
