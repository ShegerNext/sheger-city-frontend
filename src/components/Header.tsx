"use client";

import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
  OrganizationSwitcher,
} from "@clerk/nextjs";
import { useLanguage } from "@/context/LanguageContext";
import { headerTranslation } from "@/Translation/headerTranslation";
import { ChangeEvent } from "react";

export function Header() {
  const { lang, setLang } = useLanguage();
  const t = headerTranslation[lang];

  const handleLangChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setLang(event.target.value as "en" | "am" | "om");
  };

  return (
    <header className="flex justify-between items-center p-4 h-16 shadow-sm border-b">
      <h1 className="text-2xl font-extrabold bg-gradient-to-r from-primary-dark to-primary-light text-transparent bg-clip-text">
        {t.title}
      </h1>

      <nav className="flex items-center gap-3">
        <SignedOut>
          <SignInButton mode="modal">
            <button className="text-sm font-medium hover:underline">
              {t.signIn}
            </button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className="bg-[#6c47ff] text-white rounded-full font-medium text-sm h-10 px-4 cursor-pointer">
              {t.signUp}
            </button>
          </SignUpButton>
        </SignedOut>

        {/* The dropdown for language selection */}
        <select
          value={lang}
          onChange={handleLangChange}
          className="bg-white border rounded-md p-2 text-sm"
        >
          <option value="en">English</option>
          <option value="am">አማርኛ</option>
          <option value="om">Afaan Oromoo</option>
        </select>

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
