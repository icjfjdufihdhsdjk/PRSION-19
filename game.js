const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");


// ======================================================
// CONFIGURATION
// ======================================================

let width = 0;
let height = 0;

const WORLD = {
    width: 1200,
    height: 720
};


// ======================================================
// CAMERA
// ======================================================

const camera = {
    x: 0,
    y: 0,
    zoom: 0.9
};

let dragging = false;

let mouse = {
    x: 0,
    y: 0
};


// ======================================================
// REDIMENSIONNEMENT
// ======================================================

function resizeCanvas() {

    const ratio = window.devicePixelRatio || 1;

    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = width * ratio;
    canvas.height = height * ratio;

    canvas.style.width = width + "px";
    canvas.style.height = height + "px";

    ctx.setTransform(
        ratio,
        0,
        0,
        ratio,
        0,
        0
    );
}

window.addEventListener(
    "resize",
    resizeCanvas
);

resizeCanvas();


// ======================================================
// SOURIS
// ======================================================

canvas.addEventListener(
    "mousedown",
    (event) => {

        dragging = true;

        mouse.x = event.clientX;
        mouse.y = event.clientY;
    }
);

window.addEventListener(
    "mouseup",
    () => {

        dragging = false;
    }
);

window.addEventListener(
    "mousemove",
    (event) => {

        if (!dragging) {
            return;
        }

        const dx = event.clientX - mouse.x;
        const dy = event.clientY - mouse.y;

        camera.x += dx / camera.zoom;
        camera.y += dy / camera.zoom;

        mouse.x = event.clientX;
        mouse.y = event.clientY;
    }
);


// ======================================================
// ZOOM
// ======================================================

canvas.addEventListener(
    "wheel",
    (event) => {

        event.preventDefault();

        const oldZoom = camera.zoom;

        camera.zoom -= event.deltaY * 0.001;

        camera.zoom = Math.max(
            0.55,
            Math.min(1.65, camera.zoom)
        );

        const zoomRatio =
            camera.zoom / oldZoom;

        camera.x *= zoomRatio;
        camera.y *= zoomRatio;
    },
    { passive: false }
);


// ======================================================
// COORDONNÉES
// ======================================================

function sx(x) {

    return (
        width / 2 +
        (x + camera.x) * camera.zoom
    );
}

function sy(y) {

    return (
        height / 2 +
        (y + camera.y) * camera.zoom
    );
}


// ======================================================
// OUTILS DE DESSIN
// ======================================================

function rect(
    x,
    y,
    w,
    h,
    color
) {

    ctx.fillStyle = color;

    ctx.fillRect(
        sx(x),
        sy(y),
        w * camera.zoom,
        h * camera.zoom
    );
}


function line(
    x1,
    y1,
    x2,
    y2,
    color,
    thickness = 1
) {

    ctx.beginPath();

    ctx.moveTo(
        sx(x1),
        sy(y1)
    );

    ctx.lineTo(
        sx(x2),
        sy(y2)
    );

    ctx.strokeStyle = color;

    ctx.lineWidth =
        thickness * camera.zoom;

    ctx.stroke();
}


function polygon(
    points,
    color,
    stroke = null
) {

    ctx.beginPath();

    points.forEach(
        (point, index) => {

            const x = sx(point.x);
            const y = sy(point.y);

            if (index === 0) {

                ctx.moveTo(x, y);

            } else {

                ctx.lineTo(x, y);
            }
        }
    );

    ctx.closePath();

    ctx.fillStyle = color;
    ctx.fill();

    if (stroke) {

        ctx.strokeStyle = stroke;
        ctx.lineWidth =
            2 * camera.zoom;

        ctx.stroke();
    }
}


// ======================================================
// SOL
// ======================================================

function drawFloor() {

    rect(
        -600,
        -360,
        WORLD.width,
        WORLD.height,
        "#555b5e"
    );


    // bandes de carrelage

    for (
        let x = -600;
        x <= 600;
        x += 40
    ) {

        line(
            x,
            -360,
            x,
            360,
            "#4a4f52",
            1
        );
    }


    for (
        let y = -360;
        y <= 360;
        y += 40
    ) {

        line(
            -600,
            y,
            600,
            y,
            "#4a4f52",
            1
        );
    }


    // quelques dalles légèrement différentes

    for (
        let x = -560;
        x < 560;
        x += 80
    ) {

        for (
            let y = -320;
            y < 320;
            y += 80
        ) {

            if (
                ((x + y) / 80) % 3 === 0
            ) {

                rect(
                    x + 2,
                    y + 2,
                    36,
                    36,
                    "#585e61"
                );
            }
        }
    }
}


// ======================================================
// MURS
// ======================================================

function wall(
    x,
    y,
    w,
    h,
    height = 34
) {

    // face du mur

    rect(
        x,
        y,
        w,
        h,
        "#25282a"
    );


    // partie supérieure

    polygon(
        [
            { x: x, y: y },
            { x: x + w, y: y },
            { x: x + w, y: y - height },
            { x: x, y: y - height }
        ],
        "#3b3f41",
        "#17191a"
    );


    // ligne lumineuse

    line(
        x,
        y - height,
        x + w,
        y - height,
        "#555a5d",
        2
    );
}


