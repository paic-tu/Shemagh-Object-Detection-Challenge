"use client";

import { useState } from "react";
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

export default function CreateCompetition() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [metric, setMetric] = useState("ACCURACY");

  if (!session || session.user.role !== "ADMIN") {
    return <div className="p-8 text-center">Access Denied. Admins only.</div>;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    formData.append("metric", metric); // Manually append metric since Select might not be captured automatically
    
    try {
      const response = await fetch("http://127.0.0.1:8000/competitions/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: "Failed to fetch" }));
        throw new Error(errorData.detail || "Failed to create competition");
      }

      const data = await response.json();
      router.push(`/competitions/${data.id}`);
      router.refresh();
    } catch (err: any) {
      console.error("Submission error:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Create New Competition</CardTitle>
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
                <div className="flex gap-2">
                  <Select value={metric} onValueChange={setMetric}>
                    <SelectTrigger className="w-full">
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
                <p className="text-xs text-muted-foreground mt-1">
                   Only Accuracy and MSE are fully supported. Others are placeholders.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="train_file">Train Data (Public CSV)</Label>
              <Input id="train_file" name="train_file" type="file" accept=".csv" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="solution_file">Solution Data (Hidden CSV)</Label>
              <Input id="solution_file" name="solution_file" type="file" accept=".csv" required />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating..." : "Create Competition"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
