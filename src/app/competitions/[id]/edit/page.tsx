
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function EditCompetition({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [metric, setMetric] = useState("");

  useEffect(() => {
    // Fetch competition data
    const fetchCompetition = async () => {
      try {
        // We can use the Next.js API route if available, or fetch from backend via server action/api
        // But here we might not have a direct API to get single competition JSON easily without prisma
        // Let's assume we can fetch it. For now, let's use the same endpoint or a server action.
        // Actually, since this is a client component, let's fetch from our backend directly or via a proxy.
        // Assuming public access or authenticated access.
        
        // Simulating fetch for now or we need an endpoint.
        // Let's use the one we have in page.tsx but exposed as API? 
        // Or just fetch from backend directly since we have CORS enabled.
        const res = await fetch(`/api/competitions/`);
        if (!res.ok) throw new Error("Failed to fetch");
        const competitions = await res.json();
        const comp = competitions.find((c: any) => c.id === params.id);
        
        if (comp) {
            setTitle(comp.title);
            setDescription(comp.description);
            // Format date for input datetime-local
            const d = new Date(comp.deadline);
            d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
            setDeadline(d.toISOString().slice(0, 16));
            setMetric(comp.metric);
        } else {
            setError("Competition not found");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load competition data");
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated") {
        if (session?.user?.role !== "ADMIN") {
            setError("Access Denied");
            setLoading(false);
        } else {
            fetchCompetition();
        }
    } else if (status === "unauthenticated") {
        router.push("/auth/signin");
    }
  }, [status, params.id, session, router]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    formData.append("metric", metric);
    
    // We don't want to send empty files if user didn't select new ones
    const trainFile = formData.get("train_file") as File;
    const solutionFile = formData.get("solution_file") as File;
    
    if (trainFile.size === 0) formData.delete("train_file");
    if (solutionFile.size === 0) formData.delete("solution_file");

    try {
      const response = await fetch(`/api/competitions/${params.id}`, {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: "Failed to update" }));
        throw new Error(errorData.detail || "Failed to update competition");
      }

      router.push(`/competitions/${params.id}`);
      router.refresh();
    } catch (err: any) {
      console.error("Update error:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
      return <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>;
  }

  if (error) {
      return <div className="text-center py-20 text-red-500">{error}</div>;
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Edit Competition</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input 
                id="title" 
                name="title" 
                required 
                placeholder="Competition Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Markdown supported)</Label>
              <Textarea 
                id="description" 
                name="description" 
                required 
                placeholder="Describe the problem..." 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[200px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="deadline">Deadline</Label>
                <Input 
                  id="deadline" 
                  name="deadline" 
                  type="datetime-local" 
                  required 
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="metric">Evaluation Metric</Label>
                <Select value={metric} onValueChange={setMetric}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select metric" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACCURACY">Accuracy</SelectItem>
                    <SelectItem value="MSE">Mean Squared Error</SelectItem>
                    <SelectItem value="RMSE">Root Mean Squared Error (Optional)</SelectItem>
                    <SelectItem value="MAE">Mean Absolute Error (Optional)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="train_file">Update Train Data (Optional)</Label>
              <Input id="train_file" name="train_file" type="file" accept=".csv" />
              <p className="text-xs text-muted-foreground">Leave empty to keep existing file.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="solution_file">Update Solution Data (Optional)</Label>
              <Input id="solution_file" name="solution_file" type="file" accept=".csv" />
              <p className="text-xs text-muted-foreground">Leave empty to keep existing file.</p>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                <Button type="submit" className="flex-1" disabled={submitting}>
                {submitting ? "Updating..." : "Save Changes"}
                </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
