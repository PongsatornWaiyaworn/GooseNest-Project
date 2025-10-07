import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Forgetpassword from "./pages/ForgetPassword";
import CreateProfile from "./pages/CreateProfile";
import Profile from "./pages/Profile";
import ProfileEdit from "./pages/ProfileEdit";
import HowToUse from "./pages/HowToUse";
import ReportIssue from "./pages/ReportIssue";
import Settings from "./pages/Setting";
import Contact from "./pages/Contect";
import Sell from "./pages/Sell";
import Buy from "./pages/Buy";
import Privacy from "./pages/Privacy";
import TradeLearning from "./pages/TradeLearning";
import Chat from "./pages/Chat";
import { NotificationProvider } from "./context/NotificationProvider";
import PrivateRoute from "./components/PrivateRoute";
import MyPurchases from "./pages/MyPurchases";

const queryClient = new QueryClient();

const SIDEBAR_PATHS = ["/", "/profile", "/settings", "/report-issue", "/instructions-and-rules", "/sell", "/buy", "/chat", "/mypurchases"];

const AppContent: React.FC = () => {
  const location = useLocation();
  const showSidebar = SIDEBAR_PATHS.includes(location.pathname);
  return (
    <div className="flex min-h-screen w-full overflow-x-hidden">
      {showSidebar && <Sidebar />}
      <main className={`flex-1 ${showSidebar ? "lg:ml-16" : ""} w-full min-w-0`}>
      <Routes>
        <Route path="/profile" element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        } />
        <Route path="/settings" element={
          <PrivateRoute>
            <Settings />
          </PrivateRoute>
        } />
        <Route path="/report-issue" element={
          <PrivateRoute>
            <ReportIssue />
          </PrivateRoute>
        } />
        <Route path="/instructions-and-rules" element={
          <PrivateRoute>
            <HowToUse />
          </PrivateRoute>
        } />
        <Route path="/sell" element={
          <PrivateRoute>
            <Sell />
          </PrivateRoute>
        } />
        <Route path="/sell/tradelearning" element={
          <PrivateRoute>
            <TradeLearning />
          </PrivateRoute>
        } />
        <Route path="/buy" element={
          <PrivateRoute>
            <Buy />
          </PrivateRoute>
        } />
        <Route path="/chat" element={
          <PrivateRoute>
            <Chat />
          </PrivateRoute>
        } />

        <Route path="/profile/edit" element={
          <PrivateRoute>
            <ProfileEdit />
          </PrivateRoute>
        } />

        <Route path="/mypurchases" element={
          <PrivateRoute>
            <MyPurchases />
          </PrivateRoute>
        } />

        {/* Public Routes */}
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgetpassword" element={<Forgetpassword />} />
        <Route path="/createprofile" element={<CreateProfile />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <AuthProvider>
            <NotificationProvider>
              <AppContent />
            </NotificationProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