// ======================================================
// MURS DE L'ACCUEIL
// ======================================================

function drawWalls() {

    // mur du haut

    wall(
        -600,
        -360,
        1200,
        30
    );


    // mur gauche

    wall(
        -600,
        -360,
        30,
        720
    );


    // mur droit

    wall(
        570,
        -360,
        30,
        720
    );


    // mur du bas

    wall(
        -600,
        330,
        1200,
        30
    );


    // ouverture vers la prochaine pièce

    rect(
        -100,
        -370,
        200,
        45,
        "#101214"
    );


    // cadre de porte

    rect(
        -110,
        -365,
        10,
        50,
        "#151719"
    );

    rect(
        100,
        -365,
        10,
        50,
        "#151719"
    );
}


// ======================================================
// COMPTOIR
// ======================================================

function drawDesk() {

    const x = -270;
    const y = -20;
    const w = 540;
    const h = 75;


    // dessus

    polygon(
        [
            { x: x, y: y },
            { x: x + w, y: y },
            { x: x + w, y: y + h },
            { x: x, y: y + h }
        ],
        "#51443a",
        "#211c19"
    );


    // façade

    rect(
        x,
        y + h,
        w,
        45,
        "#302925"
    );


    // bande décorative

    rect(
        x,
        y + h,
        w,
        5,
        "#6c5a4d"
    );


    // panneaux

    for (
        let i = 0;
        i < 4;
        i++
    ) {

        rect(
            x + 25 + i * 130,
            y + h + 12,
            100,
            22,
            "#27211e"
        );
    }


    // plaque ACCUEIL

    rect(
        -100,
        y + h + 8,
        200,
        30,
        "#1b1c1d"
    );


    ctx.fillStyle = "#d6d8d9";

    ctx.font =
        "bold " +
        Math.max(10, 13 * camera.zoom) +
        "px Arial";

    ctx.textAlign = "center";

    ctx.fillText(
        "ACCUEIL",
        sx(0),
        sy(y + h + 29)
    );
}


// ======================================================
// ORDINATEUR
// ======================================================

function computer(
    x,
    y
) {

    // écran

    rect(
        x,
        y,
        55,
        35,
        "#17191a"
    );

    rect(
        x + 5,
        y + 5,
        45,
        24,
        "#405258"
    );


    // écran lumineux

    rect(
        x + 9,
        y + 9,
        37,
        3,
        "#788d91"
    );

    rect(
        x + 9,
        y + 16,
        24,
        3,
        "#667b7f"
    );


    // pied

    rect(
        x + 23,
        y + 35,
        9,
        10,
        "#1c1d1e"
    );


    // clavier

    rect(
        x - 5,
        y + 45,
        65,
        15,
        "#222426"
    );
}


// ======================================================
// ORDINATEURS DE L'ACCUEIL
// ======================================================

function drawComputers() {

    computer(
        -205,
        -5
    );

    computer(
        150,
        -5
    );
}


// ======================================================
// CHAISES
// ======================================================

function chair(
    x,
    y
) {

    // dossier

    rect(
        x,
        y,
        28,
        30,
        "#303335"
    );


    // assise

    rect(
        x - 3,
        y + 28,
        34,
        10,
        "#222527"
    );


    // pieds

    rect(
        x + 2,
        y + 38,
        5,
        15,
        "#1b1d1e"
    );

    rect(
        x + 24,
        y + 38,
        5,
        15,
        "#1b1d1e"
    );
}


function drawChairs() {

    chair(
        -195,
        75
    );

    chair(
        160,
        75
    );
}


// ======================================================
// BANC D'ATTENTE
// ======================================================

function drawBench() {

    const x = -420;
    const y = 120;


    rect(
        x,
        y,
        250,
        35,
        "#38302b"
    );


    rect(
        x,
        y - 45,
        250,
        45,
        "#433a34"
    );


    rect(
        x,
        y - 8,
        250,
        8,
        "#594b42"
    );


    // pieds

    rect(
        x + 20,
        y + 35,
        12,
        30,
        "#211d1b"
    );

    rect(
        x + 218,
        y + 35,
        12,
        30,
        "#211d1b"
    );
}


// ======================================================
// PLANTE
// ======================================================

function drawPlant(
    x,
    y
) {

    // pot

    polygon(
        [
            { x: x, y: y },
            { x: x + 45, y: y },
            { x: x + 38, y: y + 50 },
            { x: x + 8, y: y + 50 }
        ],
        "#4b3930",
        "#29201d"
    );


    // feuilles

    rect(
        x + 20,
        y - 60,
        7,
        65,
        "#37483d"
    );

    rect(
        x + 4,
        y - 42,
        25,
        9,
        "#3f5747"
    );

    rect(
        x + 22,
        y - 52,
        28,
        10,
        "#405a49"
    );

    rect(
        x + 2,
        y - 62,
        25,
        9,
        "#48604e"
    );
}


