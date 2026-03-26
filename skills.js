// שימוש ב-var מונע שגיאות כפילות
var CreatureSkills = CreatureSkills || {
    // 1. חתול
    "cat": async (ctx) => {
        const targetName = prompt("ממי תרצה להפחית 15 XP? (הכנס שם מדויק)");
        if (!targetName) return null;
        const target = ctx.allStudents.find(s => s.name === targetName);
        if (!target) { alert("תלמיד לא נמצא"); return null; }
        
        if (Math.random() > 0.5) {
            await ctx.dbSvc.updateDocument(ctx.DB_ID, ctx.TABLES.students, target.id, { xp: Math.max(0, target.xp - 15) });
            return { message: `⚔️ הצלחה! ${target.name} איבד 15 XP.` };
        }
        return { message: "💨 הפספוס! לא קרה כלום." };
    },

    // 2. אפרוח
    "chk": async (ctx) => {
        for (let s of ctx.allStudents) {
            if (s.id !== ctx.attacker.id) {
                await ctx.dbSvc.updateDocument(ctx.DB_ID, ctx.TABLES.students, s.id, { xp: s.xp + 5 });
            }
        }
        return { message: "👨‍🍳 סעודת מלכים! כולם קיבלו 5 XP." };
    },

    // 9. ארנב - התיקון לשגיאה שלך כאן
    "rbt": async (ctx) => {
        // בדיקה חכמה: אם זה כבר אובייקט, אל תנסה לעשות לו Parse
        let h = ctx.attacker.history;
        if (typeof h === 'string') {
            try { h = JSON.parse(h || "{}"); } catch(e) { h = {}; }
        } else if (!h) {
            h = {};
        }

        h.counter_active = true;
        
        await ctx.dbSvc.updateDocument(ctx.DB_ID, ctx.TABLES.students, ctx.attacker.id, { 
            history: JSON.stringify(h) 
        });

        return { message: "🐇 מצב קאונטר הופעל! הנזק יחזור לתוקף הבא." };
    }
};
