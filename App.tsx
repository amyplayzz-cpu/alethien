import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Admin from "@/pages/admin";
import Teacher from "@/pages/teacher";
import LandingPage from "@/pages/landing";
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";
import { useAuth } from "@/hooks/useAuth";

function ProtectedRoute({ component: Component, role, ...rest }: any) {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <LoginPage />;
  }
  
  if (role && user?.role !== role) {
    return <NotFound />;
  }
  
  return <Component {...rest} />;
}

function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
      <Footer />
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/home">
        {() => (
          <AuthenticatedLayout>
            <Home />
          </AuthenticatedLayout>
        )}
      </Route>
      <Route path="/admin">
        {() => (
          <AuthenticatedLayout>
            <ProtectedRoute component={Admin} role="admin" />
          </AuthenticatedLayout>
        )}
      </Route>
      <Route path="/teacher">
        {() => (
          <AuthenticatedLayout>
            <ProtectedRoute component={Teacher} role="teacher" />
          </AuthenticatedLayout>
        )}
      </Route>
      <Route>
        {() => (
          <AuthenticatedLayout>
            <NotFound />
          </AuthenticatedLayout>
        )}
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <TooltipProvider>
      <Toaster />
      <Router />
    </TooltipProvider>
  );
}

export default App;
