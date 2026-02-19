
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">DataComp</h3>
            <p className="text-sm text-muted-foreground">
              The ultimate platform for data science competitions. Host datasets, build models, and climb the leaderboard.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-3">Platform</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/" className="hover:text-primary">Competitions</Link></li>
              <li><Link href="/datasets" className="hover:text-primary">Datasets</Link></li>
              <li><Link href="/leaderboard" className="hover:text-primary">Leaderboard</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-3">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/docs" className="hover:text-primary">Documentation</Link></li>
              <li><Link href="/blog" className="hover:text-primary">Blog</Link></li>
              <li><Link href="/support" className="hover:text-primary">Support</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-3">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/privacy" className="hover:text-primary">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-primary">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} DataComp. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
