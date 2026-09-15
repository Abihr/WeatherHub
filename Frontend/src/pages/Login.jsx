import { useState } from "react";

import {
  Mail,
  Lock,
  User as UserIcon,
  MapPin,
  Eye,
  EyeOff,
  AtSign,
} from "lucide-react";

import logo from "../assets/logo_remove_bg.png";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";

import { auth } from "../firebase/firebase";

import {
  createUserProfile,
  isUserIdAvailable,
} from "../firebase/firestore";

export default function Login() {
  const [mode, setMode] = useState("login");

  const [form, setForm] = useState({
    name: "",
    userId: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  // =========================
  // HANDLE INPUT CHANGE
  // =========================

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: name === "userId" ? value.toLowerCase() : value,
    }));

    if (error) {
      setError("");
    }
  }

  // =========================
  // VALIDATE USER ID
  // =========================

  function validateUserId(userId) {
    const normalizedUserId = userId.trim().toLowerCase();

    if (!normalizedUserId) {
      return "Please enter a User ID.";
    }

    if (normalizedUserId.length < 3) {
      return "User ID must be at least 3 characters.";
    }

    if (normalizedUserId.length > 20) {
      return "User ID must be maximum 20 characters.";
    }

    if (!/^[a-z0-9_]+$/.test(normalizedUserId)) {
      return "User ID can only contain letters, numbers, and underscore.";
    }

    return "";
  }

  // =========================
  // SUBMIT
  // =========================

  async function submit(e) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      // =====================================================
      // REGISTER
      // =====================================================

      if (mode === "register") {
        // -------------------------
        // NAME VALIDATION
        // -------------------------

        if (!form.name.trim()) {
          setError("Please enter your full name.");
          return;
        }

        // -------------------------
        // USER ID VALIDATION
        // -------------------------

        const normalizedUserId = form.userId
          .trim()
          .toLowerCase();

        const userIdError = validateUserId(normalizedUserId);

        if (userIdError) {
          setError(userIdError);
          return;
        }

        // -------------------------
        // EMAIL VALIDATION
        // -------------------------

        if (!form.email.trim()) {
          setError("Please enter your email.");
          return;
        }

        // -------------------------
        // PASSWORD VALIDATION
        // -------------------------

        if (form.password.length < 6) {
          setError("Password must be at least 6 characters.");
          return;
        }

        // =====================================================
        // CHECK USER ID AVAILABILITY
        // =====================================================

        const available = await isUserIdAvailable(
          normalizedUserId
        );

        if (!available) {
          setError(
            `User ID "${normalizedUserId}" is already taken.`
          );
          return;
        }

        // =====================================================
        // CREATE FIREBASE AUTH USER
        // =====================================================

        const userCredential =
          await createUserWithEmailAndPassword(
            auth,
            form.email.trim(),
            form.password
          );

        const user = userCredential.user;

        // =====================================================
        // SAVE NAME TO FIREBASE AUTH
        // =====================================================

        await updateProfile(user, {
          displayName: form.name.trim(),
        });

        // =====================================================
        // CREATE FIRESTORE USER PROFILE
        // =====================================================

        await createUserProfile({
          firebaseUid: user.uid,
          userId: normalizedUserId,
          name: form.name.trim(),
          email: form.email.trim(),
          photoURL: user.photoURL || "",
        });

        console.log(
          "✅ Account created successfully:",
          user.uid
        );

        console.log(
          "✅ Public User ID:",
          normalizedUserId
        );

        return;
      }

      // =====================================================
      // LOGIN
      // =====================================================

      if (!form.email.trim()) {
        setError("Please enter your email.");
        return;
      }

      if (!form.password) {
        setError("Please enter your password.");
        return;
      }

      const userCredential =
        await signInWithEmailAndPassword(
          auth,
          form.email.trim(),
          form.password
        );

      console.log(
        "Logged in successfully:",
        userCredential.user
      );
    } catch (err) {
      console.error("Firebase Auth Error:", err);

      switch (err.code) {
        case "auth/email-already-in-use":
          setError("This email is already registered.");
          break;

        case "auth/invalid-email":
          setError("Please enter a valid email address.");
          break;

        case "auth/weak-password":
          setError("Password must be at least 6 characters.");
          break;

        case "auth/invalid-credential":
          setError("Invalid email or password.");
          break;

        case "auth/wrong-password":
          setError("Invalid email or password.");
          break;

        case "auth/user-not-found":
          setError("No account found with this email.");
          break;

        case "auth/user-disabled":
          setError(
            "This account has been disabled. Please contact support."
          );
          break;

        case "auth/configuration-not-found":
          setError(
            "Email/Password authentication is not enabled in Firebase."
          );
          break;

        case "auth/network-request-failed":
          setError(
            "Network error. Please check your internet connection."
          );
          break;

        default:
          setError(
            err.message || "Something went wrong."
          );
      }
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">

        {/* LOGO */}

        <div className="flex flex-col items-center mb-8">
          <span
            className="
              w-24 h-24
              sm:w-20 sm:h-20
              md:w-24 md:h-24
              p-2
              rounded-2xl
              bg-gradient-to-br from-sky-100 to-blue-50
              border border-sky-100
              shadow-sm
              flex items-center justify-center
              overflow-hidden
              shrink-0
            "
          >
            <img
              src={logo}
              className="
                w-full h-full
                object-contain
                transition-transform duration-200
                hover:scale-110
              "
              alt="WeatherHub logo"
            />
          </span>

          <h1 className="text-3xl font-bold text-slate-800 mt-3">
            WeatherHub
          </h1>

          <p className="text-slate-500 mt-2 text-center">
            Connect with your community through weather
          </p>
        </div>

        {/* CARD */}

        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 sm:p-8">

          {/* LOGIN / REGISTER TABS */}

          <div className="flex bg-slate-100 rounded-xl p-1 mb-6">

            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError("");
              }}
              className={`flex-1 py-2.5 rounded-lg font-medium transition ${
                mode === "login"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-500"
              }`}
            >
              Sign In
            </button>

            <button
              type="button"
              onClick={() => {
                setMode("register");
                setError("");
              }}
              className={`flex-1 py-2.5 rounded-lg font-medium transition ${
                mode === "register"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-500"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* HEADING */}

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-800">
              {mode === "register"
                ? "Create your account"
                : "Welcome back"}
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              {mode === "register"
                ? "Join WeatherHub and connect with people nearby."
                : "Sign in to continue to WeatherHub."}
            </p>
          </div>

          {/* FORM */}

          <form
            onSubmit={submit}
            className="space-y-4"
          >

            {/* NAME */}

            {mode === "register" && (
              <Field
                icon={<UserIcon size={19} />}
                name="name"
                type="text"
                placeholder="Full name"
                value={form.name}
                onChange={handleChange}
              />
            )}

            {/* USER ID */}

            {mode === "register" && (
              <div>
                <Field
                  icon={<AtSign size={19} />}
                  name="userId"
                  type="text"
                  placeholder="Choose a User ID"
                  value={form.userId}
                  onChange={handleChange}
                />

                <p className="text-xs text-slate-400 mt-1.5 ml-1">
                  3–20 characters • letters, numbers and underscore only
                </p>
              </div>
            )}

            {/* EMAIL */}

            <Field
              icon={<Mail size={19} />}
              name="email"
              type="email"
              placeholder="Email address"
              value={form.email}
              onChange={handleChange}
            />

            {/* PASSWORD */}

            <div className="relative">

              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Lock size={19} />
              </div>

              <input
                name="password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                required
                className="
                  w-full
                  h-12
                  pl-12
                  pr-12
                  rounded-xl
                  border border-slate-200
                  bg-slate-50
                  text-slate-800
                  placeholder:text-slate-400
                  outline-none
                  transition
                  focus:border-sky-400
                  focus:ring-4
                  focus:ring-sky-100
                "
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (prev) => !prev
                  )
                }
                className="
                  absolute
                  right-3
                  top-1/2
                  -translate-y-1/2
                  p-2
                  rounded-lg
                  text-slate-400
                  hover:text-sky-500
                  hover:bg-sky-50
                  transition-colors
                "
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>

            {/* ERROR */}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            {/* SUBMIT */}

            <button
              type="submit"
              disabled={loading}
              className="
                w-full
                bg-gradient-to-r from-sky-500 to-blue-600
                hover:from-sky-600 hover:to-blue-700
                text-white
                font-semibold
                py-3
                rounded-xl
                transition
                shadow-md
                disabled:opacity-60
                disabled:cursor-not-allowed
              "
            >
              {loading
                ? mode === "register"
                  ? "Creating account..."
                  : "Signing in..."
                : mode === "register"
                ? "Create Account"
                : "Sign In"}
            </button>
          </form>

          {/* REGISTER INFORMATION */}

          {mode === "register" && (
            <div className="flex gap-3 mt-6 bg-sky-50 border border-sky-100 rounded-xl p-4">

              <MapPin
                size={20}
                className="text-sky-500 shrink-0 mt-0.5"
              />

              <p className="text-xs text-slate-600 leading-relaxed">
                WeatherHub can use your location to show
                weather conditions and nearby community reports.
              </p>
            </div>
          )}
        </div>

        {/* FOOTER */}

        <p className="text-center text-xs text-slate-400 mt-6">
          © 2026 WeatherHub
        </p>
      </div>
    </div>
  );
}

// =====================================================
// REUSABLE INPUT FIELD
// =====================================================

function Field({
  icon,
  name,
  type,
  placeholder,
  value,
  onChange,
}) {
  return (
    <div className="relative">

      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
        {icon}
      </div>

      <input
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required
        className="
          w-full
          h-12
          pl-12
          pr-4
          rounded-xl
          border border-slate-200
          bg-slate-50
          text-slate-800
          placeholder:text-slate-400
          outline-none
          transition
          focus:border-sky-400
          focus:ring-4
          focus:ring-sky-100
        "
      />
    </div>
  );
}