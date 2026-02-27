// import { Link } from "react-router-dom";

// const Register = () => {
//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-100">
//       <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">
//         <h1 className="text-2xl font-bold text-center mb-6">
//           Create FinMetrics Account
//         </h1>

//         <form className="space-y-4">
//           <div>
//             <label className="text-sm text-gray-600">Full Name</label>
//             <input
//               type="text"
//               placeholder="Enter your name"
//               className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//           </div>

//           <div>
//             <label className="text-sm text-gray-600">Email</label>
//             <input
//               type="email"
//               placeholder="Enter your email"
//               className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//           </div>

//           <div>
//             <label className="text-sm text-gray-600">Password</label>
//             <input
//               type="password"
//               placeholder="Create a password"
//               className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//           </div>

//           <button
//             type="button"
//             className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
//           >
//             Register
//           </button>
//         </form>

//         <p className="text-sm text-center mt-6 text-gray-600">
//           Already have an account?{" "}
//           <Link to="/" className="text-blue-600 font-medium">
//             Login
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// };

// export default Register;


import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

const COUNTRIES = [
  "United States","United Kingdom","Canada","Australia","Germany","France",
  "Netherlands","Singapore","India","Brazil","Japan","South Korea","Sweden",
  "Norway","Denmark","Switzerland","UAE","South Africa","Nigeria","Kenya",
  "Other",
];

