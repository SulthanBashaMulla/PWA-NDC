import { useAuth } from '@/context/AuthContext';
import { LogOut, ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/dashboard';

  return (
    <nav className="glass-strong sticky top-0 z-50 flex items-center justify-between px-4 py-3 md:px-6">
      <div className="flex items-center gap-3">
        {!isHome && (
          <button onClick={() => navigate(-1)} className="rounded-md p-1.5 text-foreground/70 transition hover:bg-primary/10 hover:text-primary">
            <ArrowLeft size={20} />
          </button>
        )}
        <img src="/ndc-logo.png" alt="NDC Logo" className="h-9 w-9 rounded-full object-cover ring-2 ring-primary/20" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        <div>
          <h1 className="font-heading text-sm font-semibold leading-tight text-foreground">National Degree College</h1>
          <p className="text-xs text-muted-foreground">Nandyal</p>
        </div>
      </div>
      {user && (
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium text-foreground">{user.name}</p>
            <p className="text-xs capitalize text-muted-foreground">{user.role}</p>
          </div>
          <button onClick={logout} className="rounded-lg p-2 text-destructive/70 transition hover:bg-destructive/10 hover:text-destructive" title="Logout">
            <LogOut size={18} />
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
