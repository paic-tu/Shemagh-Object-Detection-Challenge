
import { Button } from "@/components/ui/button";
import { User, Trophy, Calendar } from "lucide-react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  // Fetch user details including submissions and competitions
  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    include: {
      submissions: {
        include: {
          competition: true,
        },
        orderBy: {
          createdAt: 'desc'
        }
      }
    }
  });

  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <div className="container py-10 space-y-8">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-card rounded-lg border shadow-sm">
        <Avatar className="h-24 w-24 border-4 border-primary/10">
          <AvatarImage 
            src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${user.name}`} 
            alt={user.name || "User Avatar"} 
          />
          <AvatarFallback className="text-2xl">{user.name?.[0]?.toUpperCase() || "U"}</AvatarFallback>
        </Avatar>
        <div className="text-center md:text-left space-y-2">
          <h1 className="text-3xl font-bold">{user.name}</h1>
          <p className="text-muted-foreground">{user.email}</p>
          <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="ml-auto flex gap-3">
          <Button asChild variant="outline">
             <Link href="/settings">Edit Profile</Link>
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.submissions.length}</div>
          </CardContent>
        </Card>
        {/* Add more stats here if needed */}
      </div>

      {/* Recent Activity / Submissions */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Recent Submissions</h2>
        {user.submissions.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">No submissions yet.</p>
            <Button asChild variant="link" className="mt-2">
              <Link href="/competitions">Browse Competitions</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {user.submissions.map((submission) => (
              <div 
                key={submission.id} 
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div>
                  <h3 className="font-semibold">{submission.competition.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    Submitted on {new Date(submission.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">Score</p>
                    <p className="text-lg font-bold">{submission.score.toFixed(5)}</p>
                  </div>
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/competitions/${submission.competitionId}`}>View</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
