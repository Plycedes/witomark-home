export function imageDataToDataUrl(imageData: ImageData): string {
    const canvas = document.createElement("canvas");
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    const ctx = canvas.getContext("2d");
    ctx?.putImageData(imageData, 0, 0);
    return canvas.toDataURL();
}

export function downloadImage(dataUrl: string, filename = "snip.png") {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

export function getAvgSide(approx: any): number {
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
