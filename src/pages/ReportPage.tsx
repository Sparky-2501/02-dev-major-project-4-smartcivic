import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Upload, Camera, MapPin, Send, Sparkles, CheckCircle } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { useAuth } from "@/contexts/AuthContext";
import { categoryToDomain } from "@/lib/domainMapping";
import { useToast } from "@/hooks/use-toast";
import { createIssue } from "@/lib/api";

const categories = ["Pothole", "Garbage Overflow", "Water Leakage", "Broken Streetlight", "Traffic Obstruction", "Stray Animals"];

export default function ReportPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState<"upload" | "scanning" | "detected" | "form">("upload");
  const [detectedCategory, setDetectedCategory] = useState("");
  const [confidence, setConfidence] = useState(0);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

  const handleSubmit = async () => {
    if (!user || !title.trim() || !description.trim() || !location.trim()) {
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
      created_by: user._id
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Issue reported!", description: "Your report has been submitted successfully." });
      navigate("/citizen-dashboard");
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-grid pt-20 px-4 pb-12">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Report an Issue</h1>
          <p className="text-muted-foreground mt-1">Upload a photo and our AI will detect the problem</p>
        </motion.div>

        {step === "upload" && (
          <GlassCard className="p-8">
            <div
              onClick={simulateAI}
              className="border-2 border-dashed border-border/50 rounded-xl p-12 text-center cursor-pointer hover:border-primary/30 transition-colors group"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                <Camera className="w-8 h-8 text-primary" />
              </div>
              <p className="font-medium mb-1">Click to upload a photo</p>
              <p className="text-sm text-muted-foreground">or drag and drop an image here</p>
              <div className="flex items-center justify-center gap-3 mt-4">
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Upload className="w-3 h-3" /> JPG, PNG up to 10MB
                </span>
              </div>
            </div>
          </GlassCard>
        )}

        {step === "scanning" && (
          <GlassCard className="p-8">
            <div className="relative rounded-xl bg-secondary/50 h-64 overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center text-6xl">📸</div>
              <motion.div
                initial={{ top: 0 }}
                animate={{ top: "100%" }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent z-10"
                style={{ boxShadow: "0 0 15px rgba(59,130,246,0.8)" }}
              />
            </div>
            <div className="text-center mt-4">
              <div className="flex items-center justify-center gap-2 text-primary">
                <Sparkles className="w-5 h-5 animate-pulse" />
                <span className="font-medium">AI is analyzing your image...</span>
              </div>
            </div>
          </GlassCard>
        )}

        {step === "detected" && (
          <GlassCard className="p-8">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-success/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
              <h3 className="text-xl font-bold mb-2">AI Detection Complete</h3>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-medium">
                <Sparkles className="w-4 h-4" />
                {detectedCategory} — {confidence}% confidence
              </div>
            </motion.div>
          </GlassCard>
        )}

        {step === "form" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="glass-card p-4 flex items-center gap-3">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 pointer-events-none" />
              <Sparkles className="w-5 h-5 text-primary relative z-10" />
              <span className="text-sm relative z-10">
                AI Detected: <strong className="text-primary">{detectedCategory}</strong> ({confidence}% confidence)
              </span>
            </div>

            <GlassCard className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2">Issue Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Brief title for the issue"
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Issue Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Enter location or use GPS"
                    className="w-full bg-secondary border border-border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the issue in detail..."
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                />
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold transition-all hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] disabled:opacity-50"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                ) : (
                  <><Send className="w-5 h-5" /> Submit Report</>
                )}
              </motion.button>
            </GlassCard>
          </motion.div>
        )}
      </div>
    </div>
  );
}
