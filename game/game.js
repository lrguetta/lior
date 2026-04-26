/* ============================================
   מפה ותנועה - GAME MAP
   ============================================ */

// מפת המשחק - כל מספר = סוג משבצת
// 0 = דשא, 1 = קיר/גדר, 2 = בית צפון-מערב, 3 = בית צפון-מזרח, 4 = בית דרום-מערב, 5 = בית דרום-מזרח

// מצב: האם נמצא בתוך בית
let isIndoor = false;
let currentIndoorType = null;
let outdoorPos = { x: 26, y: 17 }; // שמירת מיקום חיצוני
let currentBackground = 'url("images/newFarmBG1.jpeg")';

const INDOOR_GRID_COLS = 8;
const INDOOR_GRID_ROWS = 6;
const GAME_MAP = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],  // 4=כיתה1 (col 7), 5=בית שחקן (col 17)
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],  // 2=כיתה2 (col 6)
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,4,1,1,1,1,1,1,1,1,2,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],  
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1], // בית שלי = 5
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1], // חנות = 3
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

// הגדרות בתים
const HOUSES = {
    'house_sw': { name: 'בית כיתה 1', className: 'ה1', students: [] },
    'house_se': { name: 'הבית שלך', className: 'personal', students: [] },
    'house_nw': { name: 'בית כיתה 2', className: 'ה2', students: [] },
    'house_ne': { name: 'חנות', className: 'shop', students: [] },
};

// מיקום התחלתי - ליד הבית של השחקן
let playerPos = { x: 26, y: 17 };
let playerDir = 'up';
const TILE_SIZE = 50;

// מיקום בתוך הבית
let indoorPos = { x: 0, y: 0 };

// צבעים
const TILE_COLORS = {
    0: '#4CAF50',  // דשא - ירוק
    1: '#795548',  // קיר/גדר - חום
    2: '#FF9800',  // בית שמאלי - כתום
    3: '#2196F3',  // בית ימני - כחול
    4: '#9C27B0',  // שחקן - סגול
};

// תמונות רקע לבתים
const HOUSE_BACKGROUNDS = {
    'house_sw': 'url("images/class1.png")',
    'house_se': 'url("images/home.png")',
    'house_nw': 'url("images/class2.png")',
    'house_ne': 'url("images/shop.png")',
};

// אתחול המפה
function initGameMap() {
    loadStudentsToHouses();
    drawMap();
    document.addEventListener('keydown', handleKeyDown);
}

// חלוקת תלמידים לבתים לפי כיתה
function loadStudentsToHouses() {
    const currentStudent = allStudents.find(s => s.id === currentUser);
    const myClass = currentStudent?.className || 'ה1';
    
    // בית דרום מערב - תלמידי כיתה 1 (מסתיים ב-1)
    HOUSES.house_sw.students = allStudents.filter(s => 
        s.isActive && s.className?.endsWith('1') && s.id !== currentUser
    );
    
    // בית דרום מזרח - רק השחקן עצמו
    HOUSES.house_se.students = [currentStudent].filter(Boolean);
    
    // בית צפון מערב - תלמידי כיתה 2 (מסתיים ב-2)
    HOUSES.house_nw.students = allStudents.filter(s => 
        s.isActive && s.className?.endsWith('2')
    );
    
    // צפון מזרח - חנות (אין תלמידים כאן)
    HOUSES.house_ne.students = [];
}

// ציור המפה
function drawMap() {
    const container = document.getElementById('map-container');
    if (!container) return;
    
    container.innerHTML = '';
    drawOutdoorMap(container);
}

