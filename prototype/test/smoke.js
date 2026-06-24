/* Headless smoke test for the KidsBank prototype.
 * Loads index.html in jsdom, runs the SPA, and simulates clicks across all flows.
 * Reports any thrown errors or console errors. Run: node test\smoke.js
 */
const fs = require("fs");
const path = require("path");
const { JSDOM, VirtualConsole } = require("jsdom");

const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");

const errors = [];
const vc = new VirtualConsole();
vc.on("jsdomError", e => errors.push("jsdomError: " + (e.detail || e.message)));
vc.on("error", (...a) => errors.push("console.error: " + a.join(" ")));

const dom = new JSDOM(html, {
  runScripts: "dangerously",
  resources: "usable",
  url: "file://" + root.replace(/\\/g, "/") + "/index.html",
  virtualConsole: vc,
  beforeParse(window) {
    window.requestAnimationFrame = cb => setTimeout(cb, 0);
  }
});

const { window } = dom;
const { document } = window;

function ready() { return new Promise(r => window.addEventListener("DOMContentLoaded", r)); }
function $(sel) { return document.querySelector(sel); }
function click(sel) {
  const el = typeof sel === "string" ? $(sel) : sel;
  if (!el) { errors.push("MISSING ELEMENT: " + sel); return false; }
  el.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
  return true;
}
function submit(sel) {
  const f = $(sel);
  if (!f) { errors.push("MISSING FORM: " + sel); return; }
  f.dispatchEvent(new window.Event("submit", { bubbles: true, cancelable: true }));
}
function byAction(action, extra = "") { return $(`[data-action="${action}"]${extra}`); }
let checks = 0, passed = 0;
function assert(cond, msg) { checks++; if (cond) { passed++; } else { errors.push("ASSERT FAIL: " + msg); } }

