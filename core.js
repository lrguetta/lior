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