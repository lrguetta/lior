/* ============================================
   אירועים מיוחדים - EVENTS
   ============================================ */

let currentActiveEvent = null;
let eventTimerInterval = null;

async function loadEvents() {
    try {
        const { data, error } = await supabase
            .from(TABLES.events)
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        renderEventsList(data || []);
        
        const now = new Date();
        const activeEvent = (data || []).find(e => new Date(e.endTime) > now);
        
        if (activeEvent) {
            currentActiveEvent = activeEvent;
            console.log('Active event loaded:', currentActiveEvent);
            showEventBanner(activeEvent);
        } else {
            currentActiveEvent = null;
            hideEventBanner();
        }
    } catch(e) { console.error('Error loading events:', e); }
}

function renderEventsList(events) {
    const container = document.getElementById('events-list');
    if (!container) return;
    
    if (!events || events.length === 0) {
        container.innerHTML = '<div style="text-align:center; color:#999; padding:20px;">אין אירועים עדיין</div>';
        return;
    }
    
    const now = new Date();
    container.innerHTML = events.map(e => {
        const endTime = new Date(e.endTime);
        const isActive = endTime > now;
        const timeLeft = isActive ? getTimeRemaining(endTime) : 'הסתיים';
        
        return `
            <div style="background:#fff3e0; padding:15px; border-radius:10px; margin-top:15px; border:1px solid #ffcc80;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <strong style="color:#e65100; font-size:1.1em;">${e.title || 'אירוע'}</strong>
                        <div style="color:#666; font-size:0.9em; margin-top:5px;">${e.description || ''}</div>
                        <div style="color:#7b1fa2; font-size:0.85em; margin-top:5px;">🎁 דמות: ${e.creatureType || 'רגילה'}</div>
                    </div>
                    <div style="text-align:left;">
                        <div style="color:${isActive ? '#2e7d32' : '#999'}; font-weight:bold;">${timeLeft}</div>
                        ${isActive ? '<span style="color:#2e7d32; font-size:0.8em;">פעיל</span>' : '<span style="color:#999; font-size:0.8em;">הסתיים</span>'}
                    </div>
                </div>
                <button onclick="deleteEvent('${e.id}')" style="background:#f44336; color:white; border:none; padding:8px 16px; border-radius:6px; margin-top:10px; cursor:pointer; font-size:0.85em;">🗑️ מחק אירוע</button>
            </div>`;
    }).join('');
}

function getTimeRemaining(endTime) {
    const now = new Date();
    const diff = endTime - now;
    if (diff <= 0) return 'הסתיים';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    if (hours > 24) {
        const days = Math.floor(hours / 24);
        return `${days} ימים ${hours % 24} שעות`;
    }
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

async function addNewEvent() {
    const title = document.getElementById('event-title').value.trim();
    const desc = document.getElementById('event-desc').value.trim();
    const hours = parseInt(document.getElementById('event-hours').value) || 24;
    const creatureType = document.getElementById('event-creature-type').value;
    const rawEggNum = parseInt(document.getElementById('event-egg-num').value) || 1;
    const eggNum = rawEggNum - 1;
    
    if (!title) { alert('חובה להזין כותרת!'); return; }
    if (!creatureType) { alert('חובה לבחור דמות!'); return; }
    if (rawEggNum < 1 || rawEggNum > 50) { alert('מספר ביצה 1-50!'); return; }
    
    try {
        const endTime = new Date();
        endTime.setHours(endTime.getHours() + hours);
        
        const { error } = await supabase.from(TABLES.events).insert([{
            title, description: desc, endTime: endTime.toISOString(),
            creatureType, eggNum
        }]);
        
        if (error) throw error;
        
        document.getElementById('event-title').value = '';
        document.getElementById('event-desc').value = '';
        document.getElementById('event-creature-type').value = '';
        
        alert('האירוע נוצר בהצלחה! 🎉');
        await loadEvents();
        
    } catch(e) { console.error('Error:', e); alert('שגיאה: ' + e.message); }
}

async function deleteEvent(eventId) {
    if (!confirm('למחוק את האירוע?')) return;
    try {
        const { error } = await supabase.from(TABLES.events).delete().eq('id', eventId);
        if (error) throw error;
        alert('האירוע נמחק');
        await loadEvents();
    } catch(e) { alert('שגיאה: ' + e.message); }
}

function showEventBanner(event) {
    const overlay = document.getElementById('event-banner-overlay');
    const title = document.getElementById('event-banner-title');
    const desc = document.getElementById('event-banner-desc');
    const timer = document.getElementById('event-banner-timer');
    const creatureDiv = document.getElementById('event-banner-creature');
    
    overlay.style.display = 'block';
    title.textContent = event.title || 'אירוע מיוחד!';
    desc.textContent = event.description || 'הצטרפו!';
    creatureDiv.style.display = 'none';
    
    if (eventTimerInterval) clearInterval(eventTimerInterval);
    
    const updateTimer = () => {
        const endTime = new Date(event.endTime);
        const now = new Date();
        const diff = endTime - now;
        if (diff <= 0) {
            timer.textContent = 'האירוע הסתיים!';
            if (eventTimerInterval) clearInterval(eventTimerInterval);
            hideEventBanner();
            return;
        }
        timer.textContent = '⏰ נותר: ' + getTimeRemaining(endTime);
    };
    
    updateTimer();
    eventTimerInterval = setInterval(updateTimer, 1000);
}

function hideEventBanner() {
    const overlay = document.getElementById('event-banner-overlay');
    overlay.style.display = 'none';
    if (eventTimerInterval) { clearInterval(eventTimerInterval); eventTimerInterval = null; }
    const restoreBtn = document.getElementById('event-banner-restore-btn');
    if (restoreBtn) restoreBtn.remove();
}

function closeEventBanner() {
    hideEventBanner();
    const restoreBtn = document.getElementById('event-banner-restore-btn');
    if (restoreBtn) restoreBtn.remove();
}

function minimizeEventBanner() {
    const overlay = document.getElementById('event-banner-overlay');
    overlay.style.display = 'none';
    
    let restoreBtn = document.getElementById('event-banner-restore-btn');
    if (!restoreBtn) {
        restoreBtn = document.createElement('div');
        restoreBtn.id = 'event-banner-restore-btn';
        restoreBtn.textContent = '🎉';
        restoreBtn.style.cssText = 'position:fixed;top:5px;left:50%;transform:translateX(-50%);width:45px;height:45px;border-radius:50%;background:#e65100;display:flex;align-items:center;justify-content:center;font-size:20px;cursor:pointer;z-index:2600;box-shadow:0 4px 10px rgba(0,0,0,0.3);';
        restoreBtn.onclick = function() {
            overlay.style.display = 'block';
            this.remove();
        };
        document.body.appendChild(restoreBtn);
    } else {
        restoreBtn.style.display = 'flex';
    }
}

function handleEventBannerClick(e) {
    const overlay = document.getElementById('event-banner-overlay');
    if (overlay.classList.contains('minimized')) {
        overlay.classList.remove('minimized');
        overlay.classList.add('active');
        overlay.style.display = 'block';
    }
}