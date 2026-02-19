
"use client";

import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteCompetitionButton({ competitionId }: { competitionId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this competition? This action cannot be undone.")) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/competitions/${competitionId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete competition");
      }

      router.push("/");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Error deleting competition");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="destructive" onClick={handleDelete} disabled={loading}>
      <Trash2 className="mr-2 h-4 w-4" />
      {loading ? "Deleting..." : "Delete Competition"}
    </Button>
  );
}
