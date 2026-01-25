import { ENV } from "@/shared/config/env";
import { Button } from "@/shared/ui/Button";
import googleIcon from "@/assets/google-icon.svg";

export function GoogleLoginButton() {
  const url = `${ENV.API_URL}/api/auth/google?next=${encodeURIComponent(
    window.location.origin
  )}`;
  return (
    <Button variant="glass" onClick={() => (window.location.href = url)}>
      <div className="flex items-center w-83 gap-2">
        <img className="w-5" src={googleIcon} alt="google-icon" />

        <p className="text-primary-blue">Continue with Google</p>
      </div>
    </Button>
  );
}
