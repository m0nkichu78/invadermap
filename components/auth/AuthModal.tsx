"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { signInAnonymously, signInWithMagicLink } from "@/lib/supabase/auth";

type Step = "choice" | "email" | "sent";

interface AuthContentProps {
  onClose?: () => void;
}

export function AuthContent({ onClose }: AuthContentProps) {
  const [step, setStep] = useState<Step>("choice");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAnonymous() {
    setLoading(true);
    setError(null);
    const { error } = await signInAnonymously();
    setLoading(false);
    if (error) setError(error.message);
    else onClose?.();
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    const { error } = await signInWithMagicLink(email.trim());
    setLoading(false);
    if (error) setError(error.message);
    else setStep("sent");
  }

  if (step === "choice") {
    return (
      <>
        <DialogHeader>
          <DialogTitle className="text-[--text] text-sm uppercase tracking-widest">connexion</DialogTitle>
          <DialogDescription className="text-[--text-muted] text-xs">
            suivez vos captures et votre score.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2.5 mt-3">
          <button
            onClick={() => setStep("email")}
            className="w-full py-2.5 rounded bg-[--accent-dim] text-accent text-xs uppercase tracking-wider hover:bg-accent hover:text-[--bg] transition-all duration-150"
          >
            connexion par email
          </button>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-[--border]" />
            <span className="text-[10px] text-[--text-muted]">ou</span>
            <div className="flex-1 h-px bg-[--border]" />
          </div>
          <button
            onClick={handleAnonymous}
            disabled={loading}
            className="w-full py-2.5 rounded text-[--text-muted] text-xs uppercase tracking-wider hover:bg-[--surface-2] hover:text-[--text] transition-colors duration-150 disabled:opacity-50"
          >
            {loading ? "connexion…" : "continuer anonymement"}
          </button>
          {error && <p className="text-xs text-danger">{error}</p>}
          <p className="text-[10px] text-[--text-muted] text-center leading-relaxed">
            mode anonyme — données liées à cet appareil uniquement.
          </p>
        </div>
      </>
    );
  }

  if (step === "email") {
    return (
      <>
        <DialogHeader>
          <DialogTitle className="text-[--text] text-sm uppercase tracking-widest">email</DialogTitle>
          <DialogDescription className="text-[--text-muted] text-xs">
            un lien de connexion vous sera envoyé.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleMagicLink} className="flex flex-col gap-2.5 mt-3">
          <Input
            type="email"
            placeholder="votre@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
            className="bg-[--bg] border border-[--border] text-[--text] placeholder:text-[--text-muted] focus:border-accent focus-visible:ring-0 rounded text-xs"
          />
          {error && <p className="text-xs text-danger">{error}</p>}
          <button
            type="submit"
            disabled={loading || !email.trim()}
            className="w-full py-2.5 rounded bg-[--accent-dim] text-accent text-xs uppercase tracking-wider hover:bg-accent hover:text-[--bg] transition-all duration-150 disabled:opacity-50"
          >
            {loading ? "envoi…" : "envoyer le lien"}
          </button>
          <button
            type="button"
            onClick={() => { setStep("choice"); setError(null); }}
            className="text-xs text-[--text-muted] hover:text-[--text] transition-colors duration-150"
          >
            ← retour
          </button>
        </form>
      </>
    );
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-[--text] text-sm uppercase tracking-widest">vérifiez vos emails</DialogTitle>
        <DialogDescription className="text-[--text-muted] text-xs">
          lien envoyé à{" "}
          <span className="text-accent">{email}</span>.
        </DialogDescription>
      </DialogHeader>
      <div className="flex flex-col gap-2.5 mt-3">
        <p className="text-xs text-[--text-muted]">
          cliquez sur le lien dans l&apos;email pour vous connecter.
        </p>
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded text-[--text-muted] text-xs uppercase tracking-wider hover:bg-[--surface-2] hover:text-[--text] transition-colors duration-150"
        >
          fermer
        </button>
      </div>
    </>
  );
}

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  embedded?: boolean;
}

export function AuthModal({ open, onOpenChange, embedded }: AuthModalProps) {
  if (embedded) {
    return (
      <div className="w-full max-w-sm rounded-lg bg-[--surface] border border-[--border] glow-accent p-6">
        <AuthContent onClose={() => onOpenChange(false)} />
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm bg-[--surface] border border-[--border] glow-accent text-[--text]">
        <AuthContent onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
