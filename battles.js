/* ============================================
   קרבות - BATTLES
   ============================================ */

// משתני מצב
let battleState = { 
    selectedSkill: null, 
    pendingBattleId: null, 
    pendingBattle: null, 
    stealMode: false, 
    stealCallback: null 
};

function buildBattleSidebar(me) {
    const attacks = (ATTACKS_BY_TYPE[me.type] || []).slice(0, attacksByLevel(me.level));
    let sidebar = document.getElementById('battle-sidebar');
    if (!sidebar) {
        sidebar = document.createElement('div');
        sidebar.id = 'battle-sidebar';
        document.body.appendChild(sidebar);
    }
    
    const wasOpen = sidebar.classList.contains('open');
    sidebar.innerHTML = `<div class="sidebar-title">⚔️ בחר מתקפה:</div>`;
    
    attacks.forEach(atk => {
        const name = typeof atk === 'object' ? atk.name : atk;
        const icon = typeof atk === 'object' ? atk.icon : '';
        const btn = document.createElement('button');
        btn.className = 'attack-btn';
        btn.title = name;
        
        const getLast = () => parseInt(localStorage.getItem('last_attack_' + currentUser + '_' + name) || '0');
        const getRem = () => (60 * 60 * 1000) - (Date.now() - getLast());
        const isOnCooldown = () => getRem() > 0;

        if (icon) {
            btn.style.cssText = 'background:none;border:none;padding:4px;box-shadow:none;position:relative;';
            const wrapper = document.createElement('div');
            wrapper.style.cssText = 'position:relative;width:65px;height:65px;right:-25px;display:inline-block;';
            wrapper.innerHTML = `<img src="${icon}" style="width:100%;height:100%;object-fit:contain;display:block;" onerror="this.style.display='none';if(this.nextSibling)this.nextSibling.style.display='block'"><span style="display:none;font-size:0.8em;">${name}</span>`;
            const overlay = document.createElement('div');
            overlay.style.cssText = 'display:none;position:absolute;inset:0;background:rgba(30,30,30,0.7);border-radius:50%;align-items:center;justify-content:center;font-size:0.9em;font-weight:bold;color:white;pointer-events:none;';
            wrapper.appendChild(overlay);
            btn.appendChild(wrapper);
            const tick = () => {
                const rem = getRem();
                if (rem > 0) {
                    overlay.style.display = 'flex';
                    btn.style.cursor = 'not-allowed';
                    overlay.innerText = String(Math.floor(rem/60000)).padStart(2,'0') + ':' + String(Math.floor((rem%60000)/1000)).padStart(2,'0');
                    requestAnimationFrame(tick);
                } else {
                    overlay.style.display = 'none';
                    btn.style.cursor = 'pointer';
                }
            };
            tick();
        } else {
            btn.style.position = 'relative';
            btn.textContent = name;
            const overlay = document.createElement('div');
            overlay.style.cssText = 'display:none;position:absolute;inset:0;background:rgba(30,30,30,0.7);border-radius:8px;align-items:center;justify-content:center;font-size:0.85em;font-weight:bold;color:white;pointer-events:none;';
            btn.appendChild(overlay);
            const tick = () => {
                const rem = getRem();
                if (rem > 0) {
                    overlay.style.display = 'flex';
                    btn.style.cursor = 'not-allowed';
                    overlay.innerText = String(Math.floor(rem/60000)).padStart(2,'0') + ':' + String(Math.floor((rem%60000)/1000)).padStart(2,'0');
                    requestAnimationFrame(tick);
                } else {
                    overlay.style.display = 'none';
                    btn.style.cursor = 'pointer';
                }
            };
            tick();
        }
  
        btn.onclick = () => { if (!isOnCooldown()) enterPickMode(name); };
        sidebar.appendChild(btn);
    });

    if (wasOpen) sidebar.classList.add('open');

    // עדכון כפתור היכולת
    const skillFloatBtn = document.getElementById('skill-float-btn');
    if (skillFloatBtn) {
        if ((me.level || 0) === 0) {
            skillFloatBtn.style.display = 'none';
            return;
        }
        skillFloatBtn.onclick = () => activateSpecialSkill(me);
        skillFloatBtn.style.display = 'flex';

        const oneHour = 3600000;
        const lastSkill = parseInt(me.last_skill || '0');

        const oldOverlay = skillFloatBtn.querySelector('.skill-cooldown-overlay');
        if (oldOverlay) oldOverlay.remove();

        const overlay = document.createElement('div');
        overlay.className = 'skill-cooldown-overlay';
        overlay.style.cssText = 'display:none;position:absolute;inset:0;background:rgba(30,30,30,0.75);border-radius:50%;align-items:center;justify-content:center;font-size:0.72em;font-weight:bold;color:white;pointer-events:none;';
        skillFloatBtn.appendChild(overlay);

        const tickSkill = () => {
            const rem = oneHour - (Date.now() - lastSkill);
            if (rem > 0) {
                overlay.style.display = 'flex';
                skillFloatBtn.style.cursor = 'not-allowed';
                overlay.innerText = String(Math.floor(rem/60000)).padStart(2,'0') + ':' + String(Math.floor((rem%60000)/1000)).padStart(2,'0');
                requestAnimationFrame(tickSkill);
            } else {
                overlay.style.display = 'none';
                skillFloatBtn.style.cursor = 'pointer';
            }
        };
        tickSkill();
    }
}

