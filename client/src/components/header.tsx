import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";

export function Header() {
  const { user, isAuthenticated } = useAuth();
  const [location] = useLocation();

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/">
            <a className="flex items-center space-x-2">
              <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Ping Me</span>
            </a>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/">
              <a className={`transition-colors ${isActive("/") ? "text-primary font-medium" : "text-gray-700 hover:text-primary"}`}>
                Home
              </a>
            </Link>
            <Link href="/">
              <a className={`transition-colors ${isActive("/vcs") ? "text-primary font-medium" : "text-gray-700 hover:text-primary"}`}>
                VCs
              </a>
            </Link>
            <Link href="/scout">
              <a className={`transition-colors ${isActive("/scout") ? "text-primary font-medium" : "text-gray-700 hover:text-primary"}`}>
                Scout
              </a>
            </Link>
            <Link href="/for-vcs">
              <a className={`transition-colors ${isActive("/for-vcs") ? "text-primary font-medium" : "text-gray-700 hover:text-primary"}`}>
                For Founders
              </a>
            </Link>
            <Link href="/vc-signup">
              <a className={`transition-colors ${isActive("/vc-signup") ? "text-primary font-medium" : "text-gray-700 hover:text-primary"}`}>
                For VCs
              </a>
            </Link>
            <Link href="/pricing">
              <a className={`transition-colors ${isActive("/pricing") ? "text-primary font-medium" : "text-gray-700 hover:text-primary"}`}>
                Pricing
              </a>
            </Link>
            <Link href="/join">
              <a className={`transition-colors ${isActive("/join") ? "text-primary font-medium" : "text-gray-700 hover:text-primary"}`}>
                Join
              </a>
            </Link>
          </nav>
          
          <div className="flex items-center space-x-4">
            {!isAuthenticated ? (
              <Button 
                onClick={() => window.location.href = '/api/login'}
                className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Sign In
              </Button>
            ) : (
              <>
                <div className="text-sm text-gray-600">
                  Welcome, <Link href="/profile" className="text-primary hover:underline">{user?.firstName || user?.email}</Link>
                </div>
                <Link href="/profile">
                  <a className="text-gray-700 hover:text-primary transition-colors">Profile</a>
                </Link>
                <Button 
                  variant="ghost" 
                  onClick={() => window.location.href = '/api/logout'}
                  className="text-gray-700 hover:text-primary font-medium"
                >
                  Sign Out
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}