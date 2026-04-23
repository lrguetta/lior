/* ============================================
   מפה ותנועה - GAME MAP
   ============================================ */

// מפת המשחק - כל מספר = סוג משבצת
const GAME_MAP = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,2,2,0,0,0,0,0,0,0,0,3,0,1],  // 2 = בית שמאלי, 3 = בית ימני
    [1,0,2,2,0,0,0,0,0,0,0,0,3,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,0,0,0,1,1,1,1,1,1],  // 0 באמצע = שער יציאה
    [1,1,1,1,1,1,0,4,0,1,1,1,1,1,1],  // 4 = מיקום התחלתי
];

// הגדרות בתים - מי נמצא באיזה בית
const HOUSES = {
    'house_left': { 
        name: 'בית שמאל', 
        className: 'ה1', 
        x: 2, y: 2,
        students: [] // יתמלא אוטומטי
    },
    'house_right': { 
        name: 'בית ימני', 
        className: 'ה2', 
        x: 12, y: 2,
        students: []
    },
    'player_house': {
        name: 'הבית שלך',
        x: 7, y: 14,
        students: []
    }
};

// משתני משחק
let playerPos = { x: 7, y: 14 };
let playerDir = 'up';
const TILE_SIZE = 40;

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
    // הבית של השחקן - כיתה שלו
    const currentStudent = allStudents.find(s => s.id === currentUser);
    const myClass = currentStudent?.className || 'ה1';
    
    // בית שמאל - כיתה א'
    HOUSES.player_house.students = allStudents.filter(s => 
        s.isActive && s.id !== currentUser && s.className === myClass
    );
    HOUSES.house_left.students = allStudents.filter(s => 
        s.isActive && s.className === 'ה1'
    );
    HOUSES.house_right.students = allStudents.filter(s => 
        s.isActive && s.className === 'ה2'
    );
}

// ציור המפה
function drawMap() {
    const container = document.getElementById('map-container');
    if (!container) return;
    
    container.innerHTML = '';
    container.style.display = 'grid';
    container.style.gridTemplateColumns = `repeat(${GAME_MAP[0].length}, ${TILE_SIZE}px)`;
    
    for (let y = 0; y < GAME_MAP.length; y++) {
        for (let x = 0; x < GAME_MAP[y].length; x++) {
            const tile = document.createElement('div');
            tile.style.width = TILE_SIZE + 'px';
            tile.style.height = TILE_SIZE + 'px';
            tile.style.display = 'flex';
            tile.style.alignItems = 'center';
            tile.style.justifyContent = 'center';
            tile.style.fontSize = '20px';
            
            const tileType = GAME_MAP[y][x];
            
            // צבע רקע
            tile.style.backgroundColor = TILE_COLORS[tileType] || '#4CAF50';
            
            // תוכן לפי סוג
            if (x === playerPos.x && y === playerPos.y) {
                tile.innerHTML = getPlayerEmoji();
                tile.style.zIndex = '10';
            } else if (tileType === 2) {
                tile.innerHTML = '🏠';
                tile.style.cursor = 'pointer';
                tile.onclick = () => enterHouse('house_left');
            } else if (tileType === 3) {
                tile.innerHTML = '🏠';
                tile.style.cursor = 'pointer';
                tile.onclick = () => enterHouse('house_right');
            }
            
            container.appendChild(tile);
        }
    }
}

// אימוג'י לשחקן לפי כיוון
function getPlayerEmoji() {
    const emojis = { up: '👤', down: '👤', left: '👤', right: '👤' };
    return emojis[playerDir] || '👤';
}

// טיפול במקשים
function handleKeyDown(e) {
    if (!currentUser || currentUser === 'admin') return;
    
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
            newX--;
            playerDir = 'left';
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            newX++;
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
    if (tile === 2) enterHouse('house_left');
    else if (tile === 3) enterHouse('house_right');
}

// כניסה לבית
function enterHouse(houseId) {
    const house = HOUSES[houseId];
    if (!house) return;
    
    const studentsInHouse = house.students || [];
    
    let html = `
        <div style="text-align:center; padding:20px;">
            <h2 style="margin:0 0 15px 0;">🏠 ${house.name}</h2>
            <p style="color:#666; margin-bottom:15px;">כאלה התלמידים שנמצאים פה:</p>
    `;
    
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
