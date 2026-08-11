import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../config/routes';
import { Card, Button, Input } from '../components/ui';
import { PasswordInput } from '../components/ui/PasswordInput';
import { LogIn, ArrowRight, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    const errors: { [key: string]: string } = {};

    const normEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!normEmail) {
      errors.email = 'Email address is required.';
    } else if (!emailRegex.test(normEmail)) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      errors.password = 'Password is required.';
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
      await login(email, password);
      navigate(ROUTES.DASHBOARD);
    } catch (err: any) {
      setServerError(err.message || 'Email or password is incorrect.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4 animate-in fade-in duration-300">
      <div className="text-center mb-8 space-y-2">
        <h1 className="font-serif italic text-4xl text-[#F5F2E8]">
          Farmer <span className="not-italic font-heading font-extrabold text-[#B9E48C]">Login.</span>
        </h1>
        <p className="text-xs text-[#F5F2E8]/70">
          Access your field advisory records and decision window history.
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
            label="Email Address"
            type="email"
            placeholder="farmer@agripulse.io"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={fieldErrors.email}
          />

          <PasswordInput
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={fieldErrors.password}
          />

          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting}
            leftIcon={<LogIn className="w-4 h-4" />}
            rightIcon={<ArrowRight className="w-4 h-4" />}
            className="w-full bg-[#B9E48C] text-[#07130F] hover:bg-[#a6d877] font-semibold text-sm shadow-glow-living border-0 mt-2"
          >
            {isSubmitting ? 'Logging in...' : 'Sign In to Dashboard'}
          </Button>
        </form>

        <div className="pt-4 border-t border-white/10 text-center text-xs text-[#F5F2E8]/70">
          Don't have an account yet?{' '}
          <Link to={ROUTES.SIGNUP} className="text-[#B9E48C] font-bold hover:underline">
            Register here &rarr;
          </Link>
        </div>
      </Card>
    </div>
  );
};
