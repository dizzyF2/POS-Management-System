import { Route, Routes } from "react-router-dom";
import AdminPanel from "./pages/AdminPanel";
import LoginPage from "./pages/LoginPage";
import PosPage from "./pages/PosPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { Toaster } from "react-hot-toast";


function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/pos" element={<PosPage />} />
        <Route
            path="/admin"
            element={
                <ProtectedRoute requiredRole="admin">
                    <AdminPanel />
                </ProtectedRoute>
            }
          />
      </Routes>
      <Toaster
          position="top-center"
          toastOptions={{
              success: {
                style: {
                  background: "green",
                  color: "white",
                  padding: '16px',
                  borderRadius: '8px',
                }
              },
              error: {
                style: {
                  background: "red",
                  color: "white",
                  padding: '16px',
                  borderRadius: '8px',
                }
              }
          }}
        />
    </>
  );
}

export default App;
