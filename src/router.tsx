import { createBrowserRouter } from "react-router";
import App from "./App";
import SignIn from "./components/Login/SignIn";
import SignUp from "./components/Register/SignUp";
import Dashboard from "./routes/Dashboard";
import PrivateRoute from "./components/PrivateRoute";
import ResetRequest from "./components/ResetPassword/ResetRequest";
import UpdatePassword from "./components/ResetPassword/UpdatePassword";

export const router = createBrowserRouter([
  { path: "/", element: <App /> },
  { path: "/signup", element: <SignUp /> },
  { path: "/signin", element: <SignIn /> },
  { path: "/reset", element: <ResetRequest /> },
  { path: "/update", element: <UpdatePassword /> },
  {
    path: "/dashboard",
    element: (
      <PrivateRoute>
        <Dashboard />
      </PrivateRoute>
    ),
  },
]);
