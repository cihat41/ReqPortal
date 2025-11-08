import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';
import theme from './theme';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Requests from './pages/Requests';
import CreateRequest from './pages/CreateRequest';
import EditRequest from './pages/EditRequest';
import RequestDetail from './pages/RequestDetail';
import Approvals from './pages/Approvals';
import MainLayout from './components/layout/MainLayout';
import FormTemplates from './pages/FormTemplates';
import FormTemplateBuilder from './pages/FormTemplateBuilder';
import UserManagement from './pages/UserManagement';
import AuditLogs from './pages/AuditLogs';
import WorkflowManagement from './pages/WorkflowManagement';
import WorkflowBuilder from './pages/WorkflowBuilder';
import EmailTemplates from './pages/EmailTemplates';
import EmailSettings from './pages/EmailSettings';
import Reports from './pages/Reports';
import ProtectedRoute from './components/common/ProtectedRoute';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="requests" element={<Requests />} />
              <Route path="requests/create" element={<CreateRequest />} />
              <Route path="requests/:id" element={<RequestDetail />} />
              <Route path="requests/:id/edit" element={<EditRequest />} />
              <Route path="approvals" element={<Approvals />} />
              <Route path="admin/form-templates" element={<FormTemplates />} />
              <Route path="admin/form-templates/new" element={<FormTemplateBuilder />} />
              <Route path="admin/form-templates/:id/edit" element={<FormTemplateBuilder />} />
              <Route path="admin/users" element={<UserManagement />} />
              <Route path="admin/audit-logs" element={<AuditLogs />} />
              <Route path="admin/workflows" element={<WorkflowManagement />} />
              <Route path="admin/workflows/new" element={<WorkflowBuilder />} />
              <Route path="admin/workflows/:id/edit" element={<WorkflowBuilder />} />
              <Route path="admin/email-templates" element={<EmailTemplates />} />
              <Route path="admin/email-settings" element={<EmailSettings />} />
              <Route path="admin/reports" element={<Reports />} />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

