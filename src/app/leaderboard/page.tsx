
import { Button } from "@/components/ui/button";
import { Trophy, Medal } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  // Fetch users with their submissions to calculate points/ranking
  // This is a simplified ranking: Total number of submissions (just as an example metric)
  // In a real app, you'd calculate points based on competition ranks.
  
  const users = await prisma.user.findMany({
    include: {
      submissions: {
        select: {
          id: true,
          score: true,
          competitionId: true,
        }
      }
    }
  });

  // Calculate stats per user
  const rankings = users.map(user => {
    const totalSubmissions = user.submissions.length;
    // Simple point system: 10 points per submission (placeholder logic)
    const points = totalSubmissions * 10; 
    
    return {
      id: user.id,
      name: user.name || "Anonymous",
      email: user.email,
      // @ts-ignore
      avatar: user.image,
      points,
      competitionsCount: new Set(user.submissions.map(s => s.competitionId)).size,
      totalSubmissions
    };
  }).sort((a, b) => b.points - a.points); // Sort by points desc

  return (
    <div className="container py-10 space-y-8">
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <div className="rounded-full bg-yellow-100 p-4 dark:bg-yellow-900/20">
          <Trophy className="h-10 w-10 text-yellow-600 dark:text-yellow-500" />
        </div>
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl">Global Leaderboard</h1>
        <p className="text-muted-foreground max-w-[600px]">
          Top data scientists ranked by their contributions and performance across all competitions.
        </p>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Rank</TableHead>
              <TableHead>User</TableHead>
              <TableHead className="text-right">Competitions</TableHead>
              <TableHead className="text-right">Submissions</TableHead>
              <TableHead className="text-right">Points</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rankings.map((user, index) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  {index + 1 === 1 && <Medal className="h-5 w-5 text-yellow-500 inline mr-1" />}
                  {index + 1 === 2 && <Medal className="h-5 w-5 text-gray-400 inline mr-1" />}
                  {index + 1 === 3 && <Medal className="h-5 w-5 text-amber-600 inline mr-1" />}
                  {index + 1 > 3 && <span className="ml-6">{index + 1}</span>}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar || ""} />
                      <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium">{user.name}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right">{user.competitionsCount}</TableCell>
                <TableCell className="text-right">{user.totalSubmissions}</TableCell>
                <TableCell className="text-right font-bold">{user.points}</TableCell>
              </TableRow>
            ))}
            {rankings.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                  No ranked users yet. Start competing!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
