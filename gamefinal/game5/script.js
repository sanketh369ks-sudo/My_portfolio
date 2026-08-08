const fileInput = document.getElementById('fileInput');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let currentImageData, imgElement;
let drawing = false;
let startX, startY;

// Load image or video onto the canvas
fileInput.addEventListener('change', (event) => {
    const files = Array.from(event.target.files);
    const file = files[0];
    const url = URL.createObjectURL(file);

    if (file.type.startsWith('image/')) {
        imgElement = new Image();
        imgElement.onload = () => {
            canvas.width = imgElement.width;
            canvas.height = imgElement.height;
            ctx.drawImage(imgElement, 0, 0);
            currentImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            resetFilters(); // Reset filters when a new image is loaded
        };
        imgElement.src = url;
    } else if (file.type.startsWith('video/')) {
        const video = document.createElement('video');
        video.src = url;
        video.addEventListener('loadedmetadata', () => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            video.play();
            drawVideo(video);
        });
    }
});

// Draw video onto the canvas
function drawVideo(video) {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    requestAnimationFrame(() => drawVideo(video));
}

// Color Adjustments
document.getElementById('brightness').addEventListener('input', adjustImageColor);
document.getElementById('contrast').addEventListener('input', adjustImageColor);
document.getElementById('saturation').addEventListener('input', adjustImageColor);

function resetFilters() {
    document.getElementById('brightness').value = 0;
    document.getElementById('contrast').value = 0;
    document.getElementById('saturation').value = 0;
}

function adjustImageColor() {
    if (!imgElement) return;

    const brightness = parseInt(document.getElementById('brightness').value);
    const contrast = parseInt(document.getElementById('contrast').value);
    const saturation = parseInt(document.getElementById('saturation').value);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.filter = `brightness(${brightness + 100}%) contrast(${contrast + 100}%) saturate(${saturation + 100}%)`;
    ctx.drawImage(imgElement, 0, 0, canvas.width, canvas.height);
}

// Freehand Drawing Tool
document.getElementById('draw').addEventListener('mousedown', (e) => {
    drawing = true;
    startX = e.offsetX;
    startY = e.offsetY;
});

canvas.addEventListener('mouseup', () => {
    drawing = false;
    ctx.beginPath();
});

canvas.addEventListener('mousemove', (e) => {
    if (!drawing) return;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'black';

    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
});

// Add Text Tool
document.getElementById('textTool').addEventListener('click', () => {
    const textInput = document.getElementById('textInput');
    textInput.style.display = 'inline';
    textInput.focus();
});

document.getElementById('textInput').addEventListener('blur', (event) => {
    const textOverlay = event.target.value;
    ctx.font = '30px Arial';
    ctx.fillStyle = 'black';
    ctx.fillText(textOverlay, 10, 50);
    event.target.style.display = 'none';
});

// Download functionality
document.getElementById('download').addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'edited_image.png';
    link.href = canvas.toDataURL();
    link.click();
});

// Crop Photo
document.getElementById('cutPhoto').addEventListener('click', () => {
    const croppedData = ctx.getImageData(50, 50, canvas.width - 100, canvas.height - 100); // Adjust crop area
    canvas.width = croppedData.width;
    canvas.height = croppedData.height;
    ctx.putImageData(croppedData, 0, 0);
});

// Resize (basic implementation)
document.getElementById('resize').addEventListener('click', () => {
    const newWidth = prompt("Enter new width:", canvas.width);
    const newHeight = prompt("Enter new height:", canvas.height);
    if (newWidth && newHeight) {
        const resizedData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        canvas.width = newWidth;
        canvas.height = newHeight;
        ctx.putImageData(resizedData, 0, 0);
        ctx.drawImage(canvas, 0, 0, newWidth, newHeight);
    }
});

// Rotate
document.getElementById('rotate').addEventListener('click', () => {
    const rotatedData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = canvas.height; // Change the width to height for a square canvas
    ctx.putImageData(rotatedData, 0, 0);
    ctx.rotate(90 * Math.PI / 180); // Rotate 90 degrees
    ctx.drawImage(rotatedData, 0, 0);
});

// Flip
document.getElementById('flip').addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(-1, 1); // Flip horizontally
    ctx.drawImage(imgElement, -canvas.width, 0);
    ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform
});

// Add Sticker Functionality
document.getElementById('addSticker').addEventListener('click', () => {
    const sticker = new Image();
    sticker.src = 'path/to/your/sticker.png'; // Change this to your sticker path
    sticker.onload = () => {
        ctx.drawImage(sticker, 50, 50, 50, 50); // Adjust position and size as needed
    };
});

// Video Trim Functionality (placeholder)
document.getElementById('trimVideo').addEventListener('click', () => {
    // Implement video trimming logic here
});

// Add Music Functionality (placeholder)
document.getElementById('addMusic').addEventListener('click', () => {
    // Implement adding music to video here
});

// Face Swap Functionality (placeholder)
document.getElementById('faceSwap').addEventListener('click', () => {
    // Implement face swapping logic here
});
