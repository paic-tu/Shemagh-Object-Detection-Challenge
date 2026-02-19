import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CompetitionCard } from "@/components/CompetitionCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, Trophy } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function Home() {
  const competitions = await prisma.competition.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { submissions: true } } },
    take: 6, // Limit to 6 for the homepage
  });

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="py-20 md:py-32 text-center space-y-6 bg-gradient-to-b from-background to-muted/20">
        <div className="container px-4 md:px-6">
          <div className="flex justify-center mb-6">
            <div className="rounded-full bg-primary/10 p-4 ring-1 ring-primary/20">
              <Trophy className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60 pb-2">
            Welcome to DataComp
          </h1>
          <p className="mx-auto max-w-[700px] text-muted-foreground text-xl md:text-2xl leading-relaxed">
            The ultimate platform for data science competitions. Host datasets, build models, and climb the global leaderboard.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
            <Button asChild size="lg" className="h-12 px-8 text-lg">
              <Link href="/competitions">
                Browse Competitions <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 px-8 text-lg">
              <Link href="/datasets">Explore Datasets</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Competitions Section */}
      <section className="py-16 bg-muted/10">
        <div className="container px-4 md:px-6">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Active Competitions</h2>
              <p className="text-muted-foreground mt-2">Join the latest challenges and test your skills.</p>
            </div>
            <Button asChild variant="ghost" className="hidden md:flex">
              <Link href="/competitions">View all <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
          
          {competitions.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed rounded-xl bg-muted/30">
              <Trophy className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium">No active competitions</h3>
              <p className="text-muted-foreground">Check back later for new challenges.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {competitions.map((comp) => (
                <CompetitionCard key={comp.id} competition={comp} />
              ))}
            </div>
          )}
          
          <div className="mt-8 text-center md:hidden">
            <Button asChild variant="outline" className="w-full">
              <Link href="/competitions">View all competitions</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container px-4 md:px-6">
          <div className="grid gap-12 lg:grid-cols-3 text-center">
            <div className="space-y-4">
              <div className="mx-auto rounded-full bg-blue-100 p-4 w-16 h-16 flex items-center justify-center dark:bg-blue-900/20">
                <svg className="h-8 w-8 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-xl font-bold">Diverse Datasets</h3>
              <p className="text-muted-foreground">Access a wide range of high-quality datasets for training and testing your models.</p>
            </div>
            <div className="space-y-4">
              <div className="mx-auto rounded-full bg-green-100 p-4 w-16 h-16 flex items-center justify-center dark:bg-green-900/20">
                <svg className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold">Real-time Leaderboards</h3>
              <p className="text-muted-foreground">Track your performance against other data scientists with instant feedback.</p>
            </div>
            <div className="space-y-4">
              <div className="mx-auto rounded-full bg-purple-100 p-4 w-16 h-16 flex items-center justify-center dark:bg-purple-900/20">
                <svg className="h-8 w-8 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold">Community Driven</h3>
              <p className="text-muted-foreground">Collaborate, share insights, and learn from a global community of experts.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