// מפה חיצונית
function drawOutdoorMap(container) {
    container.style.display = 'block';
    container.style.position = 'absolute';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.backgroundImage = currentBackground;
    container.style.backgroundSize = 'cover';
    container.style.backgroundRepeat = 'no-repeat';
    container.style.backgroundPosition = 'center center';
    
    const tilesLayer = document.createElement('div');
    tilesLayer.style.position = 'absolute';
    tilesLayer.style.top = '0';
    tilesLayer.style.left = '0';
    tilesLayer.style.width = '100%';
    tilesLayer.style.height = '100%';
    tilesLayer.style.display = 'grid';
    tilesLayer.style.gridTemplateColumns = `repeat(${GAME_MAP[0].length}, 1fr)`;
    tilesLayer.style.gridTemplateRows = `repeat(${GAME_MAP.length}, 1fr)`;
    
    const player = getPlayerCharacter();
    let studentsInSameLocation = [];
    if (isIndoor && currentIndoorType) {
        studentsInSameLocation = HOUSES[currentIndoorType]?.students || [];
    }
    
    for (let y = 0; y < GAME_MAP.length; y++) {
        for (let x = 0; x < GAME_MAP[y].length; x++) {
            const tile = document.createElement('div');
            tile.style.display = 'flex';
            tile.style.alignItems = 'center';
            tile.style.justifyContent = 'center';
            
            let charToShow = null;
            if (x === playerPos.x && y === playerPos.y) {
                charToShow = player;
            } else if (isIndoor) {
                const sameClass = studentsInSameLocation.filter((s, i) => {
                    const sx = 15 + (i % 10);
                    const sy = 10 + Math.floor(i / 10);
                    return sx === x && sy === y && s.id !== currentUser;
                });
                if (sameClass.length > 0) charToShow = sameClass[0];
            }
            
            if (charToShow) {
                const img = document.createElement('img');
                img.src = charToShow.level === 0 ? `images/egg${charToShow.egg || 1}.png` : `images/${charToShow.type}${(charToShow.level || 1) >= 20 ? 3 : (charToShow.level || 1) >= 10 ? 2 : 1}.png`;
                img.style.width = '80%';
                img.style.maxWidth = '50px';
                img.style.height = 'auto';
                if (charToShow.id === currentUser) {
                    img.style.filter = 'drop-shadow(0 0 8px #FFD700) drop-shadow(0 0 15px #FFA500)';
                    img.style.zIndex = '10';
                } else {
                    img.style.filter = 'drop-shadow(0 0 5px #ff5722)';
                    img.style.zIndex = '8';
                    img.style.cursor = 'pointer';
                }
                img.style.position = 'relative';
                tile.appendChild(img);
                tile.style.zIndex = charToShow.id === currentUser ? '10' : '8';
            }
            
            tilesLayer.appendChild(tile);
        }
    }
    
    container.appendChild(tilesLayer);
    
    // שכבת בתים
    const housesLayer = document.createElement('div');
    housesLayer.style.position = 'absolute';
    housesLayer.style.top = '0';
    housesLayer.style.left = '0';
    housesLayer.style.width = '100%';
    housesLayer.style.height = '100%';
    housesLayer.style.display = 'grid';
    housesLayer.style.gridTemplateColumns = `repeat(${GAME_MAP[0].length}, 1fr)`;
    housesLayer.style.gridTemplateRows = `repeat(${GAME_MAP.length}, 1fr)`;
    
    for (let y = 0; y < GAME_MAP.length; y++) {
        for (let x = 0; x < GAME_MAP[y].length; x++) {
            const tileType = GAME_MAP[y][x];
            const btn = document.createElement('div');
            
            if (tileType === 2) {
                btn.style.cursor = 'pointer';
                btn.onclick = () => enterHouse('house_nw');
            } else if (tileType === 3) {
                btn.style.cursor = 'pointer';
                btn.onclick = () => enterHouse('house_ne');
            } else if (tileType === 4) {
                btn.style.cursor = 'pointer';
                btn.onclick = () => enterHouse('house_sw');
            } else if (tileType === 5) {
                btn.style.cursor = 'pointer';
                btn.onclick = () => enterHouse('house_se');
            }
            
            housesLayer.appendChild(btn);
        }
    }
    
    container.appendChild(housesLayer);
}