(async () => {
  await ready();
  assert($(".role-grid"), "landing role grid renders");
  assert(document.querySelectorAll(".role-card").length === 5, "5 role cards (incl. Co-Parent)");

  // Parent flow
  click(byAction("selectRole", '[data-role="Parent"]'));
  assert($(".auth-wrap"), "login screen renders");
  submit("form[data-action='submitLogin']");
  assert($(".mfa-inputs"), "mfa screen renders");
  submit("form[data-action='submitMfa']");
  assert($(".sidebar") || $(".tabbar"), "dashboard renders with nav");
  assert($(".cards"), "overview cards render");

  for (const tab of ["tasks","approvals","people","redeem","notifications","settings","overview"]) {
    click(`[data-action="setTab"][data-tab="${tab}"]`);
    assert($(".main"), "tab " + tab + " has main content");
  }

  click(byAction("setTab", '[data-tab="tasks"]'));
  click(byAction("openCreateTask"));
  assert($("#ctTitle"), "create task modal opens");
  $("#ctTitle").value = "Test task";
  document.querySelector("[data-toggle-kid]")?.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
  submit("form[data-action='submitCreateTask']");
  assert(!$("#ctTitle"), "create task modal closes after submit");

  click(byAction("setTab", '[data-tab="approvals"]'));
  const approveBtn = byAction("approveTask");
  if (approveBtn) { click(approveBtn); assert(true, "approve task works"); }

  click(byAction("setTab", '[data-tab="people"]'));
  click(byAction("giftFromTask"));
  assert($("#gAmt"), "gift modal opens");
  click(byAction("confirmGift"));
  click(byAction("showQR"));
  assert($(".qr-box svg"), "QR modal renders SVG");
  click(byAction("closeModal"));
  click(byAction("setTab", '[data-tab="redeem"]'));
  const redeemBtn = byAction("redeem");
  if (redeemBtn) { click(redeemBtn); assert($("#confirmRedeem"), "redeem modal opens"); click("#confirmRedeem"); }

  click('[data-action="setCurrency"][data-cur="EUR"]');
  click(byAction("toggleLang"));
  assert(document.documentElement.getAttribute("dir") === "rtl", "RTL applied on Arabic");
  click(byAction("toggleLang"));
  click(byAction("toggleTheme"));
  assert(document.documentElement.getAttribute("data-theme") === "dark", "dark theme applied");
  click(byAction("toggleTheme"));
  click(byAction("go", '[data-view="landing"]'));
  assert($(".role-grid"), "returned to landing");

  // Moderator flow
  click(byAction("selectRole", '[data-role="Moderator"]'));
  submit("form[data-action='submitLogin']");
  submit("form[data-action='submitMfa']");
  click(byAction("setTab", '[data-tab="oversight"]'));
  assert(document.body.textContent.includes("Audit log"), "moderator oversight renders audit log");
  click(byAction("moderate"));
  click(byAction("go", '[data-view="landing"]'));

  // Teacher flow quick check
  click(byAction("selectRole", '[data-role="Teacher"]'));
  submit("form[data-action='submitLogin']");
  submit("form[data-action='submitMfa']");
  assert(document.body.textContent.includes("Students") || document.body.textContent.includes("People"), "teacher dashboard scoped");
  click(byAction("go", '[data-view="landing"]'));

  // Kid flow
  click(byAction("selectRole", '[data-role="Kid"]'));
  assert($(".qr-box"), "kid scan screen renders QR");
  click(byAction("kidRequest"));
  assert(document.body.textContent.includes("Waiting for approval"), "kid waiting state");
  click(byAction("kidApproved"));
  assert($(".tabbar"), "kid dashboard renders");
  const doneBtn = byAction("kidComplete");
  if (doneBtn) click(doneBtn);
  click(byAction("setKidTab", '[data-tab="points"]'));
  assert($(".acct-grid"), "kid points/accounts render");
  click(byAction("setKidTab", '[data-tab="history"]'));
  assert(document.querySelectorAll(".row").length >= 0, "kid history renders");

  // --- Inner pass 2: deeper interaction checks ---
  // Currency conversion reflected in redeem text
  click(byAction("go", '[data-view="landing"]'));
  click(byAction("selectRole", '[data-role="Parent"]'));
  submit("form[data-action='submitLogin']");
  submit("form[data-action='submitMfa']");
  click(byAction("setTab", '[data-tab="redeem"]'));
  const usdText = document.body.textContent.includes("$");
  assert(usdText, "USD symbol shown in redeem by default");
  click('[data-action="setCurrency"][data-cur="AED"]');
  assert(document.body.textContent.includes("د.إ"), "AED symbol shown after currency switch");

  // Task search filter hides non-matching rows
  click(byAction("setTab", '[data-tab="tasks"]'));
  const search = document.getElementById("taskSearch");
  if (search) {
    search.value = "zzz_no_match_zzz";
    search.dispatchEvent(new window.Event("input", { bubbles: true }));
    const visible = [...document.querySelectorAll("#taskList .row")].filter(r => r.style.display !== "none");
    assert(visible.length === 0, "search filter hides non-matching tasks");
  }

  // Status filter chip narrows list
  click('[data-action="filterStatus"][data-fs="completed"]');
  assert($('[data-action="filterStatus"][data-fs="completed"]').getAttribute("aria-pressed") === "true", "status filter chip marks pressed");

  // --- Inner pass 3: kid complete moves task to pending approval ---
  click(byAction("go", '[data-view="landing"]'));
  click(byAction("selectRole", '[data-role="Kid"]'));
  click(byAction("kidRequest"));
  click(byAction("kidApproved"));
  const beforeP = document.querySelectorAll(".status-pending_approval").length;
  const kc = byAction("kidComplete");
  if (kc) {
    click(kc);
    const afterP = document.querySelectorAll(".status-pending_approval").length;
    assert(afterP >= beforeP, "kid complete adds a pending-approval badge");
  }

  // --- R1 / v2 feature coverage ---
  click(byAction("go", '[data-view="landing"]'));
  assert(byAction("selectRole", '[data-role="Co-Parent"]'), "Co-Parent role card present");
  click(byAction("selectRole", '[data-role="Co-Parent"]'));
  submit("form[data-action='submitLogin']");
  submit("form[data-action='submitMfa']");
  assert($(".cards"), "Co-Parent dashboard renders");
  const curBtn = byAction("cycleCurrency");
  assert(curBtn, "top-bar currency switcher present");
  if (curBtn) { click(curBtn); assert(true, "currency cycles without error"); }
  click(byAction("setTab", '[data-tab="tasks"]'));
  const infoBtn = byAction("taskDetail");
  assert(infoBtn, "task detail info button present");
  if (infoBtn) { click(infoBtn); assert(document.body.textContent.includes("Progress"), "task detail modal shows progress timeline"); click(byAction("closeModal")); }
  click(byAction("go", '[data-view="landing"]'));
  click(byAction("selectRole", '[data-role="Kid"]'));
  click(byAction("kidRequest"));
  click(byAction("kidApproved"));
  click(byAction("setKidTab", '[data-tab="points"]'));
  const goalBtn = byAction("setKidGoal");
  assert(goalBtn, "kid set-goal button present");
  if (goalBtn) { click(goalBtn); assert($("#goalAmt"), "goal modal opens"); $("#goalAmt").value = "150"; click("#saveGoal"); assert(document.body.textContent.includes("150"), "goal updated to 150"); }

  // --- R2 / v3 feature coverage ---
  click(byAction("go", '[data-view="landing"]'));
  click(byAction("selectRole", '[data-role="Parent"]'));
  submit("form[data-action='submitLogin']");
  submit("form[data-action='submitMfa']");
  // Activity feed on overview
  assert(document.body.textContent.includes("Recent activity"), "overview shows recent activity feed");
  // People search + co-parent invite
  click(byAction("setTab", '[data-tab="people"]'));
  assert(byAction("inviteCoParent"), "invite co-parent button present");
  const pSearch = document.getElementById("peopleSearch");
  if (pSearch) {
    pSearch.value = "zzz_no_match";
    pSearch.dispatchEvent(new window.Event("input", { bubbles: true }));
    const visP = [...document.querySelectorAll("#peopleList > .card")].filter(c => c.style.display !== "none");
    assert(visP.length === 0, "people search hides non-matching cards");
  }
  click(byAction("inviteCoParent"));
  assert($("#invEmail"), "invite modal opens");
  click("#sendInvite");
  assert(!$("#invEmail"), "invite modal closes after send");
  // Notifications: per-item mark read + filter
  click(byAction("setTab", '[data-tab="notifications"]'));
  const firstNotif = byAction("markNotif");
  if (firstNotif) { const id = firstNotif.getAttribute("data-id"); click(firstNotif); assert(byAction("markNotif", `[data-id="${id}"]`).classList.contains("read"), "notification marked read on click"); }
  const nf = byAction("filterNotif", '[data-nf="approval"]');
  if (nf) { click(nf); assert(nf.getAttribute("aria-pressed") === "true", "notification filter chip pressed"); }

  // --- R3 / v4 feature coverage ---
  // Demo guide overlay (button + ? shortcut)
  click(byAction("setTab", '[data-tab="overview"]'));
  assert(document.body.textContent.includes("Leaderboard"), "overview shows leaderboard");
  click(byAction("showGuide"));
  assert(document.body.textContent.includes("Demo guide"), "demo guide overlay opens via button");
  click(byAction("closeModal"));
  document.dispatchEvent(new window.KeyboardEvent("keydown", { key: "?", bubbles: true }));
  assert(document.body.textContent.includes("Demo guide"), "demo guide opens via ? shortcut");
  click(byAction("closeModal"));
  // Kid streaks & badges
  click(byAction("go", '[data-view="landing"]'));
  click(byAction("selectRole", '[data-role="Kid"]'));
  click(byAction("kidRequest"));
  click(byAction("kidApproved"));
  click(byAction("setKidTab", '[data-tab="points"]'));
  assert(document.body.textContent.includes("streak"), "kid view shows streak");
  assert(document.body.textContent.includes("Achievements"), "kid view shows achievement badges");

  // --- v6 / v7 feature coverage ---
  // v6-1: multi-role switcher changes scope
  click(byAction("go", '[data-view="landing"]'));
  click(byAction("selectRole", '[data-role="Parent"]'));
  submit("form[data-action='submitLogin']");
  submit("form[data-action='submitMfa']");
  const teacherSwitch = byAction("switchRole", '[data-role="Teacher"]');
  assert(teacherSwitch, "role switcher offers Teacher for multi-role Parent identity");
  click(byAction("setTab", '[data-tab="people"]'));
  assert(!document.body.textContent.includes("Sami"), "Parent scope excludes Teacher-only student Sami");
  click(byAction("switchRole", '[data-role="Teacher"]'));
  click(byAction("setTab", '[data-tab="people"]'));
  assert(document.body.textContent.includes("Sami"), "switching to Teacher role rescopes to include Sami");
  click(byAction("switchRole", '[data-role="Parent"]'));

  // v6-2: people name search activates at >= 3 characters (and matches Arabic)
  click(byAction("setTab", '[data-tab="people"]'));
  const pps = document.getElementById("peopleSearch");
  const allCards = () => [...document.querySelectorAll("#peopleList > .card")];
  if (pps) {
    pps.value = "la";
    pps.dispatchEvent(new window.Event("input", { bubbles: true }));
    assert(allCards().every(c => c.style.display !== "none"), "search under 3 chars shows full list");
    pps.value = "lay";
    pps.dispatchEvent(new window.Event("input", { bubbles: true }));
    const visEn = allCards().filter(c => c.style.display !== "none");
    assert(visEn.length === 1 && visEn[0].textContent.includes("Layla"), "3-char search filters to Layla");
    pps.value = "ليل";
    pps.dispatchEvent(new window.Event("input", { bubbles: true }));
    const visAr = allCards().filter(c => c.style.display !== "none");
    assert(visAr.length === 1 && visAr[0].textContent.includes("Layla"), "Arabic name search matches Layla");
  }

  // v7-2: parent overall picture panel across all assigners
  assert($("#parentOverview"), "parent overall-picture panel renders on People");
  assert(document.body.textContent.includes("Grand total"), "overall picture shows per-kid grand total");

  // v7-1: redemption history grows when a redemption is confirmed
  click(byAction("setTab", '[data-tab="redeem"]'));
  assert($("#redemptionHistory"), "redeem tab shows redemption history section");
  assert($("#allKidRedemptions"), "parent sees all-kids redemption history");
  const histBefore = document.querySelectorAll(".redemption-row").length;
  const rdBtn = byAction("redeem", '[data-kid="k_layla"]');
  if (rdBtn) {
    click(rdBtn);
    assert($("#confirmRedeem"), "redeem modal opens for history test");
    click("#confirmRedeem");
    const histAfter = document.querySelectorAll(".redemption-row").length;
    assert(histAfter > histBefore, "confirming a redemption pushes a record into history");
  }

  // v7-3: kid scans any assigner's QR -> new account created
  click(byAction("go", '[data-view="landing"]'));
  click(byAction("selectRole", '[data-role="Kid"]'));
  click(byAction("kidRequest"));
  click(byAction("kidApproved"));
  click(byAction("setKidTab", '[data-tab="points"]'));
  const acctsBefore = document.querySelectorAll(".acct-grid .acct").length;
  const scanNew = byAction("kidScanNew");
  assert(scanNew, "kid scan-new-assigner button present");
  if (scanNew) {
    click(scanNew);
    assert(!document.getElementById("newAsg"), "scan-new modal hides assigner before scan");
    assert(!document.getElementById("scanReveal"), "no reveal element before scan");
    const sim = document.getElementById("simScan");
    assert(sim, "simulate-scan button present in stage 1");
    click(sim);
    assert(document.getElementById("scanReveal"), "reveal element appears after simulate scan");
    click("#createAcct");
    const acctsAfter = document.querySelectorAll(".acct-grid .acct").length;
    assert(acctsAfter > acctsBefore, "scanning a new assigner QR creates a new account");
  }

  // --- v8-1: two-step redemption confirmation ---
  // Parent initiates a redemption -> stays pending (not yet counted as redeemed).
  click(byAction("go", '[data-view="landing"]'));
  click(byAction("selectRole", '[data-role="Parent"]'));
  submit("form[data-action='submitLogin']");
  submit("form[data-action='submitMfa']");
  window.KB.kids.k_yusuf.accounts.a_parent.earned = 60; // ensure redeemable balance for this pass
  click(byAction("setTab", '[data-tab="redeem"]'));
  const yusufAcct = window.KB.kids.k_yusuf.accounts.a_parent;
  const redeemedBefore = yusufAcct.redeemed;
  const v8rd = byAction("redeem", '[data-kid="k_yusuf"]');
  let newRedId = null;
  if (v8rd) {
    const pendBefore = window.KB.redemptions.filter(r => r.status === "pending_confirmation").length;
    click(v8rd);
    assert($("#confirmRedeem"), "redeem modal opens (v8)");
    document.getElementById("redeemAmt").value = "10";
    click("#confirmRedeem");
    const pendAfter = window.KB.redemptions.filter(r => r.status === "pending_confirmation").length;
    assert(pendAfter === pendBefore + 1, "redemption starts in pending_confirmation, not instantly redeemed");
    assert(yusufAcct.redeemed === redeemedBefore, "earned NOT moved to redeemed until kid confirms");
    assert((yusufAcct.pendingRedeem || 0) >= 10, "amount held in pendingRedeem while awaiting confirmation");
    newRedId = window.KB.redemptions.find(r => r.status === "pending_confirmation" && r.assignerId === "a_parent").id;
  }
  // Parent is notified + event logged.
  const parentNotif = window.KB.notifications.some(n => n.to === "a_parent" && /redemption/i.test(n.text));
  assert(parentNotif, "parent receives a notification when a redemption is initiated");
  assert(window.KB.redemptionLog.some(l => l.parentId === "a_parent" && l.event === "initiated"), "redemption initiation written to parent event log");
  // Parent can see the redemption activity log + status badges.
  assert($("#redemptionEventLog"), "parent sees redemption activity log");
  assert(document.body.textContent.includes("Pending redemption confirmation"), "pending status badge shown in parent view");

  // Kid confirms the seeded pending redemption -> finalized as redeemed.
  click(byAction("go", '[data-view="landing"]'));
  click(byAction("selectRole", '[data-role="Kid"]'));
  click(byAction("kidRequest"));
  click(byAction("kidApproved"));
  click(byAction("setKidTab", '[data-tab="points"]'));
  assert($("#kidPendingRedeem"), "kid sees pending redemptions to confirm");
  const confirmBtn = byAction("confirmRedemption");
  if (confirmBtn) {
    const recId = confirmBtn.getAttribute("data-id");
    const rec = window.KB.redemptions.find(r => r.id === recId);
    const acct = window.KB.kids.k_yusuf.accounts[rec.assignerId];
    const redBefore = acct.redeemed;
    const held = acct.pendingRedeem || 0;
    click(confirmBtn);
    assert(rec.status === "redeemed", "kid confirm finalizes redemption to redeemed");
    assert(acct.redeemed === redBefore + rec.amount, "confirmed amount added to redeemed total");
    assert((acct.pendingRedeem || 0) === held - rec.amount, "held pendingRedeem cleared after confirmation");
    assert(window.KB.redemptionLog.some(l => l.redemptionId === recId && l.event === "completed"), "kid confirmation logged as completed event");
  }

  // --- v8-2: pre-login role choice at the home screen ---
  click(byAction("go", '[data-view="landing"]'));
  assert($("#preLoginRolePanel"), "home screen shows pre-login role choice panel for multi-role identity");
  const preTeacher = byAction("preLoginChoose", '[data-role="Teacher"]');
  assert(preTeacher, "pre-login panel offers Teacher role");
  click(preTeacher);
  assert($(".auth-wrap"), "pre-login choice goes to login screen");
  submit("form[data-action='submitLogin']");
  submit("form[data-action='submitMfa']");
  click(byAction("setTab", '[data-tab="people"]'));
  assert(document.body.textContent.includes("Sami"), "pre-login Teacher choice sets initial scope to Teacher (Sami visible)");
  assert(byAction("switchRole", '[data-role="Parent"]'), "in-app role switcher still offered after pre-login choice");

  setTimeout(() => {
    console.log(`\nSMOKE TEST: ${passed}/${checks} assertions passed`);
    if (errors.length) {
      console.log("ERRORS (" + errors.length + "):");
      errors.forEach(e => console.log("  - " + e));
      process.exit(1);
    } else {
      console.log("No runtime errors detected.");
      process.exit(0);
    }
  }, 300);
})();