function toggleBattleSidebar() {
    const sb = document.getElementById('battle-sidebar');
    const btn = document.getElementById('battle-float-btn');
    sb.classList.toggle('open');
    btn.classList.toggle('active', sb.classList.contains('open'));
}

function enterPickMode(skill) {
    const last = parseInt(localStorage.getItem('last_attack_' + currentUser + '_' + skill) || '0');
    if ((15 * 60 * 1000) - (Date.now() - last) > 0) return;
    battleState.selectedSkill = skill;
    document.getElementById('battle-sidebar').classList.remove('open');
    document.getElementById('battle-float-btn').classList.remove('active');
    document.getElementById('battle-pick-banner').classList.add('visible');
    document.querySelectorAll('.student-card').forEach(c => c.classList.add('pick-mode'));
}

function enterStealMode(callback) {
    battleState.stealMode = true;
    battleState.stealCallback = callback;
    document.getElementById('battle-pick-banner').innerText = '🫳 בחר תלמיד לקחת ממנו XP — לחץ כאן לביטול';
    document.getElementById('battle-pick-banner').classList.add('visible');
    document.querySelectorAll('.student-card').forEach(c => c.classList.add('steal-mode'));
}

function cancelSteal() {
    battleState.stealMode = false;
    battleState.stealCallback = null;
    document.getElementById('battle-pick-banner').innerText = '🎯 בחר כרטיס תלמיד לתקוף — לחץ כאן לביטול';
    document.getElementById('battle-pick-banner').classList.remove('visible');
    document.querySelectorAll('.student-card').forEach(c => c.classList.remove('steal-mode'));
}

function cancelAttack() {
    if (battleState.stealMode) { cancelSteal(); return; }
    battleState.selectedSkill = null;
    document.getElementById('battle-pick-banner').innerText = '🎯 בחר כרטיס תלמיד לתקוף — לחץ כאן לביטול';
    document.getElementById('battle-pick-banner').classList.remove('visible');
    document.querySelectorAll('.student-card').forEach(c => c.classList.remove('pick-mode'));
    document.querySelectorAll('.shields-overlay').forEach(o => o.classList.remove('visible'));
}

function handleCardClick(event, cardEl, studentId) {
    if (battleState.stealMode) {
        if (studentId === currentUser) return;
        event.stopPropagation();
        const cb = battleState.stealCallback;
        cancelSteal();
        if (cb) cb(studentId);
        return;
    }
    if (battleState.selectedSkill) {
        if (studentId === currentUser) return;
        event.stopPropagation();
        document.querySelectorAll('.shields-overlay').forEach(o => o.classList.remove('visible'));
        document.getElementById('shields-overlay-' + studentId)?.classList.add('visible');
        return;
    }
    cardEl.classList.toggle('flipped');
}

// RPS Modal
let resolveRPS;
function openRPSModal(title, desc) {
    document.getElementById('rps-modal-title').innerText = title;
    document.getElementById('rps-modal-desc').innerText = desc;
    document.getElementById('rps-modal-overlay').style.display = 'block';
    document.getElementById('rps-modal').style.display = 'block';
    return new Promise(resolve => { resolveRPS = resolve; });
}
function closeRPSModal() {
    document.getElementById('rps-modal-overlay').style.display = 'none';
    document.getElementById('rps-modal').style.display = 'none';
}
function chooseRPS(choice) {
    closeRPSModal();
    if (typeof resolveRPS === 'function') {
        resolveRPS(choice);
        resolveRPS = null;
    }
}

