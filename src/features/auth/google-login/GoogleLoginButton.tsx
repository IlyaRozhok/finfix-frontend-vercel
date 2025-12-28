import { ENV } from "@/shared/config/env";
import { Button } from "@/shared/ui/Button";
import googleIcon from "@/assets/google-icon.svg";

export function GoogleLoginButton() {
  const url = `${ENV.API_URL}/api/auth/google?next=${encodeURIComponent(
    window.location.origin
  )}`;
  return (
    <Button variant="black-blur" onClick={() => (window.location.href = url)}>
      <div className="flex items-center gap-2">
        <img className="w-5" src={googleIcon} alt="google-icon" />
        Continue with Google
      </div>
    </Button>
  );
}
