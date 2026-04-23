/* ============================================
   מטלות ושאלות - TASKS
   ============================================ */

async function loadTasks() {
    try {
        const { data, error } = await supabase
            .from(TABLES.tasks)
            .select('*')
            .limit(200);

        if (error) throw error;

        allTasks = data.map(d => ({
            id: d.id,
            title: d.title || '',
            content: d.content || '',
            xp: d.xp || 0,
            ...d
        }));

        if (currentUser) renderTasks();
    } catch(e) { console.error("שגיאה בטעינת מטלות:", e); }
}

function addQuestionField(existingType=null, qData=null) {
    const type = existingType || document.getElementById('questionType').value;
    const container = document.getElementById('questions-constructor');
    const div = document.createElement('div');
    div.className = 'question-item'; div.dataset.type = type;
    const typeLabels = {open:'פתוחה',multiple:'אמריקאית',survey:'סקר',study_unit:'יחידת לימוד',boolean:'נכון/לא נכון'};
    let html = `<button onclick="this.parentElement.remove()" style="position:absolute;left:10px;top:10px;background:#ff5252;color:white;border:none;border-radius:4px;cursor:pointer;padding:5px 10px;">X</button>
        <strong>סוג: ${typeLabels[type]||type}</strong><br>
        <input type="text" class="q-text" placeholder="הקלד את השאלה..." style="width:90%;margin-top:10px;margin-bottom:10px;">`;
    if (type==='multiple') html += `<div style="display:grid;grid-template-columns:1fr 1fr;gap:5px;">
        <input type="text" placeholder="תשובה נכונה" class="opt-correct" style="border:2px solid #4caf50;">
        <input type="text" placeholder="מסיח 1" class="opt"><input type="text" placeholder="מסיח 2" class="opt"><input type="text" placeholder="מסיח 3" class="opt"></div>`;
    else if (type==='boolean') html += `<div>תשובה: <select class="q-ans-bool"><option value="נכון">נכון</option><option value="לא נכון">לא נכון</option></select></div>`;
    else if (type==='survey') html += `<div style="display:grid;grid-template-columns:1fr;gap:5px;">
        <div style="font-size:0.85em;color:#666;">* בחירה מרובה ללא תשובה נכונה</div>
        ${[1,2,3,4,5].map(n=>`<input type="text" placeholder="אפשרות ${n}" class="opt-survey">`).join('')}</div>`;
    else if (type==='study_unit') html += `<div style="background:#e8f5e9;padding:10px;border-radius:4px;border:1px solid #c8e6c9;">
        <strong style="font-size:0.85em;color:#2e7d32;">תשובה לבדיקה אוטומטית:</strong>
        <div style="display:flex;gap:5px;margin-top:6px;">
            <input type="text" placeholder="פרק" class="study-ans-chapter" style="width:30%;padding:5px;text-align:center;">
            <input type="text" placeholder="מפסוק" class="study-ans-start" style="width:35%;padding:5px;text-align:center;">
            <input type="text" placeholder="עד פסוק" class="study-ans-end" style="width:35%;padding:5px;text-align:center;">
        </div></div>`;
    div.innerHTML = html; container.appendChild(div);
    if (qData) {
        div.querySelector('.q-text').value = qData.text||'';
        if (type==='multiple' && qData.others) { div.querySelector('.opt-correct').value=qData.correct||''; div.querySelectorAll('.opt').forEach((el,i)=>{ if(qData.others[i]) el.value=qData.others[i]; }); }
        else if (type==='boolean') div.querySelector('.q-ans-bool').value = qData.correct||'נכון';
        else if (type==='survey' && qData.options) div.querySelectorAll('.opt-survey').forEach((el,i)=>{ if(qData.options[i]) el.value=qData.options[i]; });
    }
}

