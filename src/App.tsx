import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import Trials from "./pages/Trials";
import Enrollments from "./pages/Enrollments";
import Visits from "./pages/Visits";
import Measurements from "./pages/Measurements";
import Medications from "./pages/Medications";
import Outcomes from "./pages/Outcomes";
import StaffSites from "./pages/StaffSites";
import PatientHistory from "./pages/PatientHistory";
import TestPage from "./pages/Testpage";
import NotFound from "./pages/NotFound";
import Signup from "./pages/Signup";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/patients" element={<ProtectedRoute><Patients /></ProtectedRoute>} />
            <Route path="/patients/:id" element={<ProtectedRoute><PatientHistory /></ProtectedRoute>} />
            <Route path="/trials" element={<ProtectedRoute><Trials /></ProtectedRoute>} />
            <Route path="/enrollments" element={<ProtectedRoute><Enrollments /></ProtectedRoute>} />
            <Route path="/visits" element={<ProtectedRoute><Visits /></ProtectedRoute>} />
            <Route path="/measurements" element={<ProtectedRoute><Measurements /></ProtectedRoute>} />
            <Route path="/medications" element={<ProtectedRoute><Medications /></ProtectedRoute>} />
            <Route path="/outcomes" element={<ProtectedRoute><Outcomes /></ProtectedRoute>} />
            <Route path="/staff-sites" element={<ProtectedRoute><StaffSites /></ProtectedRoute>} />
            <Route path="/test" element={<TestPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;