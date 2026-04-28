/* ============================================
   game.js - מפה ותנועה משולבת עם מערכת קרבות
   ============================================ */

let isIndoor = false;
let currentIndoorType = null;
let outdoorPos = { x: 26, y: 17 };
let currentBackground = 'url("images/newFarmBG1.jpeg")';

const INDOOR_GRID_COLS = 8;
const INDOOR_GRID_ROWS = 6;

const GAME_MAP = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,4,1,1,1,1,1,1,1,1,2,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,5,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,3,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

const HOUSES = {
    'house_sw': { name: 'בית כיתה 1', className: 'ה1', students: [] },
    'house_se': { name: 'הבית שלך',   className: 'personal', students: [] },
    'house_nw': { name: 'בית כיתה 2', className: 'ה2', students: [] },
    'house_ne': { name: 'חנות',       className: 'shop', students: [] },
};

const HOUSE_BACKGROUNDS = {
    'house_sw': 'url("images/class1.png")',
    'house_se': 'url("images/home.png")',
    'house_nw': 'url("images/class2.png")',
    'house_ne': 'url("images/shop.png")',
};

let playerPos = { x: 26, y: 17 };
let playerDir = 'up';
const TILE_SIZE = 50;
let indoorPos = { x: 0, y: 0 };

// ============================================
// אתחול
// ============================================

function initGameMap() {
    loadStudentsToHouses();
    drawMap();
    document.addEventListener('keydown', handleKeyDown);
    initJoystick();
}

function loadStudentsToHouses() {
    const currentStudent = allStudents.find(s => s.id === currentUser);

    HOUSES.house_sw.students = allStudents.filter(s =>
        s.isActive && s.className?.endsWith('1') && s.id !== currentUser
    );
    HOUSES.house_se.students = [currentStudent].filter(Boolean);
    HOUSES.house_nw.students = allStudents.filter(s =>
        s.isActive && s.className?.endsWith('2') && s.id !== currentUser
    );
    HOUSES.house_ne.students = [];
}

// ============================================
// ציור
// ============================================

function drawMap() {
    const container = document.getElementById('map-container');
    if (!container) return;
    container.innerHTML = '';

    if (isIndoor) {
        drawIndoorMap(container);
    } else {
        drawOutdoorMap(container);
    }
}

function drawOutdoorMap(container) {
    container.style.position   = 'absolute';
    container.style.top        = '0';
    container.style.left       = '0';
    container.style.width      = '100%';
    container.style.height     = '100%';
    container.style.backgroundImage    = currentBackground;
    container.style.backgroundSize     = 'cover';
    container.style.backgroundRepeat   = 'no-repeat';
    container.style.backgroundPosition = 'center center';

    // שכבת שחקן
    const tilesLayer = document.createElement('div');
    tilesLayer.style.cssText = `position:absolute;top:0;left:0;width:100%;height:100%;
        display:grid;
        grid-template-columns:repeat(${GAME_MAP[0].length},1fr);
        grid-template-rows:repeat(${GAME_MAP.length},1fr);`;

    for (let y = 0; y < GAME_MAP.length; y++) {
        for (let x = 0; x < GAME_MAP[y].length; x++) {
            const tile = document.createElement('div');
            tile.style.cssText = 'display:flex;align-items:center;justify-content:center;';

            if (x === playerPos.x && y === playerPos.y) {
                const me = getPlayerCharacter();
                const img = document.createElement('img');
                img.src = me.img;
                img.style.cssText = 'width:80%;max-width:40px;height:auto;filter:drop-shadow(0 0 8px #FFD700) drop-shadow(0 0 15px #FFA500);position:relative;z-index:10;';
                tile.appendChild(img);
            }

            tilesLayer.appendChild(tile);
        }
    }
    container.appendChild(tilesLayer);

    // שכבת בתים — לחיצה
    const housesLayer = document.createElement('div');
    housesLayer.style.cssText = `position:absolute;top:0;left:0;width:100%;height:100%;
        display:grid;
        grid-template-columns:repeat(${GAME_MAP[0].length},1fr);
        grid-template-rows:repeat(${GAME_MAP.length},1fr);`;

    for (let y = 0; y < GAME_MAP.length; y++) {
        for (let x = 0; x < GAME_MAP[y].length; x++) {
            const tileType = GAME_MAP[y][x];
            const btn = document.createElement('div');
            const houseMap = { 2: 'house_nw', 3: 'house_ne', 4: 'house_sw', 5: 'house_se' };
            if (houseMap[tileType]) {
                btn.style.cursor = 'pointer';
                btn.onclick = () => enterHouse(houseMap[tileType]);
            }
            housesLayer.appendChild(btn);
        }
    }
    container.appendChild(housesLayer);
}

