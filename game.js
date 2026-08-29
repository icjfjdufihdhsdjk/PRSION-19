const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let width;
let height;

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}

window.addEventListener("resize", resize);
resize();


// ==========================
// CAMÉRA
// ==========================

let camera = {
    x: 0,
    y: 0,
    zoom: 1
};

let dragging = false;
let lastMouse = {
    x: 0,
    y: 0
};

canvas.addEventListener("mousedown", (event) => {
    dragging = true;

    lastMouse.x = event.clientX;
    lastMouse.y = event.clientY;
});

window.addEventListener("mouseup", () => {
    dragging = false;
});

window.addEventListener("mousemove", (event) => {

    if (!dragging) return;

    const dx = event.clientX - lastMouse.x;
    const dy = event.clientY - lastMouse.y;

    camera.x += dx;
    camera.y += dy;

    lastMouse.x = event.clientX;
    lastMouse.y = event.clientY;
});

canvas.addEventListener("wheel", (event) => {

    event.preventDefault();

    camera.zoom -= event.deltaY * 0.001;

    camera.zoom = Math.max(0.6, Math.min(2, camera.zoom));
});


// ==========================
// OUTILS
// ==========================

function screenX(x) {
    return width / 2 + (x + camera.x) * camera.zoom;
}

function screenY(y) {
    return height / 2 + (y + camera.y) * camera.zoom;
}

function polygon(points, fill) {

    ctx.beginPath();

    points.forEach((point, index) => {

        const x = screenX(point.x);
        const y = screenY(point.y);

        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });

    ctx.closePath();

    ctx.fillStyle = fill;
    ctx.fill();

    ctx.strokeStyle = "#202020";
    ctx.lineWidth = 2;
    ctx.stroke();
}


// ==========================
// SOL
// ==========================

function drawFloor() {

    const floor = [
        { x: -500, y: -300 },
        { x: 500, y: -300 },
        { x: 500, y: 300 },
        { x: -500, y: 300 }
    ];

    polygon(floor, "#777");
}


// ==========================
// CARRELAGE
// ==========================

function drawTiles() {

    for (let x = -500; x < 500; x += 50) {

        ctx.beginPath();

        ctx.moveTo(
            screenX(x),
            screenY(-300)
        );

        ctx.lineTo(
            screenX(x),
            screenY(300)
        );

        ctx.strokeStyle = "#666";
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    for (let y = -300; y < 300; y += 50) {

        ctx.beginPath();

        ctx.moveTo(
            screenX(-500),
            screenY(y)
        );

        ctx.lineTo(
            screenX(500),
            screenY(y)
        );

        ctx.strokeStyle = "#666";
        ctx.lineWidth = 1;
        ctx.stroke();
    }
}


// ==========================
// MURS
// ==========================

function drawWall(x, y, w, h) {

    // dessus
    polygon([
        { x: x, y: y },
        { x: x + w, y: y },
        { x: x + w, y: y + h },
        { x: x, y: y + h }
    ], "#444");

    // mur vertical
    const wallHeight = 35;

    polygon([
        { x: x, y: y },
        { x: x + w, y: y },
        { x: x + w, y: y - wallHeight },
        { x: x, y: y - wallHeight }
    ], "#292929");
}


// ==========================
// COMPTOIR
// ==========================

function drawReceptionDesk() {

    const x = -130;
    const y = -40;
    const w = 260;
    const h = 70;

    polygon([
        { x: x, y: y },
        { x: x + w, y: y },
        { x: x + w, y: y + h },
        { x: x, y: y + h }
    ], "#3d3028");

    // façade
    const height = 25;

    polygon([
        { x: x, y: y + h },
        { x: x + w, y: y + h },
        { x: x + w, y: y + h + height },
        { x: x, y: y + h + height }
    ], "#29211c");

    // panneau
    ctx.fillStyle = "#ddd";
    ctx.font = "bold 13px Arial";
    ctx.textAlign = "center";

    ctx.fillText(
        "ACCUEIL",
        screenX(x + w / 2),
        screenY(y + h + 17)
    );
}


// ==========================
// ORDINATEUR
// ==========================

function drawComputer() {

    const x = 20;
    const y = -15;

    ctx.fillStyle = "#1c1c1c";

    ctx.fillRect(
        screenX(x),
        screenY(y),
        45 * camera.zoom,
        30 * camera.zoom
    );

    ctx.fillStyle = "#4d6b72";

    ctx.fillRect(
        screenX(x + 5),
        screenY(y + 5),
        35 * camera.zoom,
        20 * camera.zoom
    );

    ctx.fillStyle = "#222";

    ctx.fillRect(
        screenX(x + 18),
        screenY(y + 30),
        10 * camera.zoom,
        10 * camera.zoom
    );
}


// ==========================
// PORTE
// ==========================

function drawDoor(x, y, w, h) {

    polygon([
        { x: x, y: y },
        { x: x + w, y: y },
        { x: x + w, y: y + h },
        { x: x, y: y + h }
    ], "#171717");

    ctx.fillStyle = "#aaa";
    ctx.font = "11px Arial";
    ctx.textAlign = "center";

    ctx.fillText(
        "ACCÈS",
        screenX(x + w / 2),
        screenY(y + h / 2 + 4)
    );
}


// ==========================
// PANNEAU
// ==========================

function drawSign() {

    const x = -80;
    const y = -180;

    ctx.fillStyle = "#222";

    ctx.fillRect(
        screenX(x),
        screenY(y),
        160 * camera.zoom,
        45 * camera.zoom
    );

    ctx.fillStyle = "#eee";

    ctx.font = "bold 12px Arial";
    ctx.textAlign = "center";

    ctx.fillText(
        "ADMINISTRATION",
        screenX(x + 80),
        screenY(y + 27)
    );
}


// ==========================
// DESSIN PRINCIPAL
// ==========================

function draw() {

    ctx.clearRect(0, 0, width, height);

    // arrière-plan
    ctx.fillStyle = "#151515";
    ctx.fillRect(0, 0, width, height);

    // monde
    drawFloor();
    drawTiles();

    // murs
    drawWall(-500, -300, 1000, 25);
    drawWall(-500, 275, 1000, 25);
    drawWall(-500, -300, 25, 600);
    drawWall(475, -300, 25, 600);

    // porte
    drawDoor(-40, -300, 80, 25);

    // mobilier
    drawReceptionDesk();
    drawComputer();

    // panneau
    drawSign();

    requestAnimationFrame(draw);
}

draw();