// מפה פנימית (בתוך בית)
function drawIndoorMap(container) {
    const house = HOUSES[currentIndoorType];
    const students = house?.students || [];
    
    const mapW = INDOOR_GRID_COLS * TILE_SIZE;
    const mapH = INDOOR_GRID_ROWS * TILE_SIZE;
    const viewW = window.innerWidth;
    const viewH = window.innerHeight;
    
    container.style.display = 'block';
    container.style.position = 'absolute';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.overflow = 'hidden';
    container.style.margin = '0';
    container.style.border = 'none';
    container.style.borderRadius = '0';
    
    // רקע הבית
    const bgLayer = document.createElement('div');
    bgLayer.style.position = 'absolute';
    bgLayer.style.top = '0';
    bgLayer.style.left = '0';
    bgLayer.style.width = mapW + 'px';
    bgLayer.style.height = mapH + 'px';
    bgLayer.style.backgroundImage = HOUSE_BACKGROUNDS[currentIndoorType];
    bgLayer.style.backgroundSize = 'cover';
    bgLayer.style.backgroundRepeat = 'no-repeat';
    
    // חישוב גלילה
    let offsetX = indoorPos.x * TILE_SIZE - viewW / 2 + TILE_SIZE / 2;
    let offsetY = indoorPos.y * TILE_SIZE - viewH / 2 + TILE_SIZE / 2;
    offsetX = Math.max(0, Math.min(offsetX, mapW - viewW));
    offsetY = Math.max(0, Math.min(offsetY, mapH - viewH));
    bgLayer.style.transform = `translate(${-offsetX}px, ${-offsetY}px)`;
    bgLayer.style.transition = 'transform 0.3s ease-out';
    
    container.appendChild(bgLayer);
    
    // שכבת תלמידים
    const studentsLayer = document.createElement('div');
    studentsLayer.style.position = 'absolute';
    studentsLayer.style.top = '0';
    studentsLayer.style.left = '0';
    studentsLayer.style.width = mapW + 'px';
    studentsLayer.style.height = mapH + 'px';
    studentsLayer.style.transform = `translate(${-offsetX}px, ${-offsetY}px)`;
    studentsLayer.style.transition = 'transform 0.3s ease-out';
    
    // הצגת השחקן
    const playerImg = document.createElement('img');
    playerImg.src = getPlayerCharacter().img;
    playerImg.style.position = 'absolute';
    playerImg.style.left = (indoorPos.x * TILE_SIZE) + 'px';
    playerImg.style.top = (indoorPos.y * TILE_SIZE) + 'px';
    playerImg.style.width = TILE_SIZE + 'px';
    playerImg.style.height = TILE_SIZE + 'px';
    playerImg.style.filter = 'drop-shadow(0 0 8px #FFD700)';
    playerImg.style.zIndex = '10';
    studentsLayer.appendChild(playerImg);
    
    // הצגת תלמידים אחרים
    students.forEach((s, i) => {
        const sImg = document.createElement('img');
        const imgPath = s.level === 0 ? `images/egg${s.egg || 1}.png` : `images/${s.type}${s.level >= 20 ? 3 : s.level >= 10 ? 2 : 1}.png`;
        sImg.src = imgPath;
        sImg.style.position = 'absolute';
        sImg.style.left = ((i % INDOOR_GRID_COLS) * TILE_SIZE) + 'px';
        sImg.style.top = (Math.floor(i / INDOOR_GRID_COLS) * TILE_SIZE) + 'px';
        sImg.style.width = TILE_SIZE + 'px';
        sImg.style.height = TILE_SIZE + 'px';
        sImg.style.cursor = 'pointer';
        sImg.style.zIndex = '5';
        sImg.onclick = () => tryStartBattle(s.id);
        studentsLayer.appendChild(sImg);
    });
    
    container.appendChild(studentsLayer);
    
    // כפתור יציאה
    const exitBtn = document.createElement('div');
    exitBtn.style.position = 'absolute';
    exitBtn.style.top = '10px';
    exitBtn.style.left = '10px';
    exitBtn.style.padding = '8px 16px';
    exitBtn.style.background = '#f44336';
    exitBtn.style.color = 'white';
    exitBtn.style.borderRadius = '8px';
    exitBtn.style.cursor = 'pointer';
    exitBtn.style.zIndex = '100';
    exitBtn.style.fontWeight = 'bold';
    exitBtn.textContent = '🚪 יציאה';
    exitBtn.onclick = exitHouse;
    container.appendChild(exitBtn);
}

