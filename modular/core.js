/* ============================================
   הגדרות ראשיות וקונפיגורציה - CORE
   ============================================ */

// --- הגדרות סופרבייס ---
var sbUrl = 'https://muwpexflpjoqnaeiyfhk.supabase.co';
var sbKey = 'sb_publishable_poSgynlEXNYtk6kLRQpmhw_kytUEVF_';
var supabase = window.supabase.createClient(sbUrl, sbKey);

// שמות הטבלאות
const TABLES = {
    students: 'students',
    tasks: 'tasks', 
    submissions: 'submissions',
    announcements: 'announcements',
    welcomeImage: 'welcomeImage',
    battles: 'battles',
    creatureTypes: 'creature_types',
    events: 'events'
};

// משתנים גלובליים
let allStudents = [];
let allTasks = [];
let editingTaskId = null;
let currentTaskToSubmit = null;
let currentUser = localStorage.getItem('farm_user_id') || null;
let currentGrade = localStorage.getItem('farm_teacher_grade') || null;

// פונקציות עזר לנתונים
const shieldsByLevel = l => l===0?3 : l<10?4 : l<20?5 : 6;
const attacksByLevel = l => l===0?0 : l<10?1 : l<20?2 : 3;

const safe = t => typeof t!=='string' ? t : t.replace(/'/g,"&#39;").replace(/"/g,"&quot;");

// המרת מסמך תלמיד
function docToStudent(d) {
    const history = (typeof d.history === 'string') ? JSON.parse(d.history) : (d.history || {});
    const likes = (typeof d.likes === 'string') ? JSON.parse(d.likes) : (d.likes || {});

    return { 
        id: d.id,
        name: d.full_name || '',
        className: d.className || '', 
        xp: d.xp ?? 0, 
        level: d.level ?? 0,
        type: d.type || 'cat', 
        egg: d.egg ?? 0, 
        password: d.password || null,
        personalNote: d.personalNote || '', 
        lastNote: d.lastNote || '',
        likes: likes, 
        history: history, 
        isActive: d.isActive ?? false,
        last_skill: d.last_skill || null,
        cash: d.cash ?? 0,
        hasFlag: d.hasFlag ?? false,
        is_group: d.is_group ?? false
    }; 
}

// המרת מסמך משימה
function docToTask(d) {
    return { 
        id: d.id, 
        title: d.title || '', 
        deadline: d.deadline || '', 
        xp: d.xp ?? 20,
        cash: d.cash ?? 0,
        startTime: d.startTime || '', 
        endTime: d.endTime || '',
        questions: d.questions || [] 
    };
}

// בניית מודלים
function openGenericModal(html) {
    document.getElementById('generic-modal-content').innerHTML = html;
    document.getElementById('generic-modal-overlay').style.display = 'block';
    document.getElementById('generic-modal').style.display = 'block';
}

function closeGenericModal() {
    document.getElementById('generic-modal-overlay').style.display = 'none';
    document.getElementById('generic-modal').style.display = 'none';
}

function togglePanel(id) {
    const all = ['panel-announcements','panel-banner','panel-newtask','panel-submissions','panel-creatures','panel-events'];
    all.forEach(p => {
        const el = document.getElementById(p);
        if (!el) return;
        if (p === id) {
            const opening = el.style.display === 'none';
            el.style.display = opening ? 'block' : 'none';
            if (opening) {
                if (p === 'panel-submissions') initAdminSubmissions();
                if (p === 'panel-creatures') renderCreatureTypesList();
                if (p === 'panel-events') { loadEvents(); populateEventCreatureDropdown(); }
                if (p === 'panel-announcements') loadAnnouncements();
                if (p === 'panel-banner') loadWelcomeImageForAdmin();
            }
        } else el.style.display = 'none';
    });
}

// פונקציות לוח מודעות
function toggleBoard() {
    const board = document.getElementById('announcements-board');
    const btn = document.getElementById('toggle-board');
    board.classList.toggle('minimized');
    btn.innerText = board.classList.contains('minimized') ? '📢' : '−';
    btn.title = board.classList.contains('minimized') ? 'פתח לוח מודעות' : 'מזער לוח';
}

async function loadAnnouncements() {
    try {
        const { data, error } = await supabase
            .from(TABLES.announcements)
            .select('*')
            .order('created_at', { ascending: false })
            .limit(1);

        if (error) throw error;

        const text = data[0]?.text || 'אין הודעות חדשות כרגע.';
        const el = document.getElementById('announcements-content');
        if (el) el.innerText = text;

        if (currentUser === 'admin') {
            const ta = document.getElementById('adminAnnouncementsText');
            if (ta && !ta.value) ta.value = text !== 'אין הודעות חדשות כרגע.' ? text : '';
        }
    } catch(e) { console.error("שגיאה בטעינת הודעות:", e); }
}

async function saveAnnouncements() {
    try {
        const ta = document.getElementById('adminAnnouncementsText');
        if (!ta) return;
        
        const newText = ta.value.trim();
        if (!newText) return alert("נא להזין טקסט להודעה");

        const { error } = await supabase
            .from(TABLES.announcements)
            .upsert({ 
                id: '00000000-0000-0000-0000-000000000001', 
                text: newText,
                created_at: new Date().toISOString()
            });

        if (error) throw error;

        alert('הלוח עודכן בהצלחה!');
        loadAnnouncements();
    } catch (e) {
        console.error("שגיאה בפרסום הודעה:", e);
        alert('שגיאה בפרסום: ' + (e.message || e));
    }
}

// תמונת פתיחה
async function loadWelcomeImageForAdmin() {
    try {
        const { data, error } = await supabase
            .from(TABLES.welcomeImage)
            .select('*')
            .limit(1);

        if (error) throw error;

        const doc = data[0];
        const preview = document.getElementById('current-welcome-img-preview');
        const thumb = document.getElementById('preview-thumb');

        if (doc?.url) {
            if (thumb) thumb.src = doc.url;
            if (preview) preview.style.display = 'block';
            const u = document.getElementById('welcomeImgUrl');
            const c = document.getElementById('welcomeImgCaption');
            if (u) u.value = doc.url;
            if (c) c.value = doc.caption || '';
        } else if (preview) preview.style.display = 'none';
    } catch(e) { console.error("שגיאה:", e); }
}

async function publishWelcomeImageUrl() {
    const url = document.getElementById('welcomeImgUrl').value.trim();
    const cap = document.getElementById('welcomeImgCaption').value.trim();
    const st = document.getElementById('upload-status');
    if (!url) { alert('קישור לא תקין!'); return; }
    st.innerText = '⏳ שומר...';
    try {
        const { data } = await supabase.from(TABLES.welcomeImage).select('*').limit(1);
        if (data.length) {
            const { error } = await supabase.from(TABLES.welcomeImage).update({ url, caption: cap }).eq('id', data[0].id);
            if (error) throw error;
        } else {
            const { error } = await supabase.from(TABLES.welcomeImage).insert([{ url, caption: cap }]);
            if (error) throw error;
        }
        st.innerText = '✅ פורסם!';
    } catch(e) { st.innerText = '❌ ' + e.message; }
}

// האזנה לשינויים
function sub(tableName, callback) {
    return supabase
        .channel(`public:${tableName}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: tableName }, (payload) => {
            console.log(`שינוי זוהה בטבלה ${tableName}:`, payload);
            callback(payload);
        })
        .subscribe();
}

async function loadCreatureTypes() {
    try {
        const { data, error } = await supabase
            .from(TABLES.creatureTypes)
            .select('*')
            .limit(100);
        
        if (error) throw error;
        if (!data.length) throw new Error('empty');
        
        ATTACKS_BY_TYPE = {};
        data.forEach(d => {
            ATTACKS_BY_TYPE[d.typeId] = [1,2,3].map(n => ({ name:d['attack'+n]||'', icon:d['icon'+n]||'' }));
        });
    } catch(e) {
        ATTACKS_BY_TYPE = {};
        CREATURE_SEED_DATA.forEach(d => {
            ATTACKS_BY_TYPE[d.typeId] = [1,2,3].map(n => ({ name:d['attack'+n], icon:d['icon'+n] }));
        });
    }
}

// נתוני ברירת מחדל לדמויות
const CREATURE_SEED_DATA = [
    { typeId:'trt', label:'צב', attack1:'רובה 🔫', attack2:'צלף 🎯', attack3:'מיני-גאן 💥' },
    { typeId:'snk', label:'נחש', attack1:'הכשה כפולה 🐍', attack2:'יריקת ארס ☠️', attack3:'נשיפת דרקון 🔥' },
    { typeId:'hnd', label:'כלב הציד', attack1:'חץ וקשת 🏹', attack2:'רובה 🔫', attack3:'שוט-גאן 💢' },
    { typeId:'cat', label:'חתול', attack1:'חרב עץ 🪵', attack2:'קטאנה ⚔️', attack3:'חרב כפולה ⚔️⚔️' },
    { typeId:'crw', label:'עורב', attack1:'צווחה 🖤', attack2:'מקור בזק ⚡', attack3:'מקור זהב 🥇' },
    { typeId:'fsh', label:'דג', attack1:'פטיש 🔨', attack2:'מסור יד 🪚', attack3:'מסור חשמלי ⚙️' },
    { typeId:'chk', label:'אפרוח', attack1:'ניקור 🐥', attack2:'סכין שף 🔪', attack3:'סכין קצבים 🩸' },
    { typeId:'fox', label:'שועל', attack1:'נשיכה 🦊', attack2:'ריצת אש 🔥', attack3:'דש חם 🌋' },
    { typeId:'zbr', label:'זברה', attack1:'זברה קדברה 🦓', attack2:'קללת הפסים 🌀', attack3:'מבוך צללים 🌑' },
    { typeId:'mnk', label:'קוף', attack1:'סטירת מצילתיים 🥁', attack2:'אגרוף תוף 💪', attack3:'בום על-קולי 💣' },
    { typeId:'shp', label:'כבשה', attack1:'מכת פרסה 🐑', attack2:'מהה-טורפת 😈', attack3:'טורף פראי 🐺' },
    { typeId:'cow', label:'פרה', attack1:'נגיחה 🐄', attack2:'מוו-זרק 🌪️', attack3:'פרה משוגעת 🤯' },
    { typeId:'ost', label:'יען', attack1:'בעיטה חופשית 🦵', attack2:'פנדל ⚽', attack3:'מספרת ✂️' },
    { typeId:'rbt', label:'ארנב', attack1:'אגרוף מהיר 🐇', attack2:'קומבו ממוקד 🎯', attack3:'נוק-אאוט 🥊' },
    { typeId:'dnk', label:'חמור', attack1:'חמור גרם 🫏', attack2:'בעיטת חמור 💢', attack3:'חמורו של משיח ✨' },
    { typeId:'duk', label:'ברווז', attack1:'אל תיגע-גע 🦆', attack2:'פגע-גע וברח 💨', attack3:'קרב מגע-גע 🥋' },
    { typeId:'snl', label:'חילזון', attack1:'באג בתוכנה 🐛', attack2:"וירוס 'שבלול' 💻", attack3:'קריסת מערכות 💀' },
    { typeId:'owl', label:'ינשוף', attack1:'מבט אימה 👁️', attack2:'פגיון לילה 🌙', attack3:'חיסול אפל 🕶️' },
    { typeId:'spd', label:'עכביש', attack1:'קורים 🕸️', attack2:'משחק מסוכן 🕷️', attack3:'המופע האחרון 🎭' },
    { typeId:'wsl', label:'לוטרה', attack1:'חבטת זנב 🦦', attack2:'גרזן מלחמה 🪓', attack3:'פשיטת זעם ⚡' },
    { typeId:'lio', label:'אריה', attack1:'שריטה בצבע 🦁', attack2:'שאגת קשת 🌈', attack3:'שיסוע רב-גוונים 💥' },
    { typeId:'lmb', label:'עגל', attack1:'נגוח זהב 🐂', attack2:'חבטת 24 קראט 👑', attack3:'חרב מיליון דולר 💰' },
    { typeId:'egl', label:'נשר', attack1:'ניקור על-חלל 🦅', attack2:'כנף גלקטי 🌌', attack3:'חור שחור 🌀' },
    { typeId:'hlz', label:'חילזון התכלת', attack1:'מכחול טועה 🎨', attack2:'מברשת קטלנית 🖌️', attack3:'צביעת נשמה 🌈' },
];

let ATTACKS_BY_TYPE = {};
const CREATURE_TYPES = ['trt','snk','hnd','cat','crw','fsh','chk','fox','zbr','mnk','shp','cow','ost','rbt','dnk','duk','snl','owl','spd'];

async function subscribeAll() {
    console.log("מתחיל האזנה לשינויים...");
    sub(TABLES.students, () => loadStudents());
    sub(TABLES.tasks, () => loadTasks());
    sub(TABLES.announcements, () => loadAnnouncements());
    if (TABLES.submissions) {
        sub(TABLES.submissions, () => {
            if (currentUser === 'admin' && typeof initAdminSubmissions === 'function') {
                initAdminSubmissions();
            }
        });
    }
}

// בדיקת סכמת קרבות
async function checkBattlesSchema() {
    try {
        const { data, error } = await supabase.from(TABLES.battles).select('*').limit(1);
        if (error) { console.log('Battles table not ready:', error); return; }
        console.log('Battles table ready');
    } catch (e) { console.log('Battles table check failed:', e); }
}