
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, Download, ExternalLink, User, Calendar, FileCode, Copy, Check } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import CopyButton from "./CopyButton";

// This would typically come from a database or API
const datasets = {
  "shemagh-challenge": {
    id: "shemagh-challenge",
    title: "Shemagh Challenge Dataset",
    description: "A comprehensive dataset for classifying different types of Shemagh patterns (Red, White, etc.). This dataset is curated for the Shemagh Challenge competition and contains labeled images suitable for training deep learning models.",
    author: "Mohsen Alghamdi",
    updated: "2024-02-18",
    size: "1.2 GB",
    license: "CC BY-SA 4.0",
    files: [
      { name: "train.csv", size: "15 MB", type: "csv" },
      { name: "test.csv", size: "5 MB", type: "csv" },
      { name: "images/", size: "1.1 GB", type: "folder" },
    ],
    kaggleLink: "https://www.kaggle.com/datasets/mohsen0alghamdi/shemagh-challenge",
    installCommand: 'path = kagglehub.dataset_download("mohsen0alghamdi/shemagh-challenge")',
    usageExample: `import kagglehub

# Download latest version
path = kagglehub.dataset_download("mohsen0alghamdi/shemagh-challenge")

print("Path to dataset files:", path)`
  }
};

export default function DatasetDetailPage({ params }: { params: { id: string } }) {
  const dataset = datasets[params.id as keyof typeof datasets];

  if (!dataset) {
    notFound();
  }

  return (
    <div className="container py-10 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/datasets" className="hover:underline">Datasets</Link>
          <span>/</span>
          <span>{dataset.author}</span>
          <span>/</span>
          <span className="text-foreground font-medium">{dataset.id}</span>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">{dataset.title}</h1>
            <p className="text-muted-foreground max-w-3xl">{dataset.description}</p>
          </div>
          <div className="flex gap-2">
            <Button asChild>
              <a href={dataset.kaggleLink} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" /> View on Kaggle
              </a>
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground border-b pb-6">
          <div className="flex items-center gap-1">
            <User className="h-4 w-4" />
            <span>{dataset.author}</span>
          </div>
          <div className="flex items-center gap-1">
            <Database className="h-4 w-4" />
            <span>{dataset.size}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>Updated {dataset.updated}</span>
          </div>
          <Badge variant="outline">{dataset.license}</Badge>
        </div>
      </div>

      {/* Content */}
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <Tabs defaultValue="card" className="w-full">
            <TabsList>
              <TabsTrigger value="card">Data Card</TabsTrigger>
              <TabsTrigger value="code">Usage</TabsTrigger>
            </TabsList>
            
            <TabsContent value="card" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>About this dataset</CardTitle>
                </CardHeader>
                <CardContent className="prose dark:prose-invert max-w-none">
                  <p>
                    This dataset contains high-quality images of various Shemagh patterns collected for the purpose of fine-grained image classification.
                  </p>
                  <h3>Content</h3>
                  <ul>
                    <li><strong>Images:</strong> Over 5,000 labeled images.</li>
                    <li><strong>Classes:</strong> Red Shemagh, White Shemagh, Other patterns.</li>
                    <li><strong>Format:</strong> JPG/PNG images with CSV metadata.</li>
                  </ul>
                  <h3>Acknowledgements</h3>
                  <p>
                    Special thanks to the contributors and the open-source community for making this dataset available.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>File Explorer</CardTitle>
                  <CardDescription>{dataset.files.length} files ({dataset.size})</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-md divide-y">
                    {dataset.files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 hover:bg-muted/50">
                        <div className="flex items-center gap-3">
                          <FileCode className="h-5 w-5 text-muted-foreground" />
                          <span className="font-mono text-sm">{file.name}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{file.size}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="code" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>How to use</CardTitle>
                  <CardDescription>
                    Use the <code>kagglehub</code> library to download this dataset in Python.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Install Library</label>
                    <div className="bg-muted p-3 rounded-md font-mono text-sm flex justify-between items-center">
                      <code>pip install kagglehub</code>
                      <CopyButton text="pip install kagglehub" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Download Dataset</label>
                    <div className="relative">
                      <pre className="bg-muted p-4 rounded-md font-mono text-sm overflow-x-auto">
                        <code>{dataset.usageExample}</code>
                      </pre>
                      <div className="absolute top-2 right-2">
                        <CopyButton text={dataset.usageExample} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Download</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg border text-center">
                <Database className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="font-medium">{dataset.size}</p>
                <p className="text-xs text-muted-foreground">Compressed Size</p>
              </div>
              <Button className="w-full" asChild>
                <a href={dataset.kaggleLink} target="_blank" rel="noopener noreferrer">
                  <Download className="mr-2 h-4 w-4" /> Download via Kaggle
                </a>
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Computer Vision</Badge>
                <Badge variant="secondary">Classification</Badge>
                <Badge variant="secondary">Fashion</Badge>
                <Badge variant="secondary">Culture</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