// ======================================================
// CASIERS
// ======================================================

function drawLockers() {

    const x = 330;
    const y = -250;

    for (
        let i = 0;
        i < 6;
        i++
    ) {

        rect(
            x + i * 42,
            y,
            36,
            105,
            "#34383a"
        );


        rect(
            x + i * 42 + 5,
            y + 7,
            26,
            75,
            "#292d2f"
        );


        rect(
            x + i * 42 + 25,
            y + 42,
            5,
            5,
            "#8a8e8f"
        );
    }
}


// ======================================================
// DÉCORATION MURALE
// ======================================================

function drawWallPanel() {

    const x = -470;
    const y = -245;


    rect(
        x,
        y,
        230,
        105,
        "#202325"
    );


    rect(
        x + 10,
        y + 10,
        210,
        85,
        "#34393b"
    );


    // lignes du plan

    line(
        x + 25,
        y + 25,
        x + 190,
        y + 25,
        "#606668",
        2
    );

    line(
        x + 25,
        y + 45,
        x + 150,
        y + 45,
        "#555b5d",
        2
    );

    line(
        x + 25,
        y + 65,
        x + 175,
        y + 65,
        "#555b5d",
        2
    );


    ctx.fillStyle = "#bfc3c5";

    ctx.font =
        "bold " +
        Math.max(8, 11 * camera.zoom) +
        "px Arial";

    ctx.textAlign = "left";

    ctx.fillText(
        "PLAN DU COMPLEXE",
        sx(x + 18),
        sy(y + 90)
    );
}


// ======================================================
// PORTES
// ======================================================

function drawDoor(
    x,
    y,
    w,
    label
) {

    rect(
        x,
        y,
        w,
        30,
        "#121415"
    );


    rect(
        x - 8,
        y - 5,
        8,
        40,
        "#272a2c"
    );

    rect(
        x + w,
        y - 5,
        8,
        40,
        "#272a2c"
    );


    ctx.fillStyle = "#aaa";

    ctx.font =
        Math.max(7, 10 * camera.zoom) +
        "px Arial";

    ctx.textAlign = "center";

    ctx.fillText(
        label,
        sx(x + w / 2),
        sy(y + 19)
    );
}


// ======================================================
// PETITE TABLE
// ======================================================

function drawTable(
    x,
    y
) {

    rect(
        x,
        y,
        120,
        70,
        "#39302b"
    );

    rect(
        x + 8,
        y + 8,
        104,
        54,
        "#493c34"
    );


    // pieds

    rect(
        x + 12,
        y + 70,
        10,
        25,
        "#211d1b"
    );

    rect(
        x + 98,
        y + 70,
        10,
        25,
        "#211d1b"
    );
}


// ======================================================
// OBJETS SUR LA TABLE
// ======================================================

function drawTableObjects() {

    // lampe

    rect(
        -380,
        220,
        15,
        35,
        "#222527"
    );

    rect(
        -395,
        210,
        45,
        15,
        "#555b5d"
    );


    // papiers

    rect(
        -330,
        230,
        35,
        25,
        "#c1c2bd"
    );


    // petit écran

    rect(
        -280,
        220,
        40,
        30,
        "#181b1c"
    );

    rect(
        -275,
        225,
        30,
        20,
        "#46595d"
    );
}


// ======================================================
// TEXTE DANS LE MONDE
// ======================================================

function worldText(
    text,
    x,
    y,
    size = 14
) {

    ctx.fillStyle = "#d5d7d8";

    ctx.font =
        "bold " +
        Math.max(8, size * camera.zoom) +
        "px Arial";

    ctx.textAlign = "center";

    ctx.fillText(
        text,
        sx(x),
        sy(y)
    );
}


// ======================================================
// DESSIN DU MONDE
// ======================================================

function drawWorld() {

    // fond

    ctx.fillStyle = "#101214";

    ctx.fillRect(
        0,
        0,
        width,
        height
    );


    // sol

    drawFloor();


    // murs

    drawWalls();


    // éléments muraux

    drawWallPanel();

    drawLockers();


    // zone accueil

    drawDesk();

    drawComputers();

    drawChairs();


    // attente

    drawBench();


    // plantes

    drawPlant(
        430,
        170
    );

    drawPlant(
        -500,
        170
    );


    // table

    drawTable(
        -430,
        210
    );

    drawTableObjects();


    // portes

    drawDoor(
        -100,
        -355,
        200,
        "ENTRÉE DU COMPLEXE"
    );


    // indications

    worldText(
        "ACCUEIL",
        0,
        -125,
        18
    );

    worldText(
        "ZONE ADMINISTRATIVE",
        350,
        125,
        11
    );
}


// ======================================================
// BOUCLE
// ======================================================

function loop() {

    drawWorld();

    requestAnimationFrame(loop);
}


loop();
