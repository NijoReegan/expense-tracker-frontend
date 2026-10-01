import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import { useAuth } from '../context/useAuth';

export default function Register() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const validate = () => {
    const next = {};
    if (!fullName.trim()) next.fullName = 'Full name is required.';
    else if (fullName.trim().length < 2) next.fullName = 'Enter at least 2 characters.';
    if (!email.trim()) next.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      next.email = 'Enter a valid email address.';
    if (!password) next.password = 'Password is required.';
    else if (password.length < 6) next.password = 'Password must be at least 6 characters.';
    if (!confirmPassword) next.confirmPassword = 'Please confirm your password.';
    else if (password !== confirmPassword) next.confirmPassword = 'Passwords do not match.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    if (!validate()) return;
    setLoading(true);
    try {
      await register(fullName.trim(), email.trim(), password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setSubmitError(err.message || 'Unable to create your account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (hasError) =>
    `w-full rounded-xl border bg-white/70 px-4 py-3 text-sm text-[#1b1b24] outline-none transition-all input-focus ${
      hasError
        ? 'border-error focus:border-error focus:ring-2 focus:ring-error/20'
        : 'border-[#c7c4d8] focus:border-[#3525cd] focus:ring-2 focus:ring-[#3525cd]/20'
    }`;

  const fieldError = (key) =>
    errors[key] && <p className="mt-1.5 text-xs font-semibold text-error">{errors[key]}</p>;

  return (
    <div className="mesh-bg font-['Inter'] text-[#1b1b24] min-h-screen selection:bg-[#3525cd] selection:text-white">
      <header className="relative z-20 border-b border-white/30 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-3 font-black text-[#3525cd]">
            <Icon name="account_balance_wallet" />
            <span>Smart Expense Tracker</span>
          </Link>
          <Link
            to="/"
            className="rounded-xl border border-[#c7c4d8] px-4 py-2 text-sm font-bold text-[#3525cd] transition-all hover:bg-white/70"
          >
            Back to home
          </Link>
        </div>
      </header>

      <main className="relative flex items-center justify-center px-6 py-16 md:py-24">
        <div className="w-full max-w-md">
          <div className="glass-card rounded-[28px] p-8 md:p-10">
            <div className="flex flex-col items-center text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#3525cd] text-white shadow-lg shadow-[#3525cd]/30">
                <Icon name="person_add" className="text-3xl" />
              </span>
              <h1 className="mt-5 text-3xl font-black tracking-tight">Create your account</h1>
              <p className="mt-2 text-sm leading-6 text-[#464555]">
                Get started with Smart Expense Tracker in under a minute.
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
              <div>
                <label htmlFor="fullName" className="mb-1.5 block text-sm font-bold text-[#1b1b24]">
                  Full name
                </label>
                <input
                  id="fullName"
                  type="text"
                  autoComplete="name"
                  placeholder="Jane Doe"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: undefined }));
                  }}
                  className={inputClass(errors.fullName)}
                />
                {fieldError('fullName')}
              </div>

              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-bold text-[#1b1b24]">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  className={inputClass(errors.email)}
                />
                {fieldError('email')}
              </div>

              <div>
                <label htmlFor="password" className="mb-1.5 block text-sm font-bold text-[#1b1b24]">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                    }}
                    className={`${inputClass(errors.password)} pr-11`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-[#777587] transition-colors hover:text-[#3525cd]"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <Icon name={showPassword ? 'visibility_off' : 'visibility'} size={20} />
                  </button>
                </div>
                {fieldError('password')}
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-1.5 block text-sm font-bold text-[#1b1b24]"
                >
                  Confirm password
                </label>
                <input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword)
                      setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                  }}
                  className={inputClass(errors.confirmPassword)}
                />
                {fieldError('confirmPassword')}
              </div>

              {submitError && (
                <div className="flex items-start gap-2 rounded-xl bg-error/10 px-4 py-3 text-sm font-semibold text-error">
                  <Icon name="error_outline" className="mt-0.5 shrink-0" size={18} />
                  <span>{submitError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#3525cd] px-6 py-4 text-base font-bold text-white shadow-xl shadow-[#3525cd]/20 transition-all hover:scale-[1.02] hover:bg-[#2d1fb0] disabled:opacity-60 disabled:hover:scale-100"
              >
                {loading && <Icon name="progress_activity" className="animate-spin" size={20} />}
                Create account
              </button>
            </form>

            <div className="mt-6 flex items-center gap-3 text-xs font-semibold text-[#777587]">
              <span className="h-px flex-1 bg-[#c7c4d8]/60"></span>
              OR
              <span className="h-px flex-1 bg-[#c7c4d8]/60"></span>
            </div>

            <p className="mt-6 text-center text-sm text-[#464555]">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-[#3525cd] hover:underline">
                Sign in
              </Link>
            </p>
          </div>

          <p className="mt-6 text-center text-xs text-[#777587]">
            Your account and data are stored securely on the Smart Expense Tracker server.
          </p>
        </div>
      </main>
    </div>
  );
}