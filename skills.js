// skills.js — יכולות מיוחדות לכל חיה
// כל יכולת מקבלת ctx עם: ctx.attacker, ctx.allStudents, ctx.dbSvc, ctx.DB_ID, ctx.TABLES, ctx.utils
//
// ארגז הכלים (ctx.utils):
//   getHistory(student)                          — מחזיר history כ-object
//   pickStudent(instruction, canPickSelf=false)  — בחירת שחקן בלחיצה, מחזיר Promise<student|null>
//   addXP(targetId, amount)                      — מוסיף/מחסיר XP, מטפל בעלייה ברמה
//   breakShield(targetId)                        — שובר מגן אחד
//   resetShields(targetId)                       — מחזיר את כל המגינים
//   resetAttackCooldown(targetId, attackName)    — מאפס קולדאון של מתקפה ספציפית
//   resetRandomAttackCooldown(targetId)          — מאפס קולדאון מתקפה אקראית, מחזיר שם המתקפה
//   setFlag(targetId, key, value)                — שומר ערך חופשי ב-history
//   silenceSkill(targetId)                       — מונע שימוש ביכולת המיוחדת לשעה
//   addLog(targetId, msg, xp=0)                  — כותב רשומה להיסטוריה
//   startTick(targetId, key, intervalMs, durationMs, onTick, onEnd) — טיימר מתמשך ששורד ריענון

