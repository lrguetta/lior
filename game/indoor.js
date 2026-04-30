/* ============================================
   indoor.js - לוגיקה וציור של החדרים הפנימיים (כיתות)
   ============================================ */

const INDOOR_GRID_COLS = 8;
const INDOOR_GRID_ROWS = 6;

// מפת התנגשויות פנימית: 0 = אפשר ללכת, 1 = קיר
const INDOOR_MAP = [
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0] // פתוח לחלוטין
];

let indoorNPCs = [];

function populateIndoorNPCs(houseId) {
    if (houseId !== 'house_nw' && houseId !== 'house_sw') {
        indoorNPCs = [];
        return;
    }
    
    const house = HOUSES[houseId];
    let validStudents = (house?.students || []).filter(s => !(s.is_group === true || s.is_group === 1 || s.is_group === 'true'));
    
    // ערבוב אקראי
    validStudents = validStudents.sort(() => 0.5 - Math.random());
    
    // מיקומי מפגש קבועים בכיתה (שולחנות/עמדות)
    const positions = [
        {x: 1, y: 2},
        {x: 6, y: 2},
        {x: 2, y: 4},
        {x: 5, y: 4},
        {x: 3, y: 1}
    ];
    
    indoorNPCs = [];
    for (let i = 0; i < Math.min(positions.length, validStudents.length); i++) {
        indoorNPCs.push({
            student: validStudents[i],
            x: positions[i].x,
            y: positions[i].y
        });
    }
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

    // בית אישי
    if (currentIndoorType === 'house_se') {
        addExitButton(container);
        return;
    }

    // חנות
    if (currentIndoorType === 'house_ne') {
        addExitButton(container);
        if (typeof openShop === 'function') openShop();
        return;
    }

    // כיתות — אין צורך במסוע יותר. תלמידים ירונדרו על הגריד עצמו כ-NPCs.

    // שכבת השחקן בתוך גריד המפה הפנימית
    const tilesLayer = document.createElement('div');
    tilesLayer.style.cssText = `position:absolute;top:0;left:0;width:100%;height:100%;
        display:grid;
        grid-template-columns:repeat(${INDOOR_GRID_COLS},1fr);
        grid-template-rows:repeat(${INDOOR_GRID_ROWS},1fr);
        pointer-events:none;`; // השחקן מוצג כחלק מהגריד

    for (let y = 0; y < INDOOR_MAP.length; y++) {
        for (let x = 0; x < INDOOR_MAP[y].length; x++) {
            const tile = document.createElement('div');
            tile.style.cssText = 'display:flex;align-items:center;justify-content:center;';

            // ציור NPCs (חברים לכיתה)
            const npc = indoorNPCs.find(n => n.x === x && n.y === y);
            if (npc) {
                const s = npc.student;
                const imgPath = s.level === 0
                    ? `images/egg${s.egg || 1}.png`
                    : `images/${s.type}${s.level >= 20 ? 3 : s.level >= 10 ? 2 : 1}.png`;

                const npcWrapper = document.createElement('div');
                npcWrapper.style.cssText = 'display:flex;flex-direction:column;align-items:center;pointer-events:auto;cursor:pointer;';
                npcWrapper.onclick = () => openStudentCard(s.id);
                
                const img = document.createElement('img');
                img.src = imgPath;
                img.style.cssText = 'width:50px;height:auto;filter:drop-shadow(0 0 4px rgba(0,0,0,0.5)); transition: transform 0.2s;';
                img.onmouseover = () => img.style.transform = 'scale(1.15)';
                img.onmouseout = () => img.style.transform = 'scale(1)';
                
                const nameDiv = document.createElement('div');
                nameDiv.style.cssText = 'font-size:10px;font-weight:bold;color:#333;background:rgba(255,255,255,0.85);padding:2px 6px;border-radius:6px;margin-top:2px;box-shadow:0 2px 4px rgba(0,0,0,0.2);';
                nameDiv.textContent = s.full_name;
                
                npcWrapper.appendChild(img);
                npcWrapper.appendChild(nameDiv);
                tile.appendChild(npcWrapper);
            }

            // ציור השחקן
            if (x === playerPos.x && y === playerPos.y) {
                const me = getPlayerCharacter();
                const meWrapper = document.createElement('div');
                meWrapper.style.cssText = 'display:flex;flex-direction:column;align-items:center;pointer-events:auto;';
                
                const img = document.createElement('img');
                img.src = me.img;
                img.style.cssText = 'width:50px;height:auto;filter:drop-shadow(0 0 8px #FFD700) drop-shadow(0 0 15px #FFA500);';
                
                const meName = document.createElement('div');
                meName.style.cssText = 'font-size:11px;font-weight:bold;color:#FFD700;text-shadow:0 1px 3px #000;margin-top:2px;';
                meName.textContent = me.full_name + ' (את/ה)';
                
                meWrapper.appendChild(img);
                meWrapper.appendChild(meName);
                tile.appendChild(meWrapper);
            }

            tilesLayer.appendChild(tile);
        }
    }
    container.appendChild(tilesLayer);

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
