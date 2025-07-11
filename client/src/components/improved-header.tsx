import { useAuth } from "@/hooks/useAuth";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, Settings, LogOut, ChevronDown } from "lucide-react";

export function ImprovedHeader() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return "U";
  };

  const getUserDisplayName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return "User";
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/">
              <a className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">P</span>
                </div>
                <span className="ml-3 text-xl font-bold text-gray-900">Ping Me</span>
              </a>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/">
              <a className={`transition-colors font-medium ${
                isActive("/") ? "text-primary" : "text-gray-700 hover:text-primary"
              }`}>
                Home
              </a>
            </Link>
            <Link href="/scout">
              <a className={`transition-colors font-medium ${
                isActive("/scout") ? "text-primary" : "text-gray-700 hover:text-primary"
              }`}>
                Scout
              </a>
            </Link>
            <Link href="/how-it-works">
              <a className={`transition-colors font-medium ${
                isActive("/how-it-works") ? "text-primary" : "text-gray-700 hover:text-primary"
              }`}>
                For Founders
              </a>
            </Link>
            <Link href="/for-vcs">
              <a className={`transition-colors font-medium ${
                isActive("/for-vcs") ? "text-primary" : "text-gray-700 hover:text-primary"
              }`}>
                For VCs
              </a>
            </Link>
            <Link href="/pricing">
              <a className={`transition-colors font-medium ${
                isActive("/pricing") ? "text-primary" : "text-gray-700 hover:text-primary"
              }`}>
                Pricing
              </a>
            </Link>
          </nav>

          {/* Auth Section */}
          <div className="flex items-center space-x-4">
            {isLoading ? (
              <div className="w-8 h-8 border-2 border-gray-200 border-t-primary rounded-full animate-spin"></div>
            ) : !isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <Button 
                  variant="ghost"
                  onClick={() => window.location.href = '/api/login'}
                  className="text-gray-700 hover:text-primary"
                >
                  Sign In
                </Button>
                <Button 
                  onClick={() => window.location.href = '/signup'}
                  className="bg-primary text-white hover:bg-primary/90"
                >
                  Get Started
                </Button>
              </div>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-3 hover:bg-gray-50">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.profileImageUrl} />
                      <AvatarFallback className="bg-primary text-white text-sm">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden sm:block text-left">
                      <div className="text-sm font-medium text-gray-900">
                        {getUserDisplayName()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {user?.userType === 'vc' ? 'VC Partner' : 'Founder'}
                      </div>
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div>
                      <div className="font-medium">{getUserDisplayName()}</div>
                      <div className="text-sm text-gray-500">{user?.email}</div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => window.location.href = '/profile'}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => window.location.href = '/settings'}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => window.location.href = '/api/logout'}
                    className="text-red-600 focus:text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}