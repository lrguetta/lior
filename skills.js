// skills.js - מאגר היכולות המיוחדות של החיות בחווה
const CreatureSkills = {
    // 1. חתול - מכת בזק
    "cat": async (ctx) => {
        const targetName = prompt("בחר יריב למכת בזק (סיכוי ל-50% הצלחה ללא מגן):");
        if (!targetName) return null;
        const target = ctx.allStudents.find(s => s.name === targetName);
        if (!target) { alert("תלמיד לא נמצא"); return null; }

        if (Math.random() > 0.5) {
            const damage = 15;
            await ctx.dbSvc.updateDocument(ctx.DB_ID, ctx.TABLES.students, target.id, { xp: Math.max(0, target.xp - damage) });
            return { message: `⚔️ המכה הצליחה! ${target.name} איבד ${damage} XP.` };
        } else {
            return { message: "💨 הפספוס! החתול חתך רק את האוויר." };
        }
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

    // 6. עכביש - קורי השהייה
    "spd": async (ctx) => {
        sessionStorage.setItem('spider_trap', 'true');
        return { message: "🕸️ טווית רשת!" };
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

    // 9. ארנב - קאונטר (כאן הייתה הטעות מקודם)
    "rbt": async (ctx) => {
        let history = JSON.parse(ctx.attacker.history || "{}");
        history.counter_active = true;
        await ctx.dbSvc.updateDocument(ctx.DB_ID, ctx.TABLES.students, ctx.attacker.id, { history: JSON.stringify(history) });
        return { message: "🐇 מצב קאונטר הופעל!" };
    }
}; // סגירה סופית של האובייקט