async function pickTargetShield(targetId, shieldIndex) {
    if (!battleState.selectedSkill) return;
    const skill = battleState.selectedSkill;
    const target = allStudents.find(s => s.id === targetId);
    if (!target) return;

    const broken = (target.history?.shields_broken || []);
    const maxShields = shieldsByLevel(target.level);
    const remainingShields = maxShields - broken.length;
    let rpsChoice = null;

    if (remainingShields === 1) {
        rpsChoice = await openRPSModal("⚔️ קרב על המגן האחרון!", `בחר נשק כדי לתקוף את המגן האחרון של ${target.full_name}:`);
        const valid = ["אבן", "נייר", "מספריים"];
        if (!valid.includes(rpsChoice)) return;
    }

    const mine = parseInt(shieldIndex);
    cancelAttack();
    localStorage.setItem('last_attack_' + currentUser + '_' + skill, Date.now().toString());

    try {
        const { error } = await supabase.from(TABLES.battles).insert([{ 
            attackerId: currentUser, 
            targetId: targetId, 
            skill, 
            mineIndex: mine, 
            status: 'pending',
            extraData: rpsChoice
        }]);
        if (error) throw error;
        alert(`המתקפה נשלחה! ${remainingShields === 1 ? "זהו דו-קרב!" : ""}`);
    } catch (e) { alert(e.message); }
}

async function checkPendingBattle() {
    if (!currentUser || currentUser === 'admin') return;
    try {
        const { data: pendingBattles, error } = await supabase
            .from(TABLES.battles)
            .select('*')
            .eq('targetId', currentUser)
            .eq('status', 'pending')
            .limit(50);
        
        if (error) throw error;
        if (pendingBattles.length) { 
            battleState.pendingBattle = pendingBattles[0]; 
            openDefenseModal(pendingBattles[0]); 
        } else {
            battleState.pendingBattle = null;
        }
        
        const { data: attackBattles, error: attackError } = await supabase
            .from(TABLES.battles)
            .select('targetId')
            .eq('attackerId', currentUser)
            .eq('status', 'pending')
            .limit(50);
        
        if (attackError) throw attackError;
        
        window._pendingBattleTargets = attackBattles.map(d => d.targetId);
        updateView();
    } catch(e) { console.error(e); }
}

// Defense Modal
function openDefenseModal(battle) {
    const me = allStudents.find(s => s.id === currentUser);
    if (!me) return;
    const attacker = allStudents.find(s => s.id === battle.attackerId);
    const broken = me.history?.shields_broken || [];
    document.getElementById('defense-modal-title').innerText = `⚔️ ${attacker?.full_name || 'מישהו'} תקף אותך!`;
    document.getElementById('defense-modal-desc').innerHTML = `מתקפה: <b>${battle.skill}</b><br>בחר מגן — נכון = חסמת!`;
    const row = document.getElementById('defense-shields-row');
    row.innerHTML = '';
    for (let i = 0; i < shieldsByLevel(me.level); i++) {
        const br = broken.includes(i);
        const span = document.createElement('span');
        span.className = 'shield-item' + (br ? ' broken' : '');
        span.textContent = br ? '💔' : '🛡️';
        span.title = br ? 'שבור' : 'לחץ';
        if (!br) span.onclick = () => resolveDefense(i, battle);
        row.appendChild(span);
    }
    document.getElementById('defense-modal-overlay').style.display = 'block';
    document.getElementById('defense-modal').style.display = 'block';
}

function closeDefenseModal() {
    document.getElementById('defense-modal-overlay').style.display = 'none';
    document.getElementById('defense-modal').style.display = 'none';
}

