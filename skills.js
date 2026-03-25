// 9. ארנב - קאונטר (נזק חוזר לתוקף)
    "rbt": async (ctx) => {
        // המרת ההיסטוריה לאובייקט (טיפול במקרה שזה כבר אובייקט או מחרוזת)
        let history = (typeof ctx.attacker.history === 'string') 
            ? JSON.parse(ctx.attacker.history || "{}") 
            : (ctx.attacker.history || {});

        history.counter_active = true;
        
        await ctx.dbSvc.updateDocument(ctx.DB_ID, ctx.TABLES.students, ctx.attacker.id, { 
            history: JSON.stringify(history) 
        });

        return { message: "🐇 נכנסת למצב מגננה! התלמיד הבא שיצליח לפגוע בך יספוג נזק חזרה." };
    }
}; // <--- הסוגר הזה סוגר את האובייקט CreatureSkills - הוא חייב להיות כאן!
