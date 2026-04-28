/* ============================================
   ניהול תלמידים - STUDENTS
   ============================================ */

async function loadStudents() {
    try {
        const { data, error } = await supabase
            .from(TABLES.students)
            .select('*')
            .order('full_name', { ascending: true });

        if (error) throw error;

        allStudents = data.map(doc => ({
            ...doc,
            id: doc.id,
            full_name: doc.full_name || "ללא שם",
            isActive: doc.isActive === true || doc.isActive === "true",
            history: doc.history || {},
            likes: doc.likes || {},
            xp: doc.xp || 0,
            level: doc.level || 0,
            className: doc.className || ""
        }));

        if (typeof renderStudentSelect === 'function') renderStudentSelect();
        updateView();

    } catch (err) {
        console.error("שגיאה קריטית ב-loadStudents:", err.message);
    }
}

function openStudentCard(studentId) {
    const s = allStudents.find(x => x.id === studentId);
    if (!s) return;

    const isMine = currentUser === s.id;
    const isAdminOrTeacher = currentUser === 'admin' || (currentUser && currentUser.startsWith('teacher_'));
    
    const eggNum = s.egg || 1;
    const level = s.level || 0;
    const type = s.type || 'dragon';
    const imgPath = level === 0 ? `images/egg${eggNum}.png` : `images/${type}${level >= 20 ? 3 : level >= 10 ? 2 : 1}.png`;
    
    const historyObj = s.history || {};
    const brokenShields = historyObj.shields_broken || [];
    const sc = shieldsByLevel(level);

    const histHtml = Object.values(historyObj)
        .filter(h => h && h.msg)
        .reverse()
        .slice(0, 3)
        .map(h => `<div class="history-item">✨ ${h.msg}: <b>+${h.xp}XP</b></div>`)
        .join('');

    const likes = s.likes || {};
    const likeCount = Object.keys(likes).length;
    const iLiked = likes[currentUser] === true;

    const noteHtml = s.lastNote ? `<div style="background:#fff3e0;border-radius:6px;padding:8px;border-right:3px solid #ff9800;font-size:0.85em;color:#e65100;">📝 ${s.lastNote}</div>` : '';
    const personalNoteHtml = s.personalNote ? `<div style="background:#e8f5e9;border-radius:6px;padding:8px;border-right:3px solid #4caf50;font-size:0.85em;color:#1b5e20;">💬 <b>על עצמי:</b> ${s.personalNote}</div>` : '';

    const likeBtn = !isMine && !isAdminOrTeacher ? `<button class="like-btn ${iLiked ? 'liked' : ''}" onclick="toggleLike('${s.id}')">${iLiked ? '❤️' : '🤍'}</button>` : '';
    const likeDisplay = isMine && likeCount > 0 ? `<span class="like-btn">❤️ ${likeCount}</span>` : isMine ? '<span style="font-size:0.8em;color:#ccc;">🤍</span>' : '';

    const attackBtn = !isMine && !isAdminOrTeacher ? `<button onclick="tryStartBattle('${s.id}')" style="background:#f44336;color:white;border:none;border-radius:8px;padding:8px 16px;font-weight:bold;cursor:pointer;margin-top:10px;width:100%;box-shadow:0 2px 5px rgba(0,0,0,0.2);">⚔️ תקוף אותי!</button>` : '';

    const html = `
        <div style="direction:rtl; padding:10px; display:flex; justify-content:center;">
            <div class="student-card my-creature" style="width:300px; margin:auto; cursor:default;">
                <div class="card-inner">
                    <div class="card-front" style="display:flex;flex-direction:column;justify-content:space-between;align-items:center;height:100%;padding:15px;box-sizing:border-box;">
                        <div style="width:100%;display:flex;justify-content:space-between;align-items:flex-start;">
                            <div class="level-text-badge">Lv.${level}</div>
                            <div></div>
                        </div>
                        <div style="flex-grow:1;display:flex;flex-direction:column;justify-content:center;align-items:center;width:100%;">
                            <img src="${imgPath}" class="creature-img" style="width:120px; height:120px; object-fit:contain;">
                            <div style="font-weight:bold;font-size:1.3em;line-height:1.2;display:flex;align-items:center;gap:6px;">
                                ${s.full_name} ${likeBtn} ${likeDisplay}
                            </div>
                            <div style="color:#666;font-size:0.95em;">כיתה ${s.className || ''}</div>
                        </div>
                        <div style="width:100%;margin-top:10px;">
                            <div class="xp-container"><div class="xp-bar" style="width:${s.xp || 0}%;"></div></div>
                            <div style="display:flex; gap:5px; margin-top:5px;">
                                <div style="flex:1; font-size:0.75em;color:#1976d2;font-weight:bold;text-align:center;cursor:pointer;padding:4px;border:1px solid #1976d2;border-radius:6px;" 
                                     onclick="openDeck('${s.full_name}', '${s.className || ''}')">🎴 מחסן</div>
                                ${attackBtn}
                            </div>
                        </div>
                    </div>
                    <div class="card-back" style="padding:12px;display:flex;flex-direction:column;gap:8px; border-top:1px solid #eee;">
                        <h4 style="margin:0 0 6px 0;color:#2e7d32;border-bottom:1px solid #ccc;padding-bottom:5px;">יומן פעילות</h4>
                        <div style="font-size:0.8em;color:#777;">${histHtml || 'אין פעילות'} ${noteHtml}</div>
                        ${personalNoteHtml}
                    </div>
                </div>
            </div>
        </div>
    `;
    openGenericModal(html);
}

