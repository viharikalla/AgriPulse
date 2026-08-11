import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../config/routes';
import { Card, Button, Input } from '../components/ui';
import { PasswordInput } from '../components/ui/PasswordInput';
import { Sprout, UserPlus, ArrowRight, AlertCircle } from 'lucide-react';

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    const errors: { [key: string]: string } = {};

    const trimmedName = name.trim();
    if (!trimmedName) {
      errors.name = 'Full name is required.';
    } else if (trimmedName.length > 100) {
      errors.name = 'Full name must not exceed 100 characters.';
    }

    const normEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!normEmail) {
      errors.email = 'Email address is required.';
    } else if (!emailRegex.test(normEmail)) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters long.';
    } else if (!/[A-Z]/.test(password)) {
      errors.password = 'Password must contain at least one uppercase letter.';
    } else if (!/[a-z]/.test(password)) {
      errors.password = 'Password must contain at least one lowercase letter.';
    } else if (!/[0-9]/.test(password)) {
      errors.password = 'Password must contain at least one number.';
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.password = 'Password must contain at least one special character.';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password.';
    } else if (confirmPassword !== password) {
      errors.confirmPassword = 'Confirm password must match password.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validate() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await signup(name, email, password, confirmPassword);
      navigate(ROUTES.DASHBOARD);
    } catch (err: any) {
      setServerError(err.message || 'Account registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-10 px-4 animate-in fade-in duration-300">
      <div className="text-center mb-8 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-medium border-[#B9E48C]/30 text-[#B9E48C] text-xs font-mono font-bold mb-2">
          <Sprout className="w-3.5 h-3.5" /> FARMER REGISTRATION
        </div>
        <h1 className="font-serif italic text-4xl text-[#F5F2E8]">
          Join <span className="not-italic font-heading font-extrabold text-[#B9E48C]">AgriPulse.</span>
        </h1>
        <p className="text-xs text-[#F5F2E8]/70">
          Create your account to save field analyses and track weather decision windows.
        </p>
      </div>

      <Card glassLevel="deep" className="p-6 sm:p-8 space-y-6">
        {serverError && (
          <div className="p-3.5 rounded-xl glass-medium border-[#F28B78]/40 bg-[#F28B78]/10 text-[#F28B78] text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <Input
            label="Full Name"
            placeholder="e.g. Vihari Kalla"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={fieldErrors.name}
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="farmer@agripulse.io"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={fieldErrors.email}
          />

          <PasswordInput
            label="Password"
            placeholder="Minimum 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={fieldErrors.password}
          />

          <PasswordInput
            label="Confirm Password"
            placeholder="Re-enter password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={fieldErrors.confirmPassword}
          />

          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting}
            leftIcon={<UserPlus className="w-4 h-4" />}
            rightIcon={<ArrowRight className="w-4 h-4" />}
            className="w-full bg-[#B9E48C] text-[#07130F] hover:bg-[#a6d877] font-semibold text-sm shadow-glow-living border-0 mt-2"
          >
            {isSubmitting ? 'Creating account...' : 'Create Farmer Account'}
          </Button>
        </form>

        <div className="pt-4 border-t border-white/10 text-center text-xs text-[#F5F2E8]/70">
          Already have a farmer account?{' '}
          <Link to={ROUTES.LOGIN} className="text-[#B9E48C] font-bold hover:underline">
            Log in here &rarr;
          </Link>
        </div>
      </Card>
    </div>
  );
};
