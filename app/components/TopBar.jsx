"use client";

import React from "react";
import { Search, Bell } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import WeatherWidget from "./WeatherWidget";

export default function TopBar({ currentPage = "Dashboard", showSearch = true }) {
  return (
    <header className="h-20 bg-[#0b0b0c] border-b border-white/5 flex items-center justify-between px-8 z-40">
      <div className="flex items-center gap-6">
        <h1 className="text-sm font-medium tracking-wide text-gray-200 uppercase">
          Console <span className="text-gray-500">/ {currentPage}</span>
        </h1>

        {showSearch && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              placeholder="Search commands…"
              className="bg-[#111113] border border-white/5 rounded-lg pl-10 pr-4 py-2 text-sm w-64
              placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-orange-500/30 text-white"
            />
          </div>
        )}
      </div>

      <div className="flex items-center gap-5">
        <button className="relative text-gray-400 hover:text-gray-200">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full" />
        </button>

        <div className="flex items-center gap-3 bg-white/5 border border-white/5 rounded-full px-4 py-1">
          <WeatherWidget />
          <div className="w-7 h-7 rounded-full bg-orange-500 text-black flex items-center justify-center text-xs font-bold">
            <UserButton appearance={{ elements: { userButtonAvatarBox: "w-6 h-6" } }} />
          </div>
        </div>
      </div>
    </header>
  );
}
