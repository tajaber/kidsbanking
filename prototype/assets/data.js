/* KidsBank Prototype — Seed Data
 * Static, in-memory data used to drive the clickable prototype.
 * No backend; mutations live only in memory for the session.
 */
window.KB = window.KB || {};

KB.currencies = {
  USD: { symbol: "$", ratePer10: 5, label: "US Dollar" },
  EUR: { symbol: "€", ratePer10: 4, label: "Euro" },
  AED: { symbol: "د.إ", ratePer10: 20, label: "UAE Dirham" }
};

// Assigners = adult accounts (parent, co-parent, teacher, moderator).
// Two parent families share the prototype: Tariq Jaber (Parent) and Fadi Yousef
// (Co-Parent slot), each with their own kids. Teacher and Moderator span both.
KB.assigners = {
  a_parent:   { id: "a_parent",   name: "Tariq Jaber",     nameAr: "طارق جابر",  phone: "0790112233", role: "Parent",    avatar: "👨", color: "#6C5CE7" },
  a_coparent: { id: "a_coparent", name: "Fadi Yousef",     nameAr: "فادي يوسف",  phone: "0790332211", role: "Co-Parent", avatar: "🧔", color: "#00B894" },
  a_teacher:  { id: "a_teacher",  name: "Ms. Lina Haddad", nameAr: "أ. لينا حداد", role: "Teacher",   avatar: "🧑‍🏫", color: "#0984E3" },
  a_moder:    { id: "a_moder",    name: "Mr. Khalid Nour", nameAr: "أ. خالد نور",  role: "Moderator", avatar: "🛡️", color: "#E17055" }
};

// Kids / students. Each kid keeps separate balances per assigner ("bank account numbers").
KB.kids = {
  // --- Tariq Jaber's family ---
  k_bisan: {
    id: "k_bisan", name: "Bisan", nameAr: "بيسان", emoji: "🦊", grade: "Grade 4",
    streak: 12, badges: ["First task", "10-day streak", "Bookworm", "Tidy champ"],
    accounts: {
      a_parent:  { earned: 120, redeemed: 50, pending: 15, pendingRedeem: 0,  acctNo: "PR-1001" },
      // 15 pts are held awaiting kid confirmation (see KB.redemptions rd_seed1).
      a_teacher: { earned: 25,  redeemed: 0,  pending: 10, pendingRedeem: 15, acctNo: "TC-3001" }
    },
    loginApproved: true
  },
  k_razan: {
    id: "k_razan", name: "Razan", nameAr: "رزان", emoji: "🐱", grade: "Grade 2",
    streak: 7, badges: ["First task", "5-day streak", "Helpful hero"],
    accounts: {
      a_parent: { earned: 80, redeemed: 30, pending: 5, acctNo: "PR-1002" },
      a_moder:  { earned: 25, redeemed: 0,  pending: 0, acctNo: "MD-4002" }
    },
    loginApproved: false
  },
  k_majed: {
    id: "k_majed", name: "Majed", nameAr: "ماجد", emoji: "🐯", grade: "Grade 5",
    streak: 5, badges: ["First task", "Science star"],
    accounts: {
      a_parent: { earned: 95, redeemed: 20, pending: 10, acctNo: "PR-1003" }
    },
    loginApproved: true
  },
  k_saad: {
    id: "k_saad", name: "Saad", nameAr: "سعد", emoji: "🐶", grade: "Grade 1",
    streak: 3, badges: ["First task"],
    accounts: {
      a_parent: { earned: 40, redeemed: 0, pending: 8, acctNo: "PR-1004" }
    },
    loginApproved: false
  },
  // --- Fadi Yousef's family ---
  k_mesk: {
    id: "k_mesk", name: "Mesk", nameAr: "مسك", emoji: "🐰", grade: "Grade 3",
    streak: 6, badges: ["First task", "Kind classmate"],
    accounts: {
      a_coparent: { earned: 70, redeemed: 20, pending: 0,  acctNo: "CP-2001" },
      a_teacher:  { earned: 30, redeemed: 0,  pending: 12, acctNo: "TC-3002" }
    },
    loginApproved: true
  },
  k_wesam: {
    id: "k_wesam", name: "Wesam", nameAr: "وسام", emoji: "🐨", grade: "Grade 4",
    streak: 4, badges: ["First task", "Library helper"],
    accounts: {
      a_coparent: { earned: 55, redeemed: 10, pending: 0, acctNo: "CP-2002" },
      a_moder:    { earned: 20, redeemed: 0,  pending: 0, acctNo: "MD-4003" }
    },
    loginApproved: true
  },
  k_ismael: {
    id: "k_ismael", name: "Ismael", nameAr: "إسماعيل", emoji: "🦁", grade: "Grade 6",
    streak: 8, badges: ["First task", "8-day streak", "Math whiz"],
    accounts: {
      a_coparent: { earned: 60, redeemed: 25, pending: 5, acctNo: "CP-2003" }
    },
    loginApproved: false
  }
};