// ניסיון להתחיל קרב
function tryStartBattle(targetId) {
    const target = allStudents.find(s => s.id === targetId);
    if (!target) return;
    
    const player = getPlayerCharacter();
    if (player.level === 0) {
        alert('אתה עדיין ביצה! התחל לשחק קודם.');
        return;
    }
    
    if (target.level === 0) {
        alert(target.full_name + ' עדיין ביצה! אי אפשר להילחם נגדו.');
        return;
    }
    
    const html = `
        <div style="text-align:center; padding:20px;">
            <h2>⚔️ בקשת קרב</h2>
            <p>אתה רוצה להתחיל קרב עם <b>${target.full_name}</b> (Lv.${target.level})?</p>
            <div style="margin-top:20px; display:flex; gap:10px; justify-content:center;">
                <button onclick="window.startBattleFromMap('${targetId}'); closeGenericModal();" style="padding:10px 20px; background:#f44336; color:white; border:none; border-radius:8px; cursor:pointer;">⚔️ התחל קרב</button>
                <button onclick="closeGenericModal()" style="padding:10px 20px; background:#999; color:white; border:none; border-radius:8px; cursor:pointer;">ביטול</button>
            </div>
        </div>
    `;
    openGenericModal(html);
}

// פונקציה גלובלית להתחלת קרב מהמפה
window.startBattleFromMap = function(targetId) {
    const me = allStudents.find(s => s.id === currentUser);
    const target = allStudents.find(s => s.id === targetId);
    if (!me || !target) return;
    
    if (me.level === 0 || target.level === 0) {
        alert('שניכם צריכים להיות לפחות ברמה 1!');
        return;
    }
    
    const html = `
        <div style="text-align:center; padding:30px;">
            <div style="display:flex; justify-content:center; align-items:center; gap:40px; margin-bottom:30px;">
                <div>
                    <img src="${me.level === 0 ? 'images/egg'+(me.egg||1)+'.png' : 'images/'+me.type+(me.level>=20?3:me.level>=10?2:1)+'.png'}" style="width:100px; height:100px;">
                    <div><b>${me.full_name}</b></div>
                    <div>Lv.${me.level}</div>
                </div>
                <div style="font-size:2em;">⚔️</div>
                <div>
                    <img src="${target.level === 0 ? 'images/egg'+(target.egg||1)+'.png' : 'images/'+target.type+(target.level>=20?3:target.level>=10?2:1)+'.png'}" style="width:100px; height:100px;">
                    <div><b>${target.full_name}</b></div>
                    <div>Lv.${target.level}</div>
                </div>
            </div>
            <div style="color:#666; margin-bottom:20px;">
                הקרב יתחיל! בחר את המגן שלך:
            </div>
            <div id="battle-shields-select" style="font-size:2em; margin-bottom:20px;"></div>
        </div>
    `;
    openGenericModal(html);
    
    const shieldsCount = shieldsByLevel(me.level);
    const shieldsDiv = document.getElementById('battle-shields-select');
    shieldsDiv.innerHTML = Array.from({ length: shieldsCount }, (_, i) => 
        `<span style="cursor:pointer; margin:0 10px;" onclick="confirmBattleFromMap('${targetId}', ${i})">🛡️</span>`
    ).join('');
}

