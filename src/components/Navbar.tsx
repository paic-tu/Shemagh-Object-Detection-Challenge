
"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Code2, Users } from "lucide-react";

export function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4 mx-auto">
        <Link href="/" className="flex items-center space-x-2 font-bold text-xl mr-8">
          <Trophy className="h-6 w-6 text-primary" />
          <span>DataComp</span>
        </Link>
        
        <div className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <Link href="/competitions" className="transition-colors hover:text-foreground/80 text-foreground/60">
            Competitions
          </Link>
          <Link href="/datasets" className="transition-colors hover:text-foreground/80 text-foreground/60">
            Datasets
          </Link>
          <Link href="/leaderboard" className="transition-colors hover:text-foreground/80 text-foreground/60">
            Leaderboard
          </Link>
        </div>

        <div className="ml-auto flex items-center space-x-4">
          {session ? (
            <>
              {session.user.role === "ADMIN" && (
                <Button asChild variant="outline" size="sm" className="hidden sm:flex">
                  <Link href="/competitions/create">
                    <Code2 className="mr-2 h-4 w-4" />
                    Create Competition
                  </Link>
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger className="outline-none">
                  <div className="relative h-10 w-10 rounded-full cursor-pointer hover:opacity-80 transition-opacity">
                    <Avatar className="h-10 w-10 border-2 border-primary/10">
                      <AvatarImage 
                        src={session.user.image || `https://api.dicebear.com/9.x/avataaars/svg?seed=${session.user.name}`} 
                        alt={session.user.name || ""} 
                      />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {session.user.name?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{session.user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {session.user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings">Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()} className="text-red-600 focus:text-red-600 cursor-pointer">
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm">
                <Link href="/auth/signin">Login</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/auth/register">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