const initialForm = {
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
  companyName: "",
  companyType: "",
  role: "",
  revenueRange: "",
  country: "",
  terms: false,
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const nameRegex = /^[a-zA-Z\s'-]+$/;

function getPasswordChecks(pw) {
  return {
    length: pw.length >= 8,
    upper: /[A-Z]/.test(pw),
    lower: /[a-z]/.test(pw),
    number: /[0-9]/.test(pw),
    special: /[^a-zA-Z0-9]/.test(pw),
  };
}

function getStrength(checks) {
  const count = Object.values(checks).filter(Boolean).length;
  if (count <= 2) return { label: "Weak", color: "bg-red-500", width: "w-1/5" };
  if (count <= 3) return { label: "Fair", color: "bg-orange-400", width: "w-2/5" };
  if (count === 4) return { label: "Medium", color: "bg-yellow-400", width: "w-3/5" };
  return { label: "Strong", color: "bg-emerald-400", width: "w-full" };
}

function validate(form) {
  const errors = {};
  if (!form.fullName.trim()) errors.fullName = "Full name is required.";
  else if (form.fullName.trim().length < 2) errors.fullName = "Minimum 2 characters.";
  else if (!nameRegex.test(form.fullName)) errors.fullName = "Letters, spaces, hyphens, apostrophes only.";

  if (!form.email.trim()) errors.email = "Work email is required.";
  else if (!emailRegex.test(form.email)) errors.email = "Enter a valid email address.";

  const checks = getPasswordChecks(form.password);
  if (!form.password) errors.password = "Password is required.";
  else if (!Object.values(checks).every(Boolean)) errors.password = "Password does not meet all requirements.";

  if (!form.confirmPassword) errors.confirmPassword = "Please confirm your password.";
  else if (form.confirmPassword !== form.password) errors.confirmPassword = "Passwords do not match.";

  if (!form.companyName.trim()) errors.companyName = "Company name is required.";
  else if (form.companyName.trim().length < 2) errors.companyName = "Minimum 2 characters.";

  if (!form.companyType) errors.companyType = "Please select a company type.";
  if (!form.role) errors.role = "Please select your role.";
  if (!form.revenueRange) errors.revenueRange = "Please select a revenue range.";
  if (!form.country) errors.country = "Please select a country.";
  if (!form.terms) errors.terms = "You must accept the terms to continue.";

  return errors;
}

function InputField({ label, id, type = "text", placeholder, value, onChange, onBlur, error, touched, children }) {
  const isValid = touched && !error && value;
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium text-white/80 mb-1.5 tracking-wide uppercase">
        {label}
      </label>
      <div className="relative">
        {children ? children : (
          <input
            id={id}
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            className={`w-full bg-slate-900/80 text-slate-100 placeholder-slate-600 rounded-lg px-4 py-2.5 text-sm border outline-none transition-all duration-200
              ${error && touched ? "border-red-500/70 focus:border-red-400" : ""}
              ${isValid ? "border-emerald-500/50 focus:border-emerald-400" : ""}
              ${!error && !isValid ? "border-slate-700/60 focus:border-blue-500/60" : ""}
              focus:ring-2 focus:ring-blue-500/10`}
          />
        )}
      </div>
      {error && touched && (
        <p className="mt-1 text-xs text-red-400">{error}</p>
      )}
    </div>
  );
}

function SelectField({ label, id, value, onChange, onBlur, error, touched, options, placeholder }) {
  const isValid = touched && !error && value;
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium text-white/80 mb-1.5 tracking-wide uppercase">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        className={`w-full bg-slate-900/80 text-slate-100 rounded-lg px-4 py-2.5 text-sm border outline-none transition-all duration-200 appearance-none cursor-pointer
          ${error && touched ? "border-red-500/70 focus:border-red-400" : ""}
          ${isValid ? "border-emerald-500/50 focus:border-emerald-400" : ""}
          ${!error && !isValid ? "border-slate-700/60 focus:border-blue-500/60" : ""}
          focus:ring-2 focus:ring-blue-500/10`}
      >
        <option value="" disabled className="text-slate-600">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value || opt} value={opt.value || opt} className="bg-slate-800">
            {opt.label || opt}
          </option>
        ))}
      </select>
      {error && touched && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-3 mt-8 mb-5">
      <span className="text-[10px] font-semibold tracking-widest uppercase text-slate-500">{children}</span>
      <div className="flex-1 h-px bg-slate-800" />
    </div>
  );
}

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const checks = getPasswordChecks(form.password);
  const strength = getStrength(checks);
  const isFormValid = Object.keys(validate(form)).length === 0;

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;
    setForm((prev) => ({ ...prev, [id]: val }));
    if (touched[id]) {
      const newErrors = validate({ ...form, [id]: val });
      setErrors(newErrors);
    }
  };

  const handleBlur = (e) => {
    const { id } = e.target;
    setTouched((prev) => ({ ...prev, [id]: true }));
    setErrors(validate(form));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const allTouched = Object.fromEntries(Object.keys(initialForm).map((k) => [k, true]));
    setTouched(allTouched);
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    await new Promise((res) => setTimeout(res, 1500));
    localStorage.setItem("token", "dummy-jwt-token");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#080c14] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-blue-600/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-indigo-700/4 blur-[100px] rounded-full" />
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(148,163,184,0.4) 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      {/* Card */}
      <div
        className={`relative w-full max-w-xl transition-all duration-700 ease-out ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <div className="bg-slate-950/90 border border-slate-800/60 rounded-2xl shadow-2xl shadow-black/60 backdrop-blur-sm overflow-hidden">
          {/* Top accent line */}
          <div className="h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

          <div className="px-8 py-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 text-white font-bold text-lg mb-4 shadow-lg shadow-blue-900/30">
                F
              </div>
              <h1 className="text-2xl font-semibold text-slate-100 tracking-tight">Create Your Account</h1>
              <p className="mt-1.5 text-sm text-slate-500">Start managing financial risk intelligently.</p>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              {/* Personal Information */}
              <SectionLabel>Personal Information</SectionLabel>
              <div className="space-y-4">
                <InputField
                  label="Full Name"
                  id="fullName"
                  placeholder="Jane Doe"
                  value={form.fullName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.fullName}
                  touched={touched.fullName}
                />
                <InputField
                  label="Work Email"
                  id="email"
                  type="email"
                  placeholder="jane@company.com"
                  value={form.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.email}
                  touched={touched.email}
                />

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-xs font-medium text-white/80 mb-1.5 tracking-wide uppercase">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      value={form.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full bg-slate-900/80 text-slate-100 placeholder-slate-600 rounded-lg px-4 py-2.5 pr-10 text-sm border outline-none transition-all duration-200
                        ${errors.password && touched.password ? "border-red-500/70 focus:border-red-400" : ""}
                        ${touched.password && !errors.password && form.password ? "border-emerald-500/50 focus:border-emerald-400" : ""}
                        ${!errors.password && !(touched.password && form.password) ? "border-slate-700/60 focus:border-blue-500/60" : ""}
                        focus:ring-2 focus:ring-blue-500/10`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      )}
                    </button>
                  </div>

                  {/* Strength bar */}
                  {form.password && (
                    <div className="mt-2">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-slate-500">Strength</span>
                        <span className={`text-xs font-medium ${
                          strength.label === "Strong" ? "text-emerald-400" :
                          strength.label === "Medium" ? "text-yellow-400" :
                          strength.label === "Fair" ? "text-orange-400" : "text-red-400"
                        }`}>{strength.label}</span>
                      </div>
                      <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full ${strength.color} ${strength.width} transition-all duration-500 rounded-full`} />
                      </div>

                      {/* Checklist */}
                      <div className="mt-2.5 grid grid-cols-2 gap-1">
                        {[
                          { key: "length", label: "8+ characters" },
                          { key: "upper", label: "Uppercase letter" },
                          { key: "lower", label: "Lowercase letter" },
                          { key: "number", label: "Number" },
                          { key: "special", label: "Special character" },
                        ].map(({ key, label }) => (
                          <div key={key} className="flex items-center gap-1.5">
                            <span className={`text-xs transition-colors duration-200 ${checks[key] ? "text-emerald-400" : "text-slate-600"}`}>
                              {checks[key] ? "✓" : "○"}
                            </span>
                            <span className={`text-xs transition-colors duration-200 ${checks[key] ? "text-white/80" : "text-slate-600"}`}>
                              {label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {errors.password && touched.password && (
                    <p className="mt-1 text-xs text-red-400">{errors.password}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-xs font-medium text-white/80 mb-1.5 tracking-wide uppercase">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirm ? "text" : "password"}
                      placeholder="Repeat your password"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full bg-slate-900/80 text-slate-100 placeholder-slate-600 rounded-lg px-4 py-2.5 pr-10 text-sm border outline-none transition-all duration-200
                        ${errors.confirmPassword && touched.confirmPassword ? "border-red-500/70 focus:border-red-400" : ""}
                        ${touched.confirmPassword && !errors.confirmPassword && form.confirmPassword ? "border-emerald-500/50 focus:border-emerald-400" : ""}
                        ${!errors.confirmPassword && !(touched.confirmPassword && form.confirmPassword) ? "border-slate-700/60 focus:border-blue-500/60" : ""}
                        focus:ring-2 focus:ring-blue-500/10`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                      tabIndex={-1}
                    >
                      {showConfirm ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && touched.confirmPassword && (
                    <p className="mt-1 text-xs text-red-400">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>

              {/* Company Information */}
              <SectionLabel>Company Information</SectionLabel>
              <div className="space-y-4">
                <InputField
                  label="Company Name"
                  id="companyName"
                  placeholder="Acme Corp"
                  value={form.companyName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.companyName}
                  touched={touched.companyName}
                />
                <div className="grid grid-cols-2 gap-4">
                  <SelectField
                    label="Company Type"
                    id="companyType"
                    value={form.companyType}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.companyType}
                    touched={touched.companyType}
                    placeholder="Select type"
                    options={["Startup", "SME", "Enterprise"]}
                  />
                  <SelectField
                    label="Your Role"
                    id="role"
                    value={form.role}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.role}
                    touched={touched.role}
                    placeholder="Select role"
                    options={["Founder", "CFO", "Finance Manager", "Investor", "Other"]}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <SelectField
                    label="Monthly Revenue"
                    id="revenueRange"
                    value={form.revenueRange}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.revenueRange}
                    touched={touched.revenueRange}
                    placeholder="Select range"
                    options={["Pre-revenue", "<10K", "10K–100K", "100K+"]}
                  />
                  <SelectField
                    label="Country"
                    id="country"
                    value={form.country}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.country}
                    touched={touched.country}
                    placeholder="Select country"
                    options={COUNTRIES}
                  />
                </div>
              </div>

              {/* Legal */}
              <SectionLabel>Legal</SectionLabel>
              <div className="space-y-4">
                <div>
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative mt-0.5 flex-shrink-0">
                      <input
                        id="terms"
                        type="checkbox"
                        checked={form.terms}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className="sr-only peer"
                      />
                      <div className={`w-4 h-4 rounded border transition-all duration-200 flex items-center justify-center
                        ${form.terms ? "bg-blue-600 border-blue-600" : "bg-slate-900 border-slate-600 group-hover:border-slate-500"}`}>
                        {form.terms && (
                          <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className="text-sm text-white/80 leading-snug">
                      I agree to the{" "}
                      <a href="#" className="text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors">
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a href="#" className="text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors">
                        Privacy Policy
                      </a>
                    </span>
                  </label>
                  {errors.terms && touched.terms && (
                    <p className="mt-1 text-xs text-red-400 ml-7">{errors.terms}</p>
                  )}
                </div>
              </div>

              {/* Submit */}
              <div className="mt-8">
                <button
                  type="submit"
                  disabled={!isFormValid || submitting}
                  className={`w-full relative flex items-center justify-center gap-2 py-3 px-6 rounded-xl text-sm font-semibold text-white transition-all duration-200
                    bg-gradient-to-r from-blue-600 to-blue-700
                    hover:-translate-y-px hover:shadow-lg hover:shadow-blue-900/40
                    active:translate-y-0 active:shadow-none
                    disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none`}
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Creating account…
                    </>
                  ) : (
                    "Create Account"
                  )}
                </button>
              </div>

              <p className="mt-5 text-center text-sm text-slate-500">
                Already have an account?{" "}
                <Link to="/login" className="text-blue-400 hover:text-blue-300 transition-colors font-medium">
                  Sign in
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}