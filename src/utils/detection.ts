export function findSquares(
    src: any,
    gray: any,
    thresh: any,
    contours: any,
    hierarchy: any,
    cv: any
) {
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
    cv.threshold(gray, thresh, 100, 255, cv.THRESH_BINARY_INV);
    cv.findContours(thresh, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
    return contours;
}

// Validates if a contour is a proper square
export function validateSquare(cnt: any, cv: any, MINAREA: number) {
    const peri = cv.arcLength(cnt, true);
    const approx = new cv.Mat();
    cv.approxPolyDP(cnt, approx, 0.02 * peri, true);

    if (approx.rows !== 4 || !cv.isContourConvex(approx)) {
        approx.delete();
        return null;
    }

    const area = cv.contourArea(approx);
    if (area < MINAREA) {
        approx.delete();
        return null;
    }

    return { approx, area };
}

// Checks circle inside square
export function checkForCircle(
    rect: any,
    roiGray: any,
    area: number,
    cv: any,
    isCircular: (roiGray: any, cv: any) => boolean
) {
    const smallRoi = new cv.Mat();
    cv.resize(
        roiGray,
        smallRoi,
        new cv.Size(Math.floor(roiGray.cols / 2), Math.floor(roiGray.rows / 2))
    );

    const circles = new cv.Mat();
    cv.HoughCircles(smallRoi, circles, cv.HOUGH_GRADIENT, 1, smallRoi.rows / 8, 120, 30, 60, 180);

    let circleData: { x: number; y: number; r: number } | null = null;

    for (let j = 0; j < circles.cols; j++) {
        const x = circles.data32F[j * 3] * 2 + rect.x;
        const y = circles.data32F[j * 3 + 1] * 2 + rect.y;
        const r = circles.data32F[j * 3 + 2] * 2;

        const circleArea = Math.PI * r * r;
        const coverage = circleArea / area;

        if (coverage > 0.5 && isCircular(roiGray, cv)) {
            circleData = { x, y, r };
            break;
        }
    }

    circles.delete();
    smallRoi.delete();

    return circleData;
}

// Checks circularity measure
export function isCircular(roiGray: any, cv: any): boolean {
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

    let result = false;
    for (let k = 0; k < innerContours.size(); k++) {
        const cnt = innerContours.get(k);
        const cntArea = cv.contourArea(cnt);
        const perimeter = cv.arcLength(cnt, true);
        if (perimeter > 0) {
            const circularity = (4 * Math.PI * cntArea) / (perimeter * perimeter);
            if (circularity > 0.8) {
                result = true;
                break;
            }
        }
        cnt.delete();
    }

    roiThresh.delete();
    innerContours.delete();
    innerHierarchy.delete();

    return result;
}