async function resolveDefense(chosen, battle) {
    closeDefenseModal();
    
    try {
        const me = allStudents.find(s => s.id === currentUser);
        const att = allStudents.find(s => s.id === battle.attackerId);
        if (!me) return;

        let history = (typeof me.history === 'string') ? JSON.parse(me.history || "{}") : (me.history || {});
        const attackerName = att?.full_name || 'תוקף לא ידוע';
        
        let ctx = {
            me: { ...me, history: history },
            att: att,
            isBlocked: parseInt(chosen) === parseInt(battle.mineIndex),
            xpGain: 10,
            TABLES: TABLES,
            utils: { getHistory: (s) => (typeof s.history === 'string' ? JSON.parse(s.history || "{}") : (s.history || {})) }
        };

        if (typeof CreatureSkills !== 'undefined') {
            for (let key in CreatureSkills) {
                try {
                    if (CreatureSkills[key].onDefense) {
                        const res = await CreatureSkills[key].onDefense(ctx);
                        if (res?.stop) {
                            await supabase.from(TABLES.battles).update({ status: 'resolved' }).eq('id', battle.id);
                            await loadStudents();
                            return;
                        }
                        if (res?.xpGain) ctx.xpGain = res.xpGain;
                    }
                } catch(skillErr) { console.warn('שגיאה ביכולת', key, skillErr); }
            }
        }

        const broken = [...(ctx.me.history.shields_broken || [])];
        const maxShields = shieldsByLevel(me.level);
        const isLastShield = (maxShields - broken.length) === 1;
        
        let isFinalBlocked = ctx.isBlocked;
        let finalXpGain = ctx.xpGain;

        if (isLastShield && battle.extraData) {
            const userGuess = await openRPSModal("⚔️ דו-קרב הגנה!", `${attackerName} בחר נשק! נחש מה הוא בחר:`);
            if (userGuess === battle.extraData) {
                isFinalBlocked = true;
                finalXpGain = ctx.xpGain * 2;
                alert(`מדהים! ניחשת נכון. (+${finalXpGain}XP)`);
            } else {
                isFinalBlocked = false;
                alert(`טעית! ${attackerName} בחר ${battle.extraData}.`);
            }
        }

        if (isFinalBlocked) { 
            let nxp = me.xp + finalXpGain;
            let nlvl = me.level || 0;
            while (nxp >= 100) { nlvl++; nxp -= 100; }
            ctx.me.history['block_' + Date.now()] = { msg: `חסמת את ${attackerName}! (+${finalXpGain}XP)`, xp: finalXpGain, time: Date.now() };
            await supabase.from(TABLES.students).update({ xp: nxp, level: nlvl, history: ctx.me.history }).eq('id', me.id);
            if (!isLastShield || !battle.extraData) alert(`✅ הצלחה! (+${finalXpGain}XP)`);
        } else {
            if (!broken.includes(battle.mineIndex)) broken.push(battle.mineIndex);
            const allBroken = broken.length >= maxShields;
            let myNewXP = me.xp;
            
            if (allBroken) {
                myNewXP = Math.max(0, me.xp - 10);
                ctx.me.history.shields_broken = [];
                ctx.me.history['battle_' + Date.now()] = { msg: `💥 ${attackerName} פגע בך. -10XP`, xp: -10, time: Date.now() };
            } else {
                ctx.me.history.shields_broken = broken;
                ctx.me.history['battle_' + Date.now()] = { msg: `🛡️ ${attackerName} הפיל לך מגן!`, xp: 0, time: Date.now() };
            }

            if (att) {
                const xpReward = Math.max(5, 10 * ((me.level || 1) - (att.level || 1)));
                let ah = ctx.utils.getHistory(att);
                let ax = att.xp + xpReward, al = att.level || 0;
                while (ax >= 100) { al++; ax -= 100; }
                ah['win_' + Date.now()] = { msg: `הצלחתי לפגוע ב-${me.full_name}! (+${xpReward}XP)`, xp: xpReward, time: Date.now() };
                await supabase.from(TABLES.students).update({ xp: ax, level: al, history: ah }).eq('id', att.id);
            }

            await supabase.from(TABLES.students).update({ xp: myNewXP, history: ctx.me.history }).eq('id', me.id);
            if (!isLastShield || !battle.extraData) alert(allBroken ? `💥 ספגת -10XP.` : `💥 המגן נשבר.`);
        }

        await supabase.from(TABLES.battles).update({ status: 'resolved' }).eq('id', battle.id);
        await loadStudents();
        
    } catch(e) { console.error('שגיאה בהגנה:', e); alert('שגיאה: ' + e.message); }
}
    
function updateCooldownDisplay() {
    if (!currentUser || currentUser === 'admin') return;
    const me = allStudents.find(s => s.id === currentUser);
    if (me) buildBattleSidebar(me);
}