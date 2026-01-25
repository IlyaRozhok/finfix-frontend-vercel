import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./providers/AuthProvider";
import { ModeProvider } from "./providers/ModeProvider";
import { ToastProvider } from "@/shared/ui";
import { AppRouter } from "./router/router";

const App = () => {
  return (
    <ToastProvider position="top-right">
      <ModeProvider>
        <AuthProvider>
          <BrowserRouter>
            <AppRouter />
          </BrowserRouter>
        </AuthProvider>
      </ModeProvider>
    </ToastProvider>
  );
};

export default App;
