
import { useState } from "react";

import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  User as UserIcon,
  MapPin,
  Check,
  X,
  Loader2,
} from "lucide-react";

import logo from "../assets/logo_remove_bg.png";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  deleteUser,
} from "firebase/auth";

import {
  doc,
  setDoc,
  getDoc,
  runTransaction,
  deleteDoc,
} from "firebase/firestore";

import { auth, db } from "../firebase/firebase";

// ========================================
// LOGIN COMPONENT
// ========================================

export default function Login() {
  const [mode, setMode] = useState("login");

  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [usernameStatus, setUsernameStatus] = useState("idle");
  const [usernameMessage, setUsernameMessage] = useState("");

  // ========================================
  // CHANGE LOGIN / REGISTER MODE
  // ========================================

  function setLoginMode(nextMode) {
    setMode(nextMode);
    setError("");
    setUsernameStatus("idle");
    setUsernameMessage("");

    setForm((prev) => ({
      ...prev,
      password: "",
    }));
  }

  // ========================================
  // HANDLE INPUT
  // ========================================

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "username") {
      setUsernameStatus("idle");
      setUsernameMessage("");
    }

    setError("");
  }

  // ========================================
  // NORMALIZE USERNAME
  // ========================================

  function normalizeUsername(username) {
    return username.trim().toLowerCase().replace(/^@/, "");
  }

  // ========================================
  // VALIDATE USERNAME
  // ========================================

  function validateUsername(username) {
    const normalized = normalizeUsername(username);

    if (!normalized) {
      return "Please choose a username.";
    }

    if (normalized.length < 3) {
      return "Username must be at least 3 characters.";
    }

    if (normalized.length > 20) {
      return "Username must be 20 characters or less.";
    }

    if (!/^[a-z0-9_]+$/.test(normalized)) {
      return "Username can only contain letters, numbers, and underscores.";
    }

    return "";
  }

  // ========================================
  // CHECK USERNAME
  // ========================================

  async function checkUsernameAvailability() {
    const username = normalizeUsername(form.username);

    setUsernameMessage("");
    setUsernameStatus("idle");

    const validationError = validateUsername(username);

    if (validationError) {
      setUsernameStatus("invalid");
      setUsernameMessage(validationError);
      return false;
    }

    setUsernameStatus("checking");
    setUsernameMessage("Checking username...");

    try {
      const usernameRef = doc(db, "usernames", username);
      const usernameSnapshot = await getDoc(usernameRef);

      if (usernameSnapshot.exists()) {
        setUsernameStatus("taken");
        setUsernameMessage("This username is already taken.");
        return false;
      }

      setUsernameStatus("available");
      setUsernameMessage("Username is available.");

      return true;
    } catch (err) {
      console.error("Username check error:", err);

      setUsernameStatus("invalid");
      setUsernameMessage(
        "Unable to check username. Please try again."
      );

      return false;
    }
  }

  // ========================================
  // RESERVE USERNAME
  // ========================================

  async function reserveUsername(username, user) {
    const usernameRef = doc(db, "usernames", username);

    await runTransaction(db, async (transaction) => {
      const usernameSnapshot = await transaction.get(usernameRef);

      if (usernameSnapshot.exists()) {
        throw new Error("USERNAME_TAKEN");
      }

      transaction.set(usernameRef, {
        uid: user.uid,
        email: user.email,
        username,
        createdAt: new Date().toISOString(),
      });
    });
  }

  // ========================================
  // RELEASE USERNAME
  // ========================================

  async function releaseUsername(username) {
    try {
      await deleteDoc(doc(db, "usernames", username));
    } catch (err) {
      console.error("Could not release username:", err);
    }
  }

  // ========================================
  // SUBMIT
  // ========================================

  async function submit(event) {
    event.preventDefault();

    setError("");
    setLoading(true);

    let createdUser = null;
    let reservedUsername = null;

    try {
      // ========================================
      // REGISTER
      // ========================================

      if (mode === "register") {
        if (!form.name.trim()) {
          throw new Error("Please enter your full name.");
        }

        const username = normalizeUsername(form.username);

        const usernameValidation = validateUsername(username);

        if (usernameValidation) {
          throw new Error(usernameValidation);
        }

        if (!form.email.trim()) {
          throw new Error("Please enter your email.");
        }

        if (form.password.length < 6) {
          throw new Error(
            "Password must be at least 6 characters."
          );
        }

        // Create Firebase Auth user
        const userCredential =
          await createUserWithEmailAndPassword(
            auth,
            form.email.trim(),
            form.password
          );

        const user = userCredential.user;

        createdUser = user;

        // Save display name
        await updateProfile(user, {
          displayName: form.name.trim(),
        });

        // Reserve username
        try {
          await reserveUsername(username, user);
          reservedUsername = username;
        } catch (err) {
          if (err.message === "USERNAME_TAKEN") {
            throw new Error(
              "This username is already taken. Please choose another one."
            );
          }

          throw err;
        }

        // Create Firestore profile
        await setDoc(doc(db, "users", user.uid), {
          name: form.name.trim(),
          username,
          email: form.email.trim(),
          photoURL: user.photoURL || "",

          latitude: null,
          longitude: null,

          location: {
            city: "",
            lat: null,
            lng: null,
          },

          weather: {
            temperature: null,
            condition: "",
            feelsLike: null,
            humidity: null,
            wind: null,
            rain: 0,
            icon: "",
            locationName: "",
            country: "",
          },

          locationSharing: "friends",
          weatherSharing: true,
        });

        console.log("Account created:", user.uid);
        console.log("Username:", username);

        return;
      }

      // ========================================
      // LOGIN
      // ========================================

      const loginValue = form.username.trim();

      if (!loginValue) {
        throw new Error(
          "Please enter your username or email."
        );
      }

      if (!form.password) {
        throw new Error("Please enter your password.");
      }

      let emailToLogin = loginValue;

      // Login with username
      if (!loginValue.includes("@")) {
        const username = normalizeUsername(loginValue);

        const usernameValidation =
          validateUsername(username);

        if (usernameValidation) {
          throw new Error(usernameValidation);
        }

        const usernameSnapshot = await getDoc(
          doc(db, "usernames", username)
        );

        if (!usernameSnapshot.exists()) {
          throw new Error(
            "No account found with this username."
          );
        }

        const usernameData = usernameSnapshot.data();

        if (!usernameData.email) {
          throw new Error(
            "This username is not configured correctly."
          );
        }

        emailToLogin = usernameData.email;
      }

      // Firebase login
      const userCredential =
        await signInWithEmailAndPassword(
          auth,
          emailToLogin,
          form.password
        );

      console.log(
        "Logged in successfully:",
        userCredential.user.uid
      );
    } catch (err) {
      console.error("Firebase Auth Error:", err);

      // ========================================
      // CLEANUP
      // ========================================

      if (createdUser && reservedUsername) {
        await releaseUsername(reservedUsername);
      }

      if (
        createdUser &&
        err.message ===
          "This username is already taken. Please choose another one."
      ) {
        try {
          await deleteUser(createdUser);
        } catch (deleteError) {
          console.error(
            "Could not delete Firebase user:",
            deleteError
          );
        }
      }

      // ========================================
      // FIREBASE ERROR MESSAGES
      // ========================================

      const firebaseMessages = {
        "auth/email-already-in-use":
          "This email is already registered.",

        "auth/invalid-email":
          "Please enter a valid email address.",

        "auth/weak-password":
          "Password must be at least 6 characters.",

        "auth/invalid-credential":
          "Invalid username/email or password.",

        "auth/wrong-password":
          "Invalid username/email or password.",

        "auth/user-not-found":
          "No account found with these details.",

        "auth/user-disabled":
          "This account has been disabled. Please contact support.",

        "auth/configuration-not-found":
          "Email/Password authentication is not enabled in Firebase.",

        "auth/network-request-failed":
          "Network error. Please check your internet connection.",
      };

      setError(
        firebaseMessages[err.code] ||
          err.message ||
          "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  // ========================================
  // UI
  // ========================================

  return (
    <main className="relative min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-violet-400 via-sky-400 to-amber-200 font-sans text-slate-800">

      {/* Background glow */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-[350px] w-[350px] rounded-full bg-[radial-gradient(circle,rgba(255,240,190,.55),transparent_70%)] sm:h-[420px] sm:w-[420px]" />

      {/* ========================================
          MAIN LAYOUT
      ======================================== */}

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1500px] flex-col lg:grid lg:grid-cols-[1fr_480px]">

        {/* ========================================
            LEFT SIDE
        ======================================== */}

        <section className="flex flex-col px-5 pb-5 pt-6 text-white sm:px-8 sm:pb-8 sm:pt-9 lg:min-h-screen lg:px-14 lg:py-14 xl:px-20">

          {/* Logo */}
          <div className="flex items-center gap-3 drop-shadow-md">
            <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/20 p-1 backdrop-blur-sm sm:size-14 sm:rounded-2xl">
              <img
                src={logo}
                alt="WeatherHub logo"
                className="h-full w-full object-contain"
              />
            </div>

            <strong className="font-serif text-[28px] font-medium sm:text-[34px] lg:text-[38px]">
              WeatherHub
            </strong>
          </div>

          {/* Hero */}
          <div className="mt-8 max-w-xl sm:mt-12 lg:my-auto lg:mt-0">
            <h1 className="mb-2 font-serif text-[32px] font-medium leading-[1.08] tracking-tight drop-shadow-sm sm:mb-4 sm:text-4xl md:text-[46px]">
              Ask the sky anything.
            </h1>

            <p className="max-w-md text-[14px] leading-relaxed text-white/90 sm:text-base">
              Plain-language forecasts for your city, powered by
              community — not just a chart.
            </p>
          </div>

          {/* Footer */}
          <p className="mt-6 text-[10px] text-white/70 sm:text-xs lg:mt-0">
            © 2026 WeatherHub · Available on web, iOS & Android
          </p>
        </section>

        {/* ========================================
            RIGHT SIDE
        ======================================== */}

        <section className="flex w-full items-start justify-center px-4 pb-6 sm:px-6 sm:pb-10 lg:min-h-screen lg:items-center lg:px-8 lg:py-10">

          {/* Auth Card */}
          <div className="w-full max-w-[430px] rounded-2xl border border-white/55 bg-white/15 p-4 shadow-2xl backdrop-blur-xl sm:rounded-[22px] sm:p-6 md:p-8">

            {/* ========================================
                TABS
            ======================================== */}

            <div className="mb-4 flex w-full gap-5 border-b border-white/35 sm:mb-6 sm:gap-7">

              <Tab
                active={mode === "login"}
                onClick={() => setLoginMode("login")}
              >
                Sign in
              </Tab>

              <Tab
                active={mode === "register"}
                onClick={() => setLoginMode("register")}
              >
                Create account
              </Tab>

            </div>

            {/* ========================================
                HEADING
            ======================================== */}

            <h2 className="mb-1 font-serif text-[24px] font-medium leading-tight text-white sm:text-[28px]">
              {mode === "login"
                ? "Welcome back"
                : "Create your account"}
            </h2>

            <p className="mb-4 text-xs leading-snug text-white/80 sm:mb-6 sm:text-sm">
              {mode === "login"
                ? "Sign in with your WeatherHub username or email."
                : "Join WeatherHub and get your forecasts ready."}
            </p>

            {/* ========================================
                FORM
            ======================================== */}

            <form onSubmit={submit}>

              {/* Full name */}
              {mode === "register" && (
                <Field
                  label="Full name"
                  name="name"
                  type="text"
                  icon={<UserIcon size={18} />}
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Ravi Sharma"
                />
              )}

              {/* Username */}
              {mode === "register" ? (
                <div className="mb-3 sm:mb-[18px]">

                  <label
                    htmlFor="username"
                    className="mb-[7px] block text-[13px] font-semibold text-white/90"
                  >
                    Username
                  </label>

                  <div className="relative">

                    <span className="absolute left-[13px] top-1/2 -translate-y-1/2 text-slate-800/55">
                      <UserIcon size={18} />
                    </span>

                    {/* <span className="pointer-events-none absolute left-10 top-1/2 -translate-y-1/2 text-sm text-slate-500">
                      @
                    </span> */}

                    <input
                      id="username"
                      name="username"
                      type="text"
                      required
                      autoComplete="username"
                      value={form.username}
                      onChange={handleChange}
                      onBlur={checkUsernameAvailability}
                      placeholder="ravi@1234"
                      maxLength={20}
                      className={`h-11 w-full rounded-xl border bg-white/85 py-0 pl-[45px] pr-10 text-sm text-slate-800 outline-none transition placeholder:text-slate-800/40 focus:bg-white focus:ring-4 ${
                        usernameStatus === "available"
                          ? "border-emerald-400 focus:ring-emerald-100"
                          : usernameStatus === "taken" ||
                              usernameStatus === "invalid"
                            ? "border-red-400 focus:ring-red-100"
                            : "border-white/50 focus:border-white focus:ring-white/35"
                      }`}
                    />

                    {usernameStatus === "checking" && (
                      <Loader2
                        size={17}
                        className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-slate-500"
                      />
                    )}

                    {usernameStatus === "available" && (
                      <Check
                        size={18}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600"
                      />
                    )}

                    {(usernameStatus === "taken" ||
                      usernameStatus === "invalid") && (
                      <X
                        size={18}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500"
                      />
                    )}
                  </div>

                  <p
                    className={`mt-1.5 text-[11px] ${
                      usernameStatus === "available"
                        ? "text-emerald-100"
                        : usernameStatus === "taken" ||
                            usernameStatus === "invalid"
                          ? "text-red-100"
                          : "text-white/75"
                    }`}
                  >
                    {usernameMessage ||
                      "Choose a unique username — this is how you'll sign in."}
                  </p>
                </div>
              ) : (
                <Field
                  label="Username or Email"
                  name="username"
                  type="text"
                  icon={<UserIcon size={18} />}
                  value={form.username}
                  onChange={handleChange}
                  placeholder="ravi@1234 or email@example.com"
                />
              )}

              {/* Email */}
              {mode === "register" && (
                <Field
                  label="Email"
                  name="email"
                  type="email"
                  icon={<Mail size={18} />}
                  value={form.email}
                  onChange={handleChange}
                  placeholder="ravi@example.com"
                />
              )}

              {/* Password */}
              <Field
                label="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                icon={<Lock size={18} />}
                value={form.password}
                onChange={handleChange}
                placeholder={
                  mode === "login"
                    ? "••••••••••"
                    : "Create a password"
                }
                trailing={
                  <button
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-700/60 transition hover:bg-slate-200/50 hover:text-slate-800"
                    type="button"
                    onClick={() =>
                      setShowPassword((prev) => !prev)
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>
                }
              />

              {/* Error */}
              {error && (
                <div
                  role="alert"
                  className="mb-4 rounded-xl border border-red-200/50 bg-rose-900/30 p-3 text-xs leading-relaxed text-white backdrop-blur-sm"
                >
                  {error}
                </div>
              )}

              {/* Login options */}
              {mode === "login" && (
                <div className="mb-4 flex flex-col gap-2 text-xs sm:mb-6 sm:flex-row sm:items-center sm:justify-between sm:text-[13px]">

                  <label className="flex cursor-pointer items-center gap-2 text-white/90">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="size-4 accent-slate-800"
                    />
                    Keep me signed in
                  </label>

                  <button
                    type="button"
                    onClick={() =>
                      setError(
                        "Password reset will be available soon."
                      )
                    }
                    className="self-start font-semibold text-white hover:underline sm:self-auto"
                  >
                    Forgot password?
                  </button>

                </div>
              )}

              {/* Register info */}
              {mode === "register" && (
                <p className="mb-4 text-xs leading-snug text-white/85 sm:mb-[22px]">
                  By creating an account, you agree to the
                  Terms & Privacy Policy.
                </p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={
                  loading ||
                  (mode === "register" &&
                    usernameStatus === "checking")
                }
                className="h-11 w-full rounded-xl bg-slate-800 text-sm font-bold text-white shadow-lg transition hover:bg-slate-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 sm:h-[47px] sm:text-[15px]"
              >
                {loading
                  ? "Please wait…"
                  : mode === "login"
                    ? "Sign in"
                    : "Create account"}
              </button>
            </form>

            {/* ========================================
                FEATURE PILLS
            ======================================== */}

            <div className="mt-4 flex flex-wrap gap-2 sm:mt-7 sm:gap-3">

              <FeaturePill>
                🌦️ Live weather
              </FeaturePill>

              <FeaturePill>
                👥 Community
              </FeaturePill>

              <FeaturePill>
                📍 Local insights
              </FeaturePill>

            </div>

            {/* ========================================
                LOCATION INFO
            ======================================== */}

            {mode === "register" && (
              <div className="mt-3 flex gap-2.5 rounded-xl border border-white/35 bg-white/10 p-3 backdrop-blur-sm sm:mt-5 sm:gap-3 sm:p-3.5">

                <MapPin
                  size={19}
                  className="mt-0.5 shrink-0 text-white/90"
                />

                <p className="text-xs leading-relaxed text-white/85">
                  WeatherHub can use your location to show
                  weather conditions and nearby community
                  reports.
                </p>

              </div>
            )}

          </div>
        </section>
      </div>
    </main>
  );
}

// ========================================
// TAB COMPONENT
// ========================================

function Tab({ active, children, ...props }) {
  return (
    <button
      {...props}
      type="button"
      className={`relative -mb-px whitespace-nowrap border-b-2 pb-3 text-xs font-semibold transition sm:text-sm ${
        active
          ? "border-white text-white"
          : "border-transparent text-slate-800/55 hover:text-slate-800/75"
      }`}
    >
      {children}
    </button>
  );
}

// ========================================
// INPUT FIELD
// ========================================

function Field({
  label,
  icon,
  trailing,
  ...props
}) {
  return (
    <div className="mb-3 sm:mb-[18px]">

      <label
        className="mb-[7px] block text-[13px] font-semibold text-white/90"
        htmlFor={props.name}
      >
        {label}
      </label>

      <div className="relative">

        <span className="absolute left-[13px] top-1/2 -translate-y-1/2 text-slate-800/55">
          {icon}
        </span>

        <input
          id={props.name}
          required
          {...props}
          className="h-11 w-full rounded-xl border border-white/50 bg-white/85 py-0 pl-10 pr-10 text-sm text-slate-800 outline-none transition placeholder:text-slate-800/40 focus:border-white focus:bg-white focus:ring-4 focus:ring-white/35"
        />

        {trailing}
      </div>
    </div>
  );
}

// ========================================
// FEATURE PILL
// ========================================

function FeaturePill({ children }) {
  return (
    <div className="rounded-xl border border-white/30 bg-white/15 px-3 py-2 text-xs text-white backdrop-blur-md sm:px-4 sm:py-2.5 sm:text-sm">
      {children}
    </div>
  );
}
