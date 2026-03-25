// skills.js - מאגר היכולות המיוחדות של החיות בחווה
const CreatureSkills = {
    // 1. חתול - מכת בזק
    "cat": async (ctx) => {
        return new Promise((resolve) => {
            enterStealMode(async (targetId) => {
                const target = ctx.allStudents.find(s => s.id === targetId);
                if (!target) { resolve(null); return; }
                if (Math.random() > 0.5) {
                    const damage = 15;
                    await ctx.dbSvc.updateDocument(ctx.DB_ID, ctx.TABLES.students, target.id, { xp: Math.max(0, target.xp - damage) });
                    resolve({ message: `⚔️ המכה הצליחה! ${target.name} איבד ${damage} XP.` });
                } else {
                    resolve({ message: "💨 פספוס! החתול חתך רק את האוויר." });
                }
            });
        });
    },

    // 2. אפרוח - סעודת מלכים
    "chk": async (ctx) => {
        for (let student of ctx.allStudents) {
            if (student.id !== ctx.attacker.id) {
                await ctx.dbSvc.updateDocument(ctx.DB_ID, ctx.TABLES.students, student.id, { xp: student.xp + 5 });
            }
        }
        return { message: "👨‍🍳 הארוחה הוגשה! כולם קיבלו 5 XP." };
    },

    // 3. כבשה - התחזות
    "shp": async (ctx) => {
        return new Promise((resolve) => {
            enterStealMode(async (targetId) => {
                const target = ctx.allStudents.find(s => s.id === targetId);
                if (!target) { resolve(null); return; }
                sessionStorage.setItem('fake_identity', JSON.stringify({ name: target.name, type: target.type }));
                resolve({ message: `🐺 התחפשת ל-${target.name}! עכשיו אף אחד לא יזהה אותך.` });
            });
        });
    },

    // 4. פרה - עזרה ראשונה (חידוש מגינים)
    "cow": async (ctx) => {
        let history = { ...ctx.attacker.history };
        history.shields_broken = [];
        await ctx.dbSvc.updateDocument(ctx.DB_ID, ctx.TABLES.students, ctx.attacker.id, { history: JSON.stringify(history) });
        return { message: "🩺 הטיפול הצליח! כל המגינים שלך חודשו." };
    },

    // 5. זברה - קללת השתיקה
    "zbr": async (ctx) => {
        return new Promise((resolve) => {
            enterStealMode(async (targetId) => {
                const target = ctx.allStudents.find(s => s.id === targetId);
                if (!target) { resolve(null); return; }
                const blockTime = Date.now().toString();
                await ctx.dbSvc.updateDocument(ctx.DB_ID, ctx.TABLES.students, target.id, { last_skill: blockTime });
                resolve({ message: `🔮 הכישוף הצליח! ${target.name} לא יוכל להשתמש ביכולת שלו בשעה הקרובה.` });
            });
        });
    },

    // 6. עכביש - קורי השהייה
    "spd": async (ctx) => {
        sessionStorage.setItem('spider_trap', 'true');
        return { message: "🕸️ טווית רשת! התוקף הבא שיפגע בך יספוג קאונטר." };
    },

    // 7. עורב - גניבת XP
    "crw": async (ctx) => {
        return new Promise((resolve) => {
            enterStealMode(async (targetId) => {
                const target = ctx.allStudents.find(s => s.id === targetId);
                if (!target) { resolve(null); return; }
                const amount = Math.floor(Math.random() * 21) + 10;
                const actualAmount = Math.min(amount, target.xp);
                await ctx.dbSvc.updateDocument(ctx.DB_ID, ctx.TABLES.students, ctx.attacker.id, { xp: ctx.attacker.xp + actualAmount });
                await ctx.dbSvc.updateDocument(ctx.DB_ID, ctx.TABLES.students, target.id, { xp: target.xp - actualAmount });
                resolve({ message: `בוצע! העורב גנב ${actualAmount} XP מ-${target.name} 🐦‍⬛` });
            });
        });
    },

    // 8. כלב ציד
    "hnd": async (ctx) => {
        sessionStorage.setItem('next_attack_double_shield', 'true');
        return { message: "הכלב מוכן! בקרב הבא תוכל לבחור 2 מגינים במקום אחד." };
    },

    // 9. ארנב - קאונטר (שמירה ב-DB ולא sessionStorage)
    "rbt": async (ctx) => {
        let history = { ...ctx.attacker.history };
        history.counter_active = true;
        await ctx.dbSvc.updateDocument(ctx.DB_ID, ctx.TABLES.students, ctx.attacker.id, { history: JSON.stringify(history) });
        return { message: "🐇 הארנב דרוך! אם יפגעו בך בשעה הקרובה, התוקף יספוג 15XP נזק חזרה." };
    }
};
// 9. ארנב - קאונטר (נזק חוזר לתוקף)
    "rbt": async (ctx) => {
        // מכיוון שהקרב יכול לקרות מתישהו אחר כך מול מחשב אחר,
        // אנחנו שומרים את "מצב הקאונטר" בתוך מסד הנתונים (ב-history)
        let history = JSON.parse(ctx.attacker.history || "{}");
        history.counter_active = true;
        
        await ctx.dbSvc.updateDocument(ctx.DB_ID, ctx.TABLES.students, ctx.attacker.id, { 
            history: JSON.stringify(history) 
        });

        return { message: "🐇 נכנסת למצב מגננה! התלמיד הבא שיצליח לפגוע בך יספוג נזק חזרה." };
    }