// Tasks assigned to kids from DIFFERENT assigners (demonstrates multi-assigner flow).
KB.tasks = [
  { id: "t1", title: "Finish math homework", points: 15, kidId: "k_bisan", assignerId: "a_teacher",
    deadline: "2026-06-24 18:00", decay: "-1 pt / 5 min late", status: "pending_approval", category: "School" },
  { id: "t2", title: "Tidy your room", points: 10, kidId: "k_bisan", assignerId: "a_parent",
    deadline: "2026-06-24 20:00", decay: "-1 pt / 5 min late", status: "assigned", category: "Home" },
  { id: "t3", title: "Read 20 minutes", points: 8, kidId: "k_razan", assignerId: "a_parent",
    deadline: "2026-06-25 19:00", decay: "none", status: "assigned", category: "Learning" },
  { id: "t4", title: "Help set the table", points: 5, kidId: "k_majed", assignerId: "a_parent",
    deadline: "2026-06-24 19:30", decay: "-1 pt / 10 min late", status: "pending_approval", category: "Home" },
  { id: "t5", title: "Practice spelling", points: 12, kidId: "k_saad", assignerId: "a_parent",
    deadline: "2026-06-26 17:00", decay: "none", status: "assigned", category: "Learning" },
  { id: "t6", title: "Class kindness award", points: 10, kidId: "k_wesam", assignerId: "a_moder",
    deadline: "2026-06-24 12:00", decay: "none", status: "completed", category: "Behavior" },
  { id: "t7", title: "Science project draft", points: 20, kidId: "k_mesk", assignerId: "a_teacher",
    deadline: "2026-06-24 23:00", decay: "-1 pt / 5 min late", status: "pending_approval", category: "School" },
  { id: "t8", title: "Library helper duty", points: 10, kidId: "k_ismael", assignerId: "a_coparent",
    deadline: "2026-06-25 15:00", decay: "none", status: "assigned", category: "Behavior" },
  { id: "t9", title: "Water the plants", points: 6, kidId: "k_bisan", assignerId: "a_parent",
    deadline: "2026-06-23 21:00", decay: "-1 pt / 5 min late", status: "completed", category: "Home" }
];

// Notifications per assigner role (keyed by assigner id).
KB.notifications = [
  { id: "n1", to: "a_teacher", text: "Bisan marked 'Finish math homework' as complete.", time: "2 min ago", unread: true, type: "approval" },
  { id: "n2", to: "a_parent",  text: "Majed marked 'Help set the table' as complete.", time: "10 min ago", unread: true, type: "approval" },
  { id: "n3", to: "a_parent",  text: "Teacher Lina gifted Bisan 5 bonus points.", time: "1 hr ago", unread: false, type: "gift" },
  { id: "n4", to: "a_teacher", text: "Mesk submitted 'Science project draft'.", time: "20 min ago", unread: true, type: "approval" },
  { id: "n5", to: "a_moder",   text: "Teacher Lina requested student access to Mesk.", time: "3 hr ago", unread: true, type: "safety" }
];

