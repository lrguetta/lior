/* ============================================
   חנות וחפצים - SHOP & ITEMS
   ============================================ */

async function openShop() {
    try {
        const me = allStudents.find(s => s.id === currentUser);
        const myCash = me ? (me.cash || 0) : 0;

        const { data: items, error } = await supabase.from('items').select('*');
        if (error) throw error;

        let html = `
            <div style="text-align:center; margin-bottom:20px; border-bottom:2px solid #4caf50; padding-bottom:10px;">
                <h2 style="margin:0;">🛒 חנות החווה</h2>
                <div style="font-size:1.4em; color:#2e7d32; font-weight:bold;">הארנק שלי: 💰 ${myCash} שקל</div>
            </div>
            <div class="shop-grid" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap:15px; min-width:300px;">`;

        if (items) {
            items.forEach(item => {
                const canAfford = myCash >= item.price;
                let itemIcon = item.icon;
                if (item.name === 'נר נשמה') itemIcon = 'images/izkor.gif';
                else if (item.name === 'דגל ישראל') itemIcon = 'images/flag.gif';
                const iconHtml = (itemIcon && (itemIcon.endsWith('.png') || itemIcon.endsWith('.gif'))) 
                    ? `<img src="${itemIcon}" style="width:50px;height:50px;object-fit:contain;">` 
                    : `<div style="font-size:40px; margin-bottom:5px;">${item.icon || '🎁'}</div>`;
                html += `
                    <div class="shop-item" style="border:1px solid #ddd; padding:10px; border-radius:12px; text-align:center; background:${canAfford ? '#fff' : '#f5f5f5'}; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                        ${iconHtml}
                        <div style="font-weight:bold; height:40px; display:flex; align-items:center; justify-content:center;">${item.name}</div>
                        <div style="color:#2e7d32; font-weight:bold; margin:10px 0;">${item.price} שקל</div>
                        <button onclick="buyItem('${item.id}', ${item.price}, '${item.name}')" class="action-btn" style="width:100%; padding:8px; cursor:${canAfford ? 'pointer' : 'not-allowed'}; background:${canAfford ? '#4caf50' : '#ccc'}" ${!canAfford ? 'disabled' : ''}>
                            ${canAfford ? 'קנה' : 'אין מספיק'}
                        </button>
                    </div>`;
            });
        }

        html += `</div>
                <div style="text-align:center; margin-top:20px;">
                    <button class="action-btn" onclick="closeGenericModal()" style="background:#666;">סגור חנות</button>
                </div>`;

        openGenericModal(html);
    } catch (err) {
        console.error("Shop Error:", err);
        alert("שגיאה בטעינת החנות");
    }
}

async function buyItem(itemId, price, itemName) {
    try {
        const me = allStudents.find(s => s.id === currentUser);
        if (!me) return alert("שגיאה בזיהוי");
        
        const currentCash = me.cash || 0;
        if (currentCash < price) return alert(`חסר לך כסף!`);

        if (!confirm(`לקנות ${itemName} ב-${price} שקל?`)) return;

        const newCash = currentCash - price;
        const { error: cashError } = await supabase.from('students').update({ cash: newCash }).eq('id', currentUser);
        if (cashError) throw cashError;

        const { data: existingItem } = await supabase.from('student_items').select('*').eq('student_id', currentUser).eq('item_id', itemId).single();

        if (existingItem) {
            await supabase.from('student_items').update({ quantity: (existingItem.quantity || 1) + 1 }).eq('id', existingItem.id);
        } else {
            await supabase.from('student_items').insert([{ student_id: currentUser, item_id: itemId, quantity: 1 }]);
        }

        me.cash = newCash;
        alert(`תתחדש! קנית ${itemName}.`);
        
        if (typeof loadStudents === 'function') await loadStudents();
        closeGenericModal();
        
    } catch (err) {
        console.error("Purchase Error:", err);
        alert("שגיאה: " + err.message);
    }
}
    
