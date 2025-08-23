import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";

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

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router>
          <Routes>
            {/* Main Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/role-selection" element={<RoleSelection />} />
            <Route path="/profile-setup" element={<ProfileSetup />} />
            <Route path="/post-gig" element={<PostGig />} />
            <Route path="/freelancers" element={<Freelancers />} />

            {/* Dashboard Routes */}
            <Route path="/client-dashboard" element={<ClientDashboard />} />
            <Route path="/freelancer-dashboard" element={<FreelancerDashboard />} />

            {/* Client Dashboard Pages */}
            <Route path="/my-gigs" element={<MyGigs />} />
            <Route path="/proposals" element={<ProposalsPage />} />
            <Route path="/contracts" element={<Contracts />} />
            
            {/* Freelancer Dashboard Pages */}
            <Route path="/find-gigs" element={<FindGigs />} />
            <Route path="/my-proposals" element={<MyProposals />} />
            <Route path="/my-contracts" element={<MyContracts />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/dispute" element={<Dispute />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/gigs/manage/:gigId" element={<ManageGig />} />
            <Route path="/gigs/:gigId/proposals" element={<ViewProposals />} />
            <Route path="/gigs/:gigId" element={<GigDetails />} />

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
