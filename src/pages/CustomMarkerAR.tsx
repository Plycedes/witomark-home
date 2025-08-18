// SquareDetector.tsx
import { useEffect, useRef, useState } from "react";

declare global {
    interface Window {
        cv: any;
    }
}

export default function SquareDetector() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const openCVLoadedRef = useRef(false);
    const [isOpenCVReady, setIsOpenCVReady] = useState(false);
    const [snippedSrc, setSnippedSrc] = useState<string | null>(null);
    const [message, setMessage] = useState<string>("");
    const [data, setData] = useState<string>("");

    const DELAY = 400;

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
                    await track.applyConstraints({ advanced: [{ zoom: 3 } as any] });
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
                const start = performance.now();

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
                cv.threshold(gray, thresh, 100, 255, cv.THRESH_BINARY_INV);

                cv.findContours(
                    thresh,
                    contours,
                    hierarchy,
                    cv.RETR_EXTERNAL,
                    cv.CHAIN_APPROX_SIMPLE
                );

                let validSquare = null;
                let validArea = 0;

                for (let i = 0; i < contours.size(); i++) {
                    const cnt = contours.get(i);
                    const peri = cv.arcLength(cnt, true);
                    const approx = new cv.Mat();
                    cv.approxPolyDP(cnt, approx, 0.02 * peri, true);

                    if (approx.rows === 4 && cv.isContourConvex(approx)) {
                        const area = cv.contourArea(approx);

                        if (area > 20000) {
                            // ROI extraction
                            const rect = cv.boundingRect(approx);

                            // Aspect ratio check (filter out rectangles that are not square-ish)
                            const aspectRatio = rect.width / rect.height;
                            if (aspectRatio < 0.8 || aspectRatio > 1.2) {
                                approx.delete();
                                continue;
                            }

                            let roiGray = gray.roi(rect);

                            // Downscale ROI to reduce circle detection load
                            const smallRoi = new cv.Mat();
                            cv.resize(
                                roiGray,
                                smallRoi,
                                new cv.Size(
                                    Math.floor(roiGray.cols / 2),
                                    Math.floor(roiGray.rows / 2)
                                )
                            );

                            // Detect circles with tighter params
                            const circles = new cv.Mat();
                            cv.HoughCircles(
                                smallRoi,
                                circles,
                                cv.HOUGH_GRADIENT,
                                1,
                                smallRoi.rows / 8,
                                180, // param1: Canny high threshold
                                50, // param2: accumulator threshold (higher = stricter)
                                0,
                                0
                            );

                            let hasValidCircle = false;
                            for (let j = 0; j < circles.cols; j++) {
                                const r = circles.data32F[j * 3 + 2] * 2; // rescale radius
                                const circleArea = Math.PI * r * r;
                                const coverage = circleArea / area;

                                console.log(
                                    `Circle ${circleArea}, og ${area} coverage: ${coverage}`
                                );

                                if (coverage > 0.1) {
                                    const roiThresh = new cv.Mat();
                                    cv.threshold(roiGray, roiThresh, 100, 255, cv.THRESH_BINARY);

                                    const innerContours = new cv.MatVector();
                                    const innerHierarchy = new cv.Mat();
                                    cv.findContours(
                                        roiThresh,
                                        innerContours,
                                        innerHierarchy,
                                        cv.RETR_EXTERNAL,
                                        cv.CHAIN_APPROX_SIMPLE
                                    );

                                    for (let k = 0; k < innerContours.size(); k++) {
                                        const cnt = innerContours.get(k);
                                        const cntArea = cv.contourArea(cnt);
                                        const perimeter = cv.arcLength(cnt, true);

                                        if (perimeter > 0) {
                                            const circularity =
                                                (4 * Math.PI * cntArea) / (perimeter * perimeter);
                                            console.log(`circularity: ${circularity}`);

                                            if (circularity > 0.7) {
                                                // ~circle
                                                hasValidCircle = true;
                                                setData(
                                                    `Circle coverage: ${coverage.toFixed(
                                                        2
                                                    )} | circularity: ${circularity.toFixed(2)}`
                                                );
                                            }
                                        }
                                        cnt.delete();
                                    }

                                    roiThresh.delete();
                                    innerContours.delete();
                                    innerHierarchy.delete();

                                    if (hasValidCircle) break;
                                }
                            }

                            circles.delete();
                            smallRoi.delete();
                            roiGray.delete();

                            if (hasValidCircle) {
                                validArea = area;
                                validSquare = approx.clone();
                            }
                        }
                    }

                    approx.delete();
                    cnt.delete();
                }

                overlayCtx.clearRect(0, 0, overlay.width, overlay.height);

                if (validSquare && validArea > 20000) {
                    setMessage("");
                    const pts: { x: number; y: number }[] = [];
                    for (let i = 0; i < 4; i++) {
                        pts.push({
                            x: validSquare.intPtr(i, 0)[0],
                            y: validSquare.intPtr(i, 0)[1],
                        });
                    }

                    overlayCtx.strokeStyle = "blue";
                    overlayCtx.lineWidth = 4;
                    overlayCtx.beginPath();
                    overlayCtx.moveTo(pts[0].x, pts[0].y);
                    for (let i = 1; i < pts.length; i++) {
                        overlayCtx.lineTo(pts[i].x, pts[i].y);
                    }
                    overlayCtx.closePath();
                    overlayCtx.stroke();

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
                } else {
                    setMessage("Move closer " + validArea);
                    setSnippedSrc(null);
                }

                src.delete();

                const end = performance.now();
                console.log(
                    `Frame processed in ${(end - start).toFixed(1)} ms, next in ${DELAY}ms`
                );

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
            <p className="my-5">{message ?? ""}</p>
            <p className="my-5">{data ?? ""}</p>
            {snippedSrc ? (
                <img src={snippedSrc} alt="Snipped square" style={{ border: "2px solid green" }} />
            ) : (
                <p>Looking for square pattern...</p>
            )}
        </div>
    );
}
