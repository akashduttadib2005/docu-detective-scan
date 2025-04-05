
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { FileSearch } from "lucide-react";

const Navbar = () => {
  const { currentUser, logout } = useAuth();

  return (
    <div className="border-b">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <FileSearch className="h-6 w-6 text-brand-500" />
          <Link to="/" className="font-bold text-xl text-brand-600">DocuDetective</Link>
        </div>
        <nav className="flex items-center gap-4">
          {currentUser ? (
            <>
              <div className="text-sm text-muted-foreground">
                Credits: <span className="font-bold text-foreground">{currentUser.creditsRemaining}</span>
              </div>
              <Link to="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
              {currentUser.isAdmin && (
                <Link to="/admin">
                  <Button variant="ghost">Admin</Button>
                </Link>
              )}
              <Button variant="outline" onClick={logout}>Logout</Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link to="/register">
                <Button variant="default">Register</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </div>
  );
};

export default Navbar;
