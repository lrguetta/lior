/* ============================================
   indoor.js - לוגיקה וציור של החדרים הפנימיים (כיתות)
   ============================================ */

const INDOOR_GRID_COLS = 8;
const INDOOR_GRID_ROWS = 6;

// מפת התנגשויות פנימית: 0 = אפשר ללכת, 1 = קיר
// נשים קיר בשורה התחתונה כדי שלא ידרכו על המסוע
const INDOOR_MAP = [
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [1,1,1,1,1,1,1,1] // אזור המסוע חסום
];

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

    // כיתות — מסוע תלמידים
    const studentsLayer = document.createElement('div');
    studentsLayer.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;'; // pointer-events none כדי שלא יחסום תנועה

    const validStudents = students.filter(s => !(s.is_group === true || s.is_group === 1 || s.is_group === 'true'));

    if (validStudents.length > 0) {
        let currentIndex = 0;
        const visibleCount = 5;

        const conveyorContainer = document.createElement('div');
        conveyorContainer.className = 'conveyor-container';
        conveyorContainer.style.pointerEvents = 'auto'; // לאפשר לחיצות

        const btnRight = document.createElement('button');
        btnRight.className = 'conveyor-arrow';
        btnRight.innerHTML = '&#9654;';
        btnRight.title = 'הבא';

        const btnLeft = document.createElement('button');
        btnLeft.className = 'conveyor-arrow';
        btnLeft.innerHTML = '&#9664;';
        btnLeft.title = 'הקודם';

        const viewport = document.createElement('div');
        viewport.className = 'conveyor-viewport';

        function renderConveyor() {
            viewport.innerHTML = '';
            const toShow = Math.min(visibleCount, validStudents.length);
            for (let i = 0; i < toShow; i++) {
                const sIndex = (currentIndex + i) % validStudents.length;
                const s = validStudents[sIndex];

                const imgPath = s.level === 0
                    ? `images/egg${s.egg || 1}.png`
                    : `images/${s.type}${s.level >= 20 ? 3 : s.level >= 10 ? 2 : 1}.png`;

                const card = document.createElement('div');
                card.className = 'conveyor-card';
                card.onclick = () => openStudentCard(s.id);

                const img = document.createElement('img');
                img.src = imgPath;

                const nameDiv = document.createElement('div');
                nameDiv.className = 'name';
                nameDiv.textContent = s.full_name;

                card.appendChild(img);
                card.appendChild(nameDiv);
                viewport.appendChild(card);
            }
        }

        btnRight.onclick = () => {
            currentIndex = (currentIndex - 1 + validStudents.length) % validStudents.length;
            renderConveyor();
        };

        btnLeft.onclick = () => {
            currentIndex = (currentIndex + 1) % validStudents.length;
            renderConveyor();
        };

        renderConveyor();

        conveyorContainer.appendChild(btnRight);
        conveyorContainer.appendChild(viewport);
        conveyorContainer.appendChild(btnLeft);

        studentsLayer.appendChild(conveyorContainer);
    }
    container.appendChild(studentsLayer);

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
