/* ============================================
   אימות והתחברות - AUTH
   ============================================ */

function showLoginTab(tab) {
    document.querySelectorAll('.login-tabs button').forEach(b => b.classList.remove('active'));
    document.getElementById('tab-' + tab).classList.add('active');
    document.getElementById('admin-login-area').style.display = tab === 'admin' ? 'block' : 'none';
    document.getElementById('teacher-login-area').style.display = tab === 'teacher' ? 'block' : 'none';
    document.getElementById('student-login-area').style.display = tab === 'student' ? 'block' : 'none';
}
    
function checkAdmin() {
    const pass = document.getElementById('adminPass').value;
    if (pass === 'admin247148') {
        currentUser = 'admin';
        currentGrade = null;
        localStorage.removeItem('farm_teacher_grade');
        startApp();
    } else {
        alert('סיסמה שגויה');
    }
}

function checkTeacher() {
    const grade = document.getElementById('teacherGrade').value;
    const pass = document.getElementById('teacherPass').value;
    
    if (!grade) {
        alert('בחר כיתה!');
        return;
    }
    
    const teacherPasswords = {
        'א': 'teacher1',
        'ב': 'teacher2',
        'ג': 'teacher3',
        'ד': 'teacher4',
        'ה': 'rabenu247',
        'ו': 'teacher6'
    };
    
    if (pass === teacherPasswords[grade]) {
        currentUser = 'teacher_' + grade;
        currentGrade = grade;
        localStorage.setItem('farm_teacher_grade', grade);
        startApp();
    } else {
        alert('סיסמה שגויה לכיתה ' + grade);
    }
}

async function studentLogin() {
    const id = document.getElementById('studentSelect').value;
    const pass = document.getElementById('studentPass').value.trim();

    if (!id) { alert('בחר שם!'); return; }
    if (!pass) { alert('חובה סיסמה!'); return; }

    const s = allStudents.find(S => S.id === id);
    if (!s) { alert('תלמיד לא נמצא'); return; }

    if (!s.password) {
        if (!confirm("שמור '" + pass + "' כסיסמה קבועה?")) return;

        const { error } = await supabase
            .from(TABLES.students)
            .update({ password: pass })
            .eq('full_name', s.full_name);

        if (error) {
            console.error('שגיאה בשמירת סיסמה:', error);
            alert('שגיאה בשמירת הסיסמה');
            return;
        }

        allStudents.forEach(x => {
            if (x.full_name === s.full_name) x.password = pass;
        });

        alert('הסיסמה נשמרה!');
    } else if (s.password !== pass) { 
        alert('סיסמה שגויה!'); 
        return; 
    }

    currentUser = id;
    localStorage.setItem('farm_user_id', id);
    document.getElementById('studentPass').value = '';
    await startApp();
    activateStudentMap();
}

function logout() { 
    localStorage.removeItem('farm_user_id'); 
    localStorage.removeItem('farm_teacher_grade');
    currentUser = null;
    currentGrade = null;
    location.reload(); 
}

// אתחול האפליקציה
async function startApp() {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('farm-grid').style.display = 'grid';
    document.getElementById('tasks-area').style.display = 'block';
    
    const isTeacher = currentUser && currentUser.startsWith('teacher_');
    
    if (currentUser === 'admin' || isTeacher) {
        document.getElementById('control-panel').style.display = 'flex';
        
        if (isTeacher && currentGrade) {
            const classSelect = document.getElementById('studentClass');
            classSelect.innerHTML = `
                <option value="${currentGrade}1">כיתה ${currentGrade}'1</option>
                <option value="${currentGrade}2">כיתה ${currentGrade}'2</option>
            `;
        }
        
        if (currentUser === 'admin') {
            await Promise.all([loadAnnouncements(), loadWelcomeImageForAdmin(), initAdminSubmissions(), loadEvents()]);
            document.getElementById('magic-btn').style.display = 'inline-block';
        } else {
            await loadEvents();
        }
    } else {
        // תלמיד - הצגת כפתורים וכרטיסים
        document.getElementById('logout-btn-float').style.display = 'block';
        await loadEvents();
        
        // הצגת כפתורי חנות ותיק
        ['shop-btn', 'bag-btn'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = 'flex';
        });

        await showWelcomeImageIfExists();
        
        const me = allStudents.find(s => s.id === currentUser);
        if (me && attacksByLevel(me.level) > 0) {
            document.getElementById('battle-float-btn').style.display = 'flex';
            buildBattleSidebar(me);
        }
        setTimeout(() => checkPendingBattle(), 1500);
    }
    
    subscribeAll();
    updateView();
    renderTasks();
}

// תצוגת תמונת פתיחה
async function showWelcomeImageIfExists() {
    try {
        const { data } = await supabase.from(TABLES.welcomeImage).select('*').limit(1);
        const doc = data[0];
        if (!doc?.url) return;
        
        const overlay = document.getElementById('welcome-image-overlay');
        const imgEl = document.getElementById('welcome-img-el');
        const caption = document.getElementById('welcome-img-caption');
        const old = document.getElementById('welcome-video-frame');
        if (old) old.remove();
        
        if (doc.url.includes('streamable.com')) {
            imgEl.style.display = 'none';
            const iframe = document.createElement('iframe');
            iframe.id = 'welcome-video-frame';
            iframe.src = 'https://streamable.com/e/' + doc.url.split('streamable.com/').pop().split('?')[0];
            iframe.setAttribute('allowfullscreen', '');
            iframe.style = 'width:80vw;max-width:800px;height:45vw;max-height:450px;border-radius:12px;display:block;';
            imgEl.parentNode.insertBefore(iframe, imgEl);
        } else {
            imgEl.style.display = 'block';
            imgEl.src = doc.url;
        }
        caption.innerText = doc.caption || '';
        caption.style.display = doc.caption ? 'block' : 'none';
        overlay.classList.add('active');
    } catch(e) { console.error(e); }
}

// סגירת תמונת פתיחה
function closeWelcomeImage() {
    document.getElementById('welcome-image-overlay').classList.remove('active');
    const f = document.getElementById('welcome-video-frame');
    if (f) f.src = '';
}

// מחיקת כפילויות הגשות
async function removeDuplicateSubmissions() {
    if (!confirm("למחוק הגשות כפולות?")) return;
    try {
        const { data: subs, error } = await supabase.from(TABLES.submissions).select('*').order('created_at', { ascending: false });
        if (error) throw error;
        
        const seen = new Set();
        const toDelete = [];
        subs.forEach(s => {
            const key = `${s.studentId}_${s.taskId}`;
            if (seen.has(key)) toDelete.push(s.id);
            else seen.add(key);
        });
        
        if (toDelete.length === 0) {
            alert("אין כפילויות.");
            return;
        }
        
        const { error: deleteError } = await supabase.from(TABLES.submissions).delete().in('id', toDelete);
        if (deleteError) throw deleteError;
        
        alert(`הוסרו ${toDelete.length} הגשות כפולות.`);
        if (typeof initAdminSubmissions === 'function') await initAdminSubmissions();
    } catch(e) { alert("שגיאה: " + e.message); }
}