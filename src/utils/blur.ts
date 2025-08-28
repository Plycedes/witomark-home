export const measureBlurOpenCV = async (imageData: ImageData): Promise<number | null> => {
    return new Promise((resolve) => {
        if (!window.cv || !window.cv.Laplacian) {
            console.error("OpenCV.js is not loaded yet.");
            resolve(null);
            return;
        }

        // Convert ImageData to a Canvas
        let canvas = document.createElement("canvas");
        canvas.width = imageData.width;
        canvas.height = imageData.height;
        let ctx = canvas.getContext("2d");
        if (ctx) {
            ctx.putImageData(imageData, 0, 0);
        }

        let src = window.cv.imread(canvas); // Read from Canvas instead of ImageData
        let gray = new window.cv.Mat();
        let laplacian = new window.cv.Mat();
        let mean = new window.cv.Mat();
        let stddev = new window.cv.Mat();

        // Convert to grayscale
        window.cv.cvtColor(src, gray, window.cv.COLOR_RGBA2GRAY, 0);

        // Apply Gaussian blur to reduce noise
        window.cv.GaussianBlur(gray, gray, new window.cv.Size(3, 3), 0);

        // Apply Laplacian edge detection
        window.cv.Laplacian(gray, laplacian, window.cv.CV_64F);

        // Compute variance of edge intensities
        window.cv.meanStdDev(laplacian, mean, stddev);
        let blurScore = stddev.data64F[0] ** 2; // Variance of Laplacian

        // Cleanup memory
        src.delete();
        gray.delete();
        laplacian.delete();
        mean.delete();
        stddev.delete();

        resolve(blurScore);
    });
};
