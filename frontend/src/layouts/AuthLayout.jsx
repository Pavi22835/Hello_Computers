import { Link, Outlet } from "react-router-dom";
import logo from "../assets/images/logo.jpeg";

function AuthLayout() {
  return (
    <div className="min-h-screen bg-[var(--surface)]">
      <header className="mx-auto flex h-[76px] max-w-[1280px] items-center px-5 sm:px-8 lg:px-10">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="Hello Computers" className="h-10 w-10 rounded-xl object-cover ring-1 ring-[var(--line)]" />
          <span className="display-heading text-lg font-semibold text-[var(--ink)]">Hello <span className="text-gradient">Computers</span></span>
        </Link>
      </header>
      <Outlet />
    </div>
  );
}

export default AuthLayout;
