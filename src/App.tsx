import React, { useState, useEffect } from "react";
import {
  Shield,
  Search,
  ExternalLink,
  Plus,
  Compass,
  Briefcase,
  Layers,
  Inbox,
  UserCheck,
  FileText,
  User,
  LogOut,
  Lock,
  Mail,
  AlertTriangle,
  Database,
  Globe,
  Loader,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  ShieldCheck,
  Crosshair
} from "lucide-react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth";
import {
  collection,
  query,
  onSnapshot,
  doc,
  setDoc,
  addDoc,
  deleteDoc,
  updateDoc
} from "firebase/firestore";

import { auth, db } from "./firebase";
import { Paper, Source } from "./types";
import { SEED_PAPERS, getFaviconUrl } from "./utils/sourceHelper";
import BriefingCard from "./components/BriefingCard";
import SubmissionForm from "./components/SubmissionForm";
import AdminInbox from "./components/AdminInbox";
import SourcesShowcase from "./components/SourcesShowcase";
import RedirectNotice from "./components/RedirectNotice";

export default function App() {
  const [showRedirect, setShowRedirect] = useState(true);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // Auth Inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authSuccessMsg, setAuthSuccessMsg] = useState("");

  // Firestore Papers
  const [allPapers, setAllPapers] = useState<Paper[]>([]);
  const [papersLoading, setPapersLoading] = useState(true);

  // Navigation
  const [activeTab, setActiveTab] = useState<"briefings" | "sources" | "submit" | "admin" | "my-submissions">("briefings");
  const [feedCategory, setFeedCategory] = useState<"all" | "counter-terrorism" | "military" | "crime">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Admin Direct Publish Inputs
  const [adminTitle, setAdminTitle] = useState("");
  const [adminSummary, setAdminSummary] = useState("");
  const [adminContent, setAdminContent] = useState("");
  const [adminCategory, setAdminCategory] = useState<"counter-terrorism" | "military" | "crime">("counter-terrorism");
  const [adminSources, setAdminSources] = useState<Source[]>([{ name: "", url: "" }]);
  const [adminDirectPublishSuccess, setAdminDirectPublishSuccess] = useState(false);

  // Loading indicator for async actions
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  // Monitor Authentication State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Strict Admin Mapping as requested: "if sapkotaanubhav91@gmail.com signin he is the admin"
        const adminEmail = "sapkotaanubhav91@gmail.com";
        setIsAdmin(firebaseUser.email?.toLowerCase() === adminEmail.toLowerCase());
      } else {
        setIsAdmin(false);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Sync / Stream Papers from Firestore with auto-seeding
  useEffect(() => {
    const papersCol = collection(db, "papers");
    const unsubscribe = onSnapshot(papersCol, (snapshot) => {
      if (snapshot.empty) {
        // Auto-seed default documents if empty
        SEED_PAPERS.forEach(async (paper) => {
          try {
            await setDoc(doc(db, "papers", paper.id), paper);
          } catch (err) {
            console.error("Error writing seed paper:", err);
          }
        });
      } else {
        const list: Paper[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() } as Paper);
        });
        // Sort newest first
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setAllPapers(list);
      }
      setPapersLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Handle Register
  const handleRegister = async () => {
    setAuthError("");
    setAuthSuccessMsg("");
    if (!email || !password) {
      setAuthError("Email and password are required credentials.");
      return;
    }
    if (password.length < 6) {
      setAuthError("For federal compliance, password must be at least 6 characters.");
      return;
    }
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setAuthSuccessMsg("Account successfully registered to federal database.");
      setEmail("");
      setPassword("");
    } catch (err: any) {
      setAuthError(err.message || "Failed to complete security registration.");
    }
  };

  // Handle Login
  const handleLogin = async () => {
    setAuthError("");
    setAuthSuccessMsg("");
    if (!email || !password) {
      setAuthError("Please specify both email and password.");
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setAuthSuccessMsg("Authentication handshake successful.");
      setEmail("");
      setPassword("");
    } catch (err: any) {
      setAuthError("Access Denied: Invalid email or password sequence.");
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setActiveTab("briefings");
    } catch (err) {
      console.error("Sign out failed", err);
    }
  };

  // Handle User Submitting a Paper
  const handleUserSubmitPaper = async (paperData: Omit<Paper, "id" | "authorId" | "authorEmail" | "createdAt" | "updatedAt" | "status">) => {
    if (!user) throw new Error("Security check failed: Unauthorized connection.");

    const newPaperId = "paper_" + Date.now();
    const paperObj: Paper = {
      id: newPaperId,
      ...paperData,
      status: "pending", // Queued for admin review
      authorId: user.uid,
      authorEmail: user.email || "anonymous",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await setDoc(doc(db, "papers", newPaperId), paperObj);
  };

  // Admin Directly Publishing an Article
  const handleAdminDirectPublish = async () => {
    setAuthError("");
    setAdminDirectPublishSuccess(false);

    if (!adminTitle.trim() || adminTitle.length < 5) {
      alert("Please specify a valid subject title.");
      return;
    }
    if (!adminContent.trim() || adminContent.length < 15) {
      alert("Please provide the full briefing body.");
      return;
    }

    const validSources = adminSources.filter((s) => s.name.trim() && s.url.trim());
    if (validSources.length === 0) {
      alert("Admin briefings require at least one verified source.");
      return;
    }

    const newPaperId = "intel_brief_admin_" + Date.now();
    const paperObj: Paper = {
      id: newPaperId,
      title: adminTitle,
      summary: adminSummary || adminTitle.slice(0, 100) + "...",
      content: adminContent,
      category: adminCategory,
      status: "approved", // Published directly!
      authorId: user?.uid || "admin",
      authorEmail: user?.email || "sapkotaanubhav91@gmail.com",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sources: validSources
    };

    try {
      await setDoc(doc(db, "papers", newPaperId), paperObj);
      setAdminTitle("");
      setAdminSummary("");
      setAdminContent("");
      setAdminCategory("counter-terrorism");
      setAdminSources([{ name: "", url: "" }]);
      setAdminDirectPublishSuccess(true);
    } catch (err: any) {
      alert("Direct publish failed: " + err.message);
    }
  };

  // Add/Remove sources for Admin Direct Publish
  const addAdminSource = () => setAdminSources([...adminSources, { name: "", url: "" }]);
  const removeAdminSource = (i: number) => setAdminSources(adminSources.filter((_, idx) => idx !== i));
  const updateAdminSource = (i: number, field: keyof Source, val: string) => {
    const updated = [...adminSources];
    updated[i] = { ...updated[i], [field]: val };
    setAdminSources(updated);
  };

  // Admin Actions on Submissions
  const handleApprovePaper = async (id: string) => {
    setActionInProgress(id);
    try {
      const paperRef = doc(db, "papers", id);
      await updateDoc(paperRef, {
        status: "approved",
        updatedAt: new Date().toISOString()
      });
    } finally {
      setActionInProgress(null);
    }
  };

  const handleRejectPaper = async (id: string, reason: string) => {
    setActionInProgress(id);
    try {
      const paperRef = doc(db, "papers", id);
      await updateDoc(paperRef, {
        status: "rejected",
        rejectionReason: reason,
        updatedAt: new Date().toISOString()
      });
    } finally {
      setActionInProgress(null);
    }
  };

  const handleDeletePaper = async (id: string) => {
    setActionInProgress(id);
    try {
      await deleteDoc(doc(db, "papers", id));
    } finally {
      setActionInProgress(null);
    }
  };

  // Filter Published Feed
  const publishedBriefings = allPapers.filter((paper) => {
    if (paper.status !== "approved") return false;
    const matchesCategory = feedCategory === "all" || paper.category === feedCategory;
    const matchesSearch =
      paper.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      paper.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      paper.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Filter Submissions belonging to Current User
  const mySubmissions = allPapers.filter((paper) => user && paper.authorId === user.uid);

  // Filter Pending Submissions for Admin Queue
  const pendingBriefings = allPapers.filter((paper) => paper.status === "pending");

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      {/* Full-screen Redirect Notice as requested */}
      {showRedirect && (
        <RedirectNotice onDismiss={() => setShowRedirect(false)} />
      )}

      {/* Top Banner if user chooses to stay */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-2.5 text-center text-xs sm:text-sm text-zinc-300 flex flex-col sm:flex-row items-center justify-center gap-2">
        <span>
          <strong className="text-white">Notice:</strong> Silencly & impersio.me has been bought by Graytell.
        </span>
        <a
          href="https://graytellai.space-z.ai"
          className="inline-flex items-center gap-1 bg-white text-black font-semibold px-3 py-1 rounded-full text-xs hover:bg-zinc-200 transition-colors"
        >
          Go to Graytell Now
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* HEADER SECTION */}
      <header className="border-b-2 border-amber-500/85 bg-zinc-950 sticky top-0 z-50 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Logo & Branding */}
          <div className="flex items-center gap-3">
            {/* Logo on the URL as requested */}
            <div className="w-12 h-12 bg-zinc-900 border-2 border-amber-500 rounded p-1.5 flex items-center justify-center">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/e/e5/Silencly-logo-transparent.png?_=20260711084505"
                alt="GrayTell Logo"
                className="w-full h-full object-contain filter brightness-110 saturate-100"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-amber-500 text-black px-1.5 py-0.2 rounded font-mono font-black tracking-widest uppercase">
                  FBI STYLE INTEL
                </span>
                <span className="text-[10px] text-zinc-500 font-mono tracking-widest hidden md:inline">
                  STRICT RECORD #2026
                </span>
              </div>
              <h1 className="text-2xl font-black text-zinc-100 tracking-tighter flex items-center gap-1">
                GRAY<span className="text-amber-500">TELL</span>
              </h1>
            </div>
          </div>

          {/* Identity & Status */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded px-3.5 py-1.5">
                <div className="shrink-0 text-right">
                  <span className="text-[9px] text-zinc-500 font-mono block">SECURE OPERATOR</span>
                  <span className="text-xs font-bold text-zinc-200">
                    {user.email}
                    {isAdmin && <span className="text-amber-500 ml-1.5 font-mono text-[9px] bg-amber-500/10 px-1 rounded uppercase border border-amber-500/20">ADMIN</span>}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1.5 bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-amber-500 border border-zinc-850 rounded transition-all"
                  title="Disconnect Link"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="text-[10px] font-mono text-zinc-500 flex items-center gap-1.5 bg-zinc-900/50 border border-zinc-800/80 px-3 py-1.5 rounded">
                <Lock className="w-3.5 h-3.5 text-amber-500" />
                <span>RESTRICTED GUEST NETWORK</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* SUB-HEADER DIRECTIVE WARNING */}
      <div className="bg-zinc-950 border-b border-zinc-850 py-2.5 px-4 text-center">
        <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">
          // GrayTell Intelligence Portal: Authorized personnel only. Disclosures are cataloged with source coordinates. //
        </p>
      </div>

      {/* MAIN LAYOUT */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 md:px-6 py-6 flex flex-col lg:flex-row gap-6">
        
        {/* SIDEBAR NAVIGATION */}
        <aside className="w-full lg:w-64 shrink-0 space-y-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-1.5">
            <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest block mb-2 px-1">
              Main Operations
            </span>
            
            <button
              onClick={() => setActiveTab("briefings")}
              className={`w-full text-left px-3.5 py-2.5 rounded text-xs uppercase tracking-wider font-semibold transition-all flex items-center gap-2.5 border ${
                activeTab === "briefings"
                  ? "bg-amber-500 border-amber-400 text-black font-bold"
                  : "bg-zinc-950 text-zinc-400 border-zinc-850 hover:text-zinc-100 hover:border-zinc-700"
              }`}
            >
              <Compass className="w-4.5 h-4.5 shrink-0" />
              Intelligence Feed
            </button>

            <button
              onClick={() => setActiveTab("sources")}
              className={`w-full text-left px-3.5 py-2.5 rounded text-xs uppercase tracking-wider font-semibold transition-all flex items-center gap-2.5 border ${
                activeTab === "sources"
                  ? "bg-amber-500 border-amber-400 text-black font-bold"
                  : "bg-zinc-950 text-zinc-400 border-zinc-850 hover:text-zinc-100 hover:border-zinc-700"
              }`}
            >
              <Globe className="w-4.5 h-4.5 shrink-0" />
              Verified Agencies
            </button>

            <button
              onClick={() => setActiveTab("submit")}
              className={`w-full text-left px-3.5 py-2.5 rounded text-xs uppercase tracking-wider font-semibold transition-all flex items-center gap-2.5 border ${
                activeTab === "submit"
                  ? "bg-amber-500 border-amber-400 text-black font-bold"
                  : "bg-zinc-950 text-zinc-400 border-zinc-850 hover:text-zinc-100 hover:border-zinc-700"
              }`}
            >
              <Plus className="w-4.5 h-4.5 shrink-0" />
              Submit Paper
            </button>

            {user && (
              <button
                onClick={() => setActiveTab("my-submissions")}
                className={`w-full text-left px-3.5 py-2.5 rounded text-xs uppercase tracking-wider font-semibold transition-all flex items-center gap-2.5 border ${
                  activeTab === "my-submissions"
                    ? "bg-amber-500 border-amber-400 text-black font-bold"
                    : "bg-zinc-950 text-zinc-400 border-zinc-850 hover:text-zinc-100 hover:border-zinc-700"
                }`}
              >
                <FileText className="w-4.5 h-4.5 shrink-0" />
                My Submissions
              </button>
            )}

            {isAdmin && (
              <div className="border-t border-zinc-800/80 pt-3 mt-3">
                <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-widest block mb-2 px-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-4.5 h-4.5" /> Admin Secure Sector
                </span>
                <button
                  onClick={() => setActiveTab("admin")}
                  className={`w-full text-left px-3.5 py-2.5 rounded text-xs uppercase tracking-wider font-semibold transition-all flex items-center gap-2.5 border ${
                    activeTab === "admin"
                      ? "bg-zinc-100 border-zinc-200 text-black font-bold"
                      : "bg-zinc-950 text-zinc-400 border-zinc-850 hover:text-zinc-100 hover:border-zinc-700"
                  }`}
                >
                  <Inbox className="w-4.5 h-4.5 shrink-0 text-amber-500" />
                  Admin Inbox
                  {pendingBriefings.length > 0 && (
                    <span className="ml-auto bg-red-600 text-white text-[10px] font-mono px-1.5 py-0.5 rounded font-bold">
                      {pendingBriefings.length}
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* SECURE SIDEBAR LOGS PANEL */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 font-mono text-[10px] text-zinc-500 space-y-2 hidden lg:block">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block border-b border-zinc-850 pb-1.5">
              Live System Telemetry
            </span>
            <div className="space-y-1">
              <p className="flex items-center justify-between">
                <span>PORT:</span>
                <span className="text-zinc-300">3000 SSL</span>
              </p>
              <p className="flex items-center justify-between">
                <span>FIRESTORE:</span>
                <span className="text-emerald-500">CONNECTED</span>
              </p>
              <p className="flex items-center justify-between">
                <span>SEEDED BRIEFS:</span>
                <span className="text-zinc-300">{allPapers.length}</span>
              </p>
            </div>
          </div>
        </aside>

        {/* CORE INTERFACE WORKSPACE */}
        <section className="flex-grow min-w-0">
          {authLoading || papersLoading ? (
            <div className="h-96 flex flex-col items-center justify-center gap-4 text-zinc-500">
              <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
              <p className="text-xs font-mono tracking-widest uppercase">Decrypted Terminal Pipeline Init...</p>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* TABS 1: INTEL BRIEFINGS */}
              {activeTab === "briefings" && (
                <div className="space-y-6">
                  
                  {/* SEARCH & FILTERS */}
                  <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                    {/* Category Tabs */}
                    <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
                      {(["all", "counter-terrorism", "military", "crime"] as const).map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setFeedCategory(cat)}
                          className={`px-3 py-1.5 rounded text-[11px] uppercase tracking-wider font-bold border transition-all ${
                            feedCategory === cat
                              ? "bg-amber-500 text-black border-amber-400"
                              : "bg-zinc-950 text-zinc-400 border-zinc-850 hover:text-zinc-100"
                          }`}
                        >
                          {cat === "all" ? "All Briefs" : cat.replace("-", " ")}
                        </button>
                      ))}
                    </div>

                    {/* Search Field */}
                    <div className="relative w-full md:max-w-sm">
                      <input
                        type="text"
                        placeholder="Filter database indexes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-zinc-950 text-zinc-100 placeholder-zinc-600 border border-zinc-800 rounded py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-amber-500"
                      />
                      <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-600" />
                    </div>
                  </div>

                  {/* PAPERS INDEX FEED */}
                  <div className="space-y-4">
                    {publishedBriefings.length > 0 ? (
                      publishedBriefings.map((paper) => (
                        <BriefingCard
                          key={paper.id}
                          paper={paper}
                          isAdmin={isAdmin}
                          onDelete={handleDeletePaper}
                        />
                      ))
                    ) : (
                      <div className="bg-zinc-950 border border-zinc-850 rounded-lg p-12 text-center text-zinc-500 font-mono text-xs">
                        [ NO CLASSIFIED INTEL INDEXED MATCHING THIS CRITERIA ]
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TABS 2: VERIFIED AGENCIES */}
              {activeTab === "sources" && (
                <div className="space-y-6">
                  <SourcesShowcase />
                </div>
              )}

              {/* TABS 3: SUBMIT PAPER */}
              {activeTab === "submit" && (
                <div>
                  {user ? (
                    <SubmissionForm onSave={handleUserSubmitPaper} isSubmitting={actionInProgress !== null} />
                  ) : (
                    /* LOCK SCREEN FOR ANONYMOUS GUESTS */
                    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center max-w-lg mx-auto shadow-2xl">
                      <Lock className="w-12 h-12 text-amber-500 mx-auto mb-4 animate-bounce" />
                      <h3 className="text-lg font-bold text-zinc-100 tracking-tight">Access Control Protection</h3>
                      <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                        To maintain high intelligence fidelity, submissions require an authorized operator footprint. Please register or authenticate with your Email & Password below.
                      </p>

                      {/* AUTHENTICATION PORTAL */}
                      <div className="mt-6 space-y-4 text-left border-t border-zinc-800 pt-5">
                        {authError && (
                          <div className="bg-red-950 border border-red-900 text-red-200 p-3 rounded font-mono text-[11px]">
                            {authError}
                          </div>
                        )}
                        {authSuccessMsg && (
                          <div className="bg-emerald-950 border border-emerald-900 text-emerald-200 p-3 rounded font-mono text-[11px]">
                            {authSuccessMsg}
                          </div>
                        )}

                        <div>
                          <label className="text-[10px] uppercase font-mono tracking-wider font-bold text-zinc-400 block mb-1">
                            Email Address
                          </label>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="operator@fbi.gov"
                            className="w-full bg-zinc-950 text-zinc-100 placeholder-zinc-700 border border-zinc-850 focus:border-amber-500 rounded py-2 px-3 text-xs focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] uppercase font-mono tracking-wider font-bold text-zinc-400 block mb-1">
                            Password Phrase
                          </label>
                          <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-zinc-950 text-zinc-100 placeholder-zinc-700 border border-zinc-850 focus:border-amber-500 rounded py-2 px-3 text-xs focus:outline-none"
                          />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 pt-2 justify-between items-center">
                          <button
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="text-xs text-zinc-400 hover:text-amber-500 transition-colors"
                          >
                            {isSignUp ? "Already registered? Sign In" : "Need credentials? Register here"}
                          </button>
                          
                          <button
                            onClick={isSignUp ? handleRegister : handleLogin}
                            className="w-full sm:w-auto px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-wider rounded text-xs transition-all shadow-md"
                          >
                            {isSignUp ? "Authorize Register" : "Decrypt & Enter"}
                          </button>
                        </div>
                      </div>

                      {/* FIREBASE EMAIL/PASS HELPER NOTE */}
                      <div className="mt-6 bg-zinc-950 border border-zinc-850 p-3.5 rounded text-left">
                        <span className="text-[9px] text-amber-500 font-mono font-bold block mb-1">🔧 INTEGRATION HANDSHAKE NOTE:</span>
                        <p className="text-[10px] text-zinc-500 font-mono">
                          Please ensure the <strong>Email/Password</strong> sign-in provider is fully enabled in your Firebase Authentication Console for full integration compliance.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TABS 4: ADMIN WORKSPACE */}
              {activeTab === "admin" && isAdmin && (
                <div className="space-y-8">
                  
                  {/* Submission Inbox review */}
                  <div>
                    <h2 className="text-xl font-bold text-zinc-100 tracking-tight flex items-center gap-2 mb-4">
                      <Inbox className="w-5 h-5 text-amber-500" />
                      Submitted Papers Workspace Review
                    </h2>
                    <AdminInbox
                      pendingPapers={pendingBriefings}
                      onApprove={handleApprovePaper}
                      onReject={handleRejectPaper}
                      onDelete={handleDeletePaper}
                      actionInProgress={actionInProgress}
                    />
                  </div>

                  {/* Direct Publish Option ("The admin can add anything") */}
                  <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 shadow-xl">
                    <h3 className="text-lg font-bold text-zinc-100 tracking-tight border-b border-zinc-800 pb-3 mb-5 flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-amber-500" />
                      Direct Administrator Publication Panel
                    </h3>

                    {adminDirectPublishSuccess && (
                      <div className="bg-emerald-950 border border-emerald-800 text-emerald-200 rounded p-4 text-xs font-mono mb-4">
                        [ DIRECT PUBLISH SUCCESSFUL: BRIEFING MOUNTED ONLINE ]
                      </div>
                    )}

                    <div className="space-y-4">
                      {/* Classification Category */}
                      <div>
                        <label className="text-xs uppercase tracking-wider text-zinc-400 font-bold block mb-2">
                          Direct Security Classification
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {(["counter-terrorism", "military", "crime"] as const).map((cat) => (
                            <button
                              key={cat}
                              onClick={() => setAdminCategory(cat)}
                              className={`py-1.5 px-3 border rounded text-xs uppercase tracking-wider font-mono font-bold transition-all ${
                                adminCategory === cat
                                  ? "bg-zinc-950 border-amber-500 text-amber-500"
                                  : "bg-zinc-950 border-zinc-850 text-zinc-400 hover:text-zinc-200"
                              }`}
                            >
                              {cat.replace("-", " ")}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Title */}
                      <div>
                        <label className="text-xs uppercase tracking-wider text-zinc-400 font-bold block mb-1">
                          Briefing Subject Title
                        </label>
                        <input
                          type="text"
                          value={adminTitle}
                          onChange={(e) => setAdminTitle(e.target.value)}
                          placeholder="e.g., Immediate Direct Intel Warning"
                          className="w-full bg-zinc-950 border border-zinc-850 focus:border-amber-500 rounded py-2 px-3 text-xs focus:outline-none"
                        />
                      </div>

                      {/* Summary */}
                      <div>
                        <label className="text-xs uppercase tracking-wider text-zinc-400 font-bold block mb-1">
                          Executive Snippet Summary
                        </label>
                        <input
                          type="text"
                          value={adminSummary}
                          onChange={(e) => setAdminSummary(e.target.value)}
                          placeholder="Short description for list feed previews..."
                          className="w-full bg-zinc-950 border border-zinc-850 focus:border-amber-500 rounded py-2 px-3 text-xs focus:outline-none"
                        />
                      </div>

                      {/* Content */}
                      <div>
                        <label className="text-xs uppercase tracking-wider text-zinc-400 font-bold block mb-1">
                          Analytical Intel Content Body
                        </label>
                        <textarea
                          value={adminContent}
                          onChange={(e) => setAdminContent(e.target.value)}
                          rows={6}
                          placeholder="Write direct briefing notes..."
                          className="w-full bg-zinc-950 border border-zinc-850 focus:border-amber-500 rounded py-2 px-3 text-xs focus:outline-none font-mono"
                        />
                      </div>

                      {/* Direct Sources */}
                      <div>
                        <label className="text-xs uppercase tracking-wider text-zinc-400 font-bold block mb-2">
                          Sources Directory
                        </label>
                        <div className="space-y-2">
                          {adminSources.map((source, idx) => (
                            <div key={idx} className="flex gap-2">
                              <input
                                type="text"
                                placeholder="Agency Source (e.g., DIA)"
                                value={source.name}
                                onChange={(e) => updateAdminSource(idx, "name", e.target.value)}
                                className="flex-1 bg-zinc-950 border border-zinc-850 rounded py-1.5 px-3 text-xs focus:outline-none"
                              />
                              <input
                                type="text"
                                placeholder="Verification URL"
                                value={source.url}
                                onChange={(e) => updateAdminSource(idx, "url", e.target.value)}
                                className="flex-1 bg-zinc-950 border border-zinc-850 rounded py-1.5 px-3 text-xs focus:outline-none font-mono"
                              />
                              <button
                                onClick={() => removeAdminSource(idx)}
                                className="px-2.5 py-1.5 bg-zinc-950 border border-zinc-850 hover:border-red-900 rounded text-red-500 text-xs transition-colors"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={addAdminSource}
                          className="mt-2 text-xs font-semibold text-amber-500 hover:underline flex items-center gap-1"
                        >
                          + Add Source Link
                        </button>
                      </div>

                      <div className="flex justify-end pt-3 border-t border-zinc-850">
                        <button
                          onClick={handleAdminDirectPublish}
                          className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-wider rounded text-xs shadow-lg transition-all"
                        >
                          Directly Mount & Publish Briefing
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TABS 5: OPERATOR ARCHIVE / SUBMISSIONS HISTORY */}
              {activeTab === "my-submissions" && user && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-zinc-100 tracking-tight">
                      My Submission Archives
                    </h2>
                    <p className="text-xs text-zinc-400 mt-1">
                      Track the verification and review status of your submitted intelligence briefings.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {mySubmissions.length > 0 ? (
                      mySubmissions.map((paper) => {
                        const statusColors = {
                          pending: "bg-amber-950/40 border-amber-900 text-amber-500",
                          approved: "bg-emerald-950/40 border-emerald-900 text-emerald-400",
                          rejected: "bg-red-950/40 border-red-900 text-red-400"
                        };
                        return (
                          <div key={paper.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
                            <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-950 border border-zinc-850 text-zinc-400 font-mono uppercase">
                                {paper.category}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-0.5 rounded border ${statusColors[paper.status]}`}>
                                  STATUS: {paper.status}
                                </span>
                                <span className="text-[10px] text-zinc-500 font-mono">
                                  {new Date(paper.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>

                            <h3 className="text-md font-bold text-zinc-100">{paper.title}</h3>
                            <p className="text-xs text-zinc-400 mt-1">{paper.summary}</p>

                            {paper.rejectionReason && paper.status === "rejected" && (
                              <div className="mt-3 p-3 bg-red-950/20 border border-red-900/40 rounded text-xs font-mono text-red-400">
                                <span className="font-bold uppercase block mb-1">DECLINE AUDIT NOTES:</span>
                                {paper.rejectionReason}
                              </div>
                            )}

                            {paper.status === "approved" && (
                              <p className="text-[10px] text-emerald-500 mt-3 font-mono flex items-center gap-1">
                                <CheckCircle className="w-3.5 h-3.5" /> Published and indexed on public feed.
                              </p>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="bg-zinc-950 border border-zinc-850 border-dashed rounded-lg p-12 text-center text-zinc-600 font-mono text-xs">
                        [ YOU HAVE SUBMITTED ZERO INTEL RECODS FOR REVIEW ]
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          )}
        </section>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-zinc-850 bg-zinc-950/80 py-8 text-center text-xs text-zinc-500 font-mono mt-12">
        <div className="max-w-7xl mx-auto px-4 space-y-3">
          <p className="uppercase tracking-widest">
            // GRAYTELL FEDERAL COUNTER-TERRORISM DATABASE & CO-ORDINATION SYSTEM //
          </p>
          <p className="text-[11px] text-zinc-600">
            Powered by direct server link. All data encrypted via SECURE TRANSLATIONAL PROTOCOL. Trademark of federal defense commands.
          </p>
          <div className="flex justify-center gap-4 text-zinc-400 text-[10px]">
            <a href="https://www.fbi.gov" target="_blank" rel="noreferrer" className="hover:text-amber-500 transition-colors">FBI.gov</a>
            <span>•</span>
            <a href="https://www.cia.gov" target="_blank" rel="noreferrer" className="hover:text-amber-500 transition-colors">CIA.gov</a>
            <span>•</span>
            <a href="https://www.interpol.int" target="_blank" rel="noreferrer" className="hover:text-amber-500 transition-colors">Interpol.int</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
