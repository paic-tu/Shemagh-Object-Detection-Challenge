
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SettingsForm from "./SettingsForm";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
  });

  return (
    <div className="container py-10 space-y-8">
      <div className="flex items-center gap-4 border-b pb-6">
        <div className="rounded-full bg-primary/10 p-3">
          <Settings className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
          <p className="text-muted-foreground">Manage your profile and preferences.</p>
        </div>
      </div>

      <div className="grid gap-6">
        <SettingsForm user={user} />
      </div>
    </div>
  );
}