function drawIndoorMap(container) {
    const house    = HOUSES[currentIndoorType];
    const students = house?.students || [];

    container.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;overflow:hidden;';

    // רקע
    const bgLayer = document.createElement('div');
    bgLayer.style.cssText = `position:absolute;top:0;left:0;width:100%;height:100%;
        background-image:${HOUSE_BACKGROUNDS[currentIndoorType]};
        background-size:cover;background-repeat:no-repeat;background-position:center;`;
    container.appendChild(bgLayer);

    // בית אישי — אין תלמידים, רק תמונה
    if (currentIndoorType === 'house_se') {
        addExitButton(container);
        return;
    }

    // חנות — פתח את החנות הקיימת
    if (currentIndoorType === 'house_ne') {
        addExitButton(container);
        if (typeof openShop === 'function') openShop();
        return;
    }

    // כיתות — הצגת תלמידים
    const studentsLayer = document.createElement('div');
    studentsLayer.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;';

    students.forEach((s, i) => {
        const cols = 6;
        const col  = i % cols;
        const row  = Math.floor(i / cols);
        const left = 10 + col * 15;
        const top  = 15 + row * 30;

        const imgPath = s.level === 0
            ? `images/egg${s.egg || 1}.png`
            : `images/${s.type}${s.level >= 20 ? 3 : s.level >= 10 ? 2 : 1}.png`;

        const wrapper = document.createElement('div');
        wrapper.style.cssText = `position:absolute;left:${left}%;top:${top}%;
            display:flex;flex-direction:column;align-items:center;cursor:pointer;`;
        wrapper.onclick = () => tryStartBattle(s.id); // לחיצה על דמות פותחת קרב

        const sImg = document.createElement('img');
        sImg.src = imgPath;
        sImg.style.cssText = 'width:50px;height:50px;object-fit:contain;filter:drop-shadow(0 0 5px #ff5722);';

        const name = document.createElement('div');
        name.style.cssText = 'font-size:10px;font-weight:bold;color:white;text-shadow:0 1px 3px #000;margin-top:2px;text-align:center;max-width:60px;';
        name.textContent = s.full_name;

        wrapper.appendChild(sImg);
        wrapper.appendChild(name);
        studentsLayer.appendChild(wrapper);
    });

    // השחקן עצמו
    const me = getPlayerCharacter();
    const meWrapper = document.createElement('div');
    meWrapper.style.cssText = 'position:absolute;left:50%;top:60%;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;';
    const meImg = document.createElement('img');
    meImg.src = me.img;
    meImg.style.cssText = 'width:60px;height:60px;object-fit:contain;filter:drop-shadow(0 0 8px #FFD700) drop-shadow(0 0 15px #FFA500);';
    const meName = document.createElement('div');
    meName.style.cssText = 'font-size:11px;font-weight:bold;color:#FFD700;text-shadow:0 1px 3px #000;margin-top:2px;';
    meName.textContent = me.full_name + ' (את/ה)';
    meWrapper.appendChild(meImg);
    meWrapper.appendChild(meName);
    studentsLayer.appendChild(meWrapper);

    container.appendChild(studentsLayer);
    addExitButton(container);
}

function addExitButton(container) {
    const exitBtn = document.createElement('div');
    exitBtn.style.cssText = `position:absolute;top:10px;left:10px;padding:8px 16px;
        background:#f44336;color:white;border-radius:8px;cursor:pointer;
        z-index:100;font-weight:bold;font-size:15px;box-shadow:0 4px 15px rgba(0,0,0,0.3);`;
    exitBtn.textContent = '🚪 יציאה';
    exitBtn.onclick = exitHouse;
    container.appendChild(exitBtn);
}

// ============================================
// כניסה / יציאה מבתים
// ============================================

function enterHouse(houseId) {
    if (!HOUSES[houseId]) return;
    closeGenericModal();
    outdoorPos      = { x: playerPos.x, y: playerPos.y };
    isIndoor        = true;
    currentIndoorType = houseId;
    currentBackground = HOUSE_BACKGROUNDS[houseId];
    drawMap();
}

function exitHouse() {
    isIndoor          = false;
    currentIndoorType = null;
    currentBackground = 'url("images/newFarmBG1.jpeg")';
    playerPos         = { x: outdoorPos.x, y: outdoorPos.y };
    drawMap();
}

