"use strict";

const canvas = document.getElementById("world");
const stage = document.getElementById("stage");
const context = canvas.getContext("2d");
const clock = document.getElementById("clock");
const zoomValue = document.getElementById("zoom-value");
const card = document.getElementById("card");
const cardName = document.getElementById("card-name");
const cardRole = document.getElementById("card-role");
const cardDescription = document.getElementById("card-description");
const cardActivity = document.getElementById("card-activity");

const WORLD = { width: 1600, height: 1000 };
const CYCLE = 110;
const background = new Image();
const atlas = new Image();
background.src = "./assets/reception.png";
atlas.src = "./assets/characters.png";

const camera = { x: 800, y: 500, zoom: 0.75 };
const pointer = { active: false, moved: false, x: 0, y: 0 };
let showLabels = false;
let selectedId = null;
let spriteCrops = null;
let frames = [];
const startedAt = performance.now();

const characters = [
  {
    id: "luc-arven",
    name: "Luc Arven",
    role: "Agent des admissions",
    description: "Il saisit chaque entrée sans jamais quitter le sas des yeux.",
    row: 0,
    height: 106,
    fixed: { x: 1068, y: 536 },
    clipY: 500,
    routine: [
      { at: 0, x: 1068, y: 536, activity: "Saisit un dossier d’admission" },
      { at: 28, x: 1068, y: 536, activity: "Vérifie une pièce d’identité" },
      { at: 55, x: 1068, y: 536, activity: "Consulte l’écran de contrôle" },
      { at: 84, x: 1068, y: 536, activity: "Prépare le prochain dossier" }
    ]
  },
  {
    id: "aya-lin",
    name: "Aya Lin",
    role: "Agente administrative",
    description: "Elle coordonne les autorisations avec le greffe depuis le second poste.",
    row: 1,
    height: 106,
    fixed: { x: 1258, y: 542 },
    clipY: 505,
    routine: [
      { at: 0, x: 1258, y: 542, activity: "Tape une autorisation d’accès" },
      { at: 25, x: 1258, y: 542, activity: "Répond au téléphone interne" },
      { at: 51, x: 1258, y: 542, activity: "Compare deux dossiers" },
      { at: 82, x: 1258, y: 542, activity: "Prépare un badge temporaire" }
    ]
  },
  {
    id: "elias-venn",
    name: "Elias Venn",
    role: "Agent de contrôle",
    description: "Il surveille le sas et accompagne les visiteurs pendant le contrôle.",
    row: 2,
    height: 112,
    routine: [
      { at: 0, x: 420, y: 650, activity: "Teste le détecteur manuel" },
      { at: 22, x: 365, y: 720, activity: "Surveille l’entrée" },
      { at: 46, x: 520, y: 720, activity: "Vérifie les objets consignés" },
      { at: 73, x: 620, y: 670, activity: "Contrôle le portique" },
      { at: 94, x: 420, y: 650, activity: "Renseigne la main courante" }
    ]
  },
  {
    id: "milo-serr",
    name: "Milo Serr",
    role: "Visiteur convoqué",
    description: "Il découvre la procédure et vérifie chaque indication avant d’avancer.",
    row: 3,
    height: 108,
    routine: [
      { at: 0, x: 850, y: 828, activity: "Entre dans l’accueil" },
      { at: 22, x: 808, y: 734, activity: "Cherche le bon guichet" },
      { at: 44, x: 579, y: 640, activity: "Passe sous le portique" },
      { at: 68, x: 860, y: 677, activity: "Présente ses documents" },
      { at: 92, x: 881, y: 739, activity: "Attend son badge" }
    ]
  },
  {
    id: "nima-rook",
    name: "Dr Nima Rook",
    role: "Médecin visiteuse",
    description: "Appelée à l’infirmerie, elle attend sur la première rangée.",
    row: 4,
    height: 96,
    fixed: { x: 904, y: 792 },
    routine: [
      { at: 0, x: 904, y: 792, activity: "Relit son ordre de mission" },
      { at: 31, x: 904, y: 792, activity: "Observe le guichet" },
      { at: 58, x: 904, y: 792, activity: "Consulte sa montre" },
      { at: 86, x: 904, y: 792, activity: "Attend qu’on l’appelle" }
    ]
  },
  {
    id: "juno-vale",
    name: "Juno Vale",
    role: "Agent de maintenance",
    description: "Il entretient les passages publics sans interrompre les contrôles.",
    row: 5,
    height: 110,
    routine: [
      { at: 0, x: 1400, y: 803, activity: "Range le chariot d’entretien" },
      { at: 23, x: 1365, y: 724, activity: "Nettoie le passage latéral" },
      { at: 48, x: 1300, y: 700, activity: "Ramasse un papier oublié" },
      { at: 72, x: 1335, y: 622, activity: "Inspecte une grille au sol" },
      { at: 94, x: 1400, y: 803, activity: "Revient près du chariot" }
    ]
  }
];

