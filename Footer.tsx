import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-accent text-white py-6 mt-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <div className="font-heading font-bold text-xl">Alethien</div>
            <div className="text-tertiary text-sm mt-1">Smart Assessment Scheduling</div>
          </div>
          <div className="flex space-x-6">
            <Link href="#" className="text-white hover:text-tertiary transition">Help</Link>
            <Link href="#" className="text-white hover:text-tertiary transition">Privacy</Link>
            <Link href="#" className="text-white hover:text-tertiary transition">Terms</Link>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-primary text-center text-sm text-tertiary">
          © {new Date().getFullYear()} Alethien. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
