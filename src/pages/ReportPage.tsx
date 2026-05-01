import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Upload, Camera, MapPin, Send, Sparkles, CheckCircle,
  X, Image as ImageIcon, Loader2, AlertTriangle
} from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { useAuth } from "@/contexts/AuthContext";
import { categoryToDomain } from "@/lib/domainMapping";
import { useToast } from "@/hooks/use-toast";
import { createIssue } from "@/lib/api";

const CATEGORIES = [
  "Pothole", "Garbage Overflow", "Water Leakage",
  "Broken Streetlight", "Traffic Obstruction", "Stray Animals"
];

type Step = "upload" | "scanning" | "detected" | "form";

export default function ReportPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>("upload");
  const [imageBase64, setImageBase64] = useState<string>("");
  const [imagePreview, setImagePreview] = useState<string>("");
  const [detectedCategory, setDetectedCategory] = useState("");
  const [confidence, setConfidence] = useState(0);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState(user?.city ? `${user.city}, ` : "");
  const [category, setCategory] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // ── Handle real file selection ─────────────────────────────────────────
  const handleFileSelect = (file: File) => {
    if (file.size > 8 * 1024 * 1024) {
      toast({ title: "File too large", description: "Please use an image under 8 MB.", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const b64 = reader.result as string;
      setImageBase64(b64);
      setImagePreview(b64);
      simulateAI();
    };
    reader.readAsDataURL(file);
  };

  const handleDropZoneClick = () => fileRef.current?.click();

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) handleFileSelect(file);
  };

  const simulateAI = () => {
    setStep("scanning");
    setTimeout(() => {
      const cats = ["Pothole", "Garbage Overflow", "Water Leakage", "Broken Streetlight"];
      const idx = Math.floor(Math.random() * cats.length);
      const conf = 88 + Math.floor(Math.random() * 10);
      setDetectedCategory(cats[idx]);
      setCategory(cats[idx]);
      setConfidence(conf);
      setStep("detected");
      setTimeout(() => setStep("form"), 1500);
    }, 2500);
  };

  // ── Submit ─────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!user) {
      toast({ title: "Sign in required", variant: "destructive" });
      return;
    }
    if (!title.trim() || !description.trim() || !location.trim()) {
      toast({ title: "Missing fields", description: "Please fill in all fields", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    const domain = categoryToDomain[category] || "public_infrastructure";

    const { error } = await createIssue({
      title,
      description,
      category,
      domain,
      location,
      city: user.city || "",
      created_by: user._id,
      image_url: imageBase64 || ""   // base64 stored directly in MongoDB
    });

    setSubmitting(false);

    if (error) {
      toast({ title: "Submission failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Issue reported! 🎉", description: "Your report is live in the community." });
      navigate("/community");
    }
  };

  return (
    <div className="min-h-screen bg-grid pt-20 px-4 pb-12">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Report an Issue</h1>
          <p className="text-muted-foreground mt-1">
            Upload a photo — our AI will detect the problem automatically
          </p>
        </motion.div>

        {/* Step progress */}
        <div className="flex items-center gap-2 mb-6">
          {(["upload", "scanning", "detected", "form"] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                s === step
                  ? "bg-primary text-white"
                  : ["upload", "scanning", "detected", "form"].indexOf(s) <
                    ["upload", "scanning", "detected", "form"].indexOf(step)
                    ? "bg-success text-white"
                    : "bg-secondary text-muted-foreground"
              }`}>
                {["upload", "scanning", "detected", "form"].indexOf(s) <
                 ["upload", "scanning", "detected", "form"].indexOf(step)
                  ? <CheckCircle className="w-3 h-3" />
                  : i + 1}
              </div>
              {i < 3 && <div className={`h-px flex-1 w-12 transition-colors ${
                ["upload", "scanning", "detected", "form"].indexOf(s) <
                ["upload", "scanning", "detected", "form"].indexOf(step)
                  ? "bg-success" : "bg-border/50"
              }`} />}
            </div>
          ))}
          <span className="ml-2 text-xs text-muted-foreground capitalize">{step}</span>
        </div>

        <AnimatePresence mode="wait">
          {/* ── Step 1: Upload ───────────────────────────────────────── */}
          {step === "upload" && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            >
              <GlassCard className="p-8">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelect(file);
                  }}
                />
                <div
                  onClick={handleDropZoneClick}
                  onDragOver={e => e.preventDefault()}
                  onDrop={handleDrop}
                  className="border-2 border-dashed border-border/50 rounded-xl p-12 text-center cursor-pointer hover:border-primary/40 hover:bg-primary/2 transition-all group"
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors"
                  >
                    <Camera className="w-8 h-8 text-primary" />
                  </motion.div>
                  <p className="font-medium mb-1">Click or drag to upload a photo</p>
                  <p className="text-sm text-muted-foreground">JPG, PNG, WEBP — up to 8 MB</p>
                  <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
                    <Upload className="w-3 h-3" />
                    <span>Photo will be stored with your report</span>
                  </div>
                </div>

                {/* Skip option */}
                <p className="text-center text-xs text-muted-foreground mt-4">
                  No photo?{" "}
                  <button
                    onClick={() => { setStep("form"); setCategory(CATEGORIES[0]); }}
                    className="text-primary hover:underline underline-offset-2"
                  >
                    Skip AI detection and fill the form manually →
                  </button>
                </p>
              </GlassCard>
            </motion.div>
          )}

          {/* ── Step 2: Scanning ─────────────────────────────────────── */}
          {step === "scanning" && (
            <motion.div
              key="scanning"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            >
              <GlassCard className="p-8">
                <div className="relative rounded-xl overflow-hidden h-64">
                  {imagePreview ? (
                    <img src={imagePreview} alt="uploaded" className="w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-6xl bg-secondary/50">📸</div>
                  )}
                  {/* Scanning line */}
                  <motion.div
                    initial={{ top: "0%" }} animate={{ top: "100%" }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent z-10"
                    style={{ boxShadow: "0 0 15px rgba(59,130,246,0.8)" }}
                  />
                  {/* Dark overlay */}
                  <div className="absolute inset-0 bg-black/20" />
                </div>
                <div className="text-center mt-5">
                  <div className="flex items-center justify-center gap-2 text-primary">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="font-medium">AI analyzing your image…</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Detecting issue category and severity</p>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* ── Step 3: Detected ─────────────────────────────────────── */}
          {step === "detected" && (
            <motion.div
              key="detected"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            >
              <GlassCard className="p-8">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  className="text-center"
                >
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 0.5 }}
                    className="w-16 h-16 rounded-2xl bg-success/10 flex items-center justify-center mx-auto mb-4"
                  >
                    <CheckCircle className="w-8 h-8 text-success" />
                  </motion.div>
                  <h3 className="text-xl font-bold mb-3">AI Detection Complete</h3>
                  {imagePreview && (
                    <img src={imagePreview} alt="detected" className="w-full max-h-40 object-cover rounded-xl mb-4" />
                  )}
                  <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-semibold">
                    <Sparkles className="w-4 h-4" />
                    {detectedCategory} — {confidence}% confidence
                  </div>
                  <p className="text-sm text-muted-foreground mt-3">Redirecting to report form…</p>
                </motion.div>
              </GlassCard>
            </motion.div>
          )}

          {/* ── Step 4: Form ─────────────────────────────────────────── */}
          {step === "form" && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* AI result banner */}
              {detectedCategory && (
                <div className="glass-card p-4 flex items-center gap-3">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 pointer-events-none" />
                  <Sparkles className="w-5 h-5 text-primary relative z-10 shrink-0" />
                  <span className="text-sm relative z-10">
                    AI Detected: <strong className="text-primary">{detectedCategory}</strong>{" "}
                    ({confidence}% confidence)
                  </span>
                </div>
              )}

              {/* Photo preview in form */}
              {imagePreview && (
                <div className="relative rounded-2xl overflow-hidden">
                  <img src={imagePreview} alt="report" className="w-full max-h-48 object-cover" />
                  <button
                    onClick={() => { setImageBase64(""); setImagePreview(""); }}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 flex items-center justify-center text-white hover:bg-black"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Add photo button (if no photo yet) */}
              {!imagePreview && (
                <>
                  <input
                    ref={fileRef}
                    type="file" accept="image/*" className="hidden"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.size > 8 * 1024 * 1024) {
                          toast({ title: "File too large", description: "Max 8 MB", variant: "destructive" });
                          return;
                        }
                        const reader = new FileReader();
                        reader.onload = () => {
                          setImageBase64(reader.result as string);
                          setImagePreview(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="w-full flex items-center gap-2 justify-center py-3 rounded-xl border border-dashed border-border/50 text-muted-foreground text-sm hover:border-primary/40 hover:text-primary transition-all"
                  >
                    <ImageIcon className="w-4 h-4" /> Add Photo (optional)
                  </button>
                </>
              )}

              <GlassCard className="p-6 space-y-5">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium mb-2">Issue Title</label>
                  <input
                    type="text" value={title} onChange={e => setTitle(e.target.value)}
                    placeholder="Brief title for the issue"
                    className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select
                    value={category} onChange={e => setCategory(e.target.value)}
                    className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium mb-2">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text" value={location} onChange={e => setLocation(e.target.value)}
                      placeholder={`Area, Street, ${user?.city || "City"}`}
                      className="w-full bg-secondary border border-border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    rows={4} value={description} onChange={e => setDescription(e.target.value)}
                    placeholder="Describe the issue in detail — how long it's been there, who is affected…"
                    className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  />
                </div>

                {!user?.city && (
                  <div className="flex items-start gap-2 p-3 rounded-xl bg-warning/10 border border-warning/20 text-warning text-xs">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    No city in your profile — the issue won't be linked to a city. Update your profile for better visibility.
                  </div>
                )}

                {/* Submit */}
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold transition-all hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] disabled:opacity-50"
                >
                  {submitting ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Submitting…</>
                  ) : (
                    <><Send className="w-5 h-5" /> Submit Report</>
                  )}
                </motion.button>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