async function saveNewTask() {
    const title     = document.getElementById('taskTitle').value;
    const deadline  = document.getElementById('taskDeadline').value;
    const xp        = parseInt(document.getElementById('taskXP').value) || 20;
    const cash      = parseInt(document.getElementById('taskCash').value) || 20;
    const startTime = document.getElementById('taskStartTime').value;
    const endTime   = document.getElementById('taskEndTime').value;
    const qNodes = document.querySelectorAll('#questions-constructor .question-item');

    if (!title) { alert('חובה כותרת!'); return; }
    if (!qNodes.length) { alert('חובה שאלה אחת לפחות!'); return; }

    const questions = Array.from(qNodes).map(n => {
        const type = n.dataset.type, obj = { type, text: n.querySelector('.q-text').value };
        if (type === 'multiple') { 
            obj.correct = n.querySelector('.opt-correct').value; 
            obj.others = Array.from(n.querySelectorAll('.opt')).map(i => i.value).filter(v => v); 
        }
        else if (type === 'boolean') obj.correct = n.querySelector('.q-ans-bool').value;
        else if (type === 'survey')  obj.options = Array.from(n.querySelectorAll('.opt-survey')).map(i => i.value).filter(v => v);
        else if (type === 'study_unit') { 
            obj.chapter = n.querySelector('.study-ans-chapter').value; 
            obj.start = n.querySelector('.study-ans-start').value; 
            obj.end = n.querySelector('.study-ans-end').value; 
        }
        return obj;
    });

    const formatTimeForDB = (timeStr) => {
        if (!timeStr) return null;
        const today = new Date();
        const [hours, minutes] = timeStr.split(':');
        return new Date(today.getFullYear(), today.getMonth(), today.getDate(), parseInt(hours), parseInt(minutes), 0).toISOString();
    };

    const payload = {
        title, deadline, xp, cash,
        startTime: formatTimeForDB(startTime),
        endTime: formatTimeForDB(endTime),
        questions,
    };

    try { 
        let result;
        if (typeof editingTaskId !== 'undefined' && editingTaskId) {
            result = await supabase.from(TABLES.tasks).update(payload).eq('id', editingTaskId);
            if (result.error) throw result.error;
            alert('השינויים נשמרו בהצלחה! ✨');
        } else {
            payload.created_at = new Date().toISOString();
            result = await supabase.from(TABLES.tasks).insert([payload]);
            if (result.error) throw result.error;
            alert('פורסם! 🚀'); 
        }
    }
    catch(e) { 
        alert("שגיאה בשמירה: " + e.message); 
        return; 
    }

    editingTaskId = null;
    const mainBtn = document.getElementById('publish-task-btn');
    if (mainBtn) mainBtn.innerText = 'פרסם מטלה 🚀'; 

    ['taskTitle','taskDeadline','taskStartTime','taskEndTime'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    
    document.getElementById('taskXP').value = '20';
    document.getElementById('taskCash').value = '20';
    
    const timeLimitContainer = document.getElementById('time-limit-container');
    if (timeLimitContainer) timeLimitContainer.style.display = 'none';
    
    document.getElementById('questions-constructor').innerHTML = '';
    
    if (typeof loadTasks === 'function') await loadTasks();
}

function fillLastQuestionData(q) {
    const items = document.querySelectorAll('#questions-constructor .question-item');
    const lastItem = items[items.length - 1];
    if (!lastItem) return;
    
    try {
        const qTextEl = lastItem.querySelector('.q-text');
        if (qTextEl) qTextEl.value = q.text || '';
        
        if (q.type === 'multiple') {
            const correctEl = lastItem.querySelector('.opt-correct');
            if (correctEl) correctEl.value = q.correct || '';
            const otherInputs = lastItem.querySelectorAll('.opt');
            if (q.others) q.others.forEach((val, i) => { if(otherInputs[i]) otherInputs[i].value = val; });
        } else if (q.type === 'boolean') {
            const boolEl = lastItem.querySelector('.q-ans-bool');
            if (boolEl) boolEl.value = q.correct || 'נכון';
        } else if (q.type === 'survey') {
            const surveyInputs = lastItem.querySelectorAll('.opt-survey');
            if (q.options) q.options.forEach((val, i) => { if(surveyInputs[i]) surveyInputs[i].value = val; });
        } else if (q.type === 'study_unit') {
            const chapterEl = lastItem.querySelector('.study-ans-chapter');
            const startEl = lastItem.querySelector('.study-ans-start');
            const endEl = lastItem.querySelector('.study-ans-end');
            if (chapterEl) chapterEl.value = q.chapter || '';
            if (startEl) startEl.value = q.start || '';
            if (endEl) endEl.value = q.end || '';
        }
    } catch (err) { console.error('שגיאה במילוי נתוני שאלה:', err); }
}

async function deleteTask(id) {
    if (!confirm('האם אתה בטוח שברצונך למחוק את המטלה? פעולה זו תמחוק גם את כל ההגשות הקשורות אליה.')) return;

    try {
        if (confirm('האם תרצה להפיק דו"ח (PDF) של ההגשות למטלה זו לפני שהמידע יימחק לצמיתות?')) {
            await printSubmissionsReport(id);
        }

        const { error: taskError } = await supabase.from(TABLES.tasks).delete().eq('id', id);
        if (taskError) throw taskError;

        const { error: subError } = await supabase.from(TABLES.submissions).delete().eq('taskId', id);
        if (subError) throw subError;

        if (typeof allTasks !== 'undefined') {
            allTasks = allTasks.filter(t => t.id !== id);
        }

        if (typeof renderTasks === 'function') renderTasks();
        if (typeof initAdminSubmissions === 'function') await initAdminSubmissions();

        alert("המטלה וההגשות הקשורות אליה נמחקו בהצלחה.");

    } catch (e) {
        console.error("Delete failed:", e);
        alert("שגיאה בתהליך המחיקה: " + e.message);
        if (typeof loadTasks === 'function') await loadTasks();
    }
}