
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users } from "lucide-react";

interface CompetitionCardProps {
  competition: {
    id: string;
    title: string;
    description: string;
    metric: string;
    deadline: Date;
    _count: {
      submissions: number;
    };
  };
}

export function CompetitionCard({ competition }: CompetitionCardProps) {
  return (
    <Card className="flex flex-col h-full hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
          <CardTitle className="line-clamp-1 text-xl">{competition.title}</CardTitle>
          <Badge variant={competition.metric === "ACCURACY" ? "default" : "secondary"}>
            {competition.metric}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
          {competition.description}
        </p>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span suppressHydrationWarning>{new Date(competition.deadline).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{competition._count.submissions} submissions</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/competitions/${competition.id}`}>View Competition</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