var CreatureSkills = CreatureSkills || {

    // צב — שריון פלדה: חסינות מתקפות לרבע שעה
    "trt": {
        action: async (ctx) => {
            await ctx.utils.setFlag(ctx.attacker.id, 'steel_armor_until', Date.now() + 15 * 60 * 1000);
            return { message: "🐢 שריון פלדה הופעל! אף אחד לא יוכל לתקוף אותך ל-15 דקות." };
        },
        onDefense: async (ctx) => {
            const armor = ctx.me.history.steel_armor_until;
            if (armor && Date.now() < armor) {
                const mins = Math.ceil((armor - Date.now()) / 60000);
                alert(`🐢 שריון הפלדה הדף את המתקפה! (נותרו ${mins} דקות)`);
                return { stop: true };
            }
            return { stop: false };
        }
    },

    // נחש — ארס מתמשך: מחסיר 1XP בדקה למשך 10 דקות, ואז שובר מגן
    "snk": {
        action: async (ctx) => {
            const target = await ctx.utils.pickStudent("🐍 בחר תלמיד להרעיל...");
            if (!target) return null;
            await ctx.utils.addLog(target.id, `🐍 ${ctx.attacker.name} הרעיל אותך! תאבד XP כל דקה...`, 0);
            await ctx.utils.startTick(
                target.id, 'snake_poison', 60000, 10 * 60 * 1000,
                async (t, elapsed) => {
                    await ctx.utils.addXP(t.id, -1);
                    await ctx.utils.addLog(t.id, `🐍 ארס הנחש: -1XP`, -1);
                },
                async (t) => {
                    await ctx.utils.breakShield(t.id);
                    await ctx.utils.addLog(t.id, `🐍 הארס השלים את פעולתו — מגן נשבר!`, 0);
                    alert(`🐍 הארס השלים פעולתו על ${t.name}!`);
                }
            );
            return { message: `🐍 הרעלת את ${target.name}! יאבד 1XP בכל דקה ל-10 דקות, ואז יאבד מגן.` };
        }
    },

    // כלב הציד — הגנה כפולה: בתקיפה הבאה בוחר 2 מגינים
    "hnd": {
        action: async (ctx) => {
            await ctx.utils.setFlag(ctx.attacker.id, 'double_shield_active', true);
            return { message: "🐕 הכלב יצא לסיור! בתקיפה הבאה תוכל לבחור 2 מגינים." };
        }
    },

    // חתול — תקיפה כפולה: יכול לתקוף פעם נוספת עם אותה המתקפה מיד
    "cat": {
        action: async (ctx) => {
            await ctx.utils.setFlag(ctx.attacker.id, 'double_attack_ready', true);
            return { message: "⚔️ יכולת החתול הופעלה! התקיפה הבאה שלך לא תצרוך קולדאון — תוכל לתקוף שוב מיד." };
        }
    },

    // עורב — גניבת XP: בוחר תלמיד וגונב 10-30 XP
    "crw": {
        action: async (ctx) => {
            const target = await ctx.utils.pickStudent("🦅 ממי תרצה לגנוב?");
            if (!target) return null;
            const amount = Math.min(Math.floor(Math.random() * 21) + 10, target.xp);
            await ctx.utils.addXP(target.id, -amount);
            await ctx.utils.addXP(ctx.attacker.id, amount);
            await ctx.utils.addLog(target.id, `🖤 ${ctx.attacker.name} גנב ממך ${amount}XP!`, -amount);
            await ctx.utils.addLog(ctx.attacker.id, `🖤 גנבת ${amount}XP מ-${target.name}!`, amount);
            return { message: `🖤 גנבת ${amount} XP מ-${target.name}!` };
        }
    },

    // דג — איפוס קולדאון: בוחר תלמיד ומאפס לו מתקפה אקראית. מקבל 10XP אם בחר אחר
    "fsh": {
        action: async (ctx) => {
            const target = await ctx.utils.pickStudent("🔨 בחר תלמיד לאפס לו קולדאון מתקפה", true);
            if (!target) return null;
            const attackName = ctx.utils.resetRandomAttackCooldown(target.id);
            if (!attackName) return { message: `😕 ל-${target.name} אין מתקפות עם קולדאון.` };
            await ctx.utils.addLog(target.id, `🔨 ${ctx.attacker.name} איפס לך את הקולדאון של "${attackName}"`, 0);
            if (target.id !== ctx.attacker.id) {
                await ctx.utils.addXP(ctx.attacker.id, 10);
                await ctx.utils.addLog(ctx.attacker.id, `🔨 איפסת קולדאון ל-${target.name} (+10XP)`, 10);
                return { message: `🔨 איפסת את הקולדאון של "${attackName}" ל-${target.name} וקיבלת 10XP!` };
            }
            return { message: `🔨 איפסת את הקולדאון של "${attackName}" לעצמך.` };
        }
    },

    // תרנגול — עמידות: אם לא תקפו אותו חצי שעה — מקבל 30XP
    "chk": {
        action: async (ctx) => {
            await ctx.utils.setFlag(ctx.attacker.id, 'rooster_safe_since', Date.now());
            await ctx.utils.setFlag(ctx.attacker.id, 'rooster_active', true);
            return { message: "🐔 יכולת הגאווה הופעלה! אם לא יתקפו אותך חצי שעה — תקבל 30XP." };
        },
        onDefense: async (ctx) => {
            // אם תקפו אותו — מבטל את היכולת
            if (ctx.me.history.rooster_active) {
                ctx.me.history.rooster_active = false;
                ctx.me.history.rooster_safe_since = null;
                await ctx.dbSvc.updateDocument(ctx.DB_ID, ctx.TABLES.students, ctx.me.id, {
                    history: JSON.stringify(ctx.me.history)
                });
            }
            return { stop: false };
        }
    },

    // שועל — מלכודת נגד: כל מי שתוקף אותו ב-10 דק' יאבד 10-30 XP בתקיפה הבאה שלו
    "fox": {
        action: async (ctx) => {
            await ctx.utils.setFlag(ctx.attacker.id, 'fox_trap_until', Date.now() + 10 * 60 * 1000);
            return { message: "🦊 מלכודת השועל פעילה ל-10 דקות! כל מי שיתקוף אותך יספוג 10-30 XP נזק." };
        },
        onDefense: async (ctx) => {
            const trapUntil = ctx.me.history.fox_trap_until;
            if (trapUntil && Date.now() < trapUntil && ctx.att) {
                const penalty = Math.floor(Math.random() * 21) + 10;
                await ctx.dbSvc.updateDocument(ctx.DB_ID, ctx.TABLES.students, ctx.att.id, {
                    history: JSON.stringify({
                        ...ctx.utils.getHistory(ctx.att),
                        fox_penalty: penalty,
                        fox_penalty_time: Date.now()
                    })
                });
                alert(`🦊 ${ctx.att.name} נלכד במלכודת השועל! יאבד ${penalty}XP בתקיפה הבאה שלו.`);
            }
            return { stop: false };
        }
    },

    // זברה — השתקה: מאפס את קולדאון היכולת המיוחדת של תלמיד
    "zbr": {
        action: async (ctx) => {
            const target = await ctx.utils.pickStudent("🔮 את מי תרצה להשתיק?");
            if (!target) return null;
            await ctx.utils.silenceSkill(target.id);
            await ctx.utils.addLog(target.id, `🔮 ${ctx.attacker.name} השתיק אותך! היכולת המיוחדת שלך אופסה.`, 0);
            return { message: `🔮 ${target.name} הושתק! לא יוכל להשתמש ביכולת המיוחדת שלו לשעה.` };
        }
    },

    // עכביש — מלכודת רשת: המתקפה הבאה נגדו מתבטלת
    "spd": {
        action: async (ctx) => {
            await ctx.utils.setFlag(ctx.attacker.id, 'spider_trap', true);
            return { message: "🕸️ טווית רשת! המתקפה הבאה נגדך תתבטל." };
        },
        onDefense: async (ctx) => {
            if (ctx.me.history.spider_trap && !ctx.isBlocked && ctx.att) {
                ctx.me.history.spider_trap = false;
                let ah = ctx.utils.getHistory(ctx.att);
                ah['spider_blocked_'+Date.now()] = { msg: `🕸️ נלכדת ברשת של ${ctx.me.name}!`, xp: 0, time: Date.now() };
                await ctx.dbSvc.updateDocument(ctx.DB_ID, ctx.TABLES.students, ctx.att.id, { history: JSON.stringify(ah) });
                await ctx.dbSvc.updateDocument(ctx.DB_ID, ctx.TABLES.students, ctx.me.id, { history: JSON.stringify(ctx.me.history) });
                alert(`🕸️ ${ctx.att.name} נלכד ברשת! המתקפה בוטלה.`);
                return { stop: true };
            }
            return { stop: false };
        }
    },

    // ארנב — קאונטר: אם תוקפים אותו ולא חוסם — התוקף ספג 15XP נזק
    "rbt": {
        action: async (ctx) => {
            await ctx.utils.setFlag(ctx.attacker.id, 'counter_active', true);
            return { message: "🐇 קאונטר הופעל! אם תוקפים אותך ולא חוסם — התוקף יספוג 15XP נזק." };
        },
        onDefense: async (ctx) => {
            if (ctx.me.history.counter_active && !ctx.isBlocked && ctx.att) {
                ctx.me.history.counter_active = false;
                const naxp = Math.max(0, ctx.att.xp - 15);
                let ah = ctx.utils.getHistory(ctx.att);
                ah['counter_'+Date.now()] = { msg: `🐇 קאונטר מ-${ctx.me.name}! ספגת -15XP`, xp: -15, time: Date.now() };
                await ctx.dbSvc.updateDocument(ctx.DB_ID, ctx.TABLES.students, ctx.att.id, { xp: naxp, history: JSON.stringify(ah) });
                await ctx.dbSvc.updateDocument(ctx.DB_ID, ctx.TABLES.students, ctx.me.id, { history: JSON.stringify(ctx.me.history) });
                alert(`🐇 קאונטר הופעל! ${ctx.att.name} ספג -15XP.`);
            }
            return { stop: false };
        }
    },

    // כבשה — התחזות: מתחפש לשחקן אחר (sessionStorage)
    "shp": {
        action: async (ctx) => {
            const target = await ctx.utils.pickStudent("🐑 למי תרצה להתחפש?");
            if (!target) return null;
            sessionStorage.setItem('fake_identity', JSON.stringify({ name: target.name, type: target.type }));
            return { message: `🐺 התחפשת ל-${target.name}!` };
        }
    },

    // פרה — עזרה ראשונה: בוחר תלמיד לרפא (+15XP + חידוש מגינים)
    "cow": {
        action: async (ctx) => {
            const target = await ctx.utils.pickStudent("💚 בחר תלמיד לרפא", true);
            if (!target) return null;
            await ctx.utils.addXP(target.id, 15);
            await ctx.utils.resetShields(target.id);
            await ctx.utils.addLog(target.id, `🐄 ${ctx.attacker.name} ריפא אותך! +15XP ומגינים חודשו`, 15);
            if (target.id === ctx.attacker.id) {
                return { message: "🐄 מוווו! ריפאת את עצמך — +15XP והמגינים שלך חודשו!" };
            }
            return { message: `🐄 ריפאת את ${target.name} — קיבל 15XP ומגיניו חודשו!` };
        }
    }

};
