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

/**
 * Adds XP to a student automatically (Teacher/Admin only)
 */
async function addXP(studentId) {
    const s = allStudents.find(x => x.id === studentId);
    if (!s) return;
    
    const amount = 10;
    
    try {
        let newXP = (s.xp || 0) + amount;
        let newLevel = s.level || 0;
        
        while (newXP >= 100) { newLevel++; newXP -= 100; }

        const h = s.history || {};
        const timestamp = Date.now();
        h['admin_' + timestamp] = { 
            msg: `המורה הוסיף לך ${amount} XP`, 
            xp: amount, 
            time: timestamp 
        };

        // Show floating animation immediately
        showFloatingXP(studentId, amount);

        const { error } = await supabase
            .from(TABLES.students)
            .update({ xp: newXP, level: newLevel, history: h })
            .eq('id', studentId);
            
        if (error) throw error;
        
        // Update local data and view without full reload if possible, 
        // but loadStudents is safer to keep everything in sync
        await loadStudents();
    } catch(e) { 
        console.error("Error adding XP:", e);
    }
}

function showFloatingXP(studentId, amount) {
    const card = document.querySelector(`.student-card[data-sid="${studentId}"]`);
    if (!card) return;
    
    const float = document.createElement('div');
    float.className = 'floating-xp';
    float.textContent = `+${amount} XP`;
    card.appendChild(float);
    
    setTimeout(() => float.remove(), 1000);
}


function openDeck(name, className) {
    const modal = document.getElementById('deck-modal');
    if (modal) {
        modal.style.display = 'block';
        renderDeck(name, className);
    }
}

function renderDeck(name, className) {
    const container = document.getElementById('deck-list');
    if (!container) return;
    
    // If name/className are provided, use them. Otherwise use current user's.
    let targetName = name;
    if (!targetName) {
        const me = allStudents.find(s => s.id === currentUser);
        targetName = me ? me.full_name : '';
    }
    
    const myCharacters = allStudents.filter(s => s.full_name === targetName);
    
    container.innerHTML = myCharacters.map(s => {
        const level = s.level || 0;
        const type = s.type || 'cat';
        const imgPath = level === 0 ? `images/egg${s.egg || 1}.png` : `images/${type}${level >= 20 ? 3 : level >= 10 ? 2 : 1}.png`;
        return `
            <div class="deck-item ${s.isActive ? 'active' : ''}" onclick="switchActiveCharacter('${s.id}', '${s.full_name}')">
                <img src="${imgPath}" style="width:60px; height:60px; object-fit:contain;">
                <div style="font-weight:bold; margin-top:5px;">Lv.${level}</div>
                ${s.isActive ? '<div style="color:#ffd700; font-size:0.8em; font-weight:bold;">פעיל</div>' : ''}
            </div>
        `;
    }).join('');
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

    const cardsHtml = filtered.map(s => {
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
    grid.innerHTML = cardsHtml;
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