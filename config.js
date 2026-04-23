// config.js - הגדרות חיבור למסד הנתונים
const supabaseUrl = 'https://uqfupfubprowidshobtw.supabase.co';
const supabaseKey = 'YOUR_SUPABASE_KEY'; // כאן תדביק את המפתח הסודי שלך אם הוא שונה
const _supabase = supabase.createClient(supabaseUrl, supabaseKey);

// ייצוא המשתנה כדי שקבצים אחרים יוכלו להשתמש בו
window.supabaseClient = _supabase; 
console.log("Config loaded: Supabase connection established.");
