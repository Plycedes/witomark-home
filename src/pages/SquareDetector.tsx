// SquareDetector.tsx
import { useEffect, useRef, useState } from "react";

declare global {
    interface Window {
        cv: any;
    }
}

export default function SquareDetector() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const openCVLoadedRef = useRef(false);
    const [isOpenCVReady, setIsOpenCVReady] = useState(false);
    const [snippedSrc, setSnippedSrc] = useState<string | null>(null);
    const [message, setMessage] = useState<string>("");

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
                    width: { ideal: 1400 },
                    height: { ideal: 1400 },
                },
            });
            videoRef.current!.srcObject = stream;
            videoRef.current!.play();

            videoRef.current!.onloadeddata = () => {
                processVideo();
            };
        }

        function processVideo() {
            const cv = window.cv;
            const video = videoRef.current!;
            const captureCanvas = document.createElement("canvas");
            const ctx = captureCanvas.getContext("2d");

            const gray = new cv.Mat();
            const thresh = new cv.Mat();
            const contours = new cv.MatVector();
            const hierarchy = new cv.Mat();

            function detect() {
                // Match canvas to video frame size
                captureCanvas.width = video.videoWidth;
                captureCanvas.height = video.videoHeight;

                // Draw current frame into canvas
                ctx!.drawImage(video, 0, 0, captureCanvas.width, captureCanvas.height);

                // Convert the drawn frame to cv.Mat
                const imageData = ctx!.getImageData(
                    0,
                    0,
                    captureCanvas.width,
                    captureCanvas.height
                );
                const src = cv.matFromImageData(imageData);

                cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
                cv.threshold(gray, thresh, 100, 255, cv.THRESH_BINARY_INV);

                cv.findContours(
                    thresh,
                    contours,
                    hierarchy,
                    cv.RETR_EXTERNAL,
                    cv.CHAIN_APPROX_SIMPLE
                );

                let largestSquare = null;
                let largestArea = 0;

                for (let i = 0; i < contours.size(); i++) {
                    const cnt = contours.get(i);
                    const peri = cv.arcLength(cnt, true);
                    const approx = new cv.Mat();
                    cv.approxPolyDP(cnt, approx, 0.02 * peri, true);

                    if (approx.rows === 4 && cv.isContourConvex(approx)) {
                        const area = cv.contourArea(approx);
                        if (area > largestArea) {
                            largestArea = area;
                            largestSquare = approx.clone();
                        }
                    }
                    approx.delete();
                    cnt.delete();
                }
                console.log("Largest square", largestArea);

                if (largestArea > 1000) {
                    if (largestArea > 20000) {
                        if (largestSquare) {
                            setMessage("");
                            const pts = [];
                            for (let i = 0; i < 4; i++) {
                                pts.push({
                                    x: largestSquare.intPtr(i, 0)[0],
                                    y: largestSquare.intPtr(i, 0)[1],
                                });
                            }

                            // Sort points to (tl, tr, br, bl)
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
                        }
                    } else {
                        setMessage("Move closer");
                        setSnippedSrc(null);
                    }
                } else {
                    setMessage("");
                    setSnippedSrc(null);
                }

                src.delete();
                requestAnimationFrame(detect);
            }

            detect();
        }

        startCamera();
    }, [isOpenCVReady]);

    return (
        <div className="flex flex-col items-center">
            <div className="rounded-xl overflow-hidden mt-10">
                <video
                    ref={videoRef}
                    playsInline
                    className="w-96 h-96 object-cover"
                    // style={{ borderRadius: "50px" }}
                />
            </div>
            <p className="my-5">{message ?? ""}</p>
            {snippedSrc ? (
                <img src={snippedSrc} alt="Snipped square" style={{ border: "2px solid green" }} />
            ) : (
                <p>Looking for square pattern...</p>
            )}
        </div>
    );
}