// ============================================
// תנועה — מקלדת
// ============================================

function handleKeyDown(e) {
    if (!currentUser || currentUser === 'admin') return;
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) e.preventDefault();

    const moves = {
        'ArrowUp':    { dx:  0, dy: -1, dir: 'up'    },
        'ArrowDown':  { dx:  0, dy:  1, dir: 'down'  },
        'ArrowLeft':  { dx: -1, dy:  0, dir: 'left'  },  // תוקן
        'ArrowRight': { dx:  1, dy:  0, dir: 'right' },  // תוקן
        'w': { dx:  0, dy: -1, dir: 'up'    },
        's': { dx:  0, dy:  1, dir: 'down'  },
        'a': { dx: -1, dy:  0, dir: 'left'  },
        'd': { dx:  1, dy:  0, dir: 'right' },
    };

    const move = moves[e.key];
    if (!move) return;

    playerDir = move.dir;
    const newX = playerPos.x + move.dx;
    const newY = playerPos.y + move.dy;

    if (canMoveTo(newX, newY)) {
        playerPos.x = newX;
        playerPos.y = newY;
        drawMap();
        checkHouseEntry();
    }
}

function canMoveTo(x, y) {
    if (y < 0 || y >= GAME_MAP.length || x < 0 || x >= GAME_MAP[0].length) return false;
    return GAME_MAP[y][x] !== 1;
}

function checkHouseEntry() {
    const tile = GAME_MAP[playerPos.y][playerPos.x];
    const houseMap = { 2: 'house_nw', 3: 'house_ne', 4: 'house_sw', 5: 'house_se' };
    if (houseMap[tile]) enterHouse(houseMap[tile]);
}

// ============================================
// Joystick וירטואלי — מובייל
// ============================================

function initJoystick() {
    // הסר joystick קודם אם קיים
    const existing = document.getElementById('map-joystick');
    if (existing) existing.remove();

    const joystick = document.createElement('div');
    joystick.id = 'map-joystick';
    joystick.style.cssText = `
        position:fixed;bottom:30px;left:30px;
        display:grid;grid-template-columns:repeat(3,50px);grid-template-rows:repeat(3,50px);
        gap:4px;z-index:500;user-select:none;
    `;

    const buttons = [
        { label:'↑', dx: 0, dy:-1, col:2, row:1, dir:'up'    },
        { label:'←', dx:-1, dy: 0, col:1, row:2, dir:'left'  },
        { label:'→', dx: 1, dy: 0, col:3, row:2, dir:'right' },
        { label:'↓', dx: 0, dy: 1, col:2, row:3, dir:'down'  },
    ];

    buttons.forEach(b => {
        const btn = document.createElement('div');
        btn.style.cssText = `
            grid-column:${b.col};grid-row:${b.row};
            width:50px;height:50px;
            background:rgba(0,0,0,0.5);color:white;
            border-radius:50%;display:flex;align-items:center;justify-content:center;
            font-size:22px;cursor:pointer;border:2px solid rgba(255,255,255,0.3);
            -webkit-tap-highlight-color:transparent;
        `;
        btn.textContent = b.label;

        const move = () => {
            if (!currentUser || currentUser === 'admin') return;
            playerDir = b.dir;
            const newX = playerPos.x + b.dx;
            const newY = playerPos.y + b.dy;
            if (canMoveTo(newX, newY)) {
                playerPos.x = newX;
                playerPos.y = newY;
                drawMap();
                checkHouseEntry();
            }
        };

        btn.addEventListener('touchstart', (e) => { e.preventDefault(); move(); }, { passive: false });
        btn.addEventListener('click', move);

        // לחיצה ממושכת
        let interval;
        btn.addEventListener('touchstart', () => { interval = setInterval(move, 150); }, { passive: true });
        btn.addEventListener('touchend',   () => clearInterval(interval));
        btn.addEventListener('mousedown',  () => { interval = setInterval(move, 150); });
        btn.addEventListener('mouseup',    () => clearInterval(interval));
        btn.addEventListener('mouseleave', () => clearInterval(interval));

        joystick.appendChild(btn);
    });

    document.body.appendChild(joystick);
}

function removeJoystick() {
    const j = document.getElementById('map-joystick');
    if (j) j.remove();
}

// ============================================
// קרב מהמפה — משולב עם מערכת הקרבות הקיימת
// ============================================