function clamp(value, minimum, maximum) {
  return Math.max(minimum, Math.min(maximum, value));
}

function smooth(value) {
  return value * value * (3 - 2 * value);
}

function loadImage(image) {
  return new Promise(function (resolve, reject) {
    if (image.complete && image.naturalWidth) resolve(image);
    else {
      image.addEventListener("load", function () { resolve(image); }, { once: true });
      image.addEventListener("error", reject, { once: true });
    }
  });
}

function prepareSpriteCrops() {
  const columns = 4;
  const rows = 6;
  const cellWidth = atlas.naturalWidth / columns;
  const cellHeight = atlas.naturalHeight / rows;
  const helper = document.createElement("canvas");
  helper.width = atlas.naturalWidth;
  helper.height = atlas.naturalHeight;
  const helperContext = helper.getContext("2d", { willReadFrequently: true });
  const result = [];

  try {
    helperContext.drawImage(atlas, 0, 0);
    for (let row = 0; row < rows; row += 1) {
      const rowResult = [];
      for (let column = 0; column < columns; column += 1) {
        const startX = Math.floor(column * cellWidth);
        const startY = Math.floor(row * cellHeight);
        const width = Math.ceil(cellWidth);
        const height = Math.ceil(cellHeight);
        const pixels = helperContext.getImageData(startX, startY, width, height).data;
        let minX = width;
        let minY = height;
        let maxX = -1;
        let maxY = -1;

        for (let y = 0; y < height; y += 1) {
          for (let x = 0; x < width; x += 1) {
            if (pixels[(y * width + x) * 4 + 3] > 24) {
              minX = Math.min(minX, x);
              minY = Math.min(minY, y);
              maxX = Math.max(maxX, x);
              maxY = Math.max(maxY, y);
            }
          }
        }

        if (maxX >= minX) {
          rowResult.push({
            x: startX + Math.max(0, minX - 2),
            y: startY + Math.max(0, minY - 2),
            width: Math.min(width, maxX - minX + 5),
            height: Math.min(height, maxY - minY + 5)
          });
        } else {
          rowResult.push({ x: startX, y: startY, width: width, height: height });
        }
      }
      result.push(rowResult);
    }
  } catch (error) {
    for (let row = 0; row < rows; row += 1) {
      result.push([]);
      for (let column = 0; column < columns; column += 1) {
        result[row].push({
          x: column * cellWidth,
          y: row * cellHeight,
          width: cellWidth,
          height: cellHeight
        });
      }
    }
  }

  return result;
}

