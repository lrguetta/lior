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
    startApp();
}

function logout() { 
    localStorage.removeItem('farm_user_id'); 
    localStorage.removeItem('farm_teacher_grade');
    currentUser = null;
    currentGrade = null;
    location.reload(); 
}