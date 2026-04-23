/* ============================================
   הגשות - SUBMISSIONS
   ============================================ */

async function initAdminSubmissions() {
    const container = document.getElementById('submissions-list');
    if (!container) return;
    
    container.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 15px;">
            <h4 style="margin:0; color:#2e7d32;">📥 הגשות לבדיקה</h4>
            <button onclick="downloadSubmissionsReport()" style="background:#1976d2; color:white; border:none; padding:8px 12px; border-radius:5px; cursor:pointer; font-size:0.85em;">📊 דוח</button>
        </div>
        <div id="subs-items-container" style="color:#888;text-align:center;">טוען...</div>
    `;

    const itemsContainer = document.getElementById('subs-items-container');

    try {
        const { data: subs, error } = await supabase
            .from(TABLES.submissions)
            .select(`*, students (full_name)`)
            .eq('status', 'submitted')
            .order('created_at', { ascending: false });

        if (error) throw error;
        if (!subs || subs.length === 0) { 
            itemsContainer.innerHTML = '<div style="color:#666;text-align:center;padding:20px;">אין הגשות חדשות ✨</div>'; 
            return; 
        }

        itemsContainer.innerHTML = '';

        subs.forEach(sub => {
            const task = allTasks.find(t => t.id === sub.taskId);
            const studentName = sub.students?.full_name || 'תלמיד לא ידוע';
            const grade = sub.grade !== undefined ? sub.grade : null;
            
            const gradeDisplay = grade !== null ? 
                `<span style="background:#e3f2fd; color:#1565c0; padding:2px 8px; border-radius:10px; font-size:0.85em; font-weight:bold;">ציון: ${grade}</span>` : "";

            const d = document.createElement('div');
            d.style = 'background:white;padding:15px;margin:10px 0;border-radius:8px;border-right:5px solid gold;text-align:right;box-shadow:0 2px 4px rgba(0,0,0,0.1);';
            
            d.innerHTML = `
                <div style="margin-bottom:10px; display:flex; justify-content:space-between; align-items:start;">
                    <div>
                        <strong style="color:#2e7d32; font-size:1.1em;">${studentName}</strong>
                        <div style="font-size:0.85em;color:#666;">מטלה: ${task?.title || 'כללית'} | XP: ${task?.xp || 20}</div>
                    </div>
                    ${gradeDisplay}
                </div>
                <div style="display:flex;gap:5px;margin-top:10px;">
                    <button onclick="approveSub('${sub.id}','${sub.studentId}',1)" style="background:#4caf50;flex:1;color:white;border:none;padding:8px;border-radius:4px;cursor:pointer;font-weight:bold;">אשר מלא</button>
                    <button onclick="approveSub('${sub.id}','${sub.studentId}',0.5)" style="background:#ffc107;flex:1;color:white;border:none;padding:8px;border-radius:4px;cursor:pointer;font-weight:bold;">אשר חלקי</button>
                    <button onclick="rejectSub('${sub.id}','${sub.studentId}')" style="background:#f44336;flex:1;color:white;border:none;padding:8px;border-radius:4px;cursor:pointer;font-weight:bold;">דחה</button>
                </div>
            `;
            itemsContainer.appendChild(d);
        });
    } catch (e) { 
        console.error("Error:", e);
        itemsContainer.innerHTML = `<div style="color:red;">שגיאה: ${e.message}</div>`; 
    }
}

async function renderTasks() {
    const list = document.getElementById('tasks-list');
    if (!list) return;
    list.innerHTML = '';
    
    if (!allTasks || !allTasks.length) { list.innerHTML = 'אין מטלות כרגע.'; return; }
    
    let submittedIds = [];
    try {
        if (currentUser !== 'admin') {
            const { data: subs, error } = await supabase
                .from(TABLES.submissions)
                .select('taskId')
                .eq('studentId', currentUser);
            if (!error && subs) submittedIds = subs.map(d => d.taskId);
        }
    } catch(e) { console.error("שגיאה בטעינת הגשות:", e); }

    allTasks.slice().reverse().forEach(task => {
        const div = document.createElement('div'); div.className = 'task-card';
        let btn;
        
        if (currentUser === 'admin') {
            btn = `<button onclick="editTask('${task.id}')" style="background:#ff9800;margin-left:5px;">ערוך ✏️</button>
                   <button onclick="deleteTask('${task.id}')" style="background:#ff5252;">מחק 🗑️</button>`;
        } else if (submittedIds.includes(task.id)) {
            btn = `<button disabled style="background:#999;cursor:not-allowed;">כבר הגשת ✔️</button>`;
        } else {
            const st = task.title.replace(/'/g, '׳').replace(/"/g, '״'); 
            btn = `<button id="student-btn-${task.id}" onclick="openSubmitModal('${task.id}','${st}')" style="background:#1976d2;">פתח ✍️</button>`; 
        }
        
        div.innerHTML = `
            <div class="task-info">
                <h4>${task.title}</h4>
                <div style="font-size:0.85em;color:#555;margin-top:4px;">
                    🎁 ${task.xp || 20} XP
                    ${task.deadline ? `<br>⏰ ${task.deadline}` : ''}
                    ${(task.startTime && task.endTime) ? `<br>⏳ <span id="timer-${task.id}" style="color:#d32f2f;font-weight:bold;">מחשב...</span>` : ''}
                </div>
            </div>
            <div>${btn}</div>`;
        list.appendChild(div);
    });
    
    if (typeof updateAllTimers === 'function') updateAllTimers();
}

function openSubmitModal(id, title) {
    currentTaskToSubmit = id;
    const titleEl = document.getElementById('modal-task-title');
    if (titleEl) titleEl.innerText = title;
    
    const task = allTasks.find(t => t.id === id);
    const container = document.getElementById('questions-display');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (task?.questions) {
        task.questions.forEach((q, i) => {
            const d = document.createElement('div');
            d.style = 'margin-bottom:15px;padding:15px;background:#f0f7ff;border-radius:8px;border:1px solid #bbdefb;position:relative;';
            d.innerHTML = `<strong>${i + 1}. ${q.text}</strong><br>`;
            
            if (q.type === 'open') {
                d.innerHTML += `<textarea class="ans-input" data-index="${i}" style="width:100%;margin-top:10px;height:60px;" placeholder="תשובתך כאן..."></textarea>`;
            } else if (q.type === 'boolean') {
                d.innerHTML += `<div style="margin-top:10px;"><label style="margin-left:20px;cursor:pointer;"><input type="radio" name="q${i}" value="נכון"> נכון</label><label style="cursor:pointer;"><input type="radio" name="q${i}" value="לא נכון"> לא נכון</label></div>`;
            } else if (q.type === 'multiple') {
                const options = [q.correct, ...(q.others || [])].sort(() => Math.random() - .5);
                options.forEach(opt => {
                    d.innerHTML += `<label style="display:block;margin-top:8px;cursor:pointer;background:white;padding:8px;border-radius:5px;border:1px solid #ddd;"><input type="radio" name="q${i}" value="${opt}"> ${opt}</label>`;
                });
            } else if (q.type === 'survey') {
                (q.options || []).forEach(opt => {
                    d.innerHTML += `<label style="display:block;margin-top:8px;cursor:pointer;background:white;padding:8px;border-radius:5px;border:1px solid #ddd;"><input type="checkbox" name="q${i}" value="${opt}"> ${opt}</label>`;
                });
            } else if (q.type === 'study_unit') {
                d.innerHTML += `<div style="display:flex;gap:5px;margin-top:10px;">
                    <input type="text" id="study_chapter_${i}" placeholder="פרק" style="width:30%;padding:8px;border:1px solid #ccc;border-radius:4px;">
                    <input type="text" id="study_start_${i}" placeholder="מפסוק" style="width:35%;padding:8px;border:1px solid #ccc;border-radius:4px;">
                    <input type="text" id="study_end_${i}" placeholder="עד פסוק" style="width:35%;padding:8px;border:1px solid #ccc;border-radius:4px;">
                </div>`;
            }
            container.appendChild(d);
        });
    }
    document.getElementById('submit-modal').style.display = 'block';
}

function closeModal() { 
    const modal = document.getElementById('submit-modal');
    if (modal) modal.style.display = 'none'; 
}

async function sendSubmission() {
    const task = allTasks.find(t => t.id === currentTaskToSubmit);
    if (!task) return;

    const { data: existing, error: checkErr } = await supabase
        .from(TABLES.submissions)
        .select('id')
        .eq('studentId', currentUser)
        .eq('taskId', currentTaskToSubmit);

    if (existing && existing.length > 0) {
        alert("הגשה כפולה");
        closeModal();
        return;
    }

    const answers = []; 
    let allAnswered = true;
    let correctCount = 0; 
    let gradableCount = 0;

    if (task?.questions) {
        task.questions.forEach((q, i) => {
            let val = '';
            let isCorrect = false;

            if (q.type === 'open') {
                val = document.querySelector(`textarea[data-index="${i}"]`)?.value.trim() || '';
            } else if (q.type === 'survey') {
                val = Array.from(document.querySelectorAll(`input[name="q${i}"]:checked`)).map(c => c.value).join(' | ');
            } else if (q.type === 'study_unit') {
                const ch = document.getElementById(`study_chapter_${i}`)?.value.trim() || '';
                const st = document.getElementById(`study_start_${i}`)?.value.trim() || '';
                const en = document.getElementById(`study_end_${i}`)?.value.trim() || '';
                val = (ch || st || en) ? `פרק ${ch}, פסוקים ${st}-${en}` : '';
                const correctCh = (q.chapter || '').trim();
                const correctSt = (q.start || '').trim();
                const correctEn = (q.end || '').trim();
                if (ch === correctCh && st === correctSt && en === correctEn) isCorrect = true;
            } else {
                const c = document.querySelector(`input[name="q${i}"]:checked`);
                val = c ? c.value : '';
                if (q.correct && val.trim() === String(q.correct).trim()) isCorrect = true;
            }
            
            if (!val) allAnswered = false;
            const isGradable = (q.type === 'multiple' || q.type === 'boolean' || q.type === 'study_unit');
            if (isGradable) {
                gradableCount++;
                if (isCorrect) correctCount++;
            }
            answers.push({ q: q.text, a: val });
        });
    }
    
    const suggestedGrade = gradableCount > 0 ? Math.round((correctCount / gradableCount) * 100) : 100;
    if (!allAnswered && !confirm('לא ענית על הכל. לשלוח בכל זאת?')) return;

    try {
        const { error } = await supabase.from(TABLES.submissions).insert([{
            studentId: currentUser,
            taskId: currentTaskToSubmit,
            taskTitle: task.title, 
            answers: answers, 
            status: 'submitted',
            grade: suggestedGrade, 
            created_at: new Date().toISOString()
        }]);
        if (error) throw error;

        alert(`נשלח בהצלחה! 🎉\nציון מוצע: ${suggestedGrade}`); 
        closeModal(); 
        if (typeof renderTasks === 'function') await renderTasks();
    } catch (e) { 
        alert("שגיאה בשליחה: " + e.message); 
    }
}