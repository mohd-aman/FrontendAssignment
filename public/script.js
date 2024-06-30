const canvas = document.getElementById('whiteboard');
const context = canvas.getContext('2d');
const colorPicker = document.getElementById('colorPicker');
const penTool = document.getElementById('penTool');
const eraserTool = document.getElementById('eraserTool');
const clearCanvasButton = document.getElementById('clearCanvas');
const downloadImageButton = document.getElementById('downloadImage');

let drawing = false;
let currentColor = '#000000';
let currentTool = 'pen';
let ws;

function connectWebSocket() {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    ws = new WebSocket(`${wsProtocol}://${window.location.host}`);

    ws.onopen = () => {
        console.log('WebSocket connection established');
    };

    ws.onmessage = (event) => {
        const reader = new FileReader();
        reader.onload = function() {
            const message = JSON.parse(reader.result);
            if (message.clear) {
                context.clearRect(0, 0, canvas.width, canvas.height);
            } else {
                draw(message.x, message.y, message.color, false, message.tool);
            }
        };
        reader.readAsText(event.data);
    };

    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
        console.log('WebSocket connection closed. Reconnecting...');
        setTimeout(connectWebSocket, 1000); // Attempt to reconnect every second
    };
}

connectWebSocket();

canvas.addEventListener('mousedown', (e) => {
    drawing = true;
    draw(e.offsetX, e.offsetY, currentColor, true, currentTool);
});

canvas.addEventListener('mousemove', (e) => {
    if (drawing) {
        draw(e.offsetX, e.offsetY, currentColor, true, currentTool);
    }
});

canvas.addEventListener('mouseup', () => {
    drawing = false;
    context.beginPath();
});

colorPicker.addEventListener('input', (e) => {
    currentColor = e.target.value;
});

penTool.addEventListener('click', () => {
    currentTool = 'pen';
});

eraserTool.addEventListener('click', () => {
    currentTool = 'eraser';
});

clearCanvasButton.addEventListener('click', () => {
    clearCanvas();
});

downloadImageButton.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'whiteboard.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
});

function draw(x, y, color, send = true, tool = 'pen') {
    if (send && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ x, y, color, tool }));
    }

    context.strokeStyle = tool === 'eraser' ? '#FFFFFF' : color;
    context.lineWidth = tool === 'eraser' ? 10 : 2;
    context.lineTo(x, y);
    context.stroke();
    context.beginPath();
    context.moveTo(x, y);
}

function clearCanvas() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ clear: true }));
    }
}