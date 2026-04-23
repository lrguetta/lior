/* ============================================
   יכולות מיוחדות - SKILLS
   קובץ זה מכיל את היכולות המיוחדות של כל דמות
   ============================================ */

const CreatureSkills = {
    // צב -Steel Armor
    trt: {
        action: async (ctx) => {
            const { attacker, utils, allStudents, TABLES, supabase } = ctx;
            const history = utils.getHistory(attacker);
            
            if (history.steel_armor_until && Date.now() < history.steel_armor_until) {
                return { message: "מעטפת הפלדה כבר פעילה!" };
            }
            
            if (attacker.level < 10) {
                return { message: "דרושה רמה 10 להפעלת היכולת." };
            }
            
            await utils.setFlag(attacker.id, 'steel_armor_until', Date.now() + 1800000); // 30 דקות
            return { message: "🛡️ הצב עטף עצמו בשריון פלדה! מגן נוסף ל-30 דקות." };
        },
        onDefense: async (ctx) => {
            const { me, isBlocked } = ctx;
            const h = utils.getHistory(me);
            if (h.steel_armor_until && Date.now() < h.steel_armor_until) {
                return { stop: true, xpGain: isBlocked ? 20 : 5 };
            }
        }
    },
    
    // נחש - Snake Poison
    snk: {
        action: async (ctx) => {
            const { attacker, utils } = ctx;
            const history = utils.getHistory(attacker);
            
            if (history.snake_poison) {
                return { message: "הארס כבר פעיל! בחר תלמיד להכשיל." };
            }
            
            if (attacker.level < 15) {
                return { message: "דרושה רמה 15." };
            }
            
            const target = await utils.pickStudent("בחר תלמיד להרעיל:", true);
            if (!target) return { message: "בוטל." };
            
            const hasPoison = Date.now() < (target.history?.snake_poison_time || 0);
            if (hasPoison) return { message: "התלמיד כבר מורעל!" };
            
            await utils.setFlag(target.id, 'snake_poison_time', Date.now() + 3600000);
            await utils.addXP(attacker.id, 10);
            await utils.addLog(attacker.id, `🧪 הרעיל את ${target.full_name}!`, 10);
            return { message: `🧪 ${target.full_name} הורעל!` };
        },
        onDefense: async (ctx) => {
            const { me, att, isBlocked } = ctx;
            const poisonTime = me.history?.snake_poison_time || 0;
            if (Date.now() < poisonTime) {
                const utils = ctx.utils;
                await utils.addXP(att.id, 15);
                await utils.addLog(att.id, `🧪 הכשיל את ${me.full_name} עם ארס!`, 15);
                return { stop: true, xpGain: isBlocked ? 25 : 10 };
            }
        }
    },
    
    // כלב - Double Shield
    hnd: {
        action: async (ctx) => {
            const { attacker, utils } = ctx;
            const history = utils.getHistory(attacker);
            
            if (history.double_shield_active) {
                return { message: "המגן הכפול כבר פעיל!" };
            }
            
            if (attacker.level < 12) {
                return { message: "דרושה רמה 12." };
            }
            
            await utils.setFlag(attacker.id, 'double_shield_active', true);
            return { message: "🐕 מגן כפולי! +1 מגן ל-15 דקות." };
        }
    },
    
    // חתול - Double Attack
    cat: {
        action: async (ctx) => {
            const { attacker, utils } = ctx;
            const history = utils.getHistory(attacker);
            
            if (history.double_attack_ready) {
                const target = await utils.pickStudent("בחר תלמיד לתקוף פעמיים:", true);
                if (!target) return { message: "בוטל." };
                
                await utils.resetAttackCooldown(attacker.id, 'רובה 🔫');
                await utils.resetAttackCooldown(attacker.id, 'חרב ⚔️');
                return { message: "🐱 תקפת פעמיים!" };
            }
            
            await utils.setFlag(attacker.id, 'double_attack_ready', true);
            return { message: "🐱 היכולת טעונה. הקש על מתקפה פעמיים." };
        }
    },
    
    // עורב - Screech
    crw: {
        action: async (ctx) => {
            const { attacker, utils } = ctx;
            
            if (attacker.level < 8) {
                return { message: "דרושה רמה 8." };
            }
            
            const target = await utils.pickStudent("בחר תלמיד להפחיד:", true);
            if (!target) return { message: "בוטל." };
            
            // הפחדה מבטלת את הקולדאון של כל המתקפות
            const attacks = (ATTACKS_BY_TYPE[target.type] || []).slice(0, attacksByLevel(target.level || 0));
            for (const atk of attacks) {
                const name = typeof atk === 'object' ? atk.name : atk;
                utils.resetAttackCooldown(target.id, name);
            }
            
            await utils.addXP(attacker.id, 15);
            await utils.addLog(attacker.id, `🕛 הפחיד את ${target.full_name}!`, 15);
            return { message: `🕛 ${target.full_name} מפוחד! הקולדאונים אופסו.` };
        }
    },
    
    // ארנב - Counter
    rbt: {
        action: async (ctx) => {
            const { attacker, utils } = ctx;
            const history = utils.getHistory(attacker);
            
            if (history.counter_active) {
                return { message: "עמדת הנגד כבר פעילה! +50% XP מהתקפה נוספת." };
            }
            
            if (attacker.level < 18) {
                return { message: "דרושה רמה 18." };
            }
            
            await utils.setFlag(attacker.id, 'counter_active', true);
            return { message: "🐇 עמדת נגד פעילה! +50% XP מהבא." };
        }
    },
    
    // עכביש - Spider Trap
    spd: {
        action: async (ctx) => {
            const { attacker, utils, allStudents } = ctx;
            
            if (attacker.level < 20) {
                return { message: "דרושה רמה 20." };
            }
            
            const targets = allStudents.filter(s => s.id !== attacker.id && s.isActive);
            if (targets.length < 3) return { message: "צריך לפחות 3 תלמידים פעילים." };
            
            const trapCount = targets.filter(t => t.history?.spider_trap).length;
            if (trapCount >= 3) return { message: "יש כבר 3 מלכודות במש giá." };
            
            const target = targets[Math.floor(Math.random() * targets.length)];
            if (target.history?.spider_trap) return { message: "המלכודת כבר פעילה!" };
            
            await utils.setFlag(target.id, 'spider_trap', true);
            async function removeTrap() {
                const fresh = allStudents.find(s => s.id === target.id);
                if (fresh) {
                    const h = utils.getHistory(fresh);
                    delete h.spider_trap;
                    await supabase.from(TABLES.students).update({ history: h }).eq('id', target.id);
                }
            }
            setTimeout(removeTrap, 300000); // 5 דקות
            
            await utils.addXP(attacker.id, 20);
            await utils.addLog(attacker.id, `🕷️ הקים מלכודת על ${target.full_name}!`, 20);
            return { message: `🕷️ מלכודת על ${target.full_name} ל-5 דקות.` };
        }
    },
    
    // שועל - Fox Trap
    fox: {
        action: async (ctx) => {
            const { attacker, utils } = ctx;
            const history = utils.getHistory(attacker);
            
            if (history.fox_trap_until && Date.now() < history.fox_trap_until) {
                return { message: "המלכודת פעילה! גונב XP מתוקפים." };
            }
            
            if (attacker.level < 25) {
                return { message: "דרושה רמה 25." };
            }
            
            await utils.setFlag(attacker.id, 'fox_trap_until', Date.now() + 600000); // 10 דקות
            return { message: "🦊 מלכודת השועל! כל תוקף יפסיד 15 XP." };
        }
    },
    
    // יונה - Heal
    dvc: {
        action: async (ctx) => {
            const { attacker, utils } = ctx;
            const history = utils.getHistory(attacker);
            
            if (history.dove_heal_until && Date.now() < history.dove_heal_until) {
                return { message: "הריפוי כבר פעיל!" };
            }
            
            if (attacker.level < 5) {
                return { message: "דרושה רמה 5." };
            }
            
            // מתקן את כל המגינים השבורים
            await utils.resetShields(attacker.id);
            return { message: "🕊️ היונה ריפאה את כל המגינים שלך!" };
        }
    },
    
    // אריה - King Roar
    lio: {
        action: async (ctx) => {
            const { attacker, utils, allStudents } = ctx;
            
            if (attacker.level < 30) {
                return { message: "דרושה רמה 30." };
            }
            
            // נוטרל את היכולות של כל התלמידים האחרים ל-2 דקות
            const targets = allStudents.filter(s => s.id !== attacker.id && s.isActive);
            for (const t of targets) {
                await utils.silenceSkill(t.id);
            }
            
            await utils.addXP(attacker.id, 30);
            await utils.addLog(attacker.id, `🦁 שאגת האריה! הכניע את כולם.`, 30);
            return { message: "🦁 שאגת המלך! כל היכולות מושתקות ל-2 דקות." };
        }
    }
};

module.exports = CreatureSkills;