import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "../pages/Home/Home";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import Problems from "../pages/Problems/Problems";
import ProblemDetails from "../pages/ProblemDetails/ProblemDetails";
import Profile from "../pages/Profile/Profile";
import Submissions from "../pages/Submissions/Submissions";
import SubmissionDetails from "../pages/Submissions/SubmissionDetails";
import AdminDashboard from "../pages/Admin/AdminDashboard";
import AdminProblems from "../pages/Admin/AdminProblems";
import AdminUsers from "../pages/Admin/AdminUsers";
import AdminSubmissions from "../pages/Admin/AdminSubmissions";
import ProtectedRoute from "../components/common/ProtectedRoute";
import AdminRoute from "../components/common/AdminRoute.jsx";
import MainLayout from "../layouts/MainLayout";
import AdminLayout from "../layouts/AdminLayout.jsx";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/problems" element={<Problems />} />
          <Route path="/problems/:id" element={<ProblemDetails />} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/submissions" element={<ProtectedRoute><Submissions /></ProtectedRoute>} />
          <Route path="/submissions/:id" element={<ProtectedRoute><SubmissionDetails /></ProtectedRoute>} />
          <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="problems" element={<AdminProblems />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="submissions" element={<AdminSubmissions />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
