import { useState, type FormEvent } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import apiService from '../services/api';
import { useAuthStore } from '../stores/authStore';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FieldErrors { email?: string; password?: string }

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({});
  const [loading, setLoading] = useState(false);

  const validateEmail = (v: string) => {
    if (!v.trim()) return 'Email is required';
    if (!EMAIL_REGEX.test(v)) return 'Please enter a valid email address';
    return undefined;
  };

  const validatePassword = (v: string) => (!v ? 'Password is required' : undefined);

  const handleBlur = (field: 'email' | 'password') => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = field === 'email' ? validateEmail(email) : validatePassword(password);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    setTouched({ email: true, password: true });
    setErrors({ email: emailError, password: passwordError });
    if (emailError || passwordError) return;

    setLoading(true);
    try {
      const res = await apiService.post<{ token: string }>('/api/auth/login', { email, password });
      useAuthStore.getState().login(res.data.token);
      navigate(from, { replace: true });
    } catch {
      // Error toast handled by API service interceptor
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field: 'email' | 'password') =>
    `mt-1 block w-full rounded-lg border px-4 py-2.5 text-sm transition duration-200 ease-in-out
     focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white ${
       touched[field] && errors[field]
         ? 'border-red-500 focus:ring-red-500'
         : 'border-gray-300 dark:border-gray-600'
     }`;

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-lg dark:bg-gray-800">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Sign in</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Welcome back to ShopBuilder</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6" noValidate>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email address
            </label>
            <input
              id="email" type="email" autoComplete="email" value={email}
              onChange={(e) => setEmail(e.target.value)} onBlur={() => handleBlur('email')}
              className={inputClass('email')}
              aria-invalid={touched.email && !!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            {touched.email && errors.email && (
              <p id="email-error" className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
            <input
              id="password" type="password" autoComplete="current-password" value={password}
              onChange={(e) => setPassword(e.target.value)} onBlur={() => handleBlur('password')}
              className={inputClass('password')}
              aria-invalid={touched.password && !!errors.password}
              aria-describedby={errors.password ? 'password-error' : undefined}
            />
            {touched.password && errors.password && (
              <p id="password-error" className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
            )}
          </div>

          <button
            type="submit" disabled={loading}
            className="flex w-full items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white
              transition duration-200 ease-in-out hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
              disabled:cursor-not-allowed disabled:opacity-60 dark:focus:ring-offset-gray-800"
          >
            {loading ? (
              <>
                <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Signing in...
              </>
            ) : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-medium text-indigo-600 transition duration-200 hover:text-indigo-500 dark:text-indigo-400">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