function confirmBattleFromMap(targetId, shieldIndex) {
    closeGenericModal();
    exitHouse();
    alert('הקרב יתחיל! (טרם מושלם)');
}

// קבלת הדמות של השחקן
function getPlayerCharacter() {
    const me = allStudents.find(s => s.id === currentUser);
    if (!me) return { type: 'egg', level: 0, img: 'images/egg1.png' };
    
    let imgPath;
    if (me.level === 0) {
        imgPath = `images/egg${me.egg || 1}.png`;
    } else {
        const stage = me.level >= 20 ? 3 : me.level >= 10 ? 2 : 1;
        imgPath = `images/${me.type}${stage}.png`;
    }
    
    return { ...me, img: imgPath };
}

// אייקון לשחקן (משמש ל-backward compatibility)
function getPlayerEmoji() {
    return '<span style="font-size:24px;">👤</span>';
}

// טיפול במקשים
function handleKeyDown(e) {
    if (!currentUser || currentUser === 'admin') return;
    
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) {
        e.preventDefault();
    }
    
    let newX = playerPos.x;
    let newY = playerPos.y;
    
    switch(e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            newY--;
            playerDir = 'up';
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            newY++;
            playerDir = 'down';
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            newX--;
            playerDir = 'left';
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            newX++;
            playerDir = 'right';
            break;
        default:
            return;
    }
    
    if (canMoveTo(newX, newY)) {
        playerPos.x = newX;
        playerPos.y = newY;
        drawMap();
        checkHouseEntry();
    }
}

// בדיקה אם אפשר לזוז בתוך הבית
function canMoveIndoor(x, y) {
    if (x < 0 || x >= INDOOR_GRID_COLS || y < 0 || y >= INDOOR_GRID_ROWS) return false;
    return true;
}

// האם אפשר לזוז למשבצת
function canMoveTo(x, y) {
    if (y < 0 || y >= GAME_MAP.length || x < 0 || x >= GAME_MAP[0].length) return false;
    const tile = GAME_MAP[y][x];
    return tile !== 1; // 1 = קיר
}

// בדיקה אם נכנס לבית
function checkHouseEntry() {
    const tile = GAME_MAP[playerPos.y][playerPos.x];
    if (tile === 2) enterHouse('house_nw');
    else if (tile === 3) enterHouse('house_ne');
    else if (tile === 4) enterHouse('house_sw');
    else if (tile === 5) enterHouse('house_se');
}

// כניסה לבית
function enterHouse(houseId) {
    const house = HOUSES[houseId];
    if (!house) return;
    
    closeGenericModal();
    
    // שמירת מיקום חיצוני
    outdoorPos = { x: playerPos.x, y: playerPos.y };
    
    // מעבר לרקע הבית
    isIndoor = true;
    currentIndoorType = houseId;
    currentBackground = HOUSE_BACKGROUNDS[houseId];
    
    drawMap();
}

// יציאה מהבית
function exitHouse() {
    isIndoor = false;
    currentBackground = 'url("images/newFarmBG1.jpeg")';
    playerPos = { x: outdoorPos.x, y: outdoorPos.y };
    drawMap();
}

// הצגת כפתור המפה בתפריט
function showMapButton() {
    const mapBtn = document.getElementById('map-btn');
    if (mapBtn) {
        mapBtn.style.display = 'flex';
    }
}

// החלפת תצוגה בין מפה לרשת
function toggleMap() {
    const mapContainer = document.getElementById('map-container');
    const farmGrid = document.getElementById('farm-grid');
    
    if (mapContainer.style.display === 'none' || !mapContainer.style.display) {
        farmGrid.style.display = 'none';
        mapContainer.style.display = 'grid';
        initGameMap();
    } else {
        mapContainer.style.display = 'none';
        farmGrid.style.display = 'grid';
    }
}

// הפעלת מפה לתלמיד
function activateStudentMap() {
    const mapBtn = document.getElementById('map-btn');
    if (mapBtn) {
        mapBtn.style.display = 'flex';
    }
}
