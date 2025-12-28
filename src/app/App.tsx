import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./providers/AuthProvider";
import { ToastProvider } from "@/shared/ui";
import { AppRouter } from "./router/router";

const App = () => {
  return (
    <ToastProvider position="top-right">
      <AuthProvider>
        <BrowserRouter>
          <AppRouter />
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;