function renderStudentSelect() {
    const sel = document.getElementById('studentSelect');
    if (!sel) return;
    sel.innerHTML = '<option value="">בחר את שמך...</option>';
    
    const addedNames = new Set();
    allStudents.filter(s => s.isActive).forEach(s => { 
        if (!addedNames.has(s.full_name)) {
            addedNames.add(s.full_name);
            const o = document.createElement('option'); 
            o.value = s.id; 
            o.textContent = s.full_name; 
            sel.appendChild(o); 
        }
    });
}

function updateView() {
    const grid = document.getElementById('farm-grid');
    if (!grid || !currentUser) return;

    const isAdminOrTeacher = currentUser === 'admin' || (currentUser && currentUser.startsWith('teacher_'));

    const flippedIds = new Set(
        [...document.querySelectorAll('.student-card.flipped')]
        .map(c => c.dataset.sid)
        .filter(Boolean)
    );

    const searchTerm = document.getElementById('search')?.value.toLowerCase() || '';
    const sortBy = document.getElementById('sortBy')?.value || 'name';
    const pending = window._pendingBattleTargets || [];

    let filtered = allStudents.filter(s => {
        const active = (s.isActive === true || s.isActive === "true");
        const nameMatch = s.full_name && s.full_name.toLowerCase().includes(searchTerm);
        
        let gradeMatch = true;
        if (currentGrade && currentUser.startsWith('teacher_')) {
            const className = s.className || '';
            gradeMatch = className.startsWith(currentGrade);
        }
        
        return active && nameMatch && gradeMatch;
    });

    if (sortBy === 'name') filtered.sort((a, b) => (a.full_name || '').localeCompare(b.full_name || '', 'he'));
    if (sortBy === 'level') filtered.sort((a, b) => (b.level || 0) - (a.level || 0));
    if (sortBy === 'class') {
        const parse = cls => { 
            const m = cls?.match(/([א-ת])'?(\d+)/);
            if (!m) return { g: 0, n: 0 }; 
            return { g: 'אבגדהוזחטיכלמנסעפצקרשת'.indexOf(m[1]), n: +m[2] }; 
        };
        filtered.sort((a, b) => { 
            const ca = parse(a.className), cb = parse(b.className); 
            return ca.g !== cb.g ? ca.g - cb.g : ca.n - cb.n; 
        });
    }
    if (sortBy === 'class1') filtered = filtered.filter(s => (s.className || '').endsWith('1'));
    if (sortBy === 'class2') filtered = filtered.filter(s => (s.className || '').endsWith('2'));

    grid.innerHTML = filtered.map(s => {
        const isMine = currentUser === s.id;
        const isGroup = s.is_group === true || s.is_group === 1;
        const groupClass = isGroup ? 'group-card' : '';
        const tooltipAttr = isGroup ? `data-tooltip="${(s.personalNote || '').replace(/"/g, '&quot;')}"` : '';
        const groupStyle = isGroup ? 'background-color: #ffcc80 !important;' : '';

        const eggNum = s.egg || 1;
        const level = s.level || 0;
        const type = s.type || 'dragon';
        const imgPath = level === 0 ? `images/egg${eggNum}.png` : `images/${type}${level >= 20 ? 3 : level >= 10 ? 2 : 1}.png`;
        
        const historyObj = s.history || {};
        const brokenShields = historyObj.shields_broken || [];
        const sc = shieldsByLevel(level);

        const histHtml = Object.values(historyObj)
            .filter(h => h && h.msg)
            .reverse()
            .slice(0, 3)
            .map(h => `<div class="history-item">✨ ${h.msg}: <b>+${h.xp}XP</b></div>`)
            .join('');

        const likes = s.likes || {};
        const likeCount = Object.keys(likes).length;
        const iLiked = likes[currentUser] === true;

        const noteHtml = s.lastNote ? `<div style="background:#fff3e0;border-radius:6px;padding:8px;border-right:3px solid #ff9800;font-size:0.85em;color:#e65100;">📝 ${s.lastNote}</div>` : '';
        const personalNoteHtml = s.personalNote ? `<div style="background:#e8f5e9;border-radius:6px;padding:8px;border-right:3px solid #4caf50;font-size:0.85em;color:#1b5e20;">💬 <b>על עצמי:</b> ${s.personalNote}</div>` : '';

        const myShields = isMine ? `<div class="my-shields-row">${Array.from({ length: sc }, (_, i) => `<span class="shield-item ${brokenShields.includes(i) ? 'broken' : ''}" style="cursor:default;">${brokenShields.includes(i) ? '💔' : '🛡️'}</span>`).join('')}</div>` : '';

        const hasCandle = s.history && Object.keys(s.history).some(k => k.startsWith('candle_'));
        const hasFlag = s.hasFlag === true || s.hasFlag === 'true';
        
        const candleDisplay = hasCandle ? `<img src="images/izkor.gif" style="width:70px;height:85px;vertical-align:middle;margin-right:8px;cursor:help;">` : '';
        const flagDisplay = hasFlag ? `<img src="images/flag.gif" style="width:78px;height:78px;vertical-align:middle;margin-left:5px;">` : '';

        const shieldsOverlay = (!isMine && !isAdminOrTeacher) ? `<div id="shields-overlay-${s.id}" class="shields-overlay"><div class="shields-title">⚔️ בחר מגן!</div><div class="shields-row">${Array.from({ length: sc }, (_, i) => { const broken = brokenShields.includes(i); return `<span class="shield-item ${broken ? 'broken' : ''}" onclick="pickTargetShield('${s.id}',${i})">${broken ? '💔' : '🛡️'}</span>`; }).join('')}</div><button class="cancel-btn" onclick="cancelAttack()">ביטול</button></div>` : '';

        const likeBtn = !isMine && !isAdminOrTeacher ? `<button class="like-btn ${iLiked ? 'liked' : ''}" onclick="toggleLike('${s.id}')">${iLiked ? '❤️' : '🤍'}</button>` : '';
        const likeDisplay = isMine && likeCount > 0 ? `<span class="like-btn">❤️ ${likeCount}</span>` : isMine ? '<span style="font-size:0.8em;color:#ccc;">🤍</span>' : '';

        return `
        <div class="student-card ${groupClass} ${isMine ? 'my-creature' : ''} ${pending.includes(s.id) ? 'under-attack' : ''}" data-sid="${s.id}" ${tooltipAttr} onclick="handleCardClick(event, this, '${s.id}')">
            <div class="card-inner">
            ${shieldsOverlay}
            <div class="card-front" style="display:flex;flex-direction:column;justify-content:space-between;align-items:center;height:100%;padding:15px;box-sizing:border-box; ${groupStyle}">
                <div style="width:100%;display:flex;justify-content:space-between;align-items:flex-start;">
                    <div class="level-text-badge">Lv.${level}${flagDisplay}</div>
                    ${isAdminOrTeacher ? `<button class="remove-btn" onclick="deleteStudent('${s.id}')">✖</button>` : `<div></div>`}
                </div>
                <div style="flex-grow:1;display:flex;flex-direction:column;justify-content:center;align-items:center;width:100%;">
                    <img id="img-${s.id}" src="${imgPath}" class="creature-img" onclick="event.stopPropagation(); ${isAdminOrTeacher ? `addXP('${s.id}')` : `toggleCharacterZoom('${imgPath}')`}">
                    <div style="font-weight:bold;font-size:1.3em;line-height:1.2;display:flex;align-items:center;gap:6px;">
                        ${candleDisplay} ${s.full_name} ${likeBtn} ${likeDisplay}
                    </div>
                    <div style="color:#666;font-size:0.95em;">כיתה ${s.className || ''}</div>
                    ${myShields}
                </div>
                <div style="width:100%;margin-top:10px;">
                    <div class="xp-container"><div class="xp-bar" style="width:${s.xp || 0}%;"></div></div>
                    <div style="font-size:0.75em;color:#2e7d32;font-weight:bold;margin-top:5px;text-align:center;">
                        <span style="cursor:pointer;" onclick="this.closest('.student-card').classList.toggle('flipped')">🔄 היפוך</span>
                        &nbsp;|&nbsp;
                        <span style="cursor:pointer; color:#1976d2;" data-deckname="${(s.full_name || '').replace(/"/g, '&quot;')}" data-classname="${s.className || ''}" onclick="openDeck(this.dataset.deckname, this.dataset.classname)">🎴 מחסן</span>
                    </div>
                </div>
            </div>
            <div class="card-back" style="padding:12px;display:flex;flex-direction:column;gap:8px;">
                <h4 style="margin:0 0 6px 0;color:#2e7d32;border-bottom:1px solid #ccc;padding-bottom:5px;">יומן פעילות</h4>
                <div style="font-size:0.8em;color:#777;border-top:1px solid #eee;padding-top:6px;">${histHtml || 'אין פעילות'} ${noteHtml}</div>
                ${personalNoteHtml}
                ${isMine ? `<div style="margin-top:8px;border-top:1px solid #c8e6c9;padding-top:8px;">
                    <div style="font-size:0.85em;color:#2e7d32;font-weight:bold;margin-bottom:5px;">✏️ הערה:</div>
                    <textarea id="note-${s.id}" onclick="event.stopPropagation()" style="width:100%;height:60px;font-size:0.85em;border-radius:6px;border:1px solid #a5d6a7;resize:none;padding:6px;box-sizing:border-box;">${s.personalNote || ''}</textarea>
                    <button onclick="savePersonalNote('${s.id}')" style="width:100%;margin-top:5px;background:#4caf50;padding:6px;font-size:0.85em;">שמור 💾</button>
                </div>` : `<div style="font-size:0.75em;color:#999;text-align:center;margin-top:8px;">לחץ לחזרה</div>`}
            </div>
            </div>
        </div>`;
    }).join('');

    flippedIds.forEach(id => {
        const card = document.querySelector(`.student-card[data-sid="${id}"]`);
        if (card) card.classList.add('flipped');
    });
}

function toggleCharacterZoom(imgSrc) {
    let overlay = document.getElementById('character-zoom-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'character-zoom-overlay';
        overlay.onclick = () => overlay.style.display = 'none';
        const img = document.createElement('img');
        img.id = 'zoomed-character-img';
        overlay.appendChild(img);
        document.body.appendChild(overlay);
    }
    document.getElementById('zoomed-character-img').src = imgSrc;
    overlay.style.display = 'flex';
}

async function toggleLike(studentId) {
    if (currentUser==='admin' || currentUser===studentId) return;
    const s = allStudents.find(x=>x.id===studentId);
    if (!s) return;
    const likes = {...s.likes};
    likes[currentUser] ? delete likes[currentUser] : (likes[currentUser]=true);
    try { 
        const { error } = await supabase.from(TABLES.students).update({ likes }).eq('id', studentId);
        if (error) throw error;
        await loadStudents(); 
    } catch(e) { console.error(e); }
}

async function addXP(id) {
    const isAdminOrTeacher = currentUser === 'admin' || (currentUser && currentUser.startsWith('teacher_'));
    if (!isAdminOrTeacher) return;
    
    const s = allStudents.find(x => x.id === id);
    if (!s) return;

    const img = document.getElementById('img-' + id);
    const card = img?.closest('.student-card');
    
    if (img) {
        img.classList.remove('glow-effect');
        requestAnimationFrame(() => img.classList.add('glow-effect'));
        const f = document.createElement('div'); f.className = 'xp-float'; f.innerText = '+10 XP';
        if (card) { card.appendChild(f); setTimeout(() => f.remove(), 800); }
    }
    
    let nxp = (s.xp || 0) + 10;
    let nlv = s.level ?? 0; 
    
    if (nxp >= 100) { 
        nlv++; 
        nxp -= 100; 
        if (card) {
            const t = document.createElement('div');
            t.className = 'levelup'; t.innerText = 'LEVEL UP! ✨';
            card.appendChild(t); setTimeout(() => t.remove(), 2000);
        } 
    }
    
    s.xp = nxp; s.level = nlv;
    
    const bar = card?.querySelector('.xp-bar');
    if (bar) bar.style.width = nxp + '%';
    const badge = card?.querySelector('.level-text-badge');
    if (badge) badge.innerText = 'Lv.' + nlv;

    if (img) {
        const eggNum = s.egg || 1;
        img.src = nlv === 0 ? `images/egg${eggNum}.png` : `images/${s.type}${nlv >= 20 ? 3 : nlv >= 10 ? 2 : 1}.png`;
    }

    const history = { ...s.history };
    history['tap_' + Date.now()] = { msg: 'לחיצת מורה', xp: 10, time: Date.now() };
    s.history = history;
    
    try {
        const { error } = await supabase.from(TABLES.students).update({ xp: nxp, level: nlv, history }).eq('id', id);
        if (error) throw error;
    } catch (e) { console.error("שגיאה:", e); }
}

async function deleteStudent(id) {
    if (!confirm('למחוק את הדמות?')) return;
    try { 
        const s = allStudents.find(x => x.id === id);
        const { error: delError } = await supabase.from(TABLES.students).delete().eq('id', id);
        if (delError) throw delError;
        
        if (s && s.isActive) {
            const remaining = allStudents.filter(x => x.full_name === s.full_name && x.id !== id);
            if (remaining.length > 0) {
                await supabase.from(TABLES.students).update({ isActive: true }).eq('id', remaining[0].id);
            }
        }
        
        await loadStudents(); 
    } catch(e) { console.error(e); }
}

async function savePersonalNote(id) {
    const noteValue = document.getElementById('note-' + id).value.trim();
    try { 
        const { error } = await supabase.from(TABLES.students).update({ personalNote: noteValue }).eq('id', id);
        if (error) throw error;
        await loadStudents();
        alert('הערה נשמרה!');
    } catch(e) { console.error(e); }
}

async function addStudent() {
    const nameInput = document.getElementById('studentName').value.trim();
    const isGroupInput = document.getElementById('isGroupCheckbox')?.checked || false;
    if (!nameInput) return;
    
    if (currentGrade && currentUser.startsWith('teacher_')) {
        const classSelect = document.getElementById('studentClass');
        const selectedClass = classSelect.value;
        if (!selectedClass.startsWith(currentGrade)) {
            alert('אתה יכול להוסיף רק לכיתה ' + currentGrade);
            return;
        }
    }
     
    let creatureType, eggNum;
    if (typeof currentActiveEvent !== 'undefined' && currentActiveEvent) {
        creatureType = currentActiveEvent.creatureType;
        eggNum = (currentActiveEvent.eggNum || 0) + 1;
    } else {
        creatureType = CREATURE_TYPES[Math.floor(Math.random() * CREATURE_TYPES.length)];
        eggNum = Math.floor(Math.random() * 5);
    }

    const selectedClass = document.getElementById('studentClass').value;
    const existingSameClass = allStudents.find(s => s.full_name === nameInput && s.className === selectedClass);
    const isActive = !existingSameClass;

    try {
        const payload = {
            full_name: nameInput,
            className: selectedClass,
            is_group: isGroupInput,
            xp: 0, level: 0, type: creatureType, egg: eggNum, 
            likes: {}, history: {}, isActive: isActive, password: null,
            created_at: new Date().toISOString()
        };

        const { error } = await supabase.from(TABLES.students).insert([payload]);
        if (error) throw error;
        
        document.getElementById('studentName').value = '';
        if (document.getElementById('isGroupCheckbox')) document.getElementById('isGroupCheckbox').checked = false;
        
        await loadStudents();
        alert('הדמות צורפה בהצלחה! ✨');
    } catch(e) { 
        console.error("שגיאה:", e);
        alert('שגיאה: ' + e.message); 
    }
}

async function openDeck(fullName, className) {
    if (typeof closeGenericModal === 'function') closeGenericModal();
    document.getElementById('deck-student-name').innerText = className ? `${fullName} (${className})` : fullName;
    const deckList = document.getElementById('deck-list');
    
    const myCards = className 
        ? allStudents.filter(s => s.full_name === fullName && s.className === className)
        : allStudents.filter(s => s.full_name === fullName);
    
    if(myCards.length <= 1 && currentUser !== 'admin') {
        alert("אין לך דמויות נוספות.");
        return;
    }
    
    deckList.innerHTML = myCards.map(s => {
        const eggNum = s.egg || 1;
        const imgPath = s.level === 0 ? `images/egg${eggNum}.png` : `images/${s.type}${s.level >= 20 ? 3 : s.level >= 10 ? 2 : 1}.png`;
        return `
        <div style="border:3px solid ${s.isActive ? '#4caf50' : '#ddd'}; border-radius:12px; padding:10px; min-width:110px; text-align:center; background:${s.isActive ? '#e8f5e9' : '#fff'}; position:relative;">
            ${s.isActive ? '<div style="position:absolute; top:-10px; left:50%; transform:translateX(-50%); background:#4caf50; color:white; font-size:0.7em; padding:2px 6px; border-radius:10px; font-weight:bold;">פעיל</div>' : ''}
            <img src="${imgPath}" style="height:70px; object-fit:contain; margin-bottom:8px;">
            <div style="font-weight:bold; color:#333;">Lv.${s.level}</div>
            <div style="font-size:0.85em; color:#666; margin-bottom:8px;">XP: ${s.xp}</div>
            ${!s.isActive ? `<button onclick="switchActiveCharacter('${s.id}', '${fullName}')" style="font-size:0.8em; padding:5px 10px; width:100%;">בחר</button>` : `<button disabled style="font-size:0.8em; padding:5px 10px; width:100%; background:#ccc;">מוצג</button>`}
        </div>`;
    }).join('');
    
    document.getElementById('deck-modal-overlay').style.display = 'block';
    document.getElementById('deck-modal').style.display = 'block';
}

function closeDeck() {
    document.getElementById('deck-modal-overlay').style.display = 'none';
    document.getElementById('deck-modal').style.display = 'none';
}

async function switchActiveCharacter(newId, full_name) {
    if(!confirm("להחליף לדמות זו?")) return;
    closeDeck();
    
    try {
        await supabase.from(TABLES.students).update({ isActive: false }).eq('full_name', full_name);
        await supabase.from(TABLES.students).update({ isActive: true }).eq('id', newId);

        allStudents.forEach(s => { if (s.full_name === full_name) s.isActive = (s.id === newId); });

        if (currentUser && currentUser !== 'admin') {
            const currentStudent = allStudents.find(s => s.id === currentUser);
            if (currentStudent && currentStudent.full_name === full_name) {
                currentUser = newId;
                localStorage.setItem('farm_user_id', newId);
            }
        }

        await loadStudents();
        if (typeof loadStudentsToHouses === 'function') loadStudentsToHouses();
        if (typeof drawMap === 'function') drawMap();
        alert("הוחלף בהצלחה!");
    } catch(e) { console.error(e); alert("שגיאה: " + e.message); }
}

/* ============================================
   ניקוי וסידור - LEGACY FIXES
   ============================================ */

async function smartCleanupAllStudents() {
    if (!confirm("לנקות לוגים ישנים?")) return;
    
    let count = 0;
    for (let student of allStudents) {
        try {
            let h = {};
            try { h = JSON.parse(student.history || "{}"); } catch(e) {}
            
            const keysToKeep = ['shields_broken','steel_armor_until','snake_poison','fox_trap_until','double_shield_active','double_attack_ready','rooster_active','spider_trap','counter_active'];
            let newH = {};
            keysToKeep.forEach(key => { if (h[key] !== undefined) newH[key] = h[key]; });
            
            let logKeys = Object.keys(h).filter(k => k.startsWith('log_') || k.startsWith('win_') || k.startsWith('lose_')).sort().slice(-10);
            logKeys.forEach(k => newH[k] = h[k]);

            const { error } = await supabase.from(TABLES.students).update({ history: newH }).eq('id', student.id);
            if (error) throw error;
            count++;
        } catch (e) { console.error(e); }
    }
    alert(`נוקו ${count} תלמידים.`);
    await loadStudents();
}

async function fixDatabase() {
    if (!confirm("לסדר מצב 'פעיל' וסיסמאות?")) return;
    const btn = document.getElementById('magic-btn');
    if (btn) { btn.innerText = '⏳ עדכון...'; btn.disabled = true; }

    const nameGroups = {};
    allStudents.forEach(s => {
        if (!nameGroups[s.full_name]) nameGroups[s.full_name] = [];
        nameGroups[s.full_name].push(s);
    });

    const updates = [];
    for (const name in nameGroups) {
        const group = nameGroups[name];
        const passDoc = group.find(s => s.password);
        const sharedPass = passDoc ? passDoc.password : null;
        let hasActive = group.some(s => s.isActive);
        
        for (let i = 0; i < group.length; i++) {
            const doc = group[i];
            let shouldBeActive = (!hasActive && i === 0);
            if (hasActive && doc.isActive) shouldBeActive = true;
            
            const needsUpdate = doc.isActive !== shouldBeActive || doc.password !== sharedPass;
            if (needsUpdate) {
                updates.push(
                    supabase.from(TABLES.students).update({ isActive: shouldBeActive, password: sharedPass }).eq('id', doc.id)
                );
            }
        }
    }
    try {
        await Promise.all(updates);
        alert("✅ הסידור הושלם!");
        await loadStudents();
    } catch(e) {
        alert("❌ שגיאה: " + e.message);
    }
    if (btn) { btn.innerText = '✨ סידור דמויות אוטומטי'; btn.disabled = false; }
}