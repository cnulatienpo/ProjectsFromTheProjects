import React from "react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="mt-8 border-t border-neutral-200 dark:border-neutral-800">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-4 text-xs text-neutral-600 dark:text-neutral-400 md:flex-row md:items-center md:justify-between">
        <span>The Good Word · Words, but exact.</span>
        <nav className="flex flex-wrap items-center gap-3">
          <Link to="/privacy" className="hover:underline">
            Privacy
          </Link>
          <Link to="/terms" className="hover:underline">
            Terms
          </Link>
          <Link to="/cookies" className="hover:underline">
            Cookies
          </Link>
          <Link to="/dmca" className="hover:underline">
            DMCA
          </Link>
          <Link to="/about" className="hover:underline">
            About
          </Link>
          <Link to="/contact" className="hover:underline">
            Contact
          </Link>
        </nav>
        <span>v0.1</span>
      </div>
    </footer>
  );
}

export default Footer;
