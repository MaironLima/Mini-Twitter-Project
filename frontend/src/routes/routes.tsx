import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import ErrorElement from "../pages/ErrorElement";
import MainPage from "../pages/MainPage";
import AuthPage from "../pages/AuthPage";

export const router = createBrowserRouter([
  {
    path: "",
    element: <App />,
    errorElement: <ErrorElement />,
    children: [
      {
        path: "",
        element: <MainPage />,
      },
    ],
  },
  {
    path: "/auth",
    element: <AuthPage />,
    errorElement: <ErrorElement />,
  }
]);