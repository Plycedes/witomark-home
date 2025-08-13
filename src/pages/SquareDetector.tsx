// SquareDetector.tsx
import { useEffect, useRef, useState } from "react";

declare global {
    interface Window {
        cv: any;
    }
}

export default function SquareDetector() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const overlayRef = useRef<HTMLCanvasElement>(null); // for blue box overlay
    const openCVLoadedRef = useRef(false);

    const [isOpenCVReady, setIsOpenCVReady] = useState(false);
    const [snippedSrc, setSnippedSrc] = useState<string | null>(null);
    const [status, setStatus] = useState<string>("Looking for square pattern...");

    // tweakable thresholds
    const MIN_AREA_RATIO = 0.18; // e.g. square must cover at least 18% of the frame
    const MAX_SIDE_RATIO = 1.2; // max (longest side / shortest side) to still consider it roughly square

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
                video: { facingMode: { ideal: "environment" } },
            });
            const video = videoRef.current!;
            video.srcObject = stream;
            await video.play();

            video.onloadeddata = () => {
                // size overlay canvas to video frame
                const overlay = overlayRef.current!;
                overlay.width = video.videoWidth;
                overlay.height = video.videoHeight;
                processVideo();
            };
        }

        function processVideo() {
            const cv = window.cv;
            const video = videoRef.current!;
            const overlay = overlayRef.current!;
            const octx = overlay.getContext("2d")!;

            // offscreen canvas to capture frames
            const captureCanvas = document.createElement("canvas");
            const ctx = captureCanvas.getContext("2d")!;

            // mats reused across frames
            const gray = new cv.Mat();
            const thresh = new cv.Mat();

            function length(a: { x: number; y: number }, b: { x: number; y: number }) {
                const dx = a.x - b.x,
                    dy = a.y - b.y;
                return Math.hypot(dx, dy);
            }

            function detect() {
                // match canvas to frame each time (handles orientation changes)
                captureCanvas.width = video.videoWidth;
                captureCanvas.height = video.videoHeight;

                // draw frame
                ctx.drawImage(video, 0, 0, captureCanvas.width, captureCanvas.height);

                // build Mat
                const imageData = ctx.getImageData(0, 0, captureCanvas.width, captureCanvas.height);
                const src = cv.matFromImageData(imageData);

                // preprocess
                cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
                // small blur to kill tiny noise (optional)
                cv.GaussianBlur(gray, gray, new cv.Size(3, 3), 0);
                // simple global threshold; swap to adaptive if lighting is rough
                cv.threshold(gray, thresh, 100, 255, cv.THRESH_BINARY_INV);

                // find contours
                const contours = new cv.MatVector();
                const hierarchy = new cv.Mat();
                cv.findContours(
                    thresh,
                    contours,
                    hierarchy,
                    cv.RETR_EXTERNAL,
                    cv.CHAIN_APPROX_SIMPLE
                );

                let best: any = null;
                let bestArea = 0;

                for (let i = 0; i < contours.size(); i++) {
                    const cnt = contours.get(i);
                    const peri = cv.arcLength(cnt, true);
                    const approx = new cv.Mat();
                    cv.approxPolyDP(cnt, approx, 0.02 * peri, true);

                    if (approx.rows === 4 && cv.isContourConvex(approx)) {
                        // pull points
                        const pts = [];
                        for (let k = 0; k < 4; k++) {
                            pts.push({
                                x: approx.intPtr(k, 0)[0],
                                y: approx.intPtr(k, 0)[1],
                            });
                        }

                        // check near-square by side length ratio
                        // order doesn’t matter for side lengths; compute all edges
                        const d01 = length(pts[0], pts[1]);
                        const d12 = length(pts[1], pts[2]);
                        const d23 = length(pts[2], pts[3]);
                        const d30 = length(pts[3], pts[0]);
                        const sides = [d01, d12, d23, d30];
                        const sideRatio = Math.max(...sides) / Math.min(...sides);

                        if (sideRatio <= MAX_SIDE_RATIO) {
                            const area = cv.contourArea(approx);
                            if (area > bestArea) {
                                bestArea = area;
                                if (best) best.delete();
                                best = approx.clone();
                            }
                        }
                    }
                    approx.delete();
                    cnt.delete();
                }

                // clear overlay every frame
                octx.clearRect(0, 0, overlay.width, overlay.height);

                if (best) {
                    const frameArea = captureCanvas.width * captureCanvas.height;
                    const areaRatio = bestArea / frameArea;

                    if (areaRatio >= MIN_AREA_RATIO) {
                        // valid detection: order points
                        const pts: { x: number; y: number }[] = [];
                        for (let i = 0; i < 4; i++) {
                            pts.push({
                                x: best.intPtr(i, 0)[0],
                                y: best.intPtr(i, 0)[1],
                            });
                        }

                        // order (tl, tr, br, bl)
                        pts.sort((a, b) => a.y - b.y);
                        const top = pts.slice(0, 2).sort((a, b) => a.x - b.x);
                        const bottom = pts.slice(2, 4).sort((a, b) => a.x - b.x);
                        const ordered = [top[0], top[1], bottom[1], bottom[0]];

                        // draw blue box
                        octx.beginPath();
                        octx.moveTo(ordered[0].x, ordered[0].y);
                        for (let i = 1; i < 4; i++) octx.lineTo(ordered[i].x, ordered[i].y);
                        octx.closePath();
                        octx.lineWidth = 4;
                        octx.strokeStyle = "rgba(0, 122, 255, 1)"; // blue
                        octx.stroke();

                        // warp/crop & set image
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
                        setStatus("Pattern detected");

                        dst.delete();
                        M.delete();
                        srcTri.delete();
                        dstTri.delete();
                    } else {
                        // found a square, but too small
                        setSnippedSrc(null);
                        setStatus("Move closer to the pattern");
                    }

                    best.delete();
                } else {
                    // nothing square enough
                    setSnippedSrc(null);
                    setStatus("Looking for square pattern...");
                }

                // cleanup loop allocations
                contours.delete();
                hierarchy.delete();
                src.delete();

                // throttle a bit to avoid pegging CPU
                setTimeout(detect, 10);
            }

            detect();
        }

        startCamera();
    }, [isOpenCVReady]);

    return (
        <div className="flex flex-col items-center gap-3">
            <div className="relative rounded-lg overflow-hidden">
                <video
                    ref={videoRef}
                    playsInline
                    className="w-120 h-120 rounded"
                    style={{ borderRadius: "50px" }}
                />
                {/* overlay canvas on top of video for blue box */}
                <canvas
                    ref={overlayRef}
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    style={{ borderRadius: "50px" }}
                />
            </div>

            {snippedSrc ? (
                <img
                    src={snippedSrc}
                    alt="Snipped square"
                    className="rounded"
                    style={{ border: "2px solid #007aff" }}
                />
            ) : (
                <p className="text-sm text-gray-600">{status}</p>
            )}
        </div>
    );
}
