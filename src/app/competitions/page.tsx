
import { prisma } from "@/lib/prisma";
import { CompetitionCard } from "@/components/CompetitionCard";
import { Button } from "@/components/ui/button";
import { Trophy, Plus } from "lucide-react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function CompetitionsPage() {
  const session = await getServerSession(authOptions);
  
  const competitions = await prisma.competition.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { submissions: true } } },
  });

  return (
    <div className="container py-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Competitions</h1>
          <p className="text-muted-foreground mt-2">
            Explore active data science challenges and compete for the top spot.
          </p>
        </div>
        
        {session && (
          <Button asChild>
            <Link href="/competitions/create">
              <Plus className="mr-2 h-4 w-4" /> Host Competition
            </Link>
          </Button>
        )}
      </div>

      {competitions.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed rounded-xl bg-muted/30">
          <Trophy className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium">No competitions found</h3>
          <p className="text-muted-foreground mt-2">
            {session 
              ? "Be the first to host a competition!" 
              : "Check back later for new challenges."}
          </p>
          {session && (
            <Button asChild className="mt-6">
              <Link href="/competitions/create">Create Competition</Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {competitions.map((comp) => (
            <CompetitionCard key={comp.id} competition={comp} />
          ))}
        </div>
      )}
    </div>
  );
}
