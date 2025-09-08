"use client";

import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
  OrganizationSwitcher,
} from "@clerk/nextjs";

export function Header() {
  return (
    <header className="flex justify-between items-center p-4 h-16 shadow-sm border-b">
      <h1 className="text-2xl font-extrabold bg-gradient-to-r from-primary-dark to-primary-light text-transparent bg-clip-text">
          ShegerNext
        </h1>

      <nav className="flex items-center gap-3">
        <SignedOut>
          <SignInButton mode="modal">
            <button className="text-sm font-medium hover:underline">
              Sign In
            </button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className="bg-[#6c47ff] text-white rounded-full font-medium text-sm h-10 px-4 cursor-pointer">
              Sign Up
            </button>
          </SignUpButton>
        </SignedOut>

        <SignedIn>
          <OrganizationSwitcher
            appearance={{
              elements: {
                organizationSwitcherTrigger:
                  "px-3 py-1.5 text-sm border rounded-md hover:bg-muted/50",
              },
            }}
          />
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
      </nav>
    </header>
  );
}
