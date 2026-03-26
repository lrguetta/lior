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

  // 2. אפרוח טבח - מנת שף (בונוס XP על הגנה מוצלחת)
    "chk": async (ctx) => {
        let h = (typeof ctx.attacker.history === 'string') ? JSON.parse(ctx.attacker.history || "{}") : ctx.attacker.history;
        if (!h) h = {};
        
        h.chef_buff = true; // סימון שהמנה מוכנה
        
        await ctx.dbSvc.updateDocument(ctx.DB_ID, ctx.TABLES.students, ctx.attacker.id, { 
            history: JSON.stringify(h) 
        });
        return { message: "👨‍🍳 אכלת מנת שף! בהגנה הבאה שלך תקבל XP כפול." };
    },

    // 10. צב חייל - שריון פלדה (חסינות ל-10 דקות)
    "trt": async (ctx) => {
        let h = (typeof ctx.attacker.history === 'string') ? JSON.parse(ctx.attacker.history || "{}") : ctx.attacker.history;
        if (!h) h = {};

        // קביעת זמן סיום השריון (עכשיו + 10 דקות)
        h.steel_armor_until = Date.now() + (10 * 60 * 1000);
        
        await ctx.dbSvc.updateDocument(ctx.DB_ID, ctx.TABLES.students, ctx.attacker.id, { 
            history: JSON.stringify(h) 
        });

        return { message: "🐢 שריון פלדה הופעל! אתה חסין לחלוטין ל-10 הדקות הקרובות." };
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
// 3. כבשה - התחזות
    "shp": async (ctx) => {
        const targetName = prompt("למי תרצה להתחפש? (הכנס שם של תלמיד אחר)");
        if (!targetName) return null;
        const target = ctx.allStudents.find(s => s.name === targetName);
        if (!target) return null;
        sessionStorage.setItem('fake_identity', JSON.stringify({ name: target.name, type: target.type }));
        return { message: `🐺 התחפשת ל-${target.name}!` };
    },

    // 4. פרה - עזרה ראשונה
    "cow": async (ctx) => {
        let history = JSON.parse(ctx.attacker.history || "{}");
        history.shields_broken = []; 
        await ctx.dbSvc.updateDocument(ctx.DB_ID, ctx.TABLES.students, ctx.attacker.id, { history: JSON.stringify(history) });
        return { message: "🩺 המגינים שלך חודשו." };
    },

    // 5. זברה - קללת השתיקה
    "zbr": async (ctx) => {
        const targetName = prompt("למי תרצה לבטל את היכולת המיוחדת?");
        if (!targetName) return null;
        const target = ctx.allStudents.find(s => s.name === targetName);
        if (!target) return null;
        const blockTime = Date.now().toString(); 
        await ctx.dbSvc.updateDocument(ctx.DB_ID, ctx.TABLES.students, target.id, { last_skill: blockTime });
        return { message: `🔮 הכישוף הצליח! ${target.name} הושתק.` };
    },

   // 6. עכביש - קורי השהייה (שמירה בשרת)
    "spd": async (ctx) => {
        let h = ctx.attacker.history;
        if (typeof h === 'string') {
            try { h = JSON.parse(h || "{}"); } catch(e) { h = {}; }
        } else if (!h) { h = {}; }

        h.spider_trap = true; // סימון שהמלכודת דרוכה בשרת
        
        await ctx.dbSvc.updateDocument(ctx.DB_ID, ctx.TABLES.students, ctx.attacker.id, { 
            history: JSON.stringify(h) 
        });

        return { message: "🕸️ טווית רשת! התוקף הבא שיפגע בך יילכד ומתקפתו הבאה תבוטל." };
    },

    // 7. עורב - גניבת XP
    "crw": async (ctx) => {
        const targetName = prompt("ממי תרצה לגנוב XP?");
        if (!targetName) return null;
        const target = ctx.allStudents.find(s => s.name === targetName);
        if (!target) return null;
        const amount = Math.floor(Math.random() * 21) + 10;
        const actualAmount = Math.min(amount, target.xp);
        await ctx.dbSvc.updateDocument(ctx.DB_ID, ctx.TABLES.students, ctx.attacker.id, { xp: ctx.attacker.xp + actualAmount });
        await ctx.dbSvc.updateDocument(ctx.DB_ID, ctx.TABLES.students, target.id, { xp: target.xp - actualAmount });
        return { message: `גנבת ${actualAmount} XP מ-${target.name}.` };
    },

    // 8. כלב ציד
    "hnd": async (ctx) => {
        sessionStorage.setItem('next_attack_double_shield', 'true');
        return { message: "הכלב מוכן! בקרב הבא תוכל לבחור 2 מגינים." };
    },