async function openBag() {
    try {
        const me = allStudents.find(s => s.id === currentUser);
        const myCash = me ? (me.cash || 0) : 0;

        const { data: allItems } = await supabase.from('items').select('*');
        const { data: bagData, error } = await supabase.from('student_items').select('*').eq('student_id', currentUser);

        if (error) throw error;

        let html = `
            <div style="text-align:center; background:#fff3e0; padding:15px; border-radius:15px; border:2px solid #ff9800; margin-bottom:15px;">
                <h2 style="margin:0;">🎒 התיק של ${me.full_name}</h2>
                <div style="font-size:1.6em; margin-top:10px; color:#e65100;">💰 <b>${myCash}</b> שקל</div>
            </div>
            <div class="bag-grid" style="display:grid; grid-template-columns: repeat(4, 1fr); gap:10px; min-width:300px;">`;

        if (!bagData || bagData.length === 0) {
            html += `<p style="grid-column: 1/-1; text-align:center; padding:20px; color:#888;">התיק ריק...</p>`;
        } else {
            bagData.forEach(entry => {
                const itemDetails = allItems ? allItems.find(i => i.id == entry.item_id) : null;
                if (itemDetails) {
                    let bagIcon = itemDetails.icon;
                    if (itemDetails.name === 'נר נשמה') bagIcon = 'images/izkor.gif';
                    else if (itemDetails.name === 'דגל ישראל') bagIcon = 'images/flag.gif';
                    const bagIconHtml = (bagIcon && (bagIcon.endsWith('.png') || bagIcon.endsWith('.gif')))
                        ? `<img src="${bagIcon}" style="width:40px;height:40px;object-fit:contain;">`
                        : `<div style="font-size:35px;">${itemDetails.icon || '📦'}</div>`;
                    html += `
                        <div class="item-slot" style="border:2px solid #eee; border-radius:10px; padding:10px; text-align:center; position:relative; background:white; display:flex; flex-direction:column; align-items:center;">
                            ${bagIconHtml}
                            <div style="font-size:12px; font-weight:bold; margin-top:5px;">${itemDetails.name}</div>
                            <div style="position:absolute; top:-5px; right:-5px; background:#ff5252; color:white; border-radius:50%; width:22px; height:22px; font-size:12px; display:flex; align-items:center; justify-content:center; border:2px solid white; font-weight:bold;">
                                ${entry.quantity}
                            </div>
                            <button onclick="handleItemUsage('${entry.id}', '${itemDetails.name}')" style="margin-top:auto; background:#4caf50; color:white; border:none; border-radius:5px; padding:3px 8px; cursor:pointer; font-size:11px; font-weight:bold;">השתמש ✨</button>
                        </div>`;
                }
            });
        }

        html += `</div>
                <div style="text-align:center; margin-top:20px;">
                    <button class="action-btn" onclick="closeGenericModal()" style="background:#666;">סגור תיק</button>
                </div>`;
                
        openGenericModal(html);
    } catch (err) { console.error("Bag Error:", err); alert("שגיאה"); }
}