// Audit log for moderator oversight.
KB.auditLog = [
  { id: "au1", actor: "Ms. Lina Haddad", action: "Approved task completion", target: "Bisan · Math", time: "Today 09:14", risk: "low" },
  { id: "au2", actor: "Tariq Jaber", action: "Gifted bonus points (+5)", target: "Bisan", time: "Today 08:40", risk: "low" },
  { id: "au3", actor: "Ms. Lina Haddad", action: "Requested new student link", target: "Mesk", time: "Yesterday 16:02", risk: "review" },
  { id: "au4", actor: "Fadi Yousef", action: "Redeemed points → USD", target: "Ismael (CP-2003)", time: "Yesterday 14:20", risk: "low" }
];

// Moderation queue (safeguarding).
KB.moderationQueue = [
  { id: "m1", title: "Teacher access request", detail: "Lina Haddad → Mesk (Grade 3)", status: "pending" },
  { id: "m2", title: "Unusual point spike", detail: "Bisan earned 60 pts in 1 hour", status: "review" },
  { id: "m3", title: "New independent teacher", detail: "Verify credentials: Lina Haddad", status: "pending" }
];

// Map of which assigners each adult role "owns" for scoping the dashboard.
KB.roleScope = {
  Parent:    { assignerId: "a_parent",   kids: ["k_bisan", "k_razan", "k_majed", "k_saad"], label: "Your Kids" },
  "Co-Parent": { assignerId: "a_coparent", kids: ["k_mesk", "k_wesam", "k_ismael"],         label: "Your Kids" },
  Teacher:   { assignerId: "a_teacher",  kids: ["k_bisan", "k_mesk"],   label: "Your Students" },
  Moderator: { assignerId: "a_moder",    kids: ["k_razan", "k_wesam"],  label: "Assigned Students" }
};

// Multi-role identities (v6): one adult can wear several hats.
// The demo identity holds BOTH Parent and Teacher roles to demonstrate the role switcher.
KB.roleGroups = {
  Parent:      ["Parent", "Teacher"],
  Teacher:     ["Teacher", "Parent"],
  "Co-Parent": ["Co-Parent"],
  Moderator:   ["Moderator"]
};

// Redemption ledger (v7/v8): every redemption is recorded here.
// v8: redemptions are TWO-STEP. status is "pending_confirmation" until the kid
// confirms, then becomes "redeemed" (or "declined" if the kid rejects it).
// Seeded with completed history plus one pending item so the kid-confirm flow is demoable.
KB.redemptions = [
  { id: "rd_seed1", kidId: "k_bisan", assignerId: "a_teacher", amount: 15, money: "$7.50", cur: "USD", ts: "2026-06-23 17:10", acctNo: "TC-3001", status: "pending_confirmation" },
  { id: "rd_h1", kidId: "k_bisan",  assignerId: "a_parent",   amount: 50, money: "$25.00", cur: "USD", ts: "2026-06-22 14:20", acctNo: "PR-1001", status: "redeemed" },
  { id: "rd_h2", kidId: "k_razan",  assignerId: "a_parent",   amount: 30, money: "$15.00", cur: "USD", ts: "2026-06-21 19:05", acctNo: "PR-1002", status: "redeemed" },
  { id: "rd_h3", kidId: "k_ismael", assignerId: "a_coparent", amount: 25, money: "$12.50", cur: "USD", ts: "2026-06-20 18:00", acctNo: "CP-2003", status: "redeemed" },
  { id: "rd_h4", kidId: "k_mesk",   assignerId: "a_teacher",  amount: 20, money: "$10.00", cur: "USD", ts: "2026-06-19 16:30", acctNo: "TC-3002", status: "redeemed" }
];

// Redemption event log (v8): parent-visible audit of every redemption lifecycle event
// (initiated / completed / declined) with kid, assigner, amount, money value and timestamp.
KB.redemptionLog = [
  { id: "rl1", redemptionId: "rd_seed1", kidId: "k_bisan", assignerId: "a_teacher", parentId: "a_parent", amount: 15, money: "$7.50", cur: "USD", event: "initiated", ts: "2026-06-23 17:10" }
];
