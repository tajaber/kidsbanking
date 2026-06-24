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

// Assigners = adult accounts (parent, co-parent, teacher, moderator)
KB.assigners = {
  a_parent:   { id: "a_parent",   name: "Sara Aziz",     role: "Parent",    avatar: "👩", color: "#6C5CE7" },
  a_coparent: { id: "a_coparent", name: "Omar Aziz",     role: "Co-Parent", avatar: "👨", color: "#00B894" },
  a_teacher:  { id: "a_teacher",  name: "Ms. Lina Haddad",role: "Teacher",  avatar: "🧑‍🏫", color: "#0984E3" },
  a_moder:    { id: "a_moder",    name: "Mr. Khalid Nour",role: "Moderator",avatar: "🛡️", color: "#E17055" }
};

// Kids / students. Each kid keeps separate balances per assigner ("bank account numbers").
KB.kids = {
  k_yusuf: {
    id: "k_yusuf", name: "Yusuf", nameAr: "يوسف", emoji: "🦊", grade: "Grade 4",
    streak: 12, badges: ["First task", "10-day streak", "Bookworm", "Tidy champ"],
    accounts: {
      a_parent:   { earned: 120, redeemed: 50, pending: 15, pendingRedeem: 0,  acctNo: "PR-1001" },
      a_coparent: { earned: 60,  redeemed: 20, pending: 0,  pendingRedeem: 0,  acctNo: "CP-2001" },
      // 15 pts are held awaiting kid confirmation (see KB.redemptions rd_seed1).
      a_teacher:  { earned: 25,  redeemed: 0,  pending: 10, pendingRedeem: 15, acctNo: "TC-3001" }
    },
    loginApproved: true
  },
  k_layla: {
    id: "k_layla", name: "Layla", nameAr: "ليلى", emoji: "🐱", grade: "Grade 2",
    streak: 7, badges: ["First task", "5-day streak", "Helpful hero"],
    accounts: {
      a_parent:   { earned: 80,  redeemed: 30, pending: 5,  acctNo: "PR-1002" },
      a_coparent: { earned: 45,  redeemed: 10, pending: 0,  acctNo: "CP-2002" },
      a_moder:    { earned: 25,  redeemed: 0,  pending: 0,  acctNo: "MD-4002" }
    },
    loginApproved: false
  },
  k_sami: {
    id: "k_sami", name: "Sami", nameAr: "سامي", emoji: "🐯", grade: "Grade 5",
    streak: 4, badges: ["First task", "Science star"],
    accounts: {
      a_teacher: { earned: 70, redeemed: 20, pending: 20, acctNo: "TC-3003" },
      a_moder:   { earned: 30, redeemed: 0,  pending: 0,  acctNo: "MD-4003" }
    },
    loginApproved: true
  }
};

// Tasks assigned to kids from DIFFERENT assigners (demonstrates multi-assigner flow).
KB.tasks = [
  { id: "t1", title: "Finish math homework", points: 15, kidId: "k_yusuf", assignerId: "a_teacher",
    deadline: "2026-06-24 18:00", decay: "-1 pt / 5 min late", status: "pending_approval", category: "School" },
  { id: "t2", title: "Tidy your room", points: 10, kidId: "k_yusuf", assignerId: "a_parent",
    deadline: "2026-06-24 20:00", decay: "-1 pt / 5 min late", status: "assigned", category: "Home" },
  { id: "t3", title: "Read 20 minutes", points: 8, kidId: "k_yusuf", assignerId: "a_coparent",
    deadline: "2026-06-25 19:00", decay: "none", status: "assigned", category: "Learning" },
  { id: "t4", title: "Help set the table", points: 5, kidId: "k_layla", assignerId: "a_parent",
    deadline: "2026-06-24 19:30", decay: "-1 pt / 10 min late", status: "pending_approval", category: "Home" },
  { id: "t5", title: "Practice spelling", points: 12, kidId: "k_layla", assignerId: "a_coparent",
    deadline: "2026-06-26 17:00", decay: "none", status: "assigned", category: "Learning" },
  { id: "t6", title: "Class kindness award", points: 10, kidId: "k_layla", assignerId: "a_moder",
    deadline: "2026-06-24 12:00", decay: "none", status: "completed", category: "Behavior" },
  { id: "t7", title: "Science project draft", points: 20, kidId: "k_sami", assignerId: "a_teacher",
    deadline: "2026-06-24 23:00", decay: "-1 pt / 5 min late", status: "pending_approval", category: "School" },
  { id: "t8", title: "Library helper duty", points: 10, kidId: "k_sami", assignerId: "a_moder",
    deadline: "2026-06-25 15:00", decay: "none", status: "assigned", category: "Behavior" },
  { id: "t9", title: "Water the plants", points: 6, kidId: "k_yusuf", assignerId: "a_parent",
    deadline: "2026-06-23 21:00", decay: "-1 pt / 5 min late", status: "completed", category: "Home" }
];