function tryStartBattle(targetId) {
    if (targetId === currentUser) return; // לא תוקפים את עצמך

    const target = allStudents.find(s => s.id === targetId);
    const me     = allStudents.find(s => s.id === currentUser);
    if (!target || !me) return;

    if (me.level === 0) {
        alert('אתה עדיין ביצה! התחל לשחק קודם.');
        return;
    }
    if (target.level === 0) {
        alert(target.full_name + ' עדיין ביצה! אי אפשר להילחם נגדו.');
        return;
    }

    // שלב 1 — אישור תקיפה
    const meImg  = getCharImg(me);
    const tarImg = getCharImg(target);

    const html = `
        <div style="text-align:center;padding:20px;direction:rtl;">
            <h2 style="margin-bottom:20px;">⚔️ תקיפה</h2>
            <div style="display:flex;justify-content:center;align-items:center;gap:30px;margin-bottom:25px;">
                <div>
                    <img src="${meImg}"  style="width:80px;height:80px;object-fit:contain;">
                    <div style="font-weight:bold;margin-top:6px;">${me.full_name}</div>
                    <div style="color:#666;">Lv.${me.level}</div>
                </div>
                <div style="font-size:2em;">⚔️</div>
                <div>
                    <img src="${tarImg}" style="width:80px;height:80px;object-fit:contain;">
                    <div style="font-weight:bold;margin-top:6px;">${target.full_name}</div>
                    <div style="color:#666;">Lv.${target.level}</div>
                </div>
            </div>
            <p style="color:#555;margin-bottom:20px;">האם אתה רוצה לתקוף את <b>${target.full_name}</b>?</p>
            <div style="display:flex;gap:10px;justify-content:center;">
                <button onclick="openAttackPicker('${targetId}')" 
                    style="padding:12px 24px;background:#f44336;color:white;border:none;border-radius:8px;cursor:pointer;font-size:1em;font-weight:bold;">
                    ⚔️ כן, תקוף!
                </button>
                <button onclick="closeGenericModal()" 
                    style="padding:12px 24px;background:#999;color:white;border:none;border-radius:8px;cursor:pointer;font-size:1em;">
                    ביטול
                </button>
            </div>
        </div>
    `;
    openGenericModal(html);
}

// שלב 2 — בחירת מתקפה
function openAttackPicker(targetId) {
    const me = allStudents.find(s => s.id === currentUser);
    if (!me) return;

    const attacks = (ATTACKS_BY_TYPE[me.type] || []).slice(0, attacksByLevel(me.level));
    if (attacks.length === 0) {
        alert('אין לך מתקפות זמינות עדיין!');
        return;
    }

    const attacksHtml = attacks.map((atk, i) => {
        const name = typeof atk === 'object' ? atk.name : atk;
        const icon = typeof atk === 'object' ? atk.icon : '';

        // בדיקת קולדאון
        const lastUsed  = parseInt(localStorage.getItem('last_attack_' + currentUser + '_' + name) || '0');
        const remaining = (60 * 60 * 1000) - (Date.now() - lastUsed);
        const onCooldown = remaining > 0;
        const cooldownText = onCooldown
            ? `(עוד ${Math.floor(remaining/60000)}:${String(Math.floor((remaining%60000)/1000)).padStart(2,'0')})`
            : '';

        const btnStyle = onCooldown
            ? 'background:#ccc;cursor:not-allowed;'
            : 'background:#1976d2;cursor:pointer;';

        const imgHtml = icon
            ? `<img src="${icon}" style="width:30px;height:30px;object-fit:contain;margin-left:8px;" onerror="this.style.display='none'">`
            : '';

        return `
            <button onclick="${onCooldown ? '' : `openShieldPicker('${targetId}','${name}')`}"
                style="display:flex;align-items:center;justify-content:center;width:100%;
                    padding:12px;margin-bottom:8px;border:none;border-radius:8px;
                    color:white;font-size:1em;font-weight:bold;${btnStyle}">
                ${imgHtml} ${name} <span style="font-size:0.8em;margin-right:8px;opacity:0.8;">${cooldownText}</span>
            </button>
        `;
    }).join('');

    const html = `
        <div style="text-align:center;padding:20px;direction:rtl;">
            <h3 style="margin-bottom:15px;">🗡️ בחר מתקפה</h3>
            ${attacksHtml}
            <button onclick="closeGenericModal()" 
                style="margin-top:10px;padding:10px 20px;background:#999;color:white;border:none;border-radius:8px;cursor:pointer;">
                ביטול
            </button>
        </div>
    `;
    openGenericModal(html);
}

