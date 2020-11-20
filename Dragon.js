// Hard-code useful radian values
const piOverFour = Math.PI / 4;
const piOverTwo = Math.PI / 2;

// Initialize points array, which will store coordinates defining the Dragon curve's path
const points = [];

// Convert any value of theta (in radians) to a value between 0 and 2PI
function angleWrapAround(theta) {
    if (theta < 0) {
        theta += 2 * Math.PI;
    }
    if (theta >= 2 * Math.PI) {
        theta -= 2 * Math.PI;
    }
    return theta;
}

// Recursive function for obtaining the curve's path points
//    n: recursive order
//    theta: current angle of line segment defined by (x1, y1) and (x2, y2) relative to horizontal
//    sign: either +1 or -1, used to determine which direction to "fold" the line segment
//    x1, y1, x2, y2: x and y coordinates of current line segment being considered
//    points: array for storing (x, y) coordinates when base case is reached
function heighwayDragon(n, theta, sign, x1, y1, x2, y2, points) {
    // Base case: if order reduced to 0, append (x2, y2) to the array of point coordinates,
    // along with its sign value. Append the (x, y) pair as a nested array.
    if (n == 0) {
        points.push([x2, y2]);
    }

    // Recursive step
    else {
        // Calculate r (distance between endpoints)
        let dx = x2 - x1;
        let dy = y2 - y1;
        let r = Math.sqrt(dx * dx + dy * dy);

        // Use polar coordinates to determine (x, y) coordinates needed to complete the "triangle"
        // The triangle's "base" is the line segment defined by (x1, y1) and (x2, y2)
        let theta_new = angleWrapAround(theta + sign * piOverFour);
        let theta_new_second_line = angleWrapAround(theta_new - sign * piOverTwo);
        let r_new = r * Math.SQRT1_2;
        let x_new = x1 + r_new * Math.cos(theta_new);
        let y_new = y1 + r_new * Math.sin(theta_new);

        // Make recursive call on each of the triangle's "sides"
        heighwayDragon(n - 1, theta_new, 1, x1, y1, x_new, y_new, points);
        heighwayDragon(n - 1, theta_new_second_line, -1, x_new, y_new, x2, y2, points);
    }
}


// Given an array of coordinates defining a Heighway dragon curve, generate a string specifying
// an SVG path elements's d paramter.
// x1 and y1 are the coordinates of the path's beginning
function getPathSquare(x1, y1, points) {
    // Initialize string
    let pathString = `M ${x1} ${y1} `;

    // For every point in the Dragon curve...
    for (let i = 0; i < points.length; i++) {
        // Draw a line from our current point to the next point
        pathString += `L ${points[i][0]} ${points[i][1]} `;
    }

    // Return the string
    return pathString;
}