// Notifications per assigner role (keyed by assigner id).
KB.notifications = [
  { id: "n1", to: "a_teacher", text: "Yusuf marked 'Finish math homework' as complete.", time: "2 min ago", unread: true, type: "approval" },
  { id: "n2", to: "a_parent",  text: "Layla marked 'Help set the table' as complete.", time: "10 min ago", unread: true, type: "approval" },
  { id: "n3", to: "a_parent",  text: "Co-parent Omar gifted Yusuf 5 bonus points.", time: "1 hr ago", unread: false, type: "gift" },
  { id: "n4", to: "a_teacher", text: "Sami submitted 'Science project draft'.", time: "20 min ago", unread: true, type: "approval" },
  { id: "n5", to: "a_moder",   text: "Teacher Lina requested student access to Sami.", time: "3 hr ago", unread: true, type: "safety" }
];

// Audit log for moderator oversight.
KB.auditLog = [
  { id: "au1", actor: "Ms. Lina Haddad", action: "Approved task completion", target: "Sami · Reading", time: "Today 09:14", risk: "low" },
  { id: "au2", actor: "Omar Aziz", action: "Gifted bonus points (+5)", target: "Yusuf", time: "Today 08:40", risk: "low" },
  { id: "au3", actor: "Ms. Lina Haddad", action: "Requested new student link", target: "Sami", time: "Yesterday 16:02", risk: "review" },
  { id: "au4", actor: "Sara Aziz", action: "Redeemed points → USD", target: "Yusuf (PR-1001)", time: "Yesterday 14:20", risk: "low" }
];

// Moderation queue (safeguarding).
KB.moderationQueue = [
  { id: "m1", title: "Teacher access request", detail: "Lina Haddad → Sami (Grade 5)", status: "pending" },
  { id: "m2", title: "Unusual point spike", detail: "Yusuf earned 60 pts in 1 hour", status: "review" },
  { id: "m3", title: "New independent teacher", detail: "Verify credentials: Lina Haddad", status: "pending" }
];

// Map of which assigners each adult role "owns" for scoping the dashboard.
KB.roleScope = {
  Parent:    { assignerId: "a_parent",   kids: ["k_yusuf", "k_layla"],  label: "Your Kids" },
  "Co-Parent": { assignerId: "a_coparent", kids: ["k_yusuf", "k_layla"], label: "Your Kids" },
  Teacher:   { assignerId: "a_teacher",  kids: ["k_yusuf", "k_sami"],   label: "Your Students" },
  Moderator: { assignerId: "a_moder",    kids: ["k_layla", "k_sami"],   label: "Assigned Students" }
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
  { id: "rd_seed1", kidId: "k_yusuf", assignerId: "a_teacher", amount: 15, money: "$7.50", cur: "USD", ts: "2026-06-23 17:10", acctNo: "TC-3001", status: "pending_confirmation" },
  { id: "rd_h1", kidId: "k_yusuf", assignerId: "a_parent",   amount: 50, money: "$25.00", cur: "USD", ts: "2026-06-22 14:20", acctNo: "PR-1001", status: "redeemed" },
  { id: "rd_h2", kidId: "k_layla", assignerId: "a_parent",   amount: 30, money: "$15.00", cur: "USD", ts: "2026-06-21 19:05", acctNo: "PR-1002", status: "redeemed" },
  { id: "rd_h3", kidId: "k_yusuf", assignerId: "a_coparent", amount: 20, money: "$10.00", cur: "USD", ts: "2026-06-20 18:00", acctNo: "CP-2001", status: "redeemed" },
  { id: "rd_h4", kidId: "k_sami",  assignerId: "a_teacher",  amount: 20, money: "$10.00", cur: "USD", ts: "2026-06-19 16:30", acctNo: "TC-3003", status: "redeemed" }
];

// Redemption event log (v8): parent-visible audit of every redemption lifecycle event
// (initiated / completed / declined) with kid, assigner, amount, money value and timestamp.
KB.redemptionLog = [
  { id: "rl1", redemptionId: "rd_seed1", kidId: "k_yusuf", assignerId: "a_teacher", parentId: "a_parent", amount: 15, money: "$7.50", cur: "USD", event: "initiated", ts: "2026-06-23 17:10" }
];
