
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import BlogPost from "./pages/BlogPost";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AdminCreatePost from "./pages/AdminCreatePost";
import Articles from "./pages/Articles";
import Categories from "./pages/Categories";
import CategoriesAdmin from "./pages/CategoriesAdmin";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/articles" element={<Articles />} />
            <Route path="/category/:slug" element={<Categories />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin/create" element={<AdminCreatePost />} />
            <Route path="/admin/edit/:id" element={<AdminCreatePost />} />
            <Route path="/categories-admin" element={<CategoriesAdmin />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