// Same as getPathSquare() above, except round all corners.
// roundFactor is the ratio between each corner's arc radius and the line segment's length
// without any arcing, aka how "round" the corners are.
// 0.5 = perfect roundedness
function getPathRounded(x1, y1, points, roundFactor) {
    // Initialize string
    let pathString = `M ${x1} ${y1} `;

    // Determine the length of each line segment.
    // Since they're all the same, just find the dist b/w the starting point and
    // the first point in the points[] array
    const deltaX = points[0][0] - x1;
    const deltaY = points[0][1] - y1;
    const lineLength = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Determine the radius of each arc
    const arcRadius = roundFactor * lineLength;

    // Initialize current path position at the start (x1, y1)
    let xc = x1; // the C stands for current
    let yc = y1;

    // For every point in the Dragon curve...
    for (let i = 0; i < points.length; i++) {
        // If the last point hasn't been reached yet...
        if (i < points.length - 1) {
            // Draw a line from the current position to the next dragon curve point,
            // minus the fractional amount defined by roundFactor
            let dx1 = (1 - roundFactor) * (points[i][0] - xc);
            let dy1 = (1 - roundFactor) * (points[i][1] - yc);
            let xn1 = xc + dx1; // the N stands for next
            let yn1 = yc + dy1;
            pathString += `L ${xn1} ${yn1} `;

            // Determine the endpoint of the arc after rounding the corner
            // Store as xn2 and yn2
            let dx2 = roundFactor * (points[i + 1][0] - points[i][0]);
            let dy2 = roundFactor * (points[i + 1][1] - points[i][1]);
            let xn2 = points[i][0] + dx2;
            let yn2 = points[i][1] + dy2;

            // Store some coordinates in easily accessible variables.
            // x1t and y1t are the x and y coordinates of the 1st point following xc and yc.
            // x2t and y2t are the x and y coordinates of the 2nd point following xc and yc.
            let x1t = points[i][0];
            let y1t = points[i][1];
            let x2t = points[i + 1][0];
            let y2t = points[i + 1][1];
            let arcDirection;

            // Determine direction to draw arc based on z-component of cross product
            // between two vectors defined by (xc, yc) => (x1t, y1t) and (x1t, y1t) => (x2t, y2t)
            let z = (x1t - xc) * (y2t - y1t) - (y1t - yc) * (x2t - x1t);
            if (z > 0) {
                arcDirection = 1;
            }
            else {
                arcDirection = 0;
            }

            // Finally, draw the arc
            pathString += `A ${arcRadius} ${arcRadius} 0 0 ${arcDirection} ${xn2} ${yn2} `;
        }

        // If we've reached the last point, simply draw a line from our current position to that point
        else {
            pathString += `L ${points[i][0]} ${points[i][1]} `;
        }

        // Update the current position (sans the arc)
        xc = points[i][0];
        yc = points[i][1];
    }

    // Return the string
    return pathString;
}

// Same as getPathSquare() above, but skew the curve slightly off from 90 degree angles
function getPathSkewed(x1, y1, points) {
    // Initialize string
    let pathString = `M ${x1} ${y1} `;

    // Hard-code skewFactor
    const skewFactor = 0.12;

    // Initialize current path position at the start (x1, y1)
    let xc = x1; // the C stands for current
    let yc = y1;

    // For every point in the Dragon curve...
    for (let i = 0; i < points.length; i++) {
        // If the last point hasn't been reached yet...
        if (i < points.length - 1) {
            // Draw a line from the current position to the next dragon curve point,
            // minus the fractional amount defined by skewFactor
            let dx1 = (1 - skewFactor) * (points[i][0] - xc);
            let dy1 = (1 - skewFactor) * (points[i][1] - yc);
            let xn1 = xc + dx1; // the N stands for next
            let yn1 = yc + dy1;
            pathString += `L ${xn1} ${yn1} `;
        }

        // If we've reached the last point, simply draw a line from our current position to that point
        else {
            pathString += `L ${points[i][0]} ${points[i][1]} `;
        }

        // Update the current position (sans the arc)
        xc = points[i][0];
        yc = points[i][1];
    }

    // Return the string
    return pathString;
}

// Wrapping it all together...
// Given a recursive order, two starting points, and a style type,
// obtain a string specifying an SVG path for a Heighway dragon curve
function getDragonCurvePath(n, x1, y1, x2, y2, renderStyle) {
    // First clear the points array
    points.length = 0;

    // Repopulate points array using recursive method
    heighwayDragon(n, 0, 1, x1, y1, x2, y2, points);

    // Obtain and return path string
    let pathString;
    if (renderStyle === "square") {
        pathString = getPathSquare(x1, y1, points);
    }
    else if (renderStyle === "rounded") {
        pathString = getPathRounded(x1, y1, points, 0.25);
    }
    else if (renderStyle === "skewed") {
        pathString = getPathSkewed(x1, y1, points);
    }
    else if (renderStyle === "arc") {
        pathString = getPathRounded(x1, y1, points, 0.5);
    }
    return pathString;
}

// Export
export { getDragonCurvePath };