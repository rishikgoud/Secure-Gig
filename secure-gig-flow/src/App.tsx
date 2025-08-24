import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { useEffect } from "react";

// Page Imports
import Index from "./pages/Index";
import ClientDashboard from "./pages/ClientDashboard";
import FreelancerDashboard from "./pages/FreelancerDashboard";
import Auth from "./pages/Auth";
import RoleSelection from "./pages/RoleSelection";
import ProfileSetup from "./pages/ProfileSetup";
import PostGig from "./pages/PostGig";
import Freelancers from "./pages/Freelancers";
import Gigs from "./pages/Gigs";
import MyGigs from "./pages/MyGigs";
import Proposals from "./pages/Proposals";
import ProposalsPage from "./pages/ProposalsPage";
import MyProposals from "./pages/MyProposals";
import MyContracts from "./pages/MyContracts";
import FindGigs from "./pages/FindGigs";
import Contracts from "./pages/Contracts";
import Chat from "./pages/Chat";
import Dispute from "./pages/Dispute";
import Settings from "./pages/Settings";
import ManageGig from "./pages/ManageGig";
import ViewProposals from "./pages/ViewProposals";
import GigDetails from "./pages/GigDetails";
import NotFound from "./pages/NotFound";

// Auth Components
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { ProtectedRoute } from "./components/guards/ProtectedRoute";
import { initializeAuthStore } from "./store/authStore";
import { NetworkDebugPage } from "./pages/NetworkDebugPage";
import { WalletGuard } from "./components/guards/WalletGuard";
import { WalletConnectionPage } from "./pages/WalletConnectionPage";

const queryClient = new QueryClient();

const App = () => {
  // Initialize auth store on app start
  useEffect(() => {
    initializeAuthStore();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/debug/network" element={<NetworkDebugPage />} />
            
            {/* Legacy auth route - redirect to login */}
            <Route path="/auth" element={<Auth />} />

            {/* Wallet Connection - requires auth */}
            <Route 
              path="/wallet-connection" 
              element={
                <WalletGuard>
                  <WalletConnectionPage />
                </WalletGuard>
              } 
            />

            {/* Role Selection and Profile Setup - requires auth */}
            <Route 
              path="/role-selection" 
              element={
                <ProtectedRoute>
                  <RoleSelection />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile-setup" 
              element={
                <ProtectedRoute>
                  <ProfileSetup />
                </ProtectedRoute>
              } 
            />

            {/* Protected Dashboard Routes */}
            <Route 
              path="/client-dashboard" 
              element={
                <ProtectedRoute requiredRole="client">
                  <ClientDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/freelancer-dashboard" 
              element={
                <ProtectedRoute requiredRole="freelancer">
                  <FreelancerDashboard />
                </ProtectedRoute>
              } 
            />

            {/* Protected Client Pages */}
            <Route 
              path="/my-gigs" 
              element={
                <ProtectedRoute requiredRole="client">
                  <MyGigs />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/post-gig" 
              element={
                <ProtectedRoute requiredRole="client">
                  <PostGig />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/proposals" 
              element={
                <ProtectedRoute requiredRole="client">
                  <ProposalsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/contracts" 
              element={
                <ProtectedRoute requiredRole="client">
                  <Contracts />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/gigs/manage/:gigId" 
              element={
                <ProtectedRoute requiredRole="client">
                  <ManageGig />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/gigs/:gigId/proposals" 
              element={
                <ProtectedRoute requiredRole="client">
                  <ViewProposals />
                </ProtectedRoute>
              } 
            />

            {/* Protected Freelancer Pages */}
            <Route 
              path="/find-gigs" 
              element={
                <ProtectedRoute requiredRole="freelancer">
                  <FindGigs />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/my-proposals" 
              element={
                <ProtectedRoute requiredRole="freelancer">
                  <MyProposals />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/my-contracts" 
              element={
                <ProtectedRoute requiredRole="freelancer">
                  <MyContracts />
                </ProtectedRoute>
              } 
            />

            {/* Protected Shared Pages */}
            <Route 
              path="/freelancers" 
              element={
                <ProtectedRoute>
                  <Freelancers />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/chat" 
              element={
                <ProtectedRoute>
                  <Chat />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dispute" 
              element={
                <ProtectedRoute>
                  <Dispute />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/gigs/:gigId" 
              element={
                <ProtectedRoute>
                  <GigDetails />
                </ProtectedRoute>
              } 
            />

            {/* 404 Not Found Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
        <Sonner />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
