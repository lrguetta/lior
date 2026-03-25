// skills.js
const CreatureSkills = {
    // עורב - גניבת XP
    "crw": async (ctx) => {
        return new Promise((resolve) => {
            enterStealMode(async (targetId) => {
                const target = ctx.allStudents.find(s => s.id === targetId);
                if (!target) { resolve(null); return; }

                const amount = Math.floor(Math.random() * 21) + 10;
                const actualAmount = Math.min(amount, target.xp);

                await ctx.dbSvc.updateDocument(ctx.DB_ID, ctx.TABLES.students, ctx.attacker.id, { xp: ctx.attacker.xp + actualAmount });
                await ctx.dbSvc.updateDocument(ctx.DB_ID, ctx.TABLES.students, target.id, { xp: target.xp - actualAmount });

                resolve({ message: `בוצע! גנבת ${actualAmount} XP מ-${target.name} 🐦‍⬛` });
            });
        });
    },

    // כלב ציד - 2 מגינים
    "hnd": async (ctx) => {
        sessionStorage.setItem('special_skill_active', 'dog_double_shield');
        return { message: "הכלב מוכן! בקרב הבא תוכל לבחור 2 מגינים במקום אחד." };
    },

    // ארנב - קאונטר
    "rbt": async (ctx) => {
        sessionStorage.setItem('special_skill_active', 'rbt_counter');
        return { message: "הארנב דרוך! אם יתקפו אותך בשעה הקרובה, התוקף עלול להיפגע." };
    }
};
