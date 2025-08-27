// SquareDetector.tsx
// Main file
import { useEffect, useRef, useState } from "react";
import ZoomSlider from "../components/ZoomSlider";

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

    const [backCameraDevices, setBackCameraDevices] = useState<MediaDeviceInfo[]>([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
    const [zoom, setZoom] = useState(4);

    const DELAY = 50;
    const MINAREA = 100000;

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
        if (selectedDeviceId) {
            changeStream(selectedDeviceId);
        }
    }, [selectedDeviceId]);

    useEffect(() => {
        if (!isOpenCVReady) return;
        startCamera();
    }, [isOpenCVReady]);

    async function startCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: { ideal: "environment" },
                    width: { ideal: 1000 },
                    height: { ideal: 1000 },
                },
            });

            if (!videoRef.current) return;
            videoRef.current.srcObject = stream;

            // ensure play() actually starts
            videoRef.current.onloadedmetadata = () => {
                videoRef.current?.play();
            };

            // start processing when we actually have frames
            videoRef.current.onplaying = () => {
                processVideo();
            };

            // enumerate cameras
            const mediaDevices = await navigator.mediaDevices.enumerateDevices();
            const filteredDevices = mediaDevices.filter(
                (device) =>
                    device.kind === "videoinput" && device.label.toLowerCase().includes("back")
            );
            setBackCameraDevices(filteredDevices);

            // optional zoom
            const track = stream.getVideoTracks()[0];
            const capabilities = track.getCapabilities();
            if ("zoom" in capabilities) {
                try {
                    await track.applyConstraints({ advanced: [{ zoom: zoom } as any] });
                } catch (error) {
                    console.error("Failed to set zoom:", error);
                }
            }
        } catch (err) {
            console.error("Failed to start camera:", err);
        }
    }

    const changeStream = async (deviceId: string) => {
        try {
            if (videoRef.current?.srcObject) {
                const oldStream = videoRef.current.srcObject as MediaStream;
                oldStream.getTracks().forEach((track) => track.stop());
            }

            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    deviceId: { exact: deviceId },
                    width: { ideal: 1000 },
                    height: { ideal: 1000 },
                },
                audio: false,
            });

            if (!videoRef.current) return;
            videoRef.current.srcObject = mediaStream;

            videoRef.current.onloadedmetadata = () => {
                videoRef.current?.play();
            };

            videoRef.current.onplaying = () => {
                processVideo();
            };

            const track = mediaStream.getVideoTracks()[0];
            const capabilities = track.getCapabilities();
            if ("zoom" in capabilities) {
                try {
                    await track.applyConstraints({ advanced: [{ zoom: zoom } as any] });
                } catch (err) {
                    console.error("Failed to set zoom:", err);
                }
            }
        } catch (err) {
            console.error("Failed to change video stream:", err);
        }
    };

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
            overlayCtx.clearRect(0, 0, overlay.width, overlay.height);
            const start = performance.now();

            captureCanvas.width = video.videoWidth;
            captureCanvas.height = video.videoHeight;
            overlay.width = video.videoWidth;
            overlay.height = video.videoHeight;

            ctx!.drawImage(video, 0, 0, captureCanvas.width, captureCanvas.height);

            const imageData = ctx!.getImageData(0, 0, captureCanvas.width, captureCanvas.height);
            const src = cv.matFromImageData(imageData);

            cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
            cv.threshold(gray, thresh, 100, 255, cv.THRESH_BINARY_INV);

            cv.findContours(thresh, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

            let validSquare = null;
            let validArea = 0;
            let avgSide = 0;

            let radius: number = 0;
            let xcord: number = 0;
            let ycord: number = 0;

            for (let i = 0; i < contours.size(); i++) {
                const cnt = contours.get(i);
                const peri = cv.arcLength(cnt, true);
                const approx = new cv.Mat();
                cv.approxPolyDP(cnt, approx, 0.02 * peri, true);

                if (approx.rows === 4 && cv.isContourConvex(approx)) {
                    const area = cv.contourArea(approx);

                    if (area > MINAREA) {
                        const rect = cv.boundingRect(approx);

                        const aspectRatio = rect.width / rect.height;
                        console.log(`Aspect ration ${aspectRatio}`);
                        if (aspectRatio < 0.8 || aspectRatio > 1.1) {
                            approx.delete();
                            continue;
                        }

                        let roiGray = gray.roi(rect);

                        const smallRoi = new cv.Mat();
                        cv.resize(
                            roiGray,
                            smallRoi,
                            new cv.Size(Math.floor(roiGray.cols / 2), Math.floor(roiGray.rows / 2))
                        );

                        const circles = new cv.Mat();
                        cv.HoughCircles(
                            smallRoi,
                            circles,
                            cv.HOUGH_GRADIENT,
                            1,
                            smallRoi.rows / 8,
                            120,
                            30,
                            60,
                            180
                        );

                        let hasValidCircle = false;
                        for (let j = 0; j < circles.cols; j++) {
                            const x = circles.data32F[j * 3] * 2 + rect.x;
                            const y = circles.data32F[j * 3 + 1] * 2 + rect.y;
                            const r = circles.data32F[j * 3 + 2] * 2;

                            // Draw circle overlay
                            // overlayCtx.beginPath();
                            // overlayCtx.strokeStyle = "red";
                            // overlayCtx.lineWidth = 3;
                            // overlayCtx.arc(x - 40, y, r, 0, 2 * Math.PI);
                            // overlayCtx.stroke();

                            const circleArea = Math.PI * r * r;
                            const coverage = circleArea / area;

                            console.log(`Circle ${circleArea}, og ${area} coverage: ${coverage}`);

                            if (coverage > 0.5) {
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

                                        if (circularity > 0.8) {
                                            // ~circle
                                            hasValidCircle = true;
                                            radius = r;
                                            xcord = x;
                                            ycord = y;
                                            setData(
                                                `coverage: ${coverage.toFixed(
                                                    2
                                                )} | circularity: ${circularity.toFixed(
                                                    2
                                                )} | radius: ${(r / 2).toFixed(2)}`
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
                            avgSide = getAvgSide(approx);
                            validSquare = approx.clone();
                        }
                    }
                }

                approx.delete();
                cnt.delete();
            }

            if (validSquare && validArea > MINAREA) {
                setMessage(`Side: ${avgSide}`);
                const pts: { x: number; y: number }[] = [];
                for (let i = 0; i < 4; i++) {
                    pts.push({
                        x: validSquare.intPtr(i, 0)[0],
                        y: validSquare.intPtr(i, 0)[1],
                    });
                }

                overlayCtx.beginPath();
                overlayCtx.strokeStyle = "red";
                overlayCtx.lineWidth = 3;
                overlayCtx.arc(xcord - 40, ycord, radius, 0, 2 * Math.PI);
                overlayCtx.stroke();

                overlayCtx.strokeStyle = "blue";
                overlayCtx.lineWidth = 4;
                overlayCtx.beginPath();

                const offSetX = -40;

                overlayCtx.moveTo(pts[0].x + offSetX, pts[0].y);
                for (let i = 1; i < pts.length; i++) {
                    overlayCtx.lineTo(pts[i].x + offSetX, pts[i].y);
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
                const dstTri = cv.matFromArray(4, 1, cv.CV_32FC2, [0, 0, 300, 0, 300, 300, 0, 300]);
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
                setMessage("Move closer");
                setSnippedSrc(null);
            }

            src.delete();

            const end = performance.now();
            console.log(`Frame processed in ${(end - start).toFixed(1)} ms, next in ${DELAY}ms`);

            setTimeout(detect, DELAY);
        }

        detect();
    }

    function getAvgSide(approx: any): number {
        const pts = [];
        for (let i = 0; i < 4; i++) {
            pts.push({
                x: approx.intPtr(i, 0)[0],
                y: approx.intPtr(i, 0)[1],
            });
        }

        const lengths = [];
        for (let i = 0; i < 4; i++) {
            const p1 = pts[i];
            const p2 = pts[(i + 1) % 4];
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            lengths.push(Math.sqrt(dx * dx + dy * dy));
        }
        return lengths.reduce((a, b) => a + b, 0) / lengths.length;
    }

    const handleZoomChange = async (newZoom: number) => {
        setZoom(newZoom);
        if (videoRef.current?.srcObject instanceof MediaStream) {
            const videoTrack = videoRef.current.srcObject.getVideoTracks()[0];
            if (videoTrack) {
                try {
                    await videoTrack.applyConstraints({
                        advanced: [{ zoom: newZoom } as any],
                    });
                } catch (error) {
                    console.error("Failed to apply zoom:", error);
                }
            }
        }
    };

    return (
        <div className="flex flex-col items-center">
            <div className="relative rounded-xl overflow-hidden mt-10 mx-4">
                <video ref={videoRef} playsInline className="w-96 h-96 object-cover" />
                <canvas
                    ref={canvasRef}
                    className="absolute top-0 left-0 w-96 h-96 pointer-events-none"
                />
            </div>
            <ZoomSlider onZoomChange={handleZoomChange} />
            {backCameraDevices.length > 1 && (
                <div className="mt-1">
                    <p className="text-center text-md text-gray-700">
                        Switch cameras if you can't focus the image
                    </p>
                    <div className="grid grid-cols-3 gap-4 mt-4 px-10 w-full">
                        {backCameraDevices.map((device, index) => {
                            const isActive = selectedDeviceId === device.deviceId;
                            return (
                                <button
                                    key={device.deviceId}
                                    onClick={() => setSelectedDeviceId(device.deviceId)}
                                    className={`
                                                py-2 rounded-full border transition
                                                ${
                                                    isActive
                                                        ? "border-[#4553ED] border-2 text-[#4553ED] bg-gray-200"
                                                        : "border-transparent text-gray-500 bg-gray-200 hover:bg-gray-300"
                                                }
                                                `}
                                >
                                    Cam {index + 1}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
            <p className="my-2">{message ?? ""}</p>
            <p className="my-2">{data ?? ""}</p>
            {snippedSrc ? (
                <img src={snippedSrc} alt="Snipped square" style={{ border: "2px solid green" }} />
            ) : (
                <p>Looking for square pattern...</p>
            )}
        </div>
    );
}