// שלב 3 — בחירת מגן של היריב
function openShieldPicker(targetId, attackName) {
    const target = allStudents.find(s => s.id === targetId);
    if (!target) return;

    const targetHistory = (typeof target.history === 'string')
        ? JSON.parse(target.history || '{}')
        : (target.history || {});
    const brokenShields = targetHistory.shields_broken || [];
    const shieldsCount  = typeof shieldsByLevel === 'function' ? shieldsByLevel(target.level) : 1;

    const shieldsHtml = Array.from({ length: shieldsCount }, (_, i) => {
        const broken = brokenShields.includes(i);
        return `
            <span onclick="${broken ? '' : `confirmMapAttack('${targetId}','${attackName}',${i})`}"
                style="font-size:2.5em;cursor:${broken ? 'default' : 'pointer'};
                    margin:5px;opacity:${broken ? '0.4' : '1'};
                    transition:transform 0.1s;"
                onmouseover="if(!${broken}) this.style.transform='scale(1.2)'"
                onmouseout="this.style.transform='scale(1)'">
                ${broken ? '💔' : '🛡️'}
            </span>
        `;
    }).join('');

    const html = `
        <div style="text-align:center;padding:20px;direction:rtl;">
            <h3 style="margin-bottom:5px;">🛡️ בחר מגן לתקוף</h3>
            <p style="color:#666;margin-bottom:15px;">מתקפה: <b>${attackName}</b> על <b>${target.full_name}</b></p>
            <div style="margin:15px 0;">${shieldsHtml}</div>
            <button onclick="openAttackPicker('${targetId}')" 
                style="margin-top:10px;padding:10px 20px;background:#ff9800;color:white;border:none;border-radius:8px;cursor:pointer;">
                ← חזור
            </button>
        </div>
    `;
    openGenericModal(html);
}

// שלב 4 — שליחת הקרב
async function confirmMapAttack(targetId, attackName, shieldIndex) {
    closeGenericModal();

    const me     = allStudents.find(s => s.id === currentUser);
    const target = allStudents.find(s => s.id === targetId);
    if (!me || !target) return;

    // בדיקת קולדאון לפני שליחה
    const lastUsed  = parseInt(localStorage.getItem('last_attack_' + currentUser + '_' + attackName) || '0');
    const remaining = (60 * 60 * 1000) - (Date.now() - lastUsed);
    if (remaining > 0) {
        alert(`המתקפה "${attackName}" עדיין בקולדאון!`);
        return;
    }

    try {
        const { error } = await supabase.from(TABLES.battles).insert([{
            attackerId: currentUser,
            targetId:   targetId,
            skill:      attackName,
            mineIndex:  shieldIndex,
            status:     'pending',
        }]);

        if (error) throw error;

        // שמירת קולדאון — יתעדכן אחרי resolveDefense לפי רמות שעלו
        localStorage.setItem('last_attack_' + currentUser + '_' + attackName, Date.now());

        alert(`✅ הקרב נשלח! ${target.full_name} יקבל התראה.`);

    } catch (e) {
        console.error('שגיאה בשליחת קרב מהמפה:', e);
        alert('שגיאה: ' + e.message);
    }
}

// ============================================
// עזרים
// ============================================

function getCharImg(s) {
    if (!s) return 'images/egg1.png';
    if (s.level === 0) return `images/egg${s.egg || 1}.png`;
    const stage = s.level >= 20 ? 3 : s.level >= 10 ? 2 : 1;
    return `images/${s.type}${stage}.png`;
}

function getPlayerCharacter() {
    const me = allStudents.find(s => s.id === currentUser);
    if (!me) return { type: 'egg', level: 0, img: 'images/egg1.png', full_name: '' };
    return { ...me, img: getCharImg(me) };
}

// ============================================
// הצגה / הסתרה של המפה
// ============================================

function toggleMap() {
    const mapContainer = document.getElementById('map-container');
    const farmGrid     = document.getElementById('farm-grid');

    if (!mapContainer) return;

    const isVisible = mapContainer.style.display !== 'none' && mapContainer.style.display !== '';

    if (isVisible) {
        mapContainer.style.display = 'none';
        farmGrid.style.display     = 'grid';
        removeJoystick();
    } else {
        farmGrid.style.display     = 'none';
        mapContainer.style.display = 'block';
        loadStudentsToHouses();
        initGameMap();
    }
}

function activateStudentMap() {
    const mapBtn = document.getElementById('map-btn');
    if (mapBtn) mapBtn.style.display = 'flex';
}
