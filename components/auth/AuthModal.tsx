"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { signInAnonymously, signIn, signUp } from "@/lib/supabase/auth";

type Tab = "connexion" | "inscription";

interface AuthContentProps {
  onClose?: () => void;
}

export function AuthContent({ onClose }: AuthContentProps) {
  const [tab, setTab] = useState<Tab>("connexion");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});

  function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  function validateForm(): boolean {
    const newErrors: typeof errors = {};

    if (!email.trim()) {
      newErrors.email = "Champ requis";
    } else if (!validateEmail(email)) {
      newErrors.email = "Format email invalide";
    }

    if (!password) {
      newErrors.password = "Champ requis";
    } else if (password.length < 8) {
      newErrors.password = "Minimum 8 caractères";
    }

    if (tab === "inscription") {
      if (!confirmPassword) {
        newErrors.confirmPassword = "Champ requis";
      } else if (confirmPassword !== password) {
        newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    if (tab === "connexion") {
      const { error } = await signIn(email.trim(), password);
      setLoading(false);
      if (error) {
        setErrors({ general: "Email ou mot de passe incorrect" });
      } else {
        onClose?.();
      }
    } else {
      const { error } = await signUp(email.trim(), password);
      setLoading(false);
      if (error) {
        setErrors({ general: error.message });
      } else {
        onClose?.();
      }
    }
  }

  async function handleAnonymous() {
    setLoading(true);
    setErrors({});
    const { error } = await signInAnonymously();
    setLoading(false);
    if (error) {
      setErrors({ general: error.message });
    } else {
      onClose?.();
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-[--text] text-sm uppercase tracking-widest">
          authentification
        </DialogTitle>
        <DialogDescription className="text-[--text-muted] text-xs">
          suivez vos captures et votre score.
        </DialogDescription>
      </DialogHeader>

      {/* Tab Toggle */}
      <div className="flex gap-1 mt-4 p-1 rounded-lg bg-[--surface-2]">
        <button
          onClick={() => {
            setTab("connexion");
            setErrors({});
            setPassword("");
            setConfirmPassword("");
          }}
          className={`flex-1 py-2 rounded text-xs uppercase tracking-wider transition-all duration-150 ${
            tab === "connexion"
              ? "bg-[--accent] text-[--bg]"
              : "text-[--text-muted] hover:text-[--text]"
          }`}
        >
          Connexion
        </button>
        <button
          onClick={() => {
            setTab("inscription");
            setErrors({});
            setPassword("");
            setConfirmPassword("");
          }}
          className={`flex-1 py-2 rounded text-xs uppercase tracking-wider transition-all duration-150 ${
            tab === "inscription"
              ? "bg-[--accent] text-[--bg]"
              : "text-[--text-muted] hover:text-[--text]"
          }`}
        >
          Inscription
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 mt-4">
        {/* Email Field */}
        <div>
          <input
            type="email"
            placeholder="adresse@email.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors({ ...errors, email: undefined });
            }}
            disabled={loading}
            className="w-full px-3 py-2 rounded-lg bg-[--bg] border border-[--border] text-[--text] placeholder:text-[--text-muted] focus:border-[--accent] focus:outline-none text-xs font-mono disabled:opacity-50"
          />
          {errors.email && (
            <p className="text-xs text-[--danger] mt-1">{errors.email}</p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors({ ...errors, password: undefined });
            }}
            disabled={loading}
            className="w-full px-3 py-2 rounded-lg bg-[--bg] border border-[--border] text-[--text] placeholder:text-[--text-muted] focus:border-[--accent] focus:outline-none text-xs font-mono disabled:opacity-50"
          />
          {errors.password && (
            <p className="text-xs text-[--danger] mt-1">{errors.password}</p>
          )}
        </div>

        {/* Confirm Password Field (only for signup) */}
        {tab === "inscription" && (
          <div>
            <input
              type="password"
              placeholder="Confirmer le mot de passe"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
              }}
              disabled={loading}
              className="w-full px-3 py-2 rounded-lg bg-[--bg] border border-[--border] text-[--text] placeholder:text-[--text-muted] focus:border-[--accent] focus:outline-none text-xs font-mono disabled:opacity-50"
            />
            {errors.confirmPassword && (
              <p className="text-xs text-[--danger] mt-1">{errors.confirmPassword}</p>
            )}
          </div>
        )}

        {/* General Error */}
        {errors.general && (
          <p className="text-xs text-[--danger]">{errors.general}</p>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-lg bg-[--accent-dim] text-[--accent] text-xs uppercase tracking-wider hover:bg-[--accent] hover:text-[--bg] transition-all duration-150 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="inline-block w-3 h-3 border-2 border-[--accent] border-t-transparent rounded-full animate-spin" />
              <span>{tab === "connexion" ? "connexion…" : "création…"}</span>
            </>
          ) : (
            <span>{tab === "connexion" ? "Se connecter" : "Créer un compte"}</span>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="my-4 h-px bg-[--border]" />

      {/* Anonymous Option */}
      <div className="flex flex-col gap-1.5">
        <button
          onClick={handleAnonymous}
          disabled={loading}
          className="w-full py-2.5 rounded-lg text-[--text-muted] text-xs uppercase tracking-wider hover:bg-[--surface-2] hover:text-[--text] transition-colors duration-150 disabled:opacity-50"
        >
          {loading ? "connexion…" : "Continuer sans compte"}
        </button>
        <p className="text-[10px] text-[--text-muted] text-center">
          Vos données ne seront pas sauvegardées
        </p>
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
