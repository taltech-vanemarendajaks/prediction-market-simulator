import { AuthPanel } from "./AuthPanel";
import type { AuthUser } from "../api/auth";

type Props = {
  onAuthenticated: (user: AuthUser) => void;
  onClose: () => void;
};

export function AuthModal({ onAuthenticated, onClose }: Props) {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-2xl bg-surface p-6"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-text-secondary transition hover:bg-bg hover:text-text-primary"
        >
          ✕
        </button>

        <AuthPanel
          onAuthenticated={(user) => {
            onAuthenticated(user);
            onClose();
          }}
        />
      </div>
    </div>
  );
}
