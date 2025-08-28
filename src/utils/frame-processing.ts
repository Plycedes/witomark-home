// Prepares the frame from the video and returns OpenCV Mat
export function prepareFrame(
    video: HTMLVideoElement,
    captureCanvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    overlay: HTMLCanvasElement,
    cv: any
) {
    captureCanvas.width = video.videoWidth;
    captureCanvas.height = video.videoHeight;
    overlay.width = video.videoWidth;
    overlay.height = video.videoHeight;

    ctx.drawImage(video, 0, 0, captureCanvas.width, captureCanvas.height);
    const imageData = ctx.getImageData(0, 0, captureCanvas.width, captureCanvas.height);
    return cv.matFromImageData(imageData);
}

// Finds contours/squares

// Drawing overlay on canvas
export function drawOverlay(square: any, circleData: any, overlayCtx: CanvasRenderingContext2D) {
    const pts: { x: number; y: number }[] = [];
    for (let i = 0; i < 4; i++) {
        pts.push({ x: square.intPtr(i, 0)[0], y: square.intPtr(i, 0)[1] });
    }

    // draw circle
    overlayCtx.beginPath();
    overlayCtx.strokeStyle = "red";
    overlayCtx.lineWidth = 3;
    overlayCtx.arc(circleData.x - 40, circleData.y, circleData.r, 0, 2 * Math.PI);
    overlayCtx.stroke();

    // draw square
    overlayCtx.strokeStyle = "blue";
    overlayCtx.lineWidth = 4;
    overlayCtx.beginPath();
    pts.forEach((p, i) =>
        i === 0 ? overlayCtx.moveTo(p.x - 40, p.y) : overlayCtx.lineTo(p.x - 40, p.y)
    );
    overlayCtx.closePath();
    overlayCtx.stroke();
}

// Warp and snip out the ROI
export function warpAndSnip(
    src: any,
    pts: { x: number; y: number }[],
    cv: any,
    setSnippedSrc: (s: string | null) => void
): ImageData | null {
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
    const dataUrl = snipCanvas.toDataURL();
    setSnippedSrc(dataUrl);

    const ctx = snipCanvas.getContext("2d");
    const imageData = ctx?.getImageData(0, 0, snipCanvas.width, snipCanvas.height) || null;

    dst.delete();
    M.delete();
    srcTri.delete();
    dstTri.delete();

    return imageData;
}
