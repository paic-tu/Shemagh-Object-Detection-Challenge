import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import SubmissionForm from "./SubmissionForm";
import DeleteCompetitionButton from "./DeleteButton";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { CompetitionTimeline } from "./Timeline";
import { Edit } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CompetitionDetail({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const competition = await prisma.competition.findUnique({
    where: { id: params.id },
  });

  if (!competition) {
    notFound();
  }

  // Fetch submissions for leaderboard
  const submissions = await prisma.submission.findMany({
    where: { competitionId: params.id },
    include: { user: true },
    orderBy: { score: competition.metric === "ACCURACY" ? "desc" : "asc" },
  });

  // Process leaderboard: best score per user
  const leaderboard = Object.values(
    submissions.reduce((acc, sub) => {
      if (!acc[sub.userId]) {
        acc[sub.userId] = {
          user: sub.user,
          bestScore: sub.score,
          submissionsCount: 0,
        };
      }
      acc[sub.userId].submissionsCount++;
      
      const isBetter = competition.metric === "ACCURACY" 
        ? sub.score > acc[sub.userId].bestScore 
        : sub.score < acc[sub.userId].bestScore;
        
      if (isBetter) {
        acc[sub.userId].bestScore = sub.score;
      }
      return acc;
    }, {} as Record<string, any>)
  ).sort((a, b) => {
    return competition.metric === "ACCURACY" 
      ? b.bestScore - a.bestScore 
      : a.bestScore - b.bestScore;
  });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">{competition.title}</h1>
          <div className="flex gap-2 mt-2">
            <Badge>{competition.metric}</Badge>
            <Badge variant="outline" suppressHydrationWarning>Deadline: {new Date(competition.deadline).toLocaleDateString()}</Badge>
          </div>
        </div>
        <div className="flex gap-2">
          {session?.user.role === "ADMIN" && (
            <>
              <Button asChild variant="outline">
                <Link href={`/competitions/${competition.id}/edit`}>
                  <Edit className="h-4 w-4 mr-2" /> Edit
                </Link>
              </Button>
              <DeleteCompetitionButton competitionId={competition.id} />
            </>
          )}
          <Button asChild>
            <a href={`/api/competitions/${competition.id}/download`} download>
              Download Data
            </a>
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <CompetitionTimeline 
                startDate={competition.createdAt} 
                endDate={competition.deadline} 
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose dark:prose-invert max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({node, inline, className, children, ...props}: any) {
                      const match = /language-(\w+)/.exec(className || '')
                      return !inline && match ? (
                        <SyntaxHighlighter
                          {...props}
                          style={vscDarkPlus}
                          language={match[1]}
                          PreTag="div"
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      ) : (
                        <code {...props} className={className}>
                          {children}
                        </code>
                      )
                    }
                  }}
                >
                  {competition.description}
                </ReactMarkdown>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Leaderboard</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Score ({competition.metric})</TableHead>
                    <TableHead>Submissions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaderboard.map((entry, index) => (
                    <TableRow key={entry.user.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{entry.user.name || entry.user.email}</TableCell>
                      <TableCell>{entry.bestScore.toFixed(5)}</TableCell>
                      <TableCell>{entry.submissionsCount}</TableCell>
                    </TableRow>
                  ))}
                  {leaderboard.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        No submissions yet. Be the first!
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Submit Predictions</CardTitle>
            </CardHeader>
            <CardContent>
              {session ? (
                <SubmissionForm 
                  competitionId={competition.id} 
                  userId={session.user.id} 
                />
              ) : (
                <div className="text-center py-4">
                  <p className="mb-4 text-muted-foreground">Login to submit your predictions.</p>
                  <Button asChild variant="outline">
                    <Link href={`/auth/signin?callbackUrl=/competitions/${competition.id}`}>
                      Login
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