function characterFrame(character, time) {
  const routine = character.routine;
  let index = routine.length - 1;
  for (let i = 0; i < routine.length; i += 1) {
    if (routine[i].at <= time) index = i;
  }

  const current = routine[index];
  const next = routine[(index + 1) % routine.length];
  const nextAt = index === routine.length - 1 ? next.at + CYCLE : next.at;
  const normalized = time < current.at ? time + CYCLE : time;
  const travelDuration = 7;
  const distance = Math.hypot(next.x - current.x, next.y - current.y);
  const moving = distance > 1 && normalized >= nextAt - travelDuration;
  const progress = moving ? smooth(clamp((normalized - (nextAt - travelDuration)) / travelDuration, 0, 1)) : 0;

  return {
    character: character,
    x: character.fixed ? character.fixed.x : current.x + (next.x - current.x) * progress,
    y: character.fixed ? character.fixed.y : current.y + (next.y - current.y) * progress,
    moving: moving,
    activity: moving ? "Se déplace — " + next.activity.toLowerCase() : current.activity
  };
}

function drawLabel(frame, top) {
  if (!showLabels && selectedId !== frame.character.id) return;
  context.font = "700 10px Courier New";
  const width = Math.max(74, context.measureText(frame.character.name).width + 16);
  context.fillStyle = "rgba(252,250,230,.94)";
  context.fillRect(Math.round(frame.x - width / 2), Math.round(top - 19), Math.round(width), 15);
  context.fillStyle = "#3f6265";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(frame.character.name, Math.round(frame.x), Math.round(top - 11));
}

function drawCharacter(frame, elapsed) {
  if (!spriteCrops) return;
  const spriteIndex = Math.floor(elapsed * (frame.moving ? 7 : 2.2) + frame.character.row) % 4;
  const crop = spriteCrops[frame.character.row][spriteIndex];
  const height = frame.character.height;
  const width = height * crop.width / crop.height;
  const top = frame.y - height - (frame.moving ? Math.floor(elapsed * 7) % 2 : 0);

  if (selectedId === frame.character.id) {
    context.strokeStyle = "#df6554";
    context.setLineDash([4, 3]);
    context.beginPath();
    context.ellipse(frame.x, frame.y + 2, 22, 10, .45, 0, Math.PI * 2);
    context.stroke();
    context.setLineDash([]);
  }

  context.save();
  if (frame.character.clipY !== undefined) {
    context.beginPath();
    context.rect(frame.x - width / 2 - 4, top - 4, width + 8, frame.character.clipY - top + 4);
    context.clip();
  }
  context.drawImage(atlas, crop.x, crop.y, crop.width, crop.height, frame.x - width / 2, top, width, height);
  context.restore();
  drawLabel(frame, top);
}

function drawMicroAnimations(elapsed) {
  const blink = Math.floor(elapsed * 4) % 12;
  context.fillStyle = blink ? "#63c891" : "#e45d58";
  context.fillRect(1027, 406, 3, 3);
  const pulse = 12 + Math.sin(elapsed * 2.7) * 5;
  context.fillStyle = "rgba(92,214,191,.7)";
  context.fillRect(1136, 441, pulse, 2);
  context.fillRect(1271, 458, 17 - pulse / 3, 2);
}

function resize() {
  const bounds = stage.getBoundingClientRect();
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(bounds.width * ratio);
  canvas.height = Math.round(bounds.height * ratio);
  resetCamera();
}

function resetCamera() {
  const bounds = stage.getBoundingClientRect();
  camera.x = 800;
  camera.y = 500;
  camera.zoom = clamp(Math.min(bounds.width / 1500, bounds.height / 940), .42, 1.05);
  zoomValue.value = Math.round(camera.zoom * 100) + "%";
}

function setZoom(value, focal) {
  const oldZoom = camera.zoom;
  const nextZoom = clamp(value, .38, 1.8);
  if (focal) {
    camera.x = focal.x - (focal.x - camera.x) * oldZoom / nextZoom;
    camera.y = focal.y - (focal.y - camera.y) * oldZoom / nextZoom;
  }
  camera.zoom = nextZoom;
  zoomValue.value = Math.round(nextZoom * 100) + "%";
}

function screenToWorld(clientX, clientY) {
  const bounds = canvas.getBoundingClientRect();
  return {
    x: (clientX - bounds.left - bounds.width / 2) / camera.zoom + camera.x,
    y: (clientY - bounds.top - bounds.height / 2) / camera.zoom + camera.y
  };
}