async function handleItemUsage(entryId, itemName) {
    try {
        const me = allStudents.find(s => s.id === currentUser);
        if (!me) return;

        if (itemName === "משקה אנרגיה") {
            const attacks = (ATTACKS_BY_TYPE[me.type] || []).slice(0, attacksByLevel(me.level));
            let cleared = false;
            for (let atk of attacks) {
                const name = typeof atk === 'object' ? atk.name : atk;
                localStorage.removeItem('last_attack_' + currentUser + '_' + name);
                cleared = true;
            }
            if (!cleared) return alert("אין מתקפות לאפס!");
            alert("⚡ האנרגיה חזרה!");
        } else if (itemName === "סוכריית XP") {
            let newXP = me.xp + 50;
            let newLevel = me.level;
            while (newXP >= 100) { newLevel++; newXP -= 100; }
            await supabase.from('students').update({ xp: newXP, level: newLevel }).eq('id', currentUser);
            alert("🍬 קיבלת +50 XP!");
        } else if (itemName === "מגן פלדה") {
            let history = (typeof me.history === 'string') ? JSON.parse(me.history || "{}") : (me.history || {});
            const broken = history.shields_broken || [];
            const totalShields = shieldsByLevel(me.level || 0);
            if (broken.length >= totalShields) return alert("אין מקום למגן!");
            const firstBroken = broken.findIndex(b => b !== undefined);
            if (firstBroken >= 0) broken.splice(firstBroken, 1);
            history.shields_broken = broken;
            await supabase.from('students').update({ history: history }).eq('id', currentUser);
            alert("🛡️ קיבלת מגן פלדה!");
        } else if (itemName === "נר נשמה") {
            openCandleModal(entryId);
            return;
        } else if (itemName === "דגל ישראל") {
            await supabase.from('students').update({ hasFlag: true }).eq('id', currentUser);
            alert("🇮🇱 הדגל הוצב!");
        } else {
            alert("אין שימוש מוגדר לפריט זה.");
            return;
        }

        // מחיקת הפריט
        const { data: currentEntry } = await supabase.from('student_items').select('quantity').eq('id', entryId).single();
        if (currentEntry && currentEntry.quantity > 1) {
            await supabase.from('student_items').update({ quantity: currentEntry.quantity - 1 }).eq('id', entryId);
        } else {
            await supabase.from('student_items').delete().eq('id', entryId);
        }
        
        alert(`השתמשת ב${itemName}!`);
        closeGenericModal();
        if (typeof loadStudents === 'function') await loadStudents();
        if (typeof buildBattleSidebar === 'function') buildBattleSidebar(me);

    } catch (err) { console.error("Usage Error:", err); alert("שגיאה בשימוש"); }
}

function openCandleModal(entryId) {
    const html = `
        <div style="text-align:center; padding:20px;">
            <h2 style="margin:0 0 20px 0;">🕯️ נר נשמה</h2>
            <p style="color:#666; margin-bottom:20px;">הדלק נר לזכר אהובים שאינם איתנו</p>
            <input type="text" id="candle-name" placeholder="שם הנפטר/ת" style="width:100%; padding:10px; margin-bottom:10px; border-radius:8px; border:1px solid #ddd; text-align:center;">
            <textarea id="candle-message" placeholder="פרטים נוספים" style="width:100%; height:80px; padding:10px; margin-bottom:10px; border-radius:8px; border:1px solid #ddd; text-align:right;"></textarea>
            <button onclick="useCandle('${entryId}')" style="background:#ff9800; color:white; padding:12px 24px; border:none; border-radius:10px; cursor:pointer; font-size:1.1em; width:100%;">הדלק נר 🕯️</button>
        </div>`;
    openGenericModal(html);
}

async function useCandle(entryId) {
    const name = document.getElementById('candle-name').value.trim();
    const message = document.getElementById('candle-message').value.trim();
    if (!name) return alert("חובה להזין שם!");
    
    try {
        const me = allStudents.find(s => s.id === currentUser);
        let history = (typeof me.history === 'string') ? JSON.parse(me.history || "{}") : (me.history || {});
        history['candle_' + Date.now()] = { name, message, time: Date.now() };
        
        await supabase.from('students').update({ history: history }).eq('id', currentUser);
        
        const { data: currentEntry } = await supabase.from('student_items').select('quantity').eq('id', entryId).single();
        if (currentEntry && currentEntry.quantity > 1) {
            await supabase.from('student_items').update({ quantity: currentEntry.quantity - 1 }).eq('id', entryId);
        } else {
            await supabase.from('student_items').delete().eq('id', entryId);
        }
        
        alert("🕯️ הנר הודלק לעילוי נשמת " + name);
        closeGenericModal();
        if (typeof loadStudents === 'function') await loadStudents();
    } catch(e) { alert("שגיאה: " + e.message); }
}