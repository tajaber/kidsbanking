/* KidsBank Prototype — App logic (vanilla JS, hash-aware SPA router)
 * Renders all role flows. No backend; state mutates in memory.
 */
(function () {
  const KB = window.KB;

  // ---- App state ----
  const state = {
    view: "landing",     // landing | login | mfa | dashboard | kid
    role: null,          // Parent | Co-Parent | Teacher | Moderator | Kid
    roles: [],           // all roles the signed-in identity holds (multi-role switch)
    dashTab: "overview",
    kidTab: "tasks",
    kidLoginStage: "scan", // scan | waiting | approved
    currency: "USD",
    lang: "en",
    dir: "ltr",
    theme: "light",
    showTip: true,
    kidGoal: 200
  };

  // ---- i18n (complete en/ar; full language + RTL switch) ----
  const I = {
    en: {
      // brand / landing
      appName: "KidsBank", tagline: "Motivate. Achieve. Reward.",
      taglineSuffix: "A safe way for kids to earn points and for grown-ups to reward real effort.",
      chooseRole: "Who's signing in?",
      demoNote: "Demo prototype · no real data · all flows simulated",
      roleParent: "Parent", roleCoParent: "Co-Parent", roleKid: "Kid", roleTeacher: "Teacher", roleModerator: "Moderator",
      roleParentDesc: "Manage kids, tasks & rewards",
      roleCoParentDesc: "Shared parenting access",
      roleKidDesc: "See tasks & earn points",
      roleTeacherDesc: "Assign & approve student tasks",
      roleModeratorDesc: "Oversight & safeguarding",
      // tabs / nav
      overview: "Overview", tasks: "Tasks", approvals: "Approvals", redeem: "Redeem",
      students: "People", more: "More", points: "Points", history: "History",
      people: "People", oversight: "Oversight", settings: "Settings", notifications: "Notifications",
      signOut: "Sign out",
      scopeYourKids: "Your Kids", scopeYourStudents: "Your Students", scopeAssignedStudents: "Assigned Students",
      // login
      signIn: "Sign in", welcome: "Welcome, {role}", signInPrompt: "Sign in to your KidsBank account.",
      email: "Email", password: "Password", continueBtn: "Continue →",
      mfaProtected: "🔒 Protected by multi-factor authentication",
      // mfa
      verify: "Verify", twoFactor: "Two-factor authentication",
      mfaPrompt: "We sent a 6-digit code to your device. Enter it below.", mfaDemo: "(Demo: any digits work)",
      verifyEnter: "Verify & enter →", noCode: "Didn't get a code?", resend: "Resend",
      // overview
      tipWelcome: "👋 Welcome! Approve completed tasks, then redeem points to reward real-world effort.",
      gotIt: "Got it", totalTasks: "Total tasks", pointsEarnedLabel: "Points earned",
      pointsRedeemedLabel: "Points redeemed", pendingApprovals: "Pending approvals",
      viewAll: "View all", leaderboard: "Leaderboard 🏆", byPointsLabel: "by points",
      dayStreak: "{n}-day streak", recentLabel: "Recent {x}", newTask: "＋ New task", recentActivity: "Recent activity",
      acct: "Acct", stAssigned: "assigned", stPending: "pending approval", stCompleted: "completed",
      tasksCount: "{n} {tasks}", createTask: "＋ Create task", searchTasks: "🔎 Search tasks…",
      fAll: "All", fAssigned: "Assigned", fPending: "Pending", fDone: "Done",
      noTasks: "No tasks yet. Create one to get started.", due: "Due",
      // approvals
      allCaught: "All caught up! No completions waiting for approval.",
      approvalsIntro: "Kids marked these as complete. Approving adds the points to their account.",
      approveBtn: "✓ Approve", rejectBtn: "✕ Reject",
      // people
      peopleManage: "{label} you manage · balances shown per account.",
      inviteCoParent: "＋ Invite co-parent", searchPeople: "🔎 Search {label}…",
      earnedWord: "earned", pendingWord: "pending", redeemedWord: "redeemed",
      giftPointsBtn: "🎁 Gift points", qrCodeBtn: "🔳 QR code", approveLoginBtn: "✓ Approve login",
      loginPending: "⏳ login pending",
      statEarned: "Earned", statPending: "Pending", statValue: "Value if redeemed",
      ifRedeemed: "≈ {money} if redeemed",
      // redeem
      conversionRate: "Conversion rate",
      rateLine: "10 points = {sym}{rate} {cur}. Change currency in Settings.",
      changeCurrency: "Change currency in Settings.",
      redeemIntro: "Mark points as redeemed after you give the real-world reward outside the app.",
      availableWord: "available", ptsCurrentRate: "{n} pts × current rate", redeemBtn: "💱 Redeem",
      // redeem modal
      redeemTitle: "💱 Redeem points",
      redeemPrompt: "Redeem points for {name} after giving the real-world reward.",
      pointsToRedeem: "Points to redeem", allBtn: "All", halfBtn: "Half",
      availOf: "of {n} available", confirmRedeemed: "Confirm redeemed", cancel: "Cancel",
      redeemDone: "✓ {n} pts redeemed ({money})", redeemInvalid: "⚠️ Enter 1–{max} points",
      account: "Account",
      // create task
      taskTitle: "Task title", taskTitlePh: "e.g. Tidy your room",
      pointValue: "Point value", deadline: "Deadline",
      lateDecayLead: "Late decay: reduce", lateDecayPts: "points", lateDecayMid: "every",
      lateDecayMin: "minutes after the deadline.",
      assignTo: "Assign to (one or more)", tapMulti: "Tap to select multiple kids.",
      createAssign: "Create & assign", addTitlePick: "⚠️ Add a title and pick a kid",
      taskCreated: "✓ Task created for {n} {kids}", kidWord: "kid", kidsWord: "kids",
      // gift
      giftTitle: "🎁 Gift bonus points", giftPrompt: "Reward {name} for something great that isn't a task.",
      reasonLabel: "Reason", giftReasonDefault: "Being kind & helpful", giftBtn: "Gift points",
      giftDone: "🎁 Gifted {n} pts to {name}",
      // oversight
      oversightIntro: "Safeguarding & governance: review teacher access, point anomalies, and the activity audit log.",
      moderationQueue: "Moderation queue", auditLog: "Audit log", approveWord: "Approve", blockWord: "Block",
      reqApproved: "✓ Request approved", reqBlocked: "⛔ Request blocked",
      // notifications
      markAllRead: "Mark all read", reviewBtn: "Review", noNotifs: "No notifications.",
      nfApprovals: "Approvals", nfGifts: "Gifts", nfSafety: "Safety",
      // settings
      currencyHeading: "Currency", currencyUse: "Used for point→money conversion.",
      langLayout: "Language & layout", langInfo: "Switch language and text direction (LTR/RTL).",
      englishLtr: "English (LTR)", arabicRtl: "العربية (RTL)",
      appearance: "Appearance", lightTheme: "☀️ Light", darkTheme: "🌙 Dark",
      // kid
      kidBankTitle: "{name}'s KidsBank",
      joinKidsbank: "Join KidsBank", kidHi: "Hi! Let's get you in",
      kidScanPrompt: "Scan the QR code from your parent's or teacher's app to request access.",
      kidScanBtn: "📷 Simulate scan & request access", kidApproveNote: "A grown-up must approve your first login (safety).",
      waiting: "Waiting…", waitingApproval: "Waiting for approval",
      kidWaitPrompt: "We sent your request. A parent or teacher needs to approve it before you can sign in.",
      reqSentPending: "Request sent · Pending review…", simApproval: "✓ Simulate approval",
      kidTasksIntro: "Your tasks. Each shows who gave it to you — that grown-up approves it and turns points into rewards.",
      fromWord: "From", doneBtn: "Done!", waitingBadge: "⏳ waiting",
      kidEarned: "Earned", kidRedeemed: "Redeemed", kidPending: "Pending",
      rewardGoal: "Reward goal 🎯", setGoal: "Set goal", pointsOf: "{a} / {b} points",
      goalReached: "🎉 Goal reached!", toGo: "{n} to go",
      streakLine: "{n}-day streak!", keepStreak: "Keep completing tasks daily to grow your streak.",
      achievements: "Achievements 🏅", nextBadge: "🔒 Next badge…", yourAccounts: "Your accounts",
      rewardHistory: "Your reward history.", byWord: "by",
      bonusGift: "Bonus gift +5 pts · Being kind", redeemedReward: "Redeemed 50 pts → reward",
      earnedTaskHist: "Earned {n} pts · {title}",
      // goal modal
      setRewardGoal: "🎯 Set your reward goal", goalPrompt: "Choose how many points you want to save up for your next reward.",
      goalPoints: "Goal (points)", saveGoal: "Save goal", goalSet: "🎯 Goal set to {n} points",
      // QR
      qrTitle: "🔳 {name}'s QR code", qrPrompt: "The kid scans this on their device to request access. You approve the first login.",
      qrExpires: "Account {acct} · expires in 10 min", doneWord: "Done",
      // invite
      inviteTitle: "＋ Invite co-parent",
      invitePrompt: "Invite a partner to share access to your kids' accounts. They'll get the same parenting tools with their own login.",
      partnerEmail: "Partner's email", relationship: "Relationship", sendInvite: "Send invite",
      relCoParent: "Co-Parent", relGuardian: "Guardian", relGrandparent: "Grandparent",
      inviteSent: "✉️ Invite sent to {email}", inviteSentPlain: "✉️ Invite sent",
      // task detail
      assignedToBy: "Assigned to {kid} by {by} ({role}).",
      deadlineWord: "Deadline", lateRule: "Late rule: {decay} · Category: {cat} · Account {acct}",
      progress: "Progress", stepAssigned: "Assigned", stepKidComplete: "Kid marked complete",
      stepApproved: "Approved & points added", close: "Close",
      // guide
      guideTitle: "🎬 Demo guide",
      guideIntro: "A quick script for presenting KidsBank. Press ? any time to reopen.",
      guide1: "Landing → pick a role (Parent, Co-Parent, Kid, Teacher, Moderator).",
      guide2: "Adult login → any credentials → MFA (any 6 digits) → dashboard.",
      guide3: "Overview → summary cards, leaderboard, recent activity.",
      guide4: "Tasks → create a task (points, deadline, late-decay), assign to multiple kids.",
      guide5: "Approvals → approve a kid-completed task → points are added.",
      guide6: "People → per-account balances, QR code, gift points, invite co-parent.",
      guide7: "Redeem → switch currency, redeem full or partial points after a real-world reward.",
      guide8: "Moderator → Oversight tab: moderation queue + audit log.",
      guide9: "Kid → scan QR → wait for approval → tasks show who assigned them → mark done → streaks, badges, goal.",
      guide10: "Try the 🌐 language/RTL, 🌙 theme, and {sym} currency switches in the top bar.",
      // toasts
      signedIn: "✓ Signed in securely", currencySet: "💱 Currency set to {cur}", currencyCycle: "💱 Currency: {cur}",
      switchedAr: "تم التبديل إلى العربية", switchedEn: "Switched to English",
      codeSent: "📨 A new code was sent (demo)",
      approvedPts: "✓ Approved · +{n} pts to {name}", sentBack: "↩️ Sent back to the kid to retry",
      sentForApproval: "✓ Sent for approval to {name}", loginApprovedToast: "✓ {name}'s login approved",
      kidWelcome: "✓ Approved! Welcome 🦊",
      // v6 — multi-role switch + name search
      activeRole: "Active role", switchRole: "Switch role",
      roleSwitched: "↔️ Switched to {role} view",
      typeMore: "Type 3+ letters to search",
      // v7 — redemption history
      redemptionHistory: "Redemption history 🧾",
      yourRedemptions: "Your redemptions", allKidRedemptions: "All redemptions for your kids (every assigner)",
      noRedemptions: "No redemptions yet.", redemptionRow: "{n} pts → {money}",
      // v7 — parent overall picture
      overallPicture: "Overall picture", overallIntro: "Every account for each kid, across all assigners.",
      grandTotal: "Grand total",
      // v7 — kid scans any assigner QR
      scanNewQr: "📷 Scan a new assigner's QR", scanNewTitle: "📷 Scan a new assigner's QR",
      scanNewPrompt: "Pick an assigner to simulate scanning their QR. We'll open a new bank account for you.",
      pickAssigner: "Choose assigner", createAccountBtn: "Open account",
      scanInstruction: "Point your camera at the assigner's QR code to scan.",
      simulateScanBtn: "📷 Simulate scan", scannedReveal: "✅ Scanned — QR belongs to:",
      accountCreated: "🎉 New account {acct} opened with {assigner}",
      allLinked: "You're already linked to every assigner.",
      // v8-1 — two-step redemption confirmation
      redeemInitiated: "✓ Redemption started · awaiting {name}'s confirmation",
      statusPendingRedeem: "Pending redemption confirmation",
      statusRedeemed: "Redeemed", statusDeclined: "Declined",
      pendingRedeemTitle: "Redemptions to confirm 🪙",
      pendingRedeemIntro: "A grown-up started these redemptions. Confirm to receive your real-world reward, or decline to keep your points.",
      pendingRedeemRow: "{n} pts → {money}", pendingRedeemBy: "Started by {by}",
      confirmRedeemBtn: "Confirm redemption", declineRedeemBtn: "Decline",
      redeemConfirmedToast: "🎉 Redemption confirmed · {money}",
      redeemDeclinedToast: "↩️ Redemption declined · {n} pts returned",
      parentRedeemLog: "Redemption activity log 📋",
      parentRedeemLogIntro: "Every redemption event for your kids — who started it, when, and its status.",
      redeemEventInitiated: "Redemption started · {n} pts ({money}) for {kid} by {by}",
      redeemEventCompleted: "Redemption confirmed · {n} pts ({money}) for {kid} by {by}",
      redeemEventDeclined: "Redemption declined · {n} pts for {kid}",
      notifRedeemInitiated: "{by} started a {n}-pt redemption for {kid} — awaiting kid confirmation.",
      notifRedeemCompleted: "{kid} confirmed the {n}-pt redemption ({money}).",
      notifRedeemDeclined: "{kid} declined the {n}-pt redemption — points returned.",
      // v8-2 — pre-login role choice
      preLoginTitle: "Have more than one role?",
      preLoginIntro: "Pick which role to sign in as. You can still switch roles inside the app.",
      preLoginSignInAs: "Sign in as {role}", justNowWord: "Just now"
    },
    ar: {
      // brand / landing
      appName: "بنك الأطفال", tagline: "حفّز. أنجز. كافئ.",
      taglineSuffix: "طريقة آمنة ليكسب الأطفال النقاط ويكافئ الكبار الجهد الحقيقي.",
      chooseRole: "من يسجّل الدخول؟",
      demoNote: "نموذج تجريبي · لا بيانات حقيقية · جميع المسارات محاكاة",
      roleParent: "ولي أمر", roleCoParent: "ولي أمر شريك", roleKid: "طفل", roleTeacher: "معلّم", roleModerator: "مشرف",
      roleParentDesc: "إدارة الأطفال والمهام والمكافآت",
      roleCoParentDesc: "وصول مشترك لتربية الأبناء",
      roleKidDesc: "اطّلع على المهام واكسب النقاط",
      roleTeacherDesc: "إسناد مهام الطلاب والموافقة عليها",
      roleModeratorDesc: "الإشراف والحماية",
      // tabs / nav
      overview: "نظرة عامة", tasks: "المهام", approvals: "الموافقات", redeem: "استبدال",
      students: "الأشخاص", more: "المزيد", points: "النقاط", history: "السجل",
      people: "الأشخاص", oversight: "الإشراف", settings: "الإعدادات", notifications: "الإشعارات",
      signOut: "تسجيل الخروج",
      scopeYourKids: "أطفالك", scopeYourStudents: "طلابك", scopeAssignedStudents: "الطلاب المُسندون",
      // login
      signIn: "تسجيل الدخول", welcome: "مرحبًا، {role}", signInPrompt: "سجّل الدخول إلى حسابك في بنك الأطفال.",
      email: "البريد الإلكتروني", password: "كلمة المرور", continueBtn: "متابعة ←",
      mfaProtected: "🔒 محمي بالمصادقة متعددة العوامل",
      // mfa
      verify: "تحقّق", twoFactor: "المصادقة الثنائية",
      mfaPrompt: "أرسلنا رمزًا من 6 أرقام إلى جهازك. أدخله أدناه.", mfaDemo: "(تجريبي: أي أرقام تعمل)",
      verifyEnter: "تحقّق وادخل ←", noCode: "لم يصلك الرمز؟", resend: "إعادة الإرسال",
      // overview
      tipWelcome: "👋 مرحبًا! وافق على المهام المكتملة، ثم استبدل النقاط لمكافأة الجهد الحقيقي.",
      gotIt: "حسنًا", totalTasks: "إجمالي المهام", pointsEarnedLabel: "النقاط المكتسبة",
      pointsRedeemedLabel: "النقاط المستبدلة", pendingApprovals: "موافقات معلّقة",
      viewAll: "عرض الكل", leaderboard: "لوحة الصدارة 🏆", byPointsLabel: "حسب النقاط",
      dayStreak: "تتابع {n} يوم", recentLabel: "{x} الأخيرة", newTask: "＋ مهمة جديدة", recentActivity: "النشاط الأخير",
      acct: "حساب", stAssigned: "مُسندة", stPending: "بانتظار الموافقة", stCompleted: "مكتملة",
      tasksCount: "{n} {tasks}", createTask: "＋ إنشاء مهمة", searchTasks: "🔎 ابحث في المهام…",
      fAll: "الكل", fAssigned: "مُسندة", fPending: "معلّقة", fDone: "مكتملة",
      noTasks: "لا مهام بعد. أنشئ واحدة للبدء.", due: "تستحق",
      // approvals
      allCaught: "كل شيء مكتمل! لا مهام بانتظار الموافقة.",
      approvalsIntro: "أشار الأطفال إلى إكمال هذه المهام. الموافقة تضيف النقاط إلى حسابهم.",
      approveBtn: "✓ موافقة", rejectBtn: "✕ رفض",
      // people
      peopleManage: "{label} الذين تديرهم · الأرصدة معروضة لكل حساب.",
      inviteCoParent: "＋ دعوة ولي أمر شريك", searchPeople: "🔎 ابحث في {label}…",
      earnedWord: "مكتسبة", pendingWord: "معلّقة", redeemedWord: "مستبدلة",
      giftPointsBtn: "🎁 إهداء نقاط", qrCodeBtn: "🔳 رمز QR", approveLoginBtn: "✓ الموافقة على الدخول",
      loginPending: "⏳ الدخول معلّق",
      statEarned: "مكتسبة", statPending: "معلّقة", statValue: "القيمة عند الاستبدال",
      ifRedeemed: "≈ {money} عند الاستبدال",
      // redeem
      conversionRate: "سعر التحويل",
      rateLine: "10 نقاط = {sym}{rate} {cur}. غيّر العملة من الإعدادات.",
      changeCurrency: "غيّر العملة من الإعدادات.",
      redeemIntro: "حدّد النقاط كمستبدلة بعد منح المكافأة الواقعية خارج التطبيق.",
      availableWord: "متاحة", ptsCurrentRate: "{n} نقطة × السعر الحالي", redeemBtn: "💱 استبدال",
      // redeem modal
      redeemTitle: "💱 استبدال النقاط",
      redeemPrompt: "استبدل نقاط {name} بعد منح المكافأة الواقعية.",
      pointsToRedeem: "النقاط المراد استبدالها", allBtn: "الكل", halfBtn: "النصف",
      availOf: "من {n} متاحة", confirmRedeemed: "تأكيد الاستبدال", cancel: "إلغاء",
      redeemDone: "✓ تم استبدال {n} نقطة ({money})", redeemInvalid: "⚠️ أدخل 1–{max} نقطة",
      account: "الحساب",
      // create task
      taskTitle: "عنوان المهمة", taskTitlePh: "مثال: رتّب غرفتك",
      pointValue: "قيمة النقاط", deadline: "الموعد النهائي",
      lateDecayLead: "خصم التأخير: اخصم", lateDecayPts: "نقاط", lateDecayMid: "كل",
      lateDecayMin: "دقيقة بعد الموعد النهائي.",
      assignTo: "إسناد إلى (واحد أو أكثر)", tapMulti: "اضغط لاختيار عدة أطفال.",
      createAssign: "إنشاء وإسناد", addTitlePick: "⚠️ أضف عنوانًا واختر طفلًا",
      taskCreated: "✓ أُنشئت مهمة لـ {n} {kids}", kidWord: "طفل", kidsWord: "أطفال",
      // gift
      giftTitle: "🎁 إهداء نقاط إضافية", giftPrompt: "كافئ {name} على شيء رائع ليس مهمة.",
      reasonLabel: "السبب", giftReasonDefault: "اللطف والمساعدة", giftBtn: "إهداء النقاط",
      giftDone: "🎁 تم إهداء {n} نقطة إلى {name}",
      // oversight
      oversightIntro: "الحماية والحوكمة: راجع وصول المعلمين، وشذوذ النقاط، وسجل التدقيق.",
      moderationQueue: "قائمة الإشراف", auditLog: "سجل التدقيق", approveWord: "موافقة", blockWord: "حظر",
      reqApproved: "✓ تمت الموافقة على الطلب", reqBlocked: "⛔ تم حظر الطلب",
      // notifications
      markAllRead: "تحديد الكل كمقروء", reviewBtn: "مراجعة", noNotifs: "لا إشعارات.",
      nfApprovals: "الموافقات", nfGifts: "الهدايا", nfSafety: "الأمان",
      // settings
      currencyHeading: "العملة", currencyUse: "تُستخدم لتحويل النقاط إلى مال.",
      langLayout: "اللغة والتخطيط", langInfo: "بدّل اللغة واتجاه النص (يسار/يمين).",
      englishLtr: "English (LTR)", arabicRtl: "العربية (RTL)",
      appearance: "المظهر", lightTheme: "☀️ فاتح", darkTheme: "🌙 داكن",
      // kid
      kidBankTitle: "بنك {name}",
      joinKidsbank: "انضم إلى بنك الأطفال", kidHi: "مرحبًا! لندخلك",
      kidScanPrompt: "امسح رمز QR من تطبيق والدك أو معلمك لطلب الوصول.",
      kidScanBtn: "📷 محاكاة المسح وطلب الوصول", kidApproveNote: "يجب أن يوافق شخص بالغ على أول دخول لك (للأمان).",
      waiting: "بالانتظار…", waitingApproval: "بانتظار الموافقة",
      kidWaitPrompt: "أرسلنا طلبك. يحتاج ولي الأمر أو المعلم للموافقة قبل أن تتمكن من الدخول.",
      reqSentPending: "أُرسل الطلب · بانتظار المراجعة…", simApproval: "✓ محاكاة الموافقة",
      kidTasksIntro: "مهامك. تُظهر كل واحدة من أسندها إليك — ذلك الشخص يوافق عليها ويحوّل النقاط إلى مكافآت.",
      fromWord: "من", doneBtn: "تم!", waitingBadge: "⏳ بالانتظار",
      kidEarned: "مكتسبة", kidRedeemed: "مستبدلة", kidPending: "معلّقة",
      rewardGoal: "هدف المكافأة 🎯", setGoal: "تعيين هدف", pointsOf: "{a} / {b} نقطة",
      goalReached: "🎉 تحقق الهدف!", toGo: "{n} متبقية",
      streakLine: "تتابع {n} يوم!", keepStreak: "أكمل المهام يوميًا لزيادة تتابعك.",
      achievements: "الإنجازات 🏅", nextBadge: "🔒 الشارة التالية…", yourAccounts: "حساباتك",
      rewardHistory: "سجل مكافآتك.", byWord: "بواسطة",
      bonusGift: "هدية إضافية +5 نقاط · اللطف", redeemedReward: "استبدال 50 نقطة ← مكافأة",
      earnedTaskHist: "اكتسبت {n} نقطة · {title}",
      // goal modal
      setRewardGoal: "🎯 عيّن هدف مكافأتك", goalPrompt: "اختر عدد النقاط التي تريد ادخارها لمكافأتك القادمة.",
      goalPoints: "الهدف (نقاط)", saveGoal: "حفظ الهدف", goalSet: "🎯 تم تعيين الهدف إلى {n} نقطة",
      // QR
      qrTitle: "🔳 رمز QR لـ {name}", qrPrompt: "يمسح الطفل هذا على جهازه لطلب الوصول. أنت توافق على أول دخول.",
      qrExpires: "الحساب {acct} · ينتهي خلال 10 دقائق", doneWord: "تم",
      // invite
      inviteTitle: "＋ دعوة ولي أمر شريك",
      invitePrompt: "ادعُ شريكًا لمشاركة الوصول إلى حسابات أطفالك. سيحصل على نفس أدوات التربية بتسجيل دخول خاص به.",
      partnerEmail: "بريد الشريك", relationship: "صلة القرابة", sendInvite: "إرسال الدعوة",
      relCoParent: "ولي أمر شريك", relGuardian: "وصي", relGrandparent: "جد/جدة",
      inviteSent: "✉️ أُرسلت الدعوة إلى {email}", inviteSentPlain: "✉️ أُرسلت الدعوة",
      // task detail
      assignedToBy: "مُسندة إلى {kid} من {by} ({role}).",
      deadlineWord: "الموعد النهائي", lateRule: "قاعدة التأخير: {decay} · الفئة: {cat} · الحساب {acct}",
      progress: "التقدّم", stepAssigned: "مُسندة", stepKidComplete: "أشار الطفل للإكمال",
      stepApproved: "تمت الموافقة وأُضيفت النقاط", close: "إغلاق",
      // guide
      guideTitle: "🎬 دليل العرض",
      guideIntro: "نص سريع لعرض بنك الأطفال. اضغط ؟ في أي وقت لإعادة الفتح.",
      guide1: "الصفحة الرئيسية ← اختر دورًا (ولي أمر، ولي أمر شريك، طفل، معلّم، مشرف).",
      guide2: "دخول الكبار ← أي بيانات ← المصادقة الثنائية (أي 6 أرقام) ← لوحة التحكم.",
      guide3: "نظرة عامة ← بطاقات ملخصة، لوحة الصدارة، النشاط الأخير.",
      guide4: "المهام ← أنشئ مهمة (نقاط، موعد، خصم تأخير)، أسندها لعدة أطفال.",
      guide5: "الموافقات ← وافق على مهمة أكملها طفل ← تُضاف النقاط.",
      guide6: "الأشخاص ← أرصدة لكل حساب، رمز QR، إهداء نقاط، دعوة ولي أمر شريك.",
      guide7: "الاستبدال ← بدّل العملة، استبدل النقاط كليًا أو جزئيًا بعد مكافأة واقعية.",
      guide8: "المشرف ← تبويب الإشراف: قائمة الإشراف + سجل التدقيق.",
      guide9: "الطفل ← امسح QR ← انتظر الموافقة ← تُظهر المهام من أسندها ← اضغط تم ← التتابع والشارات والهدف.",
      guide10: "جرّب مفاتيح 🌐 اللغة/الاتجاه، و🌙 السمة، و{sym} العملة في الشريط العلوي.",
      // toasts
      signedIn: "✓ تم تسجيل الدخول بأمان", currencySet: "💱 تم ضبط العملة إلى {cur}", currencyCycle: "💱 العملة: {cur}",
      switchedAr: "تم التبديل إلى العربية", switchedEn: "Switched to English",
      codeSent: "📨 تم إرسال رمز جديد (تجريبي)",
      approvedPts: "✓ تمت الموافقة · +{n} نقطة إلى {name}", sentBack: "↩️ أُعيدت إلى الطفل للمحاولة",
      sentForApproval: "✓ أُرسلت للموافقة إلى {name}", loginApprovedToast: "✓ تمت الموافقة على دخول {name}",
      kidWelcome: "✓ تمت الموافقة! أهلًا 🦊",
      // v6 — تبديل الأدوار المتعددة + البحث بالاسم
      activeRole: "الدور النشط", switchRole: "تبديل الدور",
      roleSwitched: "↔️ تم التبديل إلى عرض {role}",
      typeMore: "اكتب 3 أحرف أو أكثر للبحث",
      // v7 — سجل الاستبدال
      redemptionHistory: "سجل الاستبدال 🧾",
      yourRedemptions: "استبدالاتك", allKidRedemptions: "كل استبدالات أطفالك (جميع المُسنِدين)",
      noRedemptions: "لا استبدالات بعد.", redemptionRow: "{n} نقطة ← {money}",
      // v7 — الصورة الإجمالية لولي الأمر
      overallPicture: "الصورة الإجمالية", overallIntro: "كل حساب لكل طفل، عبر جميع المُسنِدين.",
      grandTotal: "الإجمالي الكلي",
      // v7 — الطفل يمسح رمز أي مُسنِد
      scanNewQr: "📷 امسح رمز QR لمُسنِد جديد", scanNewTitle: "📷 امسح رمز QR لمُسنِد جديد",
      scanNewPrompt: "اختر مُسنِدًا لمحاكاة مسح رمزه. سنفتح لك حسابًا بنكيًا جديدًا.",
      pickAssigner: "اختر المُسنِد", createAccountBtn: "فتح حساب",
      scanInstruction: "وجّه الكاميرا نحو رمز QR الخاص بالمُسنِد لمسحه.",
      simulateScanBtn: "📷 محاكاة المسح", scannedReveal: "✅ تم المسح — الرمز يخص:",
      accountCreated: "🎉 فُتح حساب جديد {acct} مع {assigner}",
      allLinked: "أنت مرتبط بالفعل بكل المُسنِدين.",
      // v8-1 — تأكيد الاستبدال بخطوتين
      redeemInitiated: "✓ بدأ الاستبدال · بانتظار تأكيد {name}",
      statusPendingRedeem: "بانتظار تأكيد الاستبدال",
      statusRedeemed: "تم الاستبدال", statusDeclined: "مرفوض",
      pendingRedeemTitle: "استبدالات بانتظار التأكيد 🪙",
      pendingRedeemIntro: "بدأ أحد الكبار هذه الاستبدالات. أكِّد لتحصل على مكافأتك الواقعية، أو ارفض للاحتفاظ بنقاطك.",
      pendingRedeemRow: "{n} نقطة ← {money}", pendingRedeemBy: "بدأها {by}",
      confirmRedeemBtn: "تأكيد الاستبدال", declineRedeemBtn: "رفض",
      redeemConfirmedToast: "🎉 تم تأكيد الاستبدال · {money}",
      redeemDeclinedToast: "↩️ رُفض الاستبدال · أُعيدت {n} نقطة",
      parentRedeemLog: "سجل نشاط الاستبدال 📋",
      parentRedeemLogIntro: "كل حدث استبدال لأطفالك — من بدأه ومتى وحالته.",
      redeemEventInitiated: "بدأ الاستبدال · {n} نقطة ({money}) لـ {kid} بواسطة {by}",
      redeemEventCompleted: "تأكّد الاستبدال · {n} نقطة ({money}) لـ {kid} بواسطة {by}",
      redeemEventDeclined: "رُفض الاستبدال · {n} نقطة لـ {kid}",
      notifRedeemInitiated: "بدأ {by} استبدال {n} نقطة لـ {kid} — بانتظار تأكيد الطفل.",
      notifRedeemCompleted: "أكّد {kid} استبدال {n} نقطة ({money}).",
      notifRedeemDeclined: "رفض {kid} استبدال {n} نقطة — أُعيدت النقاط.",
      // v8-2 — اختيار الدور قبل تسجيل الدخول
      preLoginTitle: "هل لديك أكثر من دور؟",
      preLoginIntro: "اختر الدور الذي تسجّل الدخول به. يمكنك تبديل الأدوار داخل التطبيق أيضًا.",
      preLoginSignInAs: "تسجيل الدخول كـ {role}", justNowWord: "الآن"
    }
  };
  const t = (k, p) => {
    let s = (I[state.lang] && I[state.lang][k]) || I.en[k] || k;
    if (p) for (const key in p) s = s.split("{" + key + "}").join(p[key]);
    return s;
  };

  const app = () => document.getElementById("app");

  // ---- Helpers ----
  function esc(s) { return String(s).replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;" }[c])); }
  function money(points) {
    const c = KB.currencies[state.currency];
    return c.symbol + ((points / 10) * c.ratePer10).toFixed(2);
  }
  function assignerById(id) { return KB.assigners[id]; }
  function scope() { return KB.roleScope[state.role] || KB.roleScope.Parent; }
  function scopeLabel() {
    const map = { "Your Kids": "scopeYourKids", "Your Students": "scopeYourStudents", "Assigned Students": "scopeAssignedStudents" };
    return t(map[scope().label] || "scopeYourKids");
  }
  function roleLabel(role) {
    const map = { Parent: "roleParent", "Co-Parent": "roleCoParent", Kid: "roleKid", Teacher: "roleTeacher", Moderator: "roleModerator" };
    return t(map[role] || role);
  }
  function statusLabel(status) {
    const map = { assigned: "stAssigned", pending_approval: "stPending", completed: "stCompleted" };
    return t(map[status] || status.replace(/_/g, " "));
  }
  function kidsForRole() { return scope().kids.map(id => KB.kids[id]).filter(Boolean); }
  function myAssignerId() { return scope().assignerId; }

  function kidTotalsForAssigner(kid, assignerId) {
    const a = kid.accounts[assignerId];
    return a ? a : { earned: 0, redeemed: 0, pending: 0, acctNo: "—" };
  }
  function kidGrandTotals(kid) {
    return Object.values(kid.accounts).reduce((s, a) => ({
      earned: s.earned + a.earned, redeemed: s.redeemed + a.redeemed, pending: s.pending + a.pending
    }), { earned: 0, redeemed: 0, pending: 0 });
  }
  function tasksForAssigner(assignerId) { return KB.tasks.filter(tk => tk.assignerId === assignerId); }
  function tasksForKid(kidId) { return KB.tasks.filter(tk => tk.kidId === kidId); }
  function pendingApprovalsForAssigner(assignerId) {
    return KB.tasks.filter(tk => tk.assignerId === assignerId && tk.status === "pending_approval");
  }
  function notifsFor(assignerId) { return KB.notifications.filter(n => n.to === assignerId); }
  function redemptionsForAssigner(assignerId) { return KB.redemptions.filter(r => r.assignerId === assignerId); }
  function redemptionsForKids(kidIds) { return KB.redemptions.filter(r => kidIds.includes(r.kidId)); }
  // v8-1 — two-step redemption helpers
  function parentForKid(kidId) {
    const kid = KB.kids[kidId];
    if (kid) {
      const pid = Object.keys(kid.accounts).find(id => (assignerById(id) || {}).role === "Parent");
      if (pid) return pid;
    }
    return "a_parent";
  }
  function pendingRedemptionsForKid(kidId) {
    return KB.redemptions.filter(r => r.kidId === kidId && r.status === "pending_confirmation");
  }
  function redemptionStatusBadge(status) {
    if (status === "pending_confirmation") return `<span class="badge status-pending_approval">${esc(t("statusPendingRedeem"))}</span>`;
    if (status === "declined") return `<span class="badge status-pending_approval">${esc(t("statusDeclined"))}</span>`;
    return `<span class="badge status-completed">${esc(t("statusRedeemed"))}</span>`;
  }
  function logRedemptionEvent(rec, event) {
    KB.redemptionLog.unshift({
      id: "rl" + Date.now(), redemptionId: rec.id, kidId: rec.kidId, assignerId: rec.assignerId,
      parentId: parentForKid(rec.kidId), amount: rec.amount, money: rec.money, cur: rec.cur,
      event, ts: nowStamp()
    });
  }
  function notifyParentRedemption(rec, event) {
    const parentId = parentForKid(rec.kidId);
    const kidName = (KB.kids[rec.kidId] || {}).name || rec.kidId;
    const byName = (assignerById(rec.assignerId) || {}).name || rec.assignerId;
    const key = event === "completed" ? "notifRedeemCompleted" : event === "declined" ? "notifRedeemDeclined" : "notifRedeemInitiated";
    KB.notifications.unshift({
      id: "n" + Date.now(), to: parentId, type: "gift", unread: true, time: t("justNowWord"),
      text: t(key, { by: byName, n: rec.amount, kid: kidName, money: rec.money })
    });
  }
  function redemptionEventLogForParent(assignerId) {
    return KB.redemptionLog.filter(l => l.parentId === assignerId);
  }
  function newAcctNo(assignerId) {
    const role = (assignerById(assignerId) || {}).role;
    const prefix = { Parent: "PR", "Co-Parent": "CP", Teacher: "TC", Moderator: "MD" }[role] || "AC";
    return prefix + "-" + Math.floor(1000 + Math.random() * 9000);
  }
  function nowStamp() { return new Date().toISOString().slice(0, 16).replace("T", " "); }

  // ---- UI utilities ----
  let toastTimer;
  function showToast(msg) {
    let wrap = document.querySelector(".toast-wrap");
    if (!wrap) { wrap = document.createElement("div"); wrap.className = "toast-wrap"; document.body.appendChild(wrap); }
    const el = document.createElement("div");
    el.className = "toast"; el.setAttribute("role", "status"); el.textContent = msg;
    wrap.appendChild(el);
    setTimeout(() => el.remove(), 2600);
  }
  function openModal(html) {
    closeModal();
    const back = document.createElement("div");
    back.className = "modal-backdrop"; back.id = "modal";
    back.innerHTML = `<div class="modal" role="dialog" aria-modal="true">${html}</div>`;
    back.addEventListener("click", e => { if (e.target === back) closeModal(); });
    document.body.appendChild(back);
    const f = back.querySelector("input,select,button,textarea"); if (f) f.focus();
  }
  function closeModal() { const m = document.getElementById("modal"); if (m) m.remove(); }

  // ---- QR generator (deterministic pseudo-QR SVG) ----
  function qrSvg(seed) {
    const N = 25, cell = 8;
    let h = 0; for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
    function rnd() { h = (h * 1103515245 + 12345) & 0x7fffffff; return h / 0x7fffffff; }
    const finder = (gx, gy, g) => {
      for (let y = 0; y < 7; y++) for (let x = 0; x < 7; x++) {
        const edge = x === 0 || y === 0 || x === 6 || y === 6;
        const core = x >= 2 && x <= 4 && y >= 2 && y <= 4;
        g[gy + y][gx + x] = edge || core ? 1 : 0;
      }
    };
    const grid = Array.from({ length: N }, () => Array(N).fill(0));
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) grid[y][x] = rnd() > 0.55 ? 1 : 0;
    finder(0, 0, grid); finder(N - 7, 0, grid); finder(0, N - 7, grid);
    let rects = "";
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (grid[y][x])
      rects += `<rect x="${x*cell}" y="${y*cell}" width="${cell}" height="${cell}"/>`;
    return `<svg viewBox="0 0 ${N*cell} ${N*cell}" role="img" aria-label="QR code">
      <rect width="100%" height="100%" fill="#fff"/><g fill="#101225">${rects}</g></svg>`;
  }

  // ---- Shared components ----
  function topbar(title, opts = {}) {
    const a = assignerById(myAssignerId());
    const unread = state.role !== "Kid" ? notifsFor(myAssignerId()).filter(n => n.unread).length : 0;
    return `<header class="topbar">
      <div class="brand"><span class="logo">💰</span><span>${esc(t("appName"))}</span></div>
      <h1>${esc(title)}</h1>
      ${(state.view === "dashboard" && state.role !== "Kid" && state.roles && state.roles.length > 1) ? `<div class="role-switch" role="group" aria-label="${esc(t("switchRole"))}" title="${esc(t("switchRole"))}">${state.roles.map(r => `<button class="role-switch-btn ${state.role===r?"active":""}" data-action="switchRole" data-role="${r}" aria-pressed="${state.role===r}">${esc(roleLabel(r))}</button>`).join("")}</div>` : ""}
      ${state.role && state.role !== "Kid" ? `<button class="iconbtn" data-action="setTab" data-tab="notifications" aria-label="Notifications">🔔${unread ? `<span class="badge-dot">${unread}</span>` : ""}</button>` : ""}
      ${state.role && state.role !== "Kid" ? `<button class="iconbtn" data-action="cycleCurrency" aria-label="Switch currency (current: ${state.currency})" title="Currency">${KB.currencies[state.currency].symbol}</button>` : ""}
      <button class="iconbtn" data-action="toggleLang" aria-label="Toggle language (English/Arabic)" title="Language / اللغة">🌐</button>
      <button class="iconbtn" data-action="toggleTheme" aria-label="Toggle dark mode" title="Theme">${state.theme === "dark" ? "☀️" : "🌙"}</button>
      <button class="iconbtn" data-action="showGuide" aria-label="Open demo guide" title="Demo guide (press ?)">❔</button>
      ${opts.exit ? `<button class="iconbtn" data-action="go" data-view="landing" aria-label="Exit to start">⏏️</button>` : ""}
    </header>`;
  }

  function statCard(ico, num, label, bg) {
    return `<div class="card stat">
      <div class="stat-ico" style="background:${bg}">${ico}</div>
      <div class="stat-num">${num}</div><div class="stat-label">${esc(label)}</div></div>`;
  }

  function roleBadge(a) {
    return `<span class="badge role" style="background:${a.color}">${a.avatar} ${esc(roleLabel(a.role))}</span>`;
  }

  function taskRow(tk, opts = {}) {
    const a = assignerById(tk.assignerId);
    const kid = KB.kids[tk.kidId];
    return `<div class="row">
      <div class="avatar" aria-hidden="true">${tk.category === "School" ? "📚" : tk.category === "Home" ? "🏠" : tk.category === "Learning" ? "🧠" : "⭐"}</div>
      <div class="grow">
        <div class="title">${esc(tk.title)}</div>
        <div class="sub">${opts.showKid ? esc(kid ? kid.name : "") + " · " : ""}${esc(t("due"))} ${esc(tk.deadline.split(" ")[1])} · ${esc(tk.decay)}</div>
        <div class="btn-row" style="margin-top:8px">
          <span class="badge points">⭐ ${tk.points} pts</span>
          ${roleBadge(a)}
          <span class="badge status-${tk.status}">${esc(statusLabel(tk.status))}</span>
        </div>
      </div>
      <button class="iconbtn" data-action="taskDetail" data-id="${tk.id}" aria-label="Task details for ${esc(tk.title)}" title="Details">ⓘ</button>
      ${opts.actions || ""}
    </div>`;
  }

  // ========================================================
  //  VIEWS
  // ========================================================
  function multiRoleChoices() {
    // Roles that belong to any multi-role identity (e.g. the Parent+Teacher demo identity).
    const set = [];
    Object.keys(KB.roleGroups || {}).forEach(k => {
      const g = KB.roleGroups[k];
      if (g && g.length > 1) g.forEach(r => { if (!set.includes(r)) set.push(r); });
    });
    return set;
  }
  function viewLanding() {
    const roles = [
      { r: "Parent", e: "👩", d: t("roleParentDesc") },
      { r: "Co-Parent", e: "👨", d: t("roleCoParentDesc") },
      { r: "Kid", e: "🦊", d: t("roleKidDesc") },
      { r: "Teacher", e: "🧑‍🏫", d: t("roleTeacherDesc") },
      { r: "Moderator", e: "🛡️", d: t("roleModeratorDesc") }
    ];
    const multi = multiRoleChoices();
    return `<div class="app">
      ${topbar("")}
      <main class="main landing" id="main">
        <div class="hero-logo" aria-hidden="true">💰</div>
        <h1>${esc(t("appName"))}</h1>
        <p class="lede">${esc(t("tagline"))} ${esc(t("taglineSuffix"))}</p>
        <h2 style="font-size:1rem">${esc(t("chooseRole"))}</h2>
        <div class="role-grid" role="list">
          ${roles.map(x => `<button class="role-card" role="listitem" data-action="selectRole" data-role="${x.r}">
            <span class="role-emoji" aria-hidden="true">${x.e}</span>
            <span class="role-name">${esc(roleLabel(x.r))}</span>
            <span class="role-desc">${esc(x.d)}</span></button>`).join("")}
        </div>
        ${multi.length > 1 ? `<div class="card mt" id="preLoginRolePanel" style="text-align:start">
          <strong>${esc(t("preLoginTitle"))}</strong>
          <p class="muted" style="margin:6px 0;font-size:.84rem">${esc(t("preLoginIntro"))}</p>
          <div class="role-switch" role="group" aria-label="${esc(t("preLoginTitle"))}">
            ${multi.map(r => `<button class="role-switch-btn" data-action="preLoginChoose" data-role="${r}">${esc(t("preLoginSignInAs", { role: roleLabel(r) }))}</button>`).join("")}
          </div></div>` : ""}
        <p class="auth-note mt">${esc(t("demoNote"))}</p>
      </main>
    </div>`;
  }

  function viewLogin() {
    return `<div class="app">
      ${topbar(t("signIn"), { exit: true })}
      <main class="main" id="main">
        <div class="auth-wrap">
          <h2>${esc(t("welcome", { role: roleLabel(state.role) }))}</h2>
          <p class="muted">${esc(t("signInPrompt"))}</p>
          <form data-action="submitLogin" class="mt">
            <div class="field"><label for="email">${esc(t("email"))}</label>
              <input id="email" type="email" value="demo@kidsbank.app" autocomplete="username" required></div>
            <div class="field"><label for="pw">${esc(t("password"))}</label>
              <input id="pw" type="password" value="demo1234" autocomplete="current-password" required></div>
            <button class="btn primary block" type="submit">${esc(t("continueBtn"))}</button>
          </form>
          <p class="auth-note">${esc(t("mfaProtected"))}</p>
        </div>
      </main>
    </div>`;
  }

  function viewMfa() {
    return `<div class="app">
      ${topbar(t("verify"), { exit: true })}
      <main class="main" id="main">
        <div class="auth-wrap center">
          <div class="hero-logo" aria-hidden="true" style="background:linear-gradient(135deg,var(--info),var(--primary))">🔐</div>
          <h2>${esc(t("twoFactor"))}</h2>
          <p class="muted">${esc(t("mfaPrompt"))} <strong>${esc(t("mfaDemo"))}</strong></p>
          <form data-action="submitMfa">
            <div class="mfa-inputs" role="group" aria-label="6 digit code">
              ${[0,1,2,3,4,5].map(i => `<input class="mfa-cell" inputmode="numeric" maxlength="1" aria-label="Digit ${i+1}" data-i="${i}">`).join("")}
            </div>
            <button class="btn primary block" type="submit">${esc(t("verifyEnter"))}</button>
          </form>
          <p class="auth-note">${esc(t("noCode"))} <a href="#" data-action="noop">${esc(t("resend"))}</a></p>
        </div>
      </main>
    </div>`;
  }

  // ----- Adult dashboard shell -----
  function adultTabs() {
    const isMod = state.role === "Moderator";
    const tabs = [
      { id: "overview", ico: "📊", label: t("overview") },
      { id: "tasks", ico: "✅", label: t("tasks") },
      { id: "approvals", ico: "📝", label: t("approvals") },
      { id: "people", ico: "👨‍👩‍👧", label: scopeLabel() },
      { id: "redeem", ico: "💱", label: t("redeem") }
    ];
    if (isMod) tabs.push({ id: "oversight", ico: "🛡️", label: t("oversight") });
    tabs.push({ id: "settings", ico: "⚙️", label: t("settings") });
    return tabs;
  }

  function viewDashboard() {
    const tabs = adultTabs();
    const content = renderDashTab();
    // mobile tab bar uses first 5 most-used; web uses sidebar with all
    const mobileTabs = tabs.filter(x => ["overview","tasks","approvals","people","redeem"].includes(x.id));
    return `<div class="web-layout-wrap">
      <div class="app web">
        ${topbar(tabLabel(state.dashTab), { exit: true })}
        <div class="web-layout">
          <nav class="sidebar" aria-label="Dashboard sections">
            <div style="padding:6px 14px 12px;font-weight:800">${assignerById(myAssignerId()).avatar} ${esc(assignerById(myAssignerId()).name)}<div class="muted" style="font-size:.75rem;font-weight:400">${esc(roleLabel(state.role))}</div></div>
            ${tabs.map(x => `<button class="nav-item ${state.dashTab===x.id?"active":""}" data-action="setTab" data-tab="${x.id}">
              <span aria-hidden="true">${x.ico}</span> ${esc(x.label)}</button>`).join("")}
            <div style="flex:1"></div>
            <button class="nav-item" data-action="go" data-view="landing"><span aria-hidden="true">⏏️</span> ${esc(t("signOut"))}</button>
          </nav>
          <main class="main" id="main">${content}</main>
        </div>
        <nav class="tabbar" aria-label="Quick navigation">
          ${mobileTabs.map(x => `<button class="tab ${state.dashTab===x.id?"active":""}" data-action="setTab" data-tab="${x.id}" aria-current="${state.dashTab===x.id?"page":"false"}">
            <span class="tico" aria-hidden="true">${x.ico}</span>${esc(x.label)}</button>`).join("")}
        </nav>
      </div>
    </div>`;
  }

  function tabLabel(id) {
    const map = { overview:t("overview"), tasks:t("tasks"), approvals:t("approvals"), people:scopeLabel(), redeem:t("redeem"), oversight:t("oversight"), settings:t("settings"), notifications:t("notifications") };
    return map[id] || id;
  }

  function renderDashTab() {
    switch (state.dashTab) {
      case "overview": return dashOverview();
      case "tasks": return dashTasks();
      case "approvals": return dashApprovals();
      case "people": return dashPeople();
      case "redeem": return dashRedeem();
      case "oversight": return dashOversight();
      case "notifications": return dashNotifications();
      case "settings": return dashSettings();
      default: return dashOverview();
    }
  }

  function dashOverview() {
    const aid = myAssignerId();
    const myTasks = tasksForAssigner(aid);
    const totalEarned = kidsForRole().reduce((s, k) => s + kidTotalsForAssigner(k, aid).earned, 0);
    const totalRedeemed = kidsForRole().reduce((s, k) => s + kidTotalsForAssigner(k, aid).redeemed, 0);
    const pending = pendingApprovalsForAssigner(aid).length;
    const tip = state.showTip ? `<div class="tip" role="note"><span>${esc(t("tipWelcome"))}</span><button data-action="dismissTip">${esc(t("gotIt"))}</button></div>` : "";
    return `${tip}
      <div class="cards">
        ${statCard("✅", myTasks.length, t("totalTasks"), "rgba(108,92,231,.14)")}
        ${statCard("⭐", totalEarned, t("pointsEarnedLabel"), "rgba(0,184,148,.16)")}
        ${statCard("💱", totalRedeemed, t("pointsRedeemedLabel"), "rgba(9,132,227,.14)")}
        ${statCard("📝", pending, t("pendingApprovals"), "rgba(225,112,85,.16)")}
      </div>
      <div class="section-title"><span>${esc(scopeLabel())}</span><button class="btn sm" data-action="setTab" data-tab="people">${esc(t("viewAll"))}</button></div>
      <div class="list">
        ${kidsForRole().map(k => { const tot = kidTotalsForAssigner(k, aid); return `<div class="row">
          <div class="avatar">${k.emoji}</div>
          <div class="grow"><div class="title">${esc(k.name)}</div>
            <div class="sub">${esc(k.grade)} · ${esc(t("acct"))} ${esc(tot.acctNo)}</div></div>
          <div class="center"><div class="badge points">⭐ ${tot.earned}</div><div class="muted" style="font-size:.72rem;margin-top:4px">${money(tot.earned)}</div></div>
        </div>`; }).join("")}
      </div>
      <div class="section-title"><span>${esc(t("leaderboard"))}</span><span class="muted" style="font-size:.78rem">${esc(t("byPointsLabel"))}</span></div>
      <div class="list">
        ${kidsForRole().map(k => ({ k, pts: kidTotalsForAssigner(k, aid).earned }))
          .sort((a,b) => b.pts - a.pts)
          .map((row, i) => `<div class="row" style="padding:11px">
            <div class="avatar" style="width:36px;height:36px;font-size:1.05rem">${["🥇","🥈","🥉"][i] || (i+1)+"."}</div>
            <div class="grow"><div class="title" style="font-size:.92rem">${esc(row.k.name)}</div>
              <div class="sub">🔥 ${esc(t("dayStreak", { n: row.k.streak || 0 }))}</div></div>
            <span class="badge points">⭐ ${row.pts}</span></div>`).join("")}
      </div>
      <div class="section-title"><span>${esc(t("recentLabel", { x: t("tasks") }))}</span><button class="btn sm primary" data-action="setTab" data-tab="tasks">${esc(t("newTask"))}</button></div>
      <div class="list">${myTasks.slice(0,3).map(tk => taskRow(tk, { showKid: true })).join("")}</div>
      <div class="section-title"><span>${esc(t("recentActivity"))}</span></div>
      <div class="list">
        ${KB.auditLog.slice(0,4).map(l => `<div class="row" style="padding:11px">
          <div class="avatar" style="width:36px;height:36px;font-size:1.05rem">${l.risk==="review"?"⚠️":"📜"}</div>
          <div class="grow"><div class="title" style="font-size:.9rem">${esc(l.action)}</div>
            <div class="sub">${esc(l.actor)} · ${esc(l.target)} · ${esc(l.time)}</div></div>
        </div>`).join("")}
      </div>`;
  }

  function dashTasks() {
    const aid = myAssignerId();
    const myTasks = tasksForAssigner(aid);
    return `<div class="btn-row" style="justify-content:space-between;margin-bottom:12px">
        <strong>${esc(t("tasksCount", { n: myTasks.length, tasks: t("tasks") }))}</strong>
        <button class="btn primary sm" data-action="openCreateTask">${esc(t("createTask"))}</button>
      </div>
      <div class="filterbar">
        <input class="field search" id="taskSearch" placeholder="${esc(t("searchTasks"))}" aria-label="Search tasks" oninput="window.__kbFilter()">
        <button class="chip" data-action="filterStatus" data-fs="all" aria-pressed="true">${esc(t("fAll"))}</button>
        <button class="chip" data-action="filterStatus" data-fs="assigned" aria-pressed="false">${esc(t("fAssigned"))}</button>
        <button class="chip" data-action="filterStatus" data-fs="pending_approval" aria-pressed="false">${esc(t("fPending"))}</button>
        <button class="chip" data-action="filterStatus" data-fs="completed" aria-pressed="false">${esc(t("fDone"))}</button>
      </div>
      <div class="list" id="taskList">
        ${myTasks.length ? myTasks.map(tk => taskRow(tk, { showKid: true,
          actions: `<button class="btn sm" data-action="giftFromTask" data-kid="${tk.kidId}" aria-label="Gift bonus points to ${esc(KB.kids[tk.kidId].name)}">🎁</button>` })).join("")
          : `<div class="empty"><span class="emoji">🗒️</span>${esc(t("noTasks"))}</div>`}
      </div>`;
  }

  function dashApprovals() {
    const aid = myAssignerId();
    const pend = pendingApprovalsForAssigner(aid);
    if (!pend.length) return `<div class="empty"><span class="emoji">🎉</span>${esc(t("allCaught"))}</div>`;
    return `<p class="muted">${esc(t("approvalsIntro"))}</p>
      <div class="list">
        ${pend.map(tk => taskRow(tk, { showKid: true, actions: `<div style="display:flex;flex-direction:column;gap:6px">
          <button class="btn accent sm" data-action="approveTask" data-id="${tk.id}">${esc(t("approveBtn"))}</button>
          <button class="btn warn sm" data-action="rejectTask" data-id="${tk.id}">${esc(t("rejectBtn"))}</button></div>` })).join("")}
      </div>`;
  }

  function dashPeople() {
    const aid = myAssignerId();
    const canInvite = state.role === "Parent" || state.role === "Co-Parent";
    return `<div class="btn-row" style="justify-content:space-between;align-items:center;margin-bottom:10px">
        <p class="muted" style="margin:0">${esc(t("peopleManage", { label: scopeLabel() }))}</p>
        ${canInvite ? `<button class="btn primary sm" data-action="inviteCoParent">${esc(t("inviteCoParent"))}</button>` : ""}
      </div>
      ${parentOverview()}
      <div class="filterbar" style="flex-wrap:wrap">
        <input class="field search" id="peopleSearch" placeholder="${esc(t("searchPeople", { label: scopeLabel() }))}" aria-label="Search people" oninput="window.__kbPeopleFilter()">
        <div class="hint" id="peopleHint" style="display:none;width:100%">${esc(t("typeMore"))}</div>
      </div>
      <div class="list" id="peopleList">
        ${kidsForRole().map(k => {
          const mine = kidTotalsForAssigner(k, aid);
          const accts = Object.entries(k.accounts).map(([id, a]) => {
            const asg = assignerById(id);
            return `<div class="acct"><span style="font-size:1.2rem">${asg.avatar}</span>
              <div class="grow"><div style="font-weight:600;font-size:.85rem">${esc(asg.name)} <span class="muted">(${esc(roleLabel(asg.role))})</span></div>
              <div class="acct-no">${esc(t("acct"))} ${esc(a.acctNo)} · ⭐ ${a.earned} ${esc(t("earnedWord"))} · ${a.pending} ${esc(t("pendingWord"))}</div></div>
              <div class="badge points">${money(a.earned)}</div></div>`;
          }).join("");
          return `<div class="card" data-search="${esc((k.name + " " + (k.nameAr || "")).toLowerCase())}">
            <div class="row" style="border:none;padding:0">
              <div class="avatar">${k.emoji}</div>
              <div class="grow"><div class="title">${esc(k.name)}</div><div class="sub">${esc(k.grade)} ${k.loginApproved ? "" : "· " + esc(t("loginPending"))}</div></div>
              <button class="iconbtn" data-action="showQR" data-kid="${k.id}" aria-label="Generate QR for ${esc(k.name)}">🔳</button>
            </div>
            <div class="kid-stats" role="group" aria-label="${esc(k.name)} totals">
              <div class="kid-stat"><div class="kid-stat-num">⭐ ${mine.earned}</div><div class="kid-stat-label">${esc(t("statEarned"))}</div></div>
              <div class="kid-stat"><div class="kid-stat-num">⏳ ${mine.pending}</div><div class="kid-stat-label">${esc(t("statPending"))}</div></div>
              <div class="kid-stat"><div class="kid-stat-num">${money(mine.earned)}</div><div class="kid-stat-label">${esc(t("statValue"))}</div></div>
            </div>
            <div class="muted" style="font-size:.75rem;margin:2px 2px 6px">${esc(t("ifRedeemed", { money: money(mine.earned) }))}</div>
            <div class="acct-grid">${accts}</div>
            <div class="btn-row mt">
              <button class="btn sm" data-action="giftFromTask" data-kid="${k.id}">${esc(t("giftPointsBtn"))}</button>
              <button class="btn sm" data-action="showQR" data-kid="${k.id}">${esc(t("qrCodeBtn"))}</button>
              ${!k.loginApproved ? `<button class="btn accent sm" data-action="approveKidLogin" data-kid="${k.id}">${esc(t("approveLoginBtn"))}</button>` : ""}
            </div>
          </div>`;
        }).join("")}
      </div>`;
  }

  function parentOverview() {
    if (state.role !== "Parent") return "";
    const kids = kidsForRole();
    return `<div class="section-title" id="parentOverview"><span>${esc(t("overallPicture"))}</span></div>
      <p class="muted" style="margin:0 0 8px">${esc(t("overallIntro"))}</p>
      <div class="list">${kids.map(k => {
        const gt = kidGrandTotals(k);
        const rows = Object.entries(k.accounts).map(([id, a]) => {
          const asg = assignerById(id);
          return `<div class="acct"><span style="font-size:1.15rem">${asg.avatar}</span>
            <div class="grow"><div style="font-weight:600;font-size:.84rem">${esc(asg.name)} <span class="muted">(${esc(roleLabel(asg.role))})</span></div>
            <div class="acct-no">${esc(t("acct"))} ${esc(a.acctNo)} · ⭐ ${a.earned} ${esc(t("earnedWord"))} · ⏳ ${a.pending} ${esc(t("pendingWord"))} · 💱 ${a.redeemed} ${esc(t("redeemedWord"))} · ${money(a.earned)}</div></div></div>`;
        }).join("");
        return `<div class="card overview-card">
          <div class="row" style="border:none;padding:0"><div class="avatar">${k.emoji}</div>
            <div class="grow"><div class="title">${esc(k.name)}</div><div class="sub">${esc(k.grade)}</div></div></div>
          <div class="acct-grid">${rows}</div>
          <div class="kid-stats" role="group" aria-label="${esc(k.name)} ${esc(t("grandTotal"))}">
            <div class="kid-stat"><div class="kid-stat-num">⭐ ${gt.earned}</div><div class="kid-stat-label">${esc(t("statEarned"))}</div></div>
            <div class="kid-stat"><div class="kid-stat-num">⏳ ${gt.pending}</div><div class="kid-stat-label">${esc(t("statPending"))}</div></div>
            <div class="kid-stat"><div class="kid-stat-num">💱 ${gt.redeemed}</div><div class="kid-stat-label">${esc(t("redeemedWord"))}</div></div>
            <div class="kid-stat"><div class="kid-stat-num">${money(gt.earned)}</div><div class="kid-stat-label">${esc(t("statValue"))}</div></div>
          </div>
          <div class="muted" style="font-size:.78rem;margin-top:6px">${esc(t("grandTotal"))}: ⭐ ${gt.earned} · ${money(gt.earned)}</div>
        </div>`;
      }).join("")}</div>`;
  }

  function dashRedeem() {
    const aid = myAssignerId();
    const c = KB.currencies[state.currency];
    return `<div class="card">
        <strong>${esc(t("conversionRate"))}</strong>
        <p class="muted" style="margin:6px 0">${esc(t("rateLine", { sym: c.symbol, rate: c.ratePer10, cur: state.currency }))}</p>
        <div class="btn-row">
          ${Object.keys(KB.currencies).map(code => `<button class="chip" data-action="setCurrency" data-cur="${code}" aria-pressed="${state.currency===code}">${code} ${KB.currencies[code].symbol}</button>`).join("")}
        </div>
      </div>
      <p class="muted mt">${esc(t("redeemIntro"))}</p>
      <div class="list">
        ${kidsForRole().map(k => { const a = kidTotalsForAssigner(k, aid); return `<div class="card">
          <div class="row" style="border:none;padding:0">
            <div class="avatar">${k.emoji}</div>
            <div class="grow"><div class="title">${esc(k.name)}</div>
              <div class="sub">${esc(t("acct"))} ${esc(a.acctNo)} · ⭐ ${a.earned} ${esc(t("earnedWord"))} · ${a.redeemed} ${esc(t("redeemedWord"))}</div></div>
          </div>
          <div class="row mt" style="background:var(--surface-2)">
            <div class="grow"><div class="title">${money(a.earned)} ${esc(t("availableWord"))}</div>
              <div class="sub">${esc(t("ptsCurrentRate", { n: a.earned }))}</div></div>
            <button class="btn primary sm" data-action="redeem" data-kid="${k.id}" ${a.earned<=0?"disabled":""}>${esc(t("redeemBtn"))}</button>
          </div>
        </div>`; }).join("")}
      </div>
      ${redemptionHistorySection()}`;
  }

  function renderRedemptionList(list) {
    if (!list.length) return `<div class="empty"><span class="emoji">🧾</span>${esc(t("noRedemptions"))}</div>`;
    return `<div class="list">${list.map(r => {
      const kid = KB.kids[r.kidId]; const asg = assignerById(r.assignerId);
      return `<div class="row redemption-row" data-kid="${esc(r.kidId)}">
        <div class="avatar">${kid ? kid.emoji : "🧾"}</div>
        <div class="grow"><div class="title">${esc(kid ? kid.name : r.kidId)} · ${esc(t("redemptionRow", { n: r.amount, money: r.money }))}</div>
          <div class="sub">${esc(t("byWord"))} ${esc(asg ? asg.name : r.assignerId)} · ${esc(t("acct"))} ${esc(r.acctNo)} · ${esc(r.ts)}</div></div>
        ${redemptionStatusBadge(r.status || "redeemed")}
      </div>`;
    }).join("")}</div>`;
  }

  function redemptionEventLogSection() {
    const log = redemptionEventLogForParent(myAssignerId());
    let html = `<div class="section-title" id="redemptionEventLog"><span>${esc(t("parentRedeemLog"))}</span></div>`;
    html += `<div class="muted" style="font-size:.8rem;margin:2px 2px 6px">${esc(t("parentRedeemLogIntro"))}</div>`;
    if (!log.length) return html + `<div class="empty"><span class="emoji">📋</span>${esc(t("noRedemptions"))}</div>`;
    html += `<div class="list">${log.map(l => {
      const kid = KB.kids[l.kidId]; const asg = assignerById(l.assignerId);
      const key = l.event === "completed" ? "redeemEventCompleted" : l.event === "declined" ? "redeemEventDeclined" : "redeemEventInitiated";
      const ico = l.event === "completed" ? "✅" : l.event === "declined" ? "↩️" : "🪙";
      return `<div class="row redemption-log-row" data-event="${esc(l.event)}">
        <div class="avatar">${ico}</div>
        <div class="grow"><div class="title">${esc(t(key, { n: l.amount, money: l.money, kid: kid ? kid.name : l.kidId, by: asg ? asg.name : l.assignerId }))}</div>
          <div class="sub">${esc(l.ts)}</div></div>
        ${redemptionStatusBadge(l.event === "completed" ? "redeemed" : l.event === "declined" ? "declined" : "pending_confirmation")}
      </div>`;
    }).join("")}</div>`;
    return html;
  }

  function redemptionHistorySection() {
    const aid = myAssignerId();
    let html = `<div class="section-title" id="redemptionHistory"><span>${esc(t("redemptionHistory"))}</span></div>`;
    html += `<div class="muted" style="font-size:.8rem;margin:2px 2px 6px">${esc(t("yourRedemptions"))}</div>`;
    html += renderRedemptionList(redemptionsForAssigner(aid));
    if (state.role === "Parent") {
      html += `<div class="muted" id="allKidRedemptions" style="font-size:.8rem;margin:12px 2px 6px">${esc(t("allKidRedemptions"))}</div>`;
      html += renderRedemptionList(redemptionsForKids(scope().kids));
      html += redemptionEventLogSection();
    }
    return html;
  }

  function dashOversight() {
    return `<p class="muted">${esc(t("oversightIntro"))}</p>
      <div class="section-title">${esc(t("moderationQueue"))}</div>
      <div class="list">
        ${KB.moderationQueue.map(m => `<div class="row">
          <div class="avatar">${m.status==="pending"?"⏳":"🔍"}</div>
          <div class="grow"><div class="title">${esc(m.title)}</div><div class="sub">${esc(m.detail)}</div></div>
          <div style="display:flex;flex-direction:column;gap:6px">
            <button class="btn accent sm" data-action="moderate" data-id="${m.id}" data-ok="1">${esc(t("approveWord"))}</button>
            <button class="btn warn sm" data-action="moderate" data-id="${m.id}" data-ok="0">${esc(t("blockWord"))}</button></div>
        </div>`).join("")}
      </div>
      <div class="section-title">${esc(t("auditLog"))}</div>
      <div class="list">
        ${KB.auditLog.map(l => `<div class="row">
          <div class="avatar">${l.risk==="review"?"⚠️":"📜"}</div>
          <div class="grow"><div class="title">${esc(l.action)}</div>
            <div class="sub">${esc(l.actor)} · ${esc(l.target)} · ${esc(l.time)}</div></div>
          <span class="badge ${l.risk==="review"?"status-pending_approval":"status-completed"}">${esc(l.risk)}</span>
        </div>`).join("")}
      </div>`;
  }

  function dashNotifications() {
    const list = notifsFor(myAssignerId());
    if (!list.length) return `<div class="empty"><span class="emoji">🔕</span>${esc(t("noNotifs"))}</div>`;
    return `<div class="btn-row" style="justify-content:space-between;margin-bottom:10px">
        <strong>${esc(t("notifications"))}</strong>
        <button class="btn sm" data-action="markAllRead">${esc(t("markAllRead"))}</button></div>
      <div class="filterbar">
        <button class="chip" data-action="filterNotif" data-nf="all" aria-pressed="true">${esc(t("fAll"))}</button>
        <button class="chip" data-action="filterNotif" data-nf="approval" aria-pressed="false">${esc(t("nfApprovals"))}</button>
        <button class="chip" data-action="filterNotif" data-nf="gift" aria-pressed="false">${esc(t("nfGifts"))}</button>
        <button class="chip" data-action="filterNotif" data-nf="safety" aria-pressed="false">${esc(t("nfSafety"))}</button>
      </div>
      <div class="list" id="notifList">
        ${list.map(n => `<div class="row notif ${n.unread?"":"read"}" data-ntype="${n.type}" data-action="markNotif" data-id="${n.id}" role="button" tabindex="0" aria-label="${n.unread?"Unread":"Read"} notification: ${esc(n.text)}">
          <span class="ndot" aria-hidden="true"></span>
          <div class="grow"><div class="title" style="font-weight:${n.unread?"700":"500"}">${esc(n.text)}</div>
            <div class="sub">${esc(n.time)} · ${esc(n.type)}</div></div>
          ${n.type==="approval"?`<button class="btn sm" data-action="setTab" data-tab="approvals">${esc(t("reviewBtn"))}</button>`:""}
        </div>`).join("")}
      </div>`;
  }

  function dashSettings() {
    return `<div class="card">
        <strong>${esc(t("currencyHeading"))}</strong>
        <p class="muted" style="margin:6px 0">${esc(t("currencyUse"))}</p>
        <div class="btn-row">${Object.keys(KB.currencies).map(code => `<button class="chip" data-action="setCurrency" data-cur="${code}" aria-pressed="${state.currency===code}">${code} · ${KB.currencies[code].symbol}${KB.currencies[code].ratePer10}/10pt</button>`).join("")}</div>
      </div>
      <div class="card mt">
        <strong>${esc(t("langLayout"))}</strong>
        <p class="muted" style="margin:6px 0">${esc(t("langInfo"))}</p>
        <div class="btn-row">
          <button class="chip" data-action="setLang" data-l="en" aria-pressed="${state.lang==="en"}">${esc(t("englishLtr"))}</button>
          <button class="chip" data-action="setLang" data-l="ar" aria-pressed="${state.lang==="ar"}">${esc(t("arabicRtl"))}</button>
        </div>
      </div>
      <div class="card mt">
        <strong>${esc(t("appearance"))}</strong>
        <div class="btn-row mt">
          <button class="chip" data-action="setTheme" data-th="light" aria-pressed="${state.theme==="light"}">${esc(t("lightTheme"))}</button>
          <button class="chip" data-action="setTheme" data-th="dark" aria-pressed="${state.theme==="dark"}">${esc(t("darkTheme"))}</button>
        </div>
      </div>
      <button class="btn block warn mt" data-action="go" data-view="landing">${esc(t("signOut"))}</button>`;
  }

  // ----- Kid view -----
  function viewKid() {
    const kid = KB.kids.k_yusuf; // demo kid
    if (state.kidLoginStage !== "approved") return kidOnboarding(kid);
    return `<div class="app">
      ${topbar(t("kidBankTitle", { name: kid.name }), { exit: true })}
      <main class="main" id="main">${renderKidTab(kid)}</main>
      <nav class="tabbar" aria-label="Navigation">
        ${[{id:"tasks",ico:"✅",l:t("tasks")},{id:"points",ico:"⭐",l:t("points")},{id:"history",ico:"📜",l:t("history")}].map(x =>
          `<button class="tab ${state.kidTab===x.id?"active":""}" data-action="setKidTab" data-tab="${x.id}" aria-current="${state.kidTab===x.id?"page":"false"}">
            <span class="tico" aria-hidden="true">${x.ico}</span>${esc(x.l)}</button>`).join("")}
      </nav>
    </div>`;
  }

  function kidOnboarding(kid) {
    if (state.kidLoginStage === "scan") {
      return `<div class="app">${topbar(t("joinKidsbank"), { exit: true })}
        <main class="main center" id="main">
          <div class="hero-logo" aria-hidden="true">🦊</div>
          <h2>${esc(t("kidHi"))}</h2>
          <p class="muted">${esc(t("kidScanPrompt"))}</p>
          <div class="qr-box" aria-hidden="true">${qrSvg("scan-demo")}</div>
          <button class="btn primary block mt" data-action="kidRequest">${esc(t("kidScanBtn"))}</button>
          <p class="auth-note">${esc(t("kidApproveNote"))}</p>
        </main></div>`;
    }
    if (state.kidLoginStage === "waiting") {
      return `<div class="app">${topbar(t("waiting"), { exit: true })}
        <main class="main center" id="main">
          <div class="hero-logo" aria-hidden="true" style="background:linear-gradient(135deg,var(--warn),var(--primary))">⏳</div>
          <h2>${esc(t("waitingApproval"))}</h2>
          <p class="muted">${esc(t("kidWaitPrompt"))}</p>
          <div class="card mt"><div class="progress"><span style="width:66%"></span></div>
            <p class="muted mt" style="font-size:.82rem">${esc(t("reqSentPending"))}</p></div>
          <button class="btn accent block mt" data-action="kidApproved">${esc(t("simApproval"))}</button>
        </main></div>`;
    }
  }

  function renderKidTab(kid) {
    if (state.kidTab === "points") return kidPoints(kid);
    if (state.kidTab === "history") return kidHistory(kid);
    return kidTasks(kid);
  }

  function kidTasks(kid) {
    const tks = tasksForKid(kid.id);
    return `<p class="muted">${esc(t("kidTasksIntro"))}</p>
      <div class="list">
        ${tks.map(tk => { const a = assignerById(tk.assignerId); return `<div class="row">
          <div class="avatar">${tk.category==="School"?"📚":tk.category==="Home"?"🏠":tk.category==="Learning"?"🧠":"⭐"}</div>
          <div class="grow"><div class="title">${esc(tk.title)}</div>
            <div class="sub">${esc(t("fromWord"))} <strong>${esc(a.name)}</strong> · ${esc(t("due"))} ${esc(tk.deadline.split(" ")[1])}</div>
            <div class="btn-row" style="margin-top:8px">
              <span class="badge points">⭐ ${tk.points} pts</span>${roleBadge(a)}
              <span class="badge status-${tk.status}">${esc(statusLabel(tk.status))}</span>
              <span class="badge countdown" data-deadline="${esc(tk.deadline)}" data-decay="${esc(tk.decay)}">⏱️ —</span>
            </div></div>
          ${tk.status==="assigned"?`<button class="btn accent sm" data-action="kidComplete" data-id="${tk.id}">${esc(t("doneBtn"))}</button>`:
            tk.status==="pending_approval"?`<span class="badge status-pending_approval">${esc(t("waitingBadge"))}</span>`:
            `<span class="badge status-completed">✓</span>`}
        </div>`; }).join("")}
      </div>`;
  }

  function kidPendingRedeemSection(kid) {
    const pend = pendingRedemptionsForKid(kid.id);
    if (!pend.length) return "";
    return `<div class="card mt" id="kidPendingRedeem" style="background:linear-gradient(135deg,rgba(9,132,227,.12),rgba(108,92,231,.10))">
        <strong>${esc(t("pendingRedeemTitle"))}</strong>
        <p class="muted" style="margin:6px 0;font-size:.84rem">${esc(t("pendingRedeemIntro"))}</p>
        <div class="list">
          ${pend.map(r => { const asg = assignerById(r.assignerId); return `<div class="row pending-redeem-row" data-id="${esc(r.id)}">
            <div class="avatar">🪙</div>
            <div class="grow"><div class="title">${esc(t("pendingRedeemRow", { n: r.amount, money: r.money }))}</div>
              <div class="sub">${esc(t("pendingRedeemBy", { by: asg ? asg.name : r.assignerId }))} · ${esc(r.ts)} ${redemptionStatusBadge(r.status)}</div></div>
            <div style="display:flex;flex-direction:column;gap:6px">
              <button class="btn accent sm" data-action="confirmRedemption" data-id="${esc(r.id)}">${esc(t("confirmRedeemBtn"))}</button>
              <button class="btn warn sm" data-action="declineRedemption" data-id="${esc(r.id)}">${esc(t("declineRedeemBtn"))}</button></div>
          </div>`; }).join("")}
        </div>
      </div>`;
  }

  function kidPoints(kid) {
    const tot = kidGrandTotals(kid);
    const goal = state.kidGoal;
    const toGo = Math.max(0, goal - tot.earned);
    return `<div class="cards">
        ${statCard("⭐", tot.earned, t("kidEarned"), "rgba(0,184,148,.16)")}
        ${statCard("💱", tot.redeemed, t("kidRedeemed"), "rgba(9,132,227,.14)")}
        ${statCard("⏳", tot.pending, t("kidPending"), "rgba(225,112,85,.16)")}
      </div>
      ${kidPendingRedeemSection(kid)}
      <div class="card mt"><div class="btn-row" style="justify-content:space-between;align-items:center">
          <strong>${esc(t("rewardGoal"))}</strong>
          <button class="btn sm" data-action="setKidGoal">${esc(t("setGoal"))}</button></div>
        <div class="progress"><span style="width:${Math.min(100, tot.earned/goal*100)}%"></span></div>
        <p class="muted mt" style="font-size:.82rem">${esc(t("pointsOf", { a: tot.earned, b: goal }))} · ${toGo === 0 ? esc(t("goalReached")) : esc(t("toGo", { n: toGo }))}</p></div>
      <div class="card mt" style="background:linear-gradient(135deg,rgba(225,112,85,.14),rgba(108,92,231,.12))">
        <div class="btn-row" style="align-items:center;gap:10px">
          <span style="font-size:1.8rem">🔥</span>
          <div class="grow"><strong>${esc(t("streakLine", { n: kid.streak || 0 }))}</strong>
            <div class="muted" style="font-size:.82rem">${esc(t("keepStreak"))}</div></div>
        </div></div>
      <div class="section-title">${esc(t("achievements"))}</div>
      <div class="chips">
        ${(kid.badges || []).map(b => `<span class="chip" aria-label="Badge: ${esc(b)}" style="cursor:default">🏅 ${esc(b)}</span>`).join("")}
        <span class="chip" style="opacity:.5;cursor:default">${esc(t("nextBadge"))}</span>
      </div>
      <div class="section-title"><span>${esc(t("yourAccounts"))}</span><button class="btn sm primary" data-action="kidScanNew">${esc(t("scanNewQr"))}</button></div>
      <div class="acct-grid">
        ${Object.entries(kid.accounts).map(([id,a]) => { const asg = assignerById(id); return `<div class="acct">
          <span style="font-size:1.3rem">${asg.avatar}</span>
          <div class="grow"><div style="font-weight:600">${esc(asg.name)} <span class="muted">(${esc(roleLabel(asg.role))})</span></div>
            <div class="acct-no">${esc(t("acct"))} ${esc(a.acctNo)}</div></div>
          <div class="badge points">⭐ ${a.earned}</div></div>`; }).join("")}
      </div>`;
  }

  function kidHistory(kid) {
    const tks = tasksForKid(kid.id);
    const items = [
      ...tks.filter(x=>x.status==="completed").map(x=>({ico:"✓",txt:t("earnedTaskHist", { n: x.points, title: x.title }),by:assignerById(x.assignerId).name})),
      {ico:"🎁",txt:t("bonusGift"),by:"Omar Aziz"},
      {ico:"💱",txt:t("redeemedReward"),by:"Sara Aziz"}
    ];
    return `<p class="muted">${esc(t("rewardHistory"))}</p>
      <div class="list">
        ${items.map(i => `<div class="row"><div class="avatar">${i.ico}</div>
          <div class="grow"><div class="title">${esc(i.txt)}</div><div class="sub">${esc(t("byWord"))} ${esc(i.by)}</div></div></div>`).join("")}
      </div>`;
  }

  // ========================================================
  //  RENDER + ROUTER
  // ========================================================
  function render() {
    document.documentElement.setAttribute("data-theme", state.theme);
    document.documentElement.setAttribute("dir", state.dir);
    document.documentElement.setAttribute("lang", state.lang);
    let html = "";
    switch (state.view) {
      case "landing": html = viewLanding(); break;
      case "login": html = viewLogin(); break;
      case "mfa": html = viewMfa(); break;
      case "dashboard": html = viewDashboard(); break;
      case "kid": html = viewKid(); break;
      default: html = viewLanding();
    }
    app().innerHTML = `<a href="#main" class="skip-link">Skip to content</a>` + html;
    location.hash = "#/" + state.view + (state.role ? "/" + state.role : "");
    startCountdowns();
  }

  // ---- Live decay countdowns ----
  let countdownTimer;
  function startCountdowns() {
    clearInterval(countdownTimer);
    const els = document.querySelectorAll(".countdown[data-deadline]");
    if (!els.length) return;
    const tick = () => {
      const now = new Date();
      els.forEach(el => {
        const dl = new Date(el.getAttribute("data-deadline").replace(" ", "T"));
        const diff = dl - now;
        if (diff > 0) {
          const h = Math.floor(diff/3.6e6), m = Math.floor(diff%3.6e6/6e4), s = Math.floor(diff%6e4/1000);
          el.textContent = `⏱️ ${h}h ${m}m ${s}s left`;
          el.classList.remove("late");
        } else {
          const lateMin = Math.floor(-diff/6e4);
          el.textContent = `⚠️ ${lateMin}m late (${el.getAttribute("data-decay")})`;
          el.classList.add("late");
        }
      });
    };
    tick();
    countdownTimer = setInterval(tick, 1000);
  }

  // ---- Task list client-side filter (search) ----
  window.__kbFilter = function () {
    const q = (document.getElementById("taskSearch")?.value || "").toLowerCase();
    document.querySelectorAll("#taskList .row").forEach(r => {
      r.style.display = r.textContent.toLowerCase().includes(q) ? "" : "none";
    });
  };
  window.__kbPeopleFilter = function () {
    const input = document.getElementById("peopleSearch");
    const q = (input ? input.value : "").trim().toLowerCase();
    const hint = document.getElementById("peopleHint");
    const cards = document.querySelectorAll("#peopleList > .card");
    if (q.length < 3) {
      cards.forEach(c => { c.style.display = ""; });
      if (hint) hint.style.display = q.length ? "" : "none";
      return;
    }
    if (hint) hint.style.display = "none";
    cards.forEach(c => {
      const hay = (c.getAttribute("data-search") || c.textContent).toLowerCase();
      c.style.display = hay.includes(q) ? "" : "none";
    });
  };

  // ========================================================
  //  EVENT DELEGATION
  // ========================================================
  document.addEventListener("submit", e => {
    const f = e.target.closest("[data-action]");
    if (!f) return;
    const action = f.getAttribute("data-action");
    if (action === "submitLogin") { e.preventDefault(); state.view = "mfa"; render(); }
    if (action === "submitMfa") { e.preventDefault(); state.view = "dashboard"; state.dashTab = "overview"; render(); showToast(t("signedIn")); }
    if (action === "submitCreateTask") { e.preventDefault(); submitCreateTask(); }
  });

  // MFA auto-advance
  document.addEventListener("input", e => {
    const cell = e.target.closest(".mfa-cell");
    if (cell && cell.value) {
      const i = +cell.getAttribute("data-i");
      const next = document.querySelector(`.mfa-cell[data-i="${i+1}"]`);
      if (next) next.focus();
    }
  });

  document.addEventListener("click", e => {
    const el = e.target.closest("[data-action]");
    if (!el) return;
    const a = el.getAttribute("data-action");
    const D = el.dataset;

    switch (a) {
      case "noop": e.preventDefault(); showToast(t("codeSent")); break;
      case "go": e.preventDefault(); resetForLanding(D.view); break;
      case "selectRole":
        state.role = D.role;
        state.roles = (KB.roleGroups && KB.roleGroups[D.role]) ? KB.roleGroups[D.role].slice() : [D.role];
        if (D.role === "Kid") { state.view = "kid"; state.kidLoginStage = "scan"; }
        else { state.view = "login"; }
        render(); break;
      case "preLoginChoose":
        // v8-2: choose which role to sign in AS before authenticating.
        state.role = D.role;
        state.roles = (KB.roleGroups && KB.roleGroups[D.role]) ? KB.roleGroups[D.role].slice() : [D.role];
        if (!state.roles.includes(D.role)) state.roles.unshift(D.role);
        state.view = "login"; state.dashTab = "overview";
        render(); break;
      case "switchRole":
        if (D.role && state.role !== D.role && state.roles.includes(D.role)) {
          state.role = D.role; state.dashTab = "overview"; render();
          showToast(t("roleSwitched", { role: roleLabel(D.role) }));
        }
        break;
      case "setTab": e.preventDefault(); state.dashTab = D.tab; render(); break;
      case "setKidTab": e.preventDefault(); state.kidTab = D.tab; render(); break;
      case "toggleTheme": state.theme = state.theme === "dark" ? "light" : "dark"; render(); break;
      case "toggleLang": setLang(state.lang === "en" ? "ar" : "en"); break;
      case "setLang": setLang(D.l); break;
      case "setTheme": state.theme = D.th; render(); break;
      case "setCurrency": state.currency = D.cur; render(); showToast(t("currencySet", { cur: D.cur })); break;
      case "cycleCurrency": cycleCurrency(); break;
      case "taskDetail": openTaskDetail(D.id); break;
      case "setKidGoal": openKidGoal(); break;
      case "dismissTip": state.showTip = false; render(); break;
      case "showGuide": openGuide(); break;

      case "approveTask": approveTask(D.id); break;
      case "rejectTask": rejectTask(D.id); break;
      case "openCreateTask": openCreateTask(); break;
      case "closeModal": closeModal(); break;
      case "giftFromTask": openGift(D.kid); break;
      case "confirmGift": e.preventDefault(); confirmGift(D.kid); break;
      case "redeem": doRedeem(D.kid); break;
      case "confirmRedemption": confirmRedemption(D.id); break;
      case "declineRedemption": declineRedemption(D.id); break;
      case "showQR": showQR(D.kid); break;
      case "approveKidLogin": approveKidLogin(D.kid); break;
      case "markAllRead": markAllRead(); break;
      case "markNotif": markNotif(D.id); break;
      case "filterNotif": filterNotif(el, D.nf); break;
      case "inviteCoParent": openInviteCoParent(); break;
      case "moderate": moderate(D.id, D.ok === "1"); break;

      case "kidRequest": state.kidLoginStage = "waiting"; render(); break;
      case "kidApproved": state.kidLoginStage = "approved"; state.kidTab = "tasks"; render(); showToast(t("kidWelcome")); break;
      case "kidComplete": kidComplete(D.id); break;
      case "kidScanNew": openKidScanNew(KB.kids.k_yusuf); break;
      case "filterStatus": filterStatus(el, D.fs); break;
    }
  });

  // keyboard: Escape closes modal; Enter/Space activates role=button rows; ? opens guide
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeModal();
    if (e.key === "?" && !/input|textarea|select/i.test(e.target.tagName)) { openGuide(); }
    if ((e.key === "Enter" || e.key === " ") && e.target.matches('[role="button"][data-action]')) {
      e.preventDefault();
      e.target.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    }
    // focus trap inside open modal
    if (e.key === "Tab") {
      const modal = document.querySelector("#modal .modal");
      if (!modal) return;
      const f = modal.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])');
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  // ---- Action implementations ----
  function setLang(l) {
    state.lang = l; state.dir = l === "ar" ? "rtl" : "ltr"; render();
    showToast(l === "ar" ? t("switchedAr") : t("switchedEn"));
  }
  function cycleCurrency() {
    const codes = Object.keys(KB.currencies);
    const i = codes.indexOf(state.currency);
    state.currency = codes[(i + 1) % codes.length];
    render(); showToast(t("currencyCycle", { cur: state.currency }));
  }
  function openGuide() {
    openModal(`<h3>${esc(t("guideTitle"))}</h3>
      <p class="muted">${esc(t("guideIntro"))}</p>
      <ol style="padding-inline-start:18px;line-height:1.8">
        <li>${esc(t("guide1"))}</li>
        <li>${esc(t("guide2"))}</li>
        <li>${esc(t("guide3"))}</li>
        <li>${esc(t("guide4"))}</li>
        <li>${esc(t("guide5"))}</li>
        <li>${esc(t("guide6"))}</li>
        <li>${esc(t("guide7"))}</li>
        <li>${esc(t("guide8"))}</li>
        <li>${esc(t("guide9"))}</li>
        <li>${esc(t("guide10", { sym: KB.currencies[state.currency].symbol }))}</li>
      </ol>
      <button class="btn primary block" data-action="closeModal">${esc(t("gotIt"))}</button>`);
  }
  function openTaskDetail(id) {
    const tk = KB.tasks.find(x => x.id === id); if (!tk) return;
    const a = assignerById(tk.assignerId); const kid = KB.kids[tk.kidId];
    const steps = [
      { label: t("stepAssigned"), done: true },
      { label: t("stepKidComplete"), done: tk.status !== "assigned" },
      { label: t("stepApproved"), done: tk.status === "completed" }
    ];
    openModal(`<h3>${esc(tk.title)}</h3>
      <div class="btn-row" style="margin-bottom:10px">
        <span class="badge points">⭐ ${tk.points} pts</span>${roleBadge(a)}
        <span class="badge status-${tk.status}">${esc(statusLabel(tk.status))}</span></div>
      <p class="muted" style="margin:4px 0">${esc(t("assignedToBy", { kid: kid.name, by: a.name, role: roleLabel(a.role) }))}</p>
      <div class="acct"><div class="grow"><div style="font-weight:600">${esc(t("deadlineWord"))}</div><div class="acct-no">${esc(tk.deadline)}</div></div>
        <span class="badge countdown" data-deadline="${esc(tk.deadline)}" data-decay="${esc(tk.decay)}">⏱️ —</span></div>
      <p class="muted mt" style="font-size:.82rem">${esc(t("lateRule", { decay: tk.decay, cat: tk.category, acct: (kid.accounts[tk.assignerId]||{}).acctNo || "—" }))}</p>
      <div class="divider"></div>
      <strong>${esc(t("progress"))}</strong>
      <div class="list mt">${steps.map(s => `<div class="row" style="padding:10px"><div class="avatar" style="width:34px;height:34px;font-size:1rem">${s.done ? "✅" : "⬜"}</div>
        <div class="grow"><div class="title" style="font-size:.9rem">${esc(s.label)}</div></div></div>`).join("")}</div>
      <button class="btn primary block mt" data-action="closeModal">${esc(t("close"))}</button>`);
    startCountdowns();
  }
  function openKidGoal() {
    openModal(`<h3>${esc(t("setRewardGoal"))}</h3>
      <p class="muted">${esc(t("goalPrompt"))}</p>
      <div class="field"><label for="goalAmt">${esc(t("goalPoints"))}</label>
        <input id="goalAmt" type="number" min="10" step="10" value="${state.kidGoal}"></div>
      <div class="btn-row" style="justify-content:flex-end">
        <button class="btn" data-action="closeModal">${esc(t("cancel"))}</button>
        <button class="btn primary" id="saveGoal">${esc(t("saveGoal"))}</button></div>`);
    document.getElementById("saveGoal").addEventListener("click", () => {
      const v = parseInt(document.getElementById("goalAmt").value, 10);
      if (v > 0) state.kidGoal = v;
      closeModal(); render(); showToast(t("goalSet", { n: state.kidGoal }));
    });
  }
  function resetForLanding(view) {
    if (view === "landing") { state.role = null; state.roles = []; state.kidLoginStage = "scan"; }
    state.view = view; render();
  }
  function approveTask(id) {
    const tk = KB.tasks.find(x => x.id === id); if (!tk) return;
    tk.status = "completed";
    const acct = KB.kids[tk.kidId].accounts[tk.assignerId];
    if (acct) { acct.earned += tk.points; acct.pending = Math.max(0, acct.pending - tk.points); }
    render(); showToast(t("approvedPts", { n: tk.points, name: KB.kids[tk.kidId].name }));
  }
  function rejectTask(id) {
    const tk = KB.tasks.find(x => x.id === id); if (!tk) return;
    tk.status = "assigned"; render(); showToast(t("sentBack"));
  }
  function openCreateTask() {
    const kids = kidsForRole();
    openModal(`<h3>${esc(t("createTask"))}</h3>
      <form data-action="submitCreateTask">
        <div class="field"><label for="ctTitle">${esc(t("taskTitle"))}</label><input id="ctTitle" required placeholder="${esc(t("taskTitlePh"))}"></div>
        <div class="field"><label for="ctPoints">${esc(t("pointValue"))}</label><input id="ctPoints" type="number" min="1" value="10" required></div>
        <div class="field"><label for="ctDeadline">${esc(t("deadline"))}</label><input id="ctDeadline" type="datetime-local" value="2026-06-25T19:00"></div>
        <div class="field"><label>${esc(t("lateDecayLead"))}</label>
          <div class="decay-row">
            <input id="ctDecayPts" type="number" min="0" value="1" aria-label="${esc(t("lateDecayPts"))}">
            <span class="muted">${esc(t("lateDecayPts"))} ${esc(t("lateDecayMid"))}</span>
            <input id="ctDecayMin" type="number" min="1" value="5" aria-label="${esc(t("lateDecayMin"))}">
            <span class="muted">${esc(t("lateDecayMin"))}</span>
          </div></div>
        <div class="field"><label>${esc(t("assignTo"))}</label>
          <div class="chips" id="ctKids">${kids.map(k => `<button type="button" class="chip" data-toggle-kid="${k.id}" aria-pressed="false">${k.emoji} ${esc(k.name)}</button>`).join("")}</div>
          <div class="hint">${esc(t("tapMulti"))}</div></div>
        <div class="btn-row" style="justify-content:flex-end">
          <button type="button" class="btn" data-action="closeModal">${esc(t("cancel"))}</button>
          <button type="submit" class="btn primary">${esc(t("createAssign"))}</button></div>
      </form>`);
    document.querySelectorAll("[data-toggle-kid]").forEach(b => b.addEventListener("click", () => {
      const on = b.getAttribute("aria-pressed") === "true"; b.setAttribute("aria-pressed", String(!on));
    }));
  }
  function buildDecayString(pts, min) {
    if (!(pts > 0) || !(min > 0)) return "none";
    return `-${pts} pt${pts === 1 ? "" : "s"} / ${min} min late`;
  }
  function submitCreateTask() {
    const title = document.getElementById("ctTitle").value.trim();
    const points = parseInt(document.getElementById("ctPoints").value, 10) || 10;
    const decayPts = parseInt(document.getElementById("ctDecayPts").value, 10) || 0;
    const decayMin = parseInt(document.getElementById("ctDecayMin").value, 10) || 5;
    const decay = buildDecayString(decayPts, decayMin);
    const dl = document.getElementById("ctDeadline").value.replace("T", " ");
    const sel = [...document.querySelectorAll('[data-toggle-kid][aria-pressed="true"]')].map(b => b.getAttribute("data-toggle-kid"));
    const kids = sel.length ? sel : (kidsForRole()[0] ? [kidsForRole()[0].id] : []);
    if (!title || !kids.length) { showToast(t("addTitlePick")); return; }
    kids.forEach((kid, i) => KB.tasks.push({
      id: "t" + Date.now() + i, title, points, kidId: kid, assignerId: myAssignerId(),
      deadline: dl || "2026-06-25 19:00", decay, status: "assigned", category: "Home"
    }));
    closeModal(); state.dashTab = "tasks"; render();
    showToast(t("taskCreated", { n: kids.length, kids: kids.length > 1 ? t("kidsWord") : t("kidWord") }));
  }
  function openGift(kidId) {
    const k = KB.kids[kidId];
    openModal(`<h3>${esc(t("giftTitle"))}</h3>
      <p class="muted">${esc(t("giftPrompt", { name: k.name }))}</p>
      <div class="field"><label for="gAmt">${esc(t("points"))}</label><input id="gAmt" type="number" min="1" value="5"></div>
      <div class="field"><label for="gReason">${esc(t("reasonLabel"))}</label><input id="gReason" value="${esc(t("giftReasonDefault"))}"></div>
      <div class="btn-row" style="justify-content:flex-end">
        <button class="btn" data-action="closeModal">${esc(t("cancel"))}</button>
        <button class="btn accent" data-action="confirmGift" data-kid="${kidId}">${esc(t("giftBtn"))}</button></div>`);
  }
  function confirmGift(kidId) {
    const amt = parseInt(document.getElementById("gAmt").value, 10) || 0;
    const acct = KB.kids[kidId].accounts[myAssignerId()] || Object.values(KB.kids[kidId].accounts)[0];
    if (acct && amt > 0) acct.earned += amt;
    closeModal(); render(); showToast(t("giftDone", { n: amt, name: KB.kids[kidId].name }));
  }
  function doRedeem(kidId) {
    const acct = kidTotalsForAssigner(KB.kids[kidId], myAssignerId());
    const available = acct.earned;
    if (available <= 0) return;
    const half = Math.max(1, Math.floor(available / 2));
    openModal(`<h3>${esc(t("redeemTitle"))}</h3>
      <p>${esc(t("redeemPrompt", { name: KB.kids[kidId].name }))}</p>
      <div class="field"><label for="redeemAmt">${esc(t("pointsToRedeem"))}</label>
        <input id="redeemAmt" type="number" min="1" max="${available}" value="${available}" inputmode="numeric">
        <div class="hint" id="redeemAvail">${esc(t("availOf", { n: available }))}</div></div>
      <div class="btn-row" style="margin:4px 0">
        <button type="button" class="chip" id="redeemAll">${esc(t("allBtn"))}</button>
        <button type="button" class="chip" id="redeemHalf">${esc(t("halfBtn"))}</button>
      </div>
      <div class="card" style="background:var(--surface-2)"><strong id="redeemMoney">${money(available)}</strong> <span class="muted">(${state.currency})</span><div class="muted" style="font-size:.8rem">${esc(t("account"))} ${esc(acct.acctNo)}</div></div>
      <div class="btn-row mt" style="justify-content:flex-end">
        <button class="btn" data-action="closeModal">${esc(t("cancel"))}</button>
        <button class="btn primary" id="confirmRedeem">${esc(t("confirmRedeemed"))}</button></div>`);
    const input = document.getElementById("redeemAmt");
    const moneyEl = document.getElementById("redeemMoney");
    const clampVal = () => {
      let v = parseInt(input.value, 10);
      if (isNaN(v)) return NaN;
      return v;
    };
    const updateMoney = () => {
      const v = clampVal();
      moneyEl.textContent = money(isNaN(v) || v < 0 ? 0 : v);
    };
    input.addEventListener("input", updateMoney);
    document.getElementById("redeemAll").addEventListener("click", () => { input.value = available; updateMoney(); });
    document.getElementById("redeemHalf").addEventListener("click", () => { input.value = half; updateMoney(); });
    document.getElementById("confirmRedeem").addEventListener("click", () => {
      const real = KB.kids[kidId].accounts[myAssignerId()];
      const max = real ? real.earned : 0;
      let amount = parseInt(input.value, 10);
      if (isNaN(amount) || amount < 1 || amount > max) {
        showToast(t("redeemInvalid", { max })); return;
      }
      real.earned -= amount;
      real.pendingRedeem = (real.pendingRedeem || 0) + amount;
      const rec = {
        id: "rd" + Date.now(), kidId, assignerId: myAssignerId(), amount,
        money: money(amount), cur: state.currency, ts: nowStamp(), acctNo: real.acctNo,
        status: "pending_confirmation"
      };
      KB.redemptions.unshift(rec);
      logRedemptionEvent(rec, "initiated");
      notifyParentRedemption(rec, "initiated");
      KB.auditLog.unshift({
        id: "au" + Date.now(), actor: assignerById(myAssignerId()).name,
        action: "Started redemption (awaiting kid confirmation) → " + state.currency,
        target: KB.kids[kidId].name + " (" + real.acctNo + ")",
        time: t("justNowWord"), risk: "low"
      });
      closeModal(); render(); showToast(t("redeemInitiated", { name: KB.kids[kidId].name }));
    });
  }
  function confirmRedemption(id) {
    const rec = KB.redemptions.find(r => r.id === id && r.status === "pending_confirmation");
    if (!rec) return;
    const acct = KB.kids[rec.kidId].accounts[rec.assignerId];
    if (acct) {
      acct.pendingRedeem = Math.max(0, (acct.pendingRedeem || 0) - rec.amount);
      acct.redeemed += rec.amount;
    }
    rec.status = "redeemed"; rec.confirmedTs = nowStamp();
    logRedemptionEvent(rec, "completed");
    notifyParentRedemption(rec, "completed");
    render(); showToast(t("redeemConfirmedToast", { money: rec.money }));
  }
  function declineRedemption(id) {
    const rec = KB.redemptions.find(r => r.id === id && r.status === "pending_confirmation");
    if (!rec) return;
    const acct = KB.kids[rec.kidId].accounts[rec.assignerId];
    if (acct) {
      acct.pendingRedeem = Math.max(0, (acct.pendingRedeem || 0) - rec.amount);
      acct.earned += rec.amount;
    }
    rec.status = "declined"; rec.confirmedTs = nowStamp();
    logRedemptionEvent(rec, "declined");
    notifyParentRedemption(rec, "declined");
    render(); showToast(t("redeemDeclinedToast", { n: rec.amount }));
  }
  function showQR(kidId) {
    const k = KB.kids[kidId];
    openModal(`<h3>${esc(t("qrTitle", { name: k.name }))}</h3>
      <p class="muted">${esc(t("qrPrompt"))}</p>
      <div class="qr-box">${qrSvg("kid-" + kidId)}</div>
      <p class="center muted" style="font-size:.8rem">${esc(t("qrExpires", { acct: Object.values(k.accounts)[0].acctNo }))}</p>
      <button class="btn primary block" data-action="closeModal">${esc(t("doneWord"))}</button>`);
  }
  function approveKidLogin(kidId) {
    KB.kids[kidId].loginApproved = true; render(); showToast(t("loginApprovedToast", { name: KB.kids[kidId].name }));
  }
  function openKidScanNew(kid) {
    const linked = Object.keys(kid.accounts);
    const avail = Object.values(KB.assigners).filter(a => !linked.includes(a.id));
    if (!avail.length) {
      openModal(`<h3>${esc(t("scanNewTitle"))}</h3>
        <p class="muted">${esc(t("allLinked"))}</p>
        <button class="btn primary block" data-action="closeModal">${esc(t("doneWord"))}</button>`);
      return;
    }
    const scanned = avail[Math.floor(Math.random() * avail.length)];
    openModal(`<h3>${esc(t("scanNewTitle"))}</h3>
      <p class="muted">${esc(t("scanInstruction"))}</p>
      <div class="qr-box" aria-hidden="true">${qrSvg("newscan-" + kid.id)}</div>
      <div class="btn-row" style="justify-content:flex-end">
        <button class="btn" data-action="closeModal">${esc(t("cancel"))}</button>
        <button class="btn primary" id="simScan">${esc(t("simulateScanBtn"))}</button></div>`);
    document.getElementById("simScan").addEventListener("click", () => {
      openModal(`<h3>${esc(t("scanNewTitle"))}</h3>
        <p class="muted">${esc(t("scannedReveal"))}</p>
        <div class="row" id="scanReveal" style="align-items:center;gap:10px;margin:8px 0">
          <span style="font-size:1.6rem">${scanned.avatar}</span>
          <div class="grow"><div style="font-weight:600">${esc(scanned.name)}</div>
            <div class="muted" style="font-size:.82rem">${esc(roleLabel(scanned.role))}</div></div></div>
        <div class="btn-row" style="justify-content:flex-end">
          <button class="btn" data-action="closeModal">${esc(t("cancel"))}</button>
          <button class="btn primary" id="createAcct">${esc(t("createAccountBtn"))}</button></div>`);
      document.getElementById("createAcct").addEventListener("click", () => {
        const asgId = scanned.id;
        const acctNo = newAcctNo(asgId);
        kid.accounts[asgId] = { earned: 0, redeemed: 0, pending: 0, acctNo };
        closeModal(); state.kidTab = "points"; render();
        showToast(t("accountCreated", { acct: acctNo, assigner: assignerById(asgId).name }));
      });
    });
  }
  function markAllRead() { KB.notifications.forEach(n => { if (n.to === myAssignerId()) n.unread = false; }); render(); }
  function markNotif(id) { const n = KB.notifications.find(x => x.id === id); if (n) n.unread = false; render(); }
  function filterNotif(btn, nf) {
    document.querySelectorAll('[data-action="filterNotif"]').forEach(b => b.setAttribute("aria-pressed", "false"));
    btn.setAttribute("aria-pressed", "true");
    document.querySelectorAll("#notifList .notif").forEach(r => {
      r.style.display = (nf === "all" || r.getAttribute("data-ntype") === nf) ? "" : "none";
    });
  }
  function openInviteCoParent() {
    openModal(`<h3>${esc(t("inviteTitle"))}</h3>
      <p class="muted">${esc(t("invitePrompt"))}</p>
      <div class="field"><label for="invEmail">${esc(t("partnerEmail"))}</label>
        <input id="invEmail" type="email" placeholder="partner@email.com" value="omar@email.com"></div>
      <div class="field"><label for="invRel">${esc(t("relationship"))}</label>
        <select id="invRel"><option>${esc(t("relCoParent"))}</option><option>${esc(t("relGuardian"))}</option><option>${esc(t("relGrandparent"))}</option></select></div>
      <div class="btn-row" style="justify-content:flex-end">
        <button class="btn" data-action="closeModal">${esc(t("cancel"))}</button>
        <button class="btn primary" id="sendInvite">${esc(t("sendInvite"))}</button></div>`);
    document.getElementById("sendInvite").addEventListener("click", () => {
      const email = document.getElementById("invEmail").value.trim();
      closeModal(); showToast(email ? t("inviteSent", { email }) : t("inviteSentPlain"));
    });
  }
  function moderate(id, ok) {
    const m = KB.moderationQueue.find(x => x.id === id); if (m) m.status = ok ? "approved" : "blocked";
    render(); showToast(ok ? t("reqApproved") : t("reqBlocked"));
  }
  function kidComplete(id) {
    const tk = KB.tasks.find(x => x.id === id); if (!tk) return;
    tk.status = "pending_approval";
    const acct = KB.kids[tk.kidId].accounts[tk.assignerId];
    if (acct) acct.pending += tk.points;
    render(); showToast(t("sentForApproval", { name: assignerById(tk.assignerId).name }));
  }
  function filterStatus(btn, fs) {
    document.querySelectorAll('[data-action="filterStatus"]').forEach(b => b.setAttribute("aria-pressed", "false"));
    btn.setAttribute("aria-pressed", "true");
    document.querySelectorAll("#taskList .row").forEach(r => {
      r.style.display = (fs === "all" || r.querySelector(`.status-${fs}`)) ? "" : "none";
    });
  }

  // ---- Boot ----
  function boot() {
    // restore from hash if present
    const m = location.hash.match(/^#\/(\w+)(?:\/([\w-]+))?/);
    if (m && ["landing","login","mfa","dashboard","kid"].includes(m[1])) {
      state.view = m[1]; if (m[2]) state.role = decodeURIComponent(m[2]);
      if (state.role) state.roles = (KB.roleGroups && KB.roleGroups[state.role]) ? KB.roleGroups[state.role].slice() : [state.role];
    }
    render();
  }
  window.addEventListener("DOMContentLoaded", boot);
})();
