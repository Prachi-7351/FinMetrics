import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const passwordChecks = (pw) => ({
  length: pw.length >= 8,
  upper: /[A-Z]/.test(pw),
  lower: /[a-z]/.test(pw),
  number: /[0-9]/.test(pw),
  special: /[^a-zA-Z0-9]/.test(pw),
});

function validate(form) {
  const errors = {};
  if (!form.email.trim()) errors.email = "Work email is required.";
  else if (!emailRegex.test(form.email.trim())) errors.email = "Enter a valid email address.";

  if (!form.password) errors.password = "Password is required.";
  else {
    const c = passwordChecks(form.password);
    if (!Object.values(c).every(Boolean))
      errors.password = "Password must be 8+ chars with uppercase, lowercase, number & special character.";
  }
  return errors;
}

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "", remember: false });
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const isValid = Object.keys(validate(form)).length === 0;

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;
    setForm((prev) => ({ ...prev, [id]: val }));
    if (touched[id]) {
      setErrors(validate({ ...form, [id]: val }));
    }
  };

  const handleBlur = (e) => {
    const { id } = e.target;
    setTouched((prev) => ({ ...prev, [id]: true }));
    setErrors(validate(form));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    await new Promise((res) => setTimeout(res, 1500));
    localStorage.setItem("token", "dummy-jwt-token");
    localStorage.setItem("justLoggedIn", "true");
    navigate("/dashboard");
  };

  const fieldClass = (id) => {
    const hasError = errors[id] && touched[id];
    const isOk = touched[id] && !errors[id] && form[id];
    return [
      "w-full bg-white/5 text-white placeholder-white/30 rounded-lg px-4 py-2.5 text-sm border outline-none transition-all duration-200 focus:ring-2",
      hasError ? "border-red-500/70 focus:border-red-400 focus:ring-red-500/10" : "",
      isOk ? "border-emerald-500/40 focus:border-emerald-400 focus:ring-emerald-500/10" : "",
      !hasError && !isOk ? "border-white/10 focus:border-blue-500/60 focus:ring-blue-500/10" : "",
    ].join(" ");
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ backgroundColor: "#0B0F19" }}
    >
      {/* Background layers */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-blue-600/6 blur-[130px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[350px] h-[350px] bg-indigo-800/5 blur-[100px] rounded-full" />
        <div
          className="absolute inset-0 opacity-[0.018]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, rgba(148,163,184,0.5) 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      {/* Card */}
      <div
        className={`relative w-full max-w-md transition-all duration-700 ease-out ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
        }`}
      >
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
          {/* Top accent */}
          <div className="h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />

          <div className="px-8 py-10">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 text-white font-bold text-lg mb-5 shadow-lg shadow-blue-900/40">
                F
              </div>
              <h1 className="text-2xl font-semibold text-white tracking-tight">Welcome Back</h1>
              <p className="mt-2 text-sm text-white/40 leading-relaxed max-w-xs mx-auto">
                Log in to continue managing financial intelligence.
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-xs font-medium text-white/40 mb-1.5 tracking-wide uppercase">
                  Work Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="jane@company.com"
                  value={form.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={fieldClass("email")}
                />
                {errors.email && touched.email && (
                  <p className="mt-1.5 text-xs text-red-400">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password" className="text-xs font-medium text-white/40 tracking-wide uppercase">
                    Password
                  </label>
                  <a
                    href="#"
                    className="text-xs text-blue-400/80 hover:text-blue-300 transition-colors"
                    tabIndex={-1}
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`${fieldClass("password")} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && touched.password && (
                  <p className="mt-1.5 text-xs text-red-400">{errors.password}</p>
                )}
              </div>

              {/* Remember me */}
              <div className="flex items-center gap-2.5 pt-1">
                <div className="relative flex-shrink-0">
                  <input
                    id="remember"
                    type="checkbox"
                    checked={form.remember}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div
                    onClick={() => setForm((p) => ({ ...p, remember: !p.remember }))}
                    className={`w-4 h-4 rounded border cursor-pointer transition-all duration-200 flex items-center justify-center
                      ${form.remember ? "bg-blue-600 border-blue-600" : "bg-white/5 border-white/20 hover:border-white/40"}`}
                  >
                    {form.remember && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <label
                  htmlFor="remember"
                  onClick={() => setForm((p) => ({ ...p, remember: !p.remember }))}
                  className="text-sm text-white/40 cursor-pointer select-none hover:text-white/60 transition-colors"
                >
                  Remember me for 30 days
                </label>
              </div>

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!isValid || submitting}
                  className="w-full relative flex items-center justify-center gap-2 py-3 px-6 rounded-xl text-sm font-semibold text-white
                    bg-gradient-to-r from-blue-600 to-blue-700
                    transition-all duration-200
                    hover:-translate-y-px hover:shadow-lg hover:shadow-blue-900/40
                    active:translate-y-0 active:shadow-none
                    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Signing in…
                    </>
                  ) : (
                    "Sign In"
                  )}
                </button>
              </div>

              <p className="text-center text-sm text-white/30 pt-1">
                Don't have an account?{" "}
                <Link to="/register" className="text-blue-400 hover:text-blue-300 transition-colors font-medium">
                  Create one
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}