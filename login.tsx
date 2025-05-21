import { LoginForm } from "@/components/auth/LoginForm";
import { BrainCircuit } from "lucide-react";
import { Link } from "wouter";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/20">
      <header className="container mx-auto px-4 py-8">
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer">
            <BrainCircuit className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Alethien</h1>
          </div>
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <LoginForm />
      </div>

      <footer className="py-6 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Beteseb Academy. All rights reserved.</p>
      </footer>
    </div>
  );
}