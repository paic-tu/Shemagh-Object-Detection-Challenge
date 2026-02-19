
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Database, Download, ExternalLink, Calendar, User } from "lucide-react";
import Link from "next/link";

export default function DatasetsPage() {
  const datasets = [
    {
      id: "shemagh-challenge",
      title: "Shemagh Challenge Dataset",
      description: "A comprehensive dataset for classifying different types of Shemagh patterns. Ideal for computer vision and image classification tasks.",
      author: "Mohsen Alghamdi",
      updated: "2024-02-18",
      size: "1.2 GB",
      kaggleLink: "https://www.kaggle.com/datasets/mohsen0alghamdi/shemagh-challenge",
      installCommand: 'kagglehub.dataset_download("mohsen0alghamdi/shemagh-challenge")'
    },
    // Add more datasets here in the future
  ];

  return (
    <div className="container py-10 space-y-8">
      <div className="flex flex-col space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Datasets</h1>
        <p className="text-muted-foreground max-w-2xl">
          Discover, analyze, and share high-quality data. Explore our featured datasets below.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {datasets.map((dataset) => (
          <Card key={dataset.id} className="flex flex-col hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start gap-2">
                <CardTitle className="line-clamp-1 text-xl">{dataset.title}</CardTitle>
                <Badge variant="secondary">Public</Badge>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                {dataset.description}
              </p>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>{dataset.author}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Database className="h-4 w-4" />
                  <span>{dataset.size}</span>
                </div>
              </div>
              
              <div className="bg-muted p-3 rounded-md font-mono text-xs overflow-x-auto whitespace-nowrap">
                <code className="select-all">{dataset.installCommand}</code>
              </div>
            </CardContent>
            <CardFooter className="gap-2">
              <Button asChild className="w-full">
                <Link href={`/datasets/${dataset.id}`}>
                  View Details
                </Link>
              </Button>
              <Button asChild variant="outline" size="icon">
                <a href={dataset.kaggleLink} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
