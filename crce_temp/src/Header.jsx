import React, { useState } from 'react';
import { Link } from "react-router-dom";
import { 
  Workflow, 
  LayoutTemplate, 
  CreditCard, 
  Sparkles,
  Menu,
  User,
  ClipboardList
} from "lucide-react";

export default function Header() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="flex justify-between items-center py-4 px-6">
        {/* Logo */}
        <Link 
          to={'/'} 
          className="flex items-center gap-2 transition-transform hover:scale-105"
        >
          <img src="../src/assets/logo.png" alt="Logo" className="w-8 h-8" />
          <span className="font-bold text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            FlowSync
          </span>
        </Link>

        {/* Navbar Links */}
        <nav className="hidden md:flex gap-8 text-base font-medium">
          <Link 
            to="/page1" 
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <Workflow className="w-4 h-4" />
            <span>WorkFlows</span>
          </Link>
          
          <Link 
            to="/template" 
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <LayoutTemplate className="w-4 h-4" />
            <span>Templates</span>
          </Link>
          
          <Link 
            to="/purchase" 
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <CreditCard className="w-4 h-4" />
            <span>Purchase</span>
          </Link>

          <Link 
            to="/tasks" 
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <ClipboardList className="w-4 h-4" />
            <span>Manage Tasks</span>
          </Link>
          
          <Link 
            to="/ai-prompt" 
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Prompt</span>
          </Link>
        </nav>

        {/* Profile & Menu */}
        <div className="relative flex items-center gap-4">
          <button 
            className="hidden md:flex items-center gap-3 border border-gray-200 rounded-full py-2 px-4 hover:shadow-md transition-shadow bg-white"
            onClick={toggleDropdown}
          >
            <Menu className="w-5 h-5 text-gray-600" />
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full p-1">
              <User className="w-5 h-5" />
            </div>
          </button>
          
          {/* Mobile Menu Button */}
          <button className="md:hidden rounded-full p-2 hover:bg-gray-100" onClick={toggleDropdown}>
            <Menu className="w-6 h-6 text-gray-600" />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg">
              <Link 
                to="/notes" 
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                onClick={() => setIsDropdownOpen(false)}
              >
                Notes
              </Link>
              <Link 
                to="/profile" 
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                onClick={() => setIsDropdownOpen(false)}
              >
                Profile
              </Link>
              {/* Add more links as needed */}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};