// SquareDetector.tsx
// detect file
import { useCallback, useEffect, useRef, useState } from "react";
import ZoomSlider from "../components/ZoomSlider";
import { prepareFrame, drawOverlay, warpAndSnip } from "../utils/frame-processing";
import { measureBlurOpenCV } from "../utils/blur";
import { getAvgSide, imageDataToDataUrl, downloadImage } from "../utils/helpers";
import { findSquares, validateSquare, checkForCircle, isCircular } from "../utils/detection";

declare global {
    interface Window {
        cv: any;
    }
}

export default function SquareDetector() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const capturedRef = useRef(false);

    const openCVLoadedRef = useRef(false);
    const [isOpenCVReady, setIsOpenCVReady] = useState(false);
    const [snippedSrc, setSnippedSrc] = useState<string | null>(null);
    const [message, setMessage] = useState<string>("");
    const [data, setData] = useState<string>("");

    const [backCameraDevices, setBackCameraDevices] = useState<MediaDeviceInfo[]>([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
    const [zoom, setZoom] = useState(4);

    // --- state / refs in your component ---
    const [_, setBlurValues] = useState<number[]>([]);
    const [adaptiveBlurThreshold, setAdaptiveBlurThreshold] = useState<number | null>(null);

    // helper to download an image

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

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject instanceof MediaStream) {
            const stream = videoRef.current.srcObject;
            stream.getTracks().forEach((track) => track.stop());
            videoRef.current.srcObject = null; // clear ref
        }
    };

    function processVideo() {
        const cv = window.cv;
        const video = videoRef.current!;
        const overlay = canvasRef.current!;
        const overlayCtx = overlay.getContext("2d")!;
        const captureCanvas = document.createElement("canvas");
        const ctx = captureCanvas.getContext("2d")!;
        const gray = new cv.Mat();
        const thresh = new cv.Mat();
        const contoursV = new cv.MatVector();
        const hierarchy = new cv.Mat();

        function detect() {
            if (capturedRef.current) return;

            overlayCtx.clearRect(0, 0, overlay.width, overlay.height);
            const start = performance.now();

            const src = prepareFrame(video, captureCanvas, ctx, overlay, cv);
            const contours = findSquares(src, gray, thresh, contoursV, hierarchy, cv);

            let bestSquare = null;
            let bestCircle = null;
            let bestArea = 0;

            for (let i = 0; i < contours.size(); i++) {
                const cnt = contours.get(i);
                const validated = validateSquare(cnt, cv, MINAREA);

                if (!validated) {
                    cnt.delete();
                    continue;
                }

                const { approx, area } = validated;
                const rect = cv.boundingRect(approx);
                const roiGray = gray.roi(rect);

                const circleData = checkForCircle(rect, roiGray, area, cv, isCircular);

                if (circleData) {
                    bestSquare = approx.clone();
                    bestCircle = circleData;
                    bestArea = area;
                }

                roiGray.delete();
                approx.delete();
                cnt.delete();
            }

            if (bestSquare && bestCircle && bestArea > MINAREA) {
                setMessage(`Side: ${getAvgSide(bestSquare)}`);
                drawOverlay(bestSquare, bestCircle, overlayCtx);

                const pts: { x: number; y: number }[] = [];
                for (let i = 0; i < 4; i++) {
                    pts.push({ x: bestSquare.intPtr(i, 0)[0], y: bestSquare.intPtr(i, 0)[1] });
                }

                const imageData = warpAndSnip(src, pts, cv, setSnippedSrc);

                if (imageData) {
                    measureBlurOpenCV(imageData).then((score) => {
                        if (score == null || capturedRef.current) return;

                        setBlurValues((prev) => {
                            const newArr = [...prev, score];
                            const avg = newArr.reduce((a, b) => a + b, 0) / newArr.length;
                            setAdaptiveBlurThreshold(avg);

                            setData(`Blur ${score} Avg ${avg} Len ${newArr.length}`);

                            if (newArr.length > 30 && score >= avg) {
                                capturedRef.current = true;
                                stopCamera();
                                const dataUrl = imageDataToDataUrl(imageData);
                                debouncedDownload(dataUrl);
                            }

                            return newArr;
                        });
                    });
                }
            } else {
                setMessage("Move closer");
                setSnippedSrc(null);
            }

            src.delete();
            const end = performance.now();
            console.log(`Frame processed in ${(end - start).toFixed(1)} ms, next in ${DELAY}ms`);

            if (!capturedRef.current) {
                setTimeout(detect, DELAY);
            }
        }

        detect();
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

    function useDebouncedCallback<T extends (...args: any[]) => void>(callback: T, delay: number) {
        const timeoutRef = useRef<number | undefined>(null);

        const debounced = useCallback(
            (...args: Parameters<T>) => {
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                }
                timeoutRef.current = window.setTimeout(() => {
                    callback(...args);
                }, delay);
            },
            [callback, delay]
        );

        // Cleanup on unmount
        useEffect(() => {
            return () => {
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                }
            };
        }, []);

        return debounced;
    }

    const debouncedDownload = useDebouncedCallback((dataUrl: string) => {
        downloadImage(dataUrl, `sharp_frame_${Date.now()}.png`);
    }, 1000);

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
            <p className="my-2">{`${adaptiveBlurThreshold?.toFixed(2)}}`}</p>
            {snippedSrc ? (
                <img src={snippedSrc} alt="Snipped square" style={{ border: "2px solid green" }} />
            ) : (
                <p>Looking for square pattern...</p>
            )}
        </div>
    );
}
