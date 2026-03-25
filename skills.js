// skills.js - המוח של היכולות המיוחדות
const CreatureSkills = {
    "crw": async (attacker, target, dbSvc, DB_ID, TABLES) => {
        // גניבת XP: בין 10 ל-30
        const amount = Math.floor(Math.random() * 21) + 10;
        
        // וידוא שלמטרה יש מספיק XP (שלא ירד מתחת ל-0)
        const actualAmount = Math.min(amount, target.xp);
        
        const newAttackerXp = attacker.xp + actualAmount;
        const newTargetXp = target.xp - actualAmount;

        // עדכון התוקף
        await dbSvc.updateDocument(DB_ID, TABLES.students, attacker.id, { xp: newAttackerXp });
        // עדכון הנתקף
        await dbSvc.updateDocument(DB_ID, TABLES.students, target.id, { xp: newTargetXp });

        return { 
            message: `עסקה מוצלחת! גנבת ${actualAmount} XP מ-${target.name}!`,
            type: "success"
        };
    },

    "hnd": async (attacker) => {
        // יכולת זו לא מעדכנת DB מיד, אלא מחזירה "מצב" לקרב הבא
        // נשמור את זה ב-localStorage או כמשתנה גלובלי זמני
        sessionStorage.setItem('next_attack_double_shield', 'true');
        
        return { 
            message: "החושים התחדדו! בהתקפה הבאה תוכל לבחור 2 מגינים.",
            type: "info"
        };
    },

    "rbt": async (attacker, target, dbSvc, DB_ID, TABLES) => {
        // סימון ב-DB שהארנב במצב "קוצים/קאונטר"
        // נניח שיש לנו שדה history או שדה סטטוס
        let history = JSON.parse(attacker.history || "{}");
        history.counter_active = true;
        
        await dbSvc.updateDocument(DB_ID, TABLES.students, attacker.id, { 
            history: JSON.stringify(history) 
        });

        return { 
            message: "נכנסת למצב כוננות! מי שיתקוף אותך עכשיו עלול להיפגע.",
            type: "warning"
        };
    }
};
