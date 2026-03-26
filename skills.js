// skills.js - המנוע הדינמי של החווה
var CreatureSkills = CreatureSkills || {
    // 1. חתול - הפחתת XP
    "cat": {
        action: async (ctx) => {
            const targetName = prompt("ממי תרצה להפחית 15 XP? (הכנס שם מדויק)");
            if (!targetName) return null;
            const target = ctx.allStudents.find(s => s.name === targetName);
            if (!target) { alert("תלמיד לא נמצא"); return null; }
            if (Math.random() > 0.5) {
                await ctx.dbSvc.updateDocument(ctx.DB_ID, ctx.TABLES.students, target.id, { xp: Math.max(0, target.xp - 15) });
                return { message: `⚔️ הצלחה! ${target.name} איבד 15 XP.` };
            }
            return { message: "💨 הפספוס! לא קרה כלום." };
        }
    },

    // 2. אפרוח טבח - מנת שף
    "chk": {
        action: async (ctx) => {
            let h = ctx.utils.getHistory(ctx.attacker);
            h.chef_buff = true;
            await ctx.dbSvc.updateDocument(ctx.DB_ID, ctx.TABLES.students, ctx.attacker.id, { history: JSON.stringify(h) });
            return { message: "👨‍🍳 מנת שף מוכנה! הגנה מוצלחת תיתן XP כפול." };
        },
        onDefense: async (ctx) => {
            if (ctx.me.history.chef_buff && ctx.isBlocked) {
                ctx.me.history.chef_buff = false;
                ctx.xpGain *= 2;
                alert("👨‍🍳 בזכות מנת השף - XP כפול על החסימה!");
            }
            return { xpGain: ctx.xpGain };
        }
    },

    // 3. צב חייל - שריון פלדה
    "trt": {
        action: async (ctx) => {
            let h = ctx.utils.getHistory(ctx.attacker);
            h.steel_armor_until = Date.now() + (10 * 60 * 1000);
            await ctx.dbSvc.updateDocument(ctx.DB_ID, ctx.TABLES.students, ctx.attacker.id, { history: JSON.stringify(h) });
            return { message: "🐢 שריון פלדה הופעל ל-10 דקות!" };
        },
        onDefense: async (ctx) => {
            if (ctx.me.history.steel_armor_until && Date.now() < ctx.me.history.steel_armor_until) {
                alert("🐢 השריון הדף את המתקפה אוטומטית!");
                return { stop: true }; // חסימה אוטומטית
            }
            return { stop: false };
        }
    },

    // 4. ארנב - קאונטר
    "rbt": {
        action: async (ctx) => {
            let h = ctx.utils.getHistory(ctx.attacker);
            h.counter_active = true;
            await ctx.dbSvc.updateDocument(ctx.DB_ID, ctx.TABLES.students, ctx.attacker.id, { history: JSON.stringify(h) });
            return { message: "🐇 קאונטר הופעל!" };
        },
        onDefense: async (ctx) => {
            if (ctx.me.history.counter_active && !ctx.isBlocked) {
                ctx.me.history.counter_active = false;
                if (ctx.att) {
                    let ah = ctx.utils.getHistory(ctx.att);
                    ah['counter_'+Date.now()] = { msg: `🐇 ננשכת ע"י קאונטר!`, xp: -15, time: Date.now() };
                    await ctx.dbSvc.updateDocument(ctx.DB_ID, ctx.TABLES.students, ctx.att.id, { xp: Math.max(0, ctx.att.xp - 15), history: JSON.stringify(ah) });
                }
                alert("🐇 קאונטר! התוקף ספג נזק חזרה.");
            }
            return { stop: false };
        }
    },

    // 5. כבשה - התחזות
    "shp": {
        action: async (ctx) => {
            const targetName = prompt("למי תרצה להתחפש?");
            const target = ctx.allStudents.find(s => s.name === targetName);
            if (!target) return null;
            sessionStorage.setItem('fake_identity', JSON.stringify({ name: target.name, type: target.type }));
            return { message: `🐺 התחפשת ל-${target.name}!` };
        }
    },

    // 6. פרה - עזרה ראשונה
    "cow": {
        action: async (ctx) => {
            let h = ctx.utils.getHistory(ctx.attacker);
            h.shields_broken = []; 
            await ctx.dbSvc.updateDocument(ctx.DB_ID, ctx.TABLES.students, ctx.attacker.id, { history: JSON.stringify(h) });
            return { message: "🩺 המגינים שלך חודשו." };
        }
    },

    // 7. זברה - השתקה
    "zbr": {
        action: async (ctx) => {
            const targetName = prompt("את מי תרצה להשתיק?");
            const target = ctx.allStudents.find(s => s.name === targetName);
            if (!target) return null;
            await ctx.dbSvc.updateDocument(ctx.DB_ID, ctx.TABLES.students, target.id, { last_skill: Date.now().toString() });
            return { message: `🔮 הכישוף הצליח! ${target.name} הושתק.` };
        }
    },

    // 8. עכביש - מלכודת רשת
    "spd": {
        action: async (ctx) => {
            let h = ctx.utils.getHistory(ctx.attacker);
            h.spider_trap = true;
            await ctx.dbSvc.updateDocument(ctx.DB_ID, ctx.TABLES.students, ctx.attacker.id, { history: JSON.stringify(h) });
            return { message: "🕸️ רשת נטוויה!" };
        },
        onDefense: async (ctx) => {
            if (ctx.me.history.spider_trap && !ctx.isBlocked && ctx.att) {
                ctx.me.history.spider_trap = false;
                let ah = ctx.utils.getHistory(ctx.att);
                ah['spider_blocked_'+Date.now()] = { msg: `🕸️ נלכדת ברשת!`, xp: 0, time: Date.now() };
                await ctx.dbSvc.updateDocument(ctx.DB_ID, ctx.TABLES.students, ctx.att.id, { history: JSON.stringify(ah) });
                alert(`🕸️ ${ctx.att.name} נלכד ברשת וקורקע!`);
            }
            return { stop: false };
        }
    },

    // 9. עורב - גניבה
    "crw": {
        action: async (ctx) => {
            const targetName = prompt("ממי לגנוב?");
            const target = ctx.allStudents.find(s => s.name === targetName);
            if (!target) return null;
            const amount = Math.min(Math.floor(Math.random() * 21) + 10, target.xp);
            await ctx.dbSvc.updateDocument(ctx.DB_ID, ctx.TABLES.students, ctx.attacker.id, { xp: ctx.attacker.xp + amount });
            await ctx.dbSvc.updateDocument(ctx.DB_ID, ctx.TABLES.students, target.id, { xp: target.xp - amount });
            return { message: `גנבת ${amount} XP מ-${target.name}!` };
        }
    },

    // 10. כלב ציד
    "hnd": {
        action: async (ctx) => {
            sessionStorage.setItem('next_attack_double_shield', 'true');
            return { message: "הכלב מוכן לקרב הבא!" };
        }
    }
};
