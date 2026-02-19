"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

export default function SubmissionForm({ competitionId, userId }: { competitionId: string, userId: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("competition_id", competitionId);
    formData.append("user_id", userId);

    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Submission failed");
      }

      const data = await res.json();
      router.refresh(); // Refresh to update leaderboard
      setFile(null); // Reset file input
      // Ideally show success toast
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="submission">Upload CSV</Label>
        <Input 
          id="submission" 
          type="file" 
          accept=".csv"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          required 
        />
      </div>
      
      {error && <p className="text-red-500 text-sm">{error}</p>}
      
      <Button type="submit" className="w-full" disabled={loading || !file}>
        {loading ? "Scoring..." : "Submit Prediction"}
      </Button>
    </form>
  );
}
