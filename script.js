import { getDragonCurvePath } from "./Dragon.js";

// Initialize svg element
const mySvg = document.getElementById("mySvg");

// Initialize initial endpoints of curve for n = 0
const x1 = 225;
const y1 = 210;
const x2 = 775;
const y2 = 210;

// Initialize n and rendering style
let n = 1;
let renderStyle = "rounded";

// Should the user be able to set any value of n?
let unlimitedRecursionAllowed = false;

// Function for drawing a dragon curve of order n with a given rendering style
// Rendering style can be either "square", "rounded", "skewed", or "arc"
function drawDragonCurve(n, renderStyle) {
    // Clear the pre-existing path curve if it exists
    while (mySvg.firstChild) {
        mySvg.removeChild(mySvg.firstChild);
    }

    // Obtain SVG path for dragon curve
    let pathString = getDragonCurvePath(n, x1, y1, x2, y2, renderStyle);

    // Render the curve
    let pathNode = document.createElementNS("http://www.w3.org/2000/svg", "path");
    let strokeWidth = 75 / (Math.SQRT2 ** n); // Ensure that stroke thickness is consistent across recursive levels
    pathNode.setAttribute("d", pathString);
    pathNode.setAttribute("stroke", "black");
    pathNode.setAttribute("stroke-linejoin", "round");
    pathNode.setAttribute("stroke-width", strokeWidth.toString());
    pathNode.setAttribute("stroke-linecap", "round");
    pathNode.setAttribute("fill", "none");
    mySvg.appendChild(pathNode);
}

// Re-render the curve if the user changes n
// Don't go above n = 13 unless the user has clicked "Here Be Dragons"
const iterationNumInput = document.getElementById("iterationNumInput");
const decrementIteration = document.getElementById("decrementIteration");
const incrementIteration = document.getElementById("incrementIteration");
decrementIteration.onclick = () => {
    if (n > 0) {
        n--;
        // If n == 0, gray out the minus button
        if (n == 0) {
            decrementIteration.style.backgroundColor = "#8A8B8C";
        }
        // If n == 12, remove gray from plus button
        if (n == 12) {
            incrementIteration.style.backgroundColor = "#A31F34";
        }
        iterationNumInput.innerHTML = n.toString();
        drawDragonCurve(n, renderStyle);
    }
};
incrementIteration.onclick = () => {
    if (n < 13 || unlimitedRecursionAllowed) {
        n++;
        // If n == 13 and unlimited recursion is disallowed, gray out the plus button
        if (n == 13 && !unlimitedRecursionAllowed) {
            incrementIteration.style.backgroundColor = "#8A8B8C";
        }
        // If n == 1, remove gray from minus button
        if (n == 1) {
            decrementIteration.style.backgroundColor = "#A31F34";
        }
        iterationNumInput.innerHTML = n.toString();
        drawDragonCurve(n, renderStyle);
    }
};

// Re-render the curve if the user changes the rendering style
const radios = document.querySelectorAll("input[type=radio][name='renderingStyle']");
radios.forEach(radio => {
    radio.addEventListener("change", () => {
        renderStyle = radio.value;
        drawDragonCurve(n, renderStyle);
    });
});

// Program the "Here Be Dragons" button
const hereBeDragons = document.getElementById("hereBeDragons");
const hereBeDragonsModal = document.getElementById("hereBeDragonsModal");
const closeHereBeDragons = document.getElementById("closeHereBeDragons");
hereBeDragons.onclick = () => {
    // If user clicks "Here Be Dragons"
    if (!unlimitedRecursionAllowed) {
        // First, display the modal pop-up warning the user
        hereBeDragonsModal.style.display = "block";

        // Toggle the button's text and color
        hereBeDragons.innerHTML = "BACK TO SAFETY";
        hereBeDragons.style.backgroundColor = "#248547";

        // Toggle the plus button's color
        incrementIteration.style.backgroundColor = "#A31F34";
    }
    
    // If user clicks "Back To Safety"
    else {
        // Toggle button's text/color
        hereBeDragons.innerHTML = "HERE BE DRAGONS";
        hereBeDragons.style.backgroundColor = "#A31F34";

        // If n > 13, set n to 13 and re-render
        if (n > 13) {
            n = 13;
            iterationNumInput.innerHTML = "13";
            incrementIteration.style.backgroundColor = "#8A8B8C";
            drawDragonCurve(n, renderStyle);
        }
        else if (n == 13) {
            incrementIteration.style.backgroundColor = "#8A8B8C";
        }
    }
    unlimitedRecursionAllowed = !unlimitedRecursionAllowed;
};

// Close the "Here Be Dragons" modal upon clicking the X or clicking outside the popup
closeHereBeDragons.onclick = () => {
    hereBeDragonsModal.style.display = "none";
};
window.addEventListener("click", (event) => {
    if (event.target == hereBeDragonsModal) {
        hereBeDragonsModal.style.display = "none";
    }
});

// Program the "What's This?" modal button
const about = document.getElementById("about");
const aboutModal = document.getElementById("aboutModal");
const closeAbout = document.getElementById("closeAbout");
about.onclick = () => {
    aboutModal.style.display = "block";
};
closeAbout.onclick = () => {
    aboutModal.style.display = "none";
}
window.addEventListener("click", (event) => {
    if (event.target == aboutModal) {
        aboutModal.style.display = "none";
    }
});

// Initial render
window.onload = () => {
    drawDragonCurve(n, renderStyle);
};