function updateCard() {
  if (!selectedId) return;
  const frame = frames.find(function (item) { return item.character.id === selectedId; });
  if (!frame) return;
  cardName.textContent = frame.character.name;
  cardRole.textContent = frame.character.role;
  cardDescription.textContent = frame.character.description;
  cardActivity.textContent = frame.activity;
  card.hidden = false;
}

function render(now) {
  const elapsed = (now - startedAt) / 1000;
  const cycleTime = elapsed % CYCLE;
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const width = canvas.width / ratio;
  const height = canvas.height / ratio;
  frames = characters.map(function (character) { return characterFrame(character, cycleTime); });

  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  context.imageSmoothingEnabled = false;
  context.clearRect(0, 0, width, height);
  context.save();
  context.translate(width / 2, height / 2);
  context.scale(camera.zoom, camera.zoom);
  context.translate(-camera.x, -camera.y);
  context.fillStyle = "#c9dfdc";
  context.fillRect(0, 0, WORLD.width, WORLD.height);
  if (background.complete && background.naturalWidth) context.drawImage(background, 32, -12);
  drawMicroAnimations(elapsed);

  frames
    .slice()
    .sort(function (a, b) { return a.y - b.y; })
    .forEach(function (frame) { drawCharacter(frame, elapsed); });
  context.restore();

  const minutes = 6 * 60 + 38 + Math.floor(elapsed * .55);
  const hours = Math.floor(minutes / 60) % 24;
  clock.textContent = String(hours).padStart(2, "0") + ":" + String(minutes % 60).padStart(2, "0");
  updateCard();
  requestAnimationFrame(render);
}

canvas.addEventListener("pointerdown", function (event) {
  canvas.setPointerCapture(event.pointerId);
  pointer.active = true;
  pointer.moved = false;
  pointer.x = event.clientX;
  pointer.y = event.clientY;
});

canvas.addEventListener("pointermove", function (event) {
  if (!pointer.active) return;
  const dx = event.clientX - pointer.x;
  const dy = event.clientY - pointer.y;
  if (Math.abs(dx) + Math.abs(dy) > 2) pointer.moved = true;
  camera.x = clamp(camera.x - dx / camera.zoom, 180, 1420);
  camera.y = clamp(camera.y - dy / camera.zoom, 80, 920);
  pointer.x = event.clientX;
  pointer.y = event.clientY;
});

canvas.addEventListener("pointerup", function (event) {
  pointer.active = false;
  if (pointer.moved) return;
  const point = screenToWorld(event.clientX, event.clientY);
  const hit = frames
    .slice()
    .reverse()
    .find(function (frame) {
      return Math.hypot(frame.x - point.x, frame.y - frame.character.height * .5 - point.y) < 50;
    });
  if (hit) {
    selectedId = hit.character.id;
    updateCard();
  }
});

canvas.addEventListener("wheel", function (event) {
  event.preventDefault();
  setZoom(camera.zoom * (event.deltaY > 0 ? .9 : 1.1), screenToWorld(event.clientX, event.clientY));
}, { passive: false });

document.getElementById("zoom-out").addEventListener("click", function () { setZoom(camera.zoom * .86); });
document.getElementById("zoom-in").addEventListener("click", function () { setZoom(camera.zoom * 1.16); });
document.getElementById("reset").addEventListener("click", resetCamera);
document.getElementById("labels").addEventListener("click", function () { showLabels = !showLabels; });
document.getElementById("close-card").addEventListener("click", function () {
  selectedId = null;
  card.hidden = true;
});

window.addEventListener("resize", resize);
resize();
Promise.all([loadImage(background), loadImage(atlas)])
  .then(function () {
    spriteCrops = prepareSpriteCrops();
    requestAnimationFrame(render);
  })
  .catch(function () {
    requestAnimationFrame(render);
  });
