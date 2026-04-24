/* ============================================
   מפה ותנועה - GAME MAP
   ============================================ */

// מפת המשחק - כל מספר = סוג משבצת
// 0 = דשא, 1 = קיר/גדר, 2 = בית צפון-מערב, 0 = בית צפון-מזרח, 4 = בית דרום-מערב, 5 = בית דרום-מזרח
const GAME_MAP = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],  // 4=כיתה1 (col 7), 5=בית שחקן (col 17)
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],  // 2=כיתה2 (col 6)
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,2,1,0,0,0,0,0,0,1,4,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],  
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
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
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
const TILE_SIZE = 15;

// צבעים
const TILE_COLORS = {
    0: '#4CAF50',  // דשא - ירוק
    1: '#795548',  // קיר/גדר - חום
    2: '#FF9800',  // בית שמאלי - כתום
    3: '#2196F3',  // בית ימני - כחול
    4: '#9C27B0',  // שחקן - סגול
};

// אתחול המפה
function initGameMap() {
    // טעינת תלמידים לבתים
    loadStudentsToHouses();
    
    // ציור ראשוני
    drawMap();
    
    // הוספת מאזין מקשים
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
    container.style.display = 'block';
    container.style.position = 'relative';
    container.style.width = '250%';
    container.style.maxWidth = '2752px';
    container.style.height = 'auto';
    container.style.aspectRatio = '16/9';
    container.style.backgroundImage = 'url("images/newFarmBG1.jpeg")';
    container.style.backgroundSize = 'cover';
    container.style.backgroundRepeat = 'no-repeat';
    
    // יצירת שכבת משבצות שקופות
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
    
    for (let y = 0; y < GAME_MAP.length; y++) {
        for (let x = 0; x < GAME_MAP[y].length; x++) {
            const tile = document.createElement('div');
            tile.style.display = 'flex';
            tile.style.alignItems = 'center';
            tile.style.justifyContent = 'center';
            
            if (x === playerPos.x && y === playerPos.y) {
                // הדמות של השחקן עם אפקט glow
                const img = document.createElement('img');
                img.src = player.img;
                img.style.width = '80%';
                img.style.maxWidth = '50px';
                img.style.height = 'auto';
                img.style.filter = 'drop-shadow(0 0 8px #FFD700) drop-shadow(0 0 15px #FFA500)';
                img.style.zIndex = '10';
                img.style.position = 'relative';
                tile.appendChild(img);
                tile.style.zIndex = '10';
            }
            
            tilesLayer.appendChild(tile);
        }
    }
    
    container.appendChild(tilesLayer);
    
    // שכבת בתים - בלחיצה
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
    
    // מניעת גלילה וקפיצה
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
        case 'ArrowLeft':
        case 'a':
        case 'A':
            newX++;
            playerDir = 'left';
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            newX--;
            playerDir = 'right';
            break;
        default:
            return;
    }
    
    // בדיקה אם אפשר לזוז
    if (canMoveTo(newX, newY)) {
        playerPos.x = newX;
        playerPos.y = newY;
        drawMap();
        
        // בדיקה אם נכנס לבית
        checkHouseEntry();
    }
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
    
    // אם זו החנות
    if (houseId === 'house_ne') {
        closeGenericModal();
        openShop();
        return;
    }
    
    const studentsInHouse = house.students || [];
    
    let html = `
        <div style="text-align:center; padding:20px;">
            <h2 style="margin:0 0 15px 0;">🏠 ${house.name}</h2>
    `;
    
    // הודעה מיוחדת לבית האישי
    if (houseId === 'house_se') {
        html += '<p style="color:#666; margin-bottom:15px;">הנה כל הדמויות שלך!</p>';
    } else {
        html += '<p style="color:#666; margin-bottom:15px;">כאלה התלמידים שנמצאים פה:</p>';
    }
    
    if (studentsInHouse.length === 0) {
        html += '<p style="color:#999;">אין כאן אף אחד...</p>';
    } else {
        html += '<div style="display:flex; flex-wrap:wrap; gap:10px; justify-content:center;">';
        studentsInHouse.forEach(s => {
            const imgPath = s.level === 0 ? `images/egg${s.egg || 1}.png` : `images/${s.type}${s.level >= 20 ? 3 : s.level >= 10 ? 2 : 1}.png`;
            html += `
                <div style="text-align:center; padding:10px; background:#f5f5f5; border-radius:10px; min-width:80px;">
                    <img src="${imgPath}" style="width:50px; height:50px; object-fit:contain;">
                    <div style="font-size:12px; margin-top:5px;">${s.full_name}</div>
                    <div style="font-size:10px; color:#888;">Lv.${s.level}</div>
                </div>
            `;
        });
    }
    
    html += `
        </div>
        <button onclick="closeGenericModal()" style="margin-top:20px; padding:10px 30px; background:#666; color:white; border:none; border-radius:8px; cursor:pointer;">צא 🏃</button>
    `;
    
    openGenericModal(html);
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
