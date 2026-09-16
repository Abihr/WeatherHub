
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
// FLOATING WEATHER ELEMENTS
// ========================================

const weather = [
  ["⛅", "left-[6%] top-[14%] text-4xl"],
  ["🌧️", "left-[18%] top-[62%] text-3xl"],
  ["☀️", "left-[32%] top-[8%] text-2xl"],
  ["🌦️", "left-[44%] top-[44%] text-3xl"],
  ["🌥️", "left-[58%] top-[20%] text-2xl"],
  ["⛈️", "left-[70%] top-[66%] text-4xl"],
  ["🌤️", "left-[82%] top-[12%] text-3xl"],
  ["☔", "left-[90%] top-[52%] text-3xl"],
  ["🌈", "left-[12%] top-[82%] text-2xl"],
  ["❄️", "left-[64%] top-[86%] text-2xl"],
];

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

  // Username availability
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

    // Reset username availability when username changes
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
    return username
      .trim()
      .toLowerCase()
      .replace(/^@/, "");
  }

  // ========================================
  // VALIDATE USERNAME FORMAT
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
  // CHECK USERNAME AVAILABILITY
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

      // Someone already owns this username
      if (usernameSnapshot.exists()) {
        throw new Error("USERNAME_TAKEN");
      }

      // Reserve username
      transaction.set(usernameRef, {
        uid: user.uid,
        email: user.email,
        username: username,
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
        // Full name
        if (!form.name.trim()) {
          throw new Error("Please enter your full name.");
        }

        // Username
        const username = normalizeUsername(form.username);

        const usernameValidation = validateUsername(username);

        if (usernameValidation) {
          throw new Error(usernameValidation);
        }

        // Email
        if (!form.email.trim()) {
          throw new Error("Please enter your email.");
        }

        // Password
        if (form.password.length < 6) {
          throw new Error(
            "Password must be at least 6 characters."
          );
        }

        // ========================================
        // CREATE FIREBASE AUTH USER
        // ========================================

        const userCredential =
          await createUserWithEmailAndPassword(
            auth,
            form.email.trim(),
            form.password
          );

        const user = userCredential.user;

        createdUser = user;

        // ========================================
        // SAVE NAME TO FIREBASE AUTH
        // ========================================

        await updateProfile(user, {
          displayName: form.name.trim(),
        });

        // ========================================
        // RESERVE UNIQUE USERNAME
        // ========================================

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

        // ========================================
        // CREATE FIRESTORE USER DOCUMENT
        // ========================================

        await setDoc(doc(db, "users", user.uid), {
          name: form.name.trim(),

          username: username,

          email: form.email.trim(),

          photoURL: user.photoURL || "",

          // ========================================
          // LOCATION
          // ========================================

          latitude: null,
          longitude: null,

          location: {
            city: "",
            lat: null,
            lng: null,
          },

          // ========================================
          // WEATHER
          // ========================================

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

          // ========================================
          // PRIVACY
          // ========================================

          locationSharing: "friends",
          weatherSharing: true,
        });

        console.log("✅ Account created:", user.uid);
        console.log("✅ Username:", username);
        console.log("✅ Firestore profile created:", user.uid);

        // Firebase automatically signs the user in.
        return;
      }

      // ========================================
      // LOGIN
      // ========================================

      const loginValue = form.username.trim();

      if (!loginValue) {
        throw new Error("Please enter your username or email.");
      }

      if (!form.password) {
        throw new Error("Please enter your password.");
      }

      let emailToLogin = loginValue;

      // ========================================
      // USERNAME LOGIN
      // ========================================

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

      // ========================================
      // FIREBASE LOGIN
      // ========================================

      const userCredential =
        await signInWithEmailAndPassword(
          auth,
          emailToLogin,
          form.password
        );

      console.log(
        "✅ Logged in successfully:",
        userCredential.user.uid
      );
    } catch (err) {
      console.error("Firebase Auth Error:", err);

      // ========================================
      // CLEANUP IF REGISTRATION FAILED
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
    <main className="relative flex min-h-screen overflow-hidden bg-gradient-to-br from-violet-400 via-sky-400 to-amber-200 font-sans text-slate-800 max-[900px]:block">

      {/* Background glow */}

      <div className="pointer-events-none absolute -left-12 -top-24 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(255,240,190,.55),transparent_70%)]" />

      {/* Floating weather */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      >
        {weather.map(([mark, position], index) => (
          <span
            key={`${mark}-${index}`}
            className={`absolute opacity-55 drop-shadow-md motion-safe:animate-bounce ${position}`}
          >
            {mark}
          </span>
        ))}
      </div>

      {/* ========================================
          LEFT SIDE
      ======================================== */}

      <section className="relative z-10 flex min-h-screen flex-[0.85] flex-col px-8 py-10 text-white md:px-[72px] md:py-16 max-[900px]:min-h-0">

        {/* Logo */}

        <div className="flex items-center gap-3 drop-shadow-md">

          <div className="flex size-14 items-center justify-center overflow-hidden rounded-2xl bg-white/20 p-1 backdrop-blur-sm">

            <img
              src={logo}
              alt="WeatherHub logo"
              className="h-full w-full object-contain"
            />

          </div>

          <strong className="font-serif text-[38px] font-medium">
            WeatherHub
          </strong>

        </div>

        {/* Hero */}

        <div className="my-auto max-w-md pt-16 max-[900px]:my-14 max-[900px]:pt-0">

          <h1 className="mb-5 font-serif text-4xl font-medium leading-tight drop-shadow-sm md:text-[46px]">
            Ask the sky anything.
          </h1>

          <p className="max-w-sm text-base leading-relaxed text-white/90">
            Plain-language forecasts for your city, powered by
            community — not just a chart.
          </p>

          {/* Feature cards */}

          <div className="mt-8 flex flex-wrap gap-3">

            <div className="rounded-xl border border-white/30 bg-white/15 px-4 py-2.5 text-sm text-white backdrop-blur-md">
              🌦️ Live weather
            </div>

            <div className="rounded-xl border border-white/30 bg-white/15 px-4 py-2.5 text-sm text-white backdrop-blur-md">
              👥 Community
            </div>

            <div className="rounded-xl border border-white/30 bg-white/15 px-4 py-2.5 text-sm text-white backdrop-blur-md">
              📍 Local insights
            </div>

          </div>
        </div>

        <p className="text-[13px] text-white/75">
          © 2026 WeatherHub · Available on web, iOS &amp; Android
        </p>

      </section>

      {/* ========================================
          RIGHT SIDE
      ======================================== */}

      <section className="relative z-10 flex flex-1 items-center justify-center px-6 py-14 md:p-12">

        <div className="w-full max-w-[420px] rounded-[20px] border border-white/55 bg-white/15 p-7 shadow-2xl backdrop-blur-xl md:px-10 md:py-9">

          {/* ========================================
              TABS
          ======================================== */}

          <div className="mb-7 flex gap-7 border-b border-white/35">

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

          <h2 className="mb-1 font-serif text-[28px] font-medium text-white">

            {mode === "login"
              ? "Welcome back"
              : "Create your account"}

          </h2>

          <p className="mb-6 text-sm leading-relaxed text-white/80">

            {mode === "login"
              ? "Sign in with your WeatherHub username or email."
              : "Join WeatherHub and get your forecasts ready."}

          </p>

          {/* ========================================
              FORM
          ======================================== */}

          <form onSubmit={submit}>

            {/* ========================================
                REGISTER NAME
            ======================================== */}

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

            {/* ========================================
                USERNAME
            ======================================== */}

            {mode === "register" ? (
              <div className="mb-[18px]">

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

                  <span className="pointer-events-none absolute left-10 top-1/2 -translate-y-1/2 text-sm text-slate-500">
                    @
                  </span>

                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    autoComplete="username"
                    value={form.username}
                    onChange={handleChange}
                    onBlur={checkUsernameAvailability}
                    placeholder="aritra18571"
                    maxLength={20}
                    className={`h-11 w-full rounded-xl border bg-white/85 py-0 pl-[58px] pr-10 text-sm text-slate-800 outline-none placeholder:text-slate-800/40 transition focus:bg-white focus:ring-4 ${
                      usernameStatus === "available"
                        ? "border-emerald-400 focus:ring-emerald-100"
                        : usernameStatus === "taken" ||
                            usernameStatus === "invalid"
                          ? "border-red-400 focus:ring-red-100"
                          : "border-white/50 focus:border-white focus:ring-white/35"
                    }`}
                  />

                  {/* Username status icon */}

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
              /* ========================================
                 LOGIN USERNAME / EMAIL
              ======================================== */

              <Field
                label="Username or Email"
                name="username"
                type="text"
                icon={<UserIcon size={18} />}
                value={form.username}
                onChange={handleChange}
                placeholder="aritra18571 or email@example.com"
              />
            )}

            {/* ========================================
                EMAIL - REGISTER ONLY
            ======================================== */}

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

            {/* ========================================
                PASSWORD
            ======================================== */}

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
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-700/60 transition hover:bg-slate-200/50 hover:text-slate-800"
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

            {/* ========================================
                ERROR
            ======================================== */}

            {error && (
              <div
                role="alert"
                className="mb-4 rounded-xl border border-red-200/50 bg-rose-900/30 p-3 text-xs text-white backdrop-blur-sm"
              >
                {error}
              </div>
            )}

            {/* ========================================
                LOGIN OPTIONS
            ======================================== */}

            {mode === "login" && (
              <div className="mb-6 flex items-center justify-between text-[13px]">

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
                  className="font-semibold text-white hover:underline"
                >
                  Forgot password?
                </button>

              </div>
            )}

            {/* ========================================
                REGISTER INFO
            ======================================== */}

            {mode === "register" && (
              <p className="mb-[22px] text-xs leading-relaxed text-white/85">
                By creating an account, you agree to the
                Terms &amp; Privacy Policy.
              </p>
            )}

            {/* ========================================
                SUBMIT BUTTON
            ======================================== */}

            <button
              type="submit"
              disabled={
                loading ||
                (mode === "register" &&
                  usernameStatus === "checking")
              }
              className="h-[47px] w-full rounded-xl bg-slate-800 text-[15px] font-bold text-white shadow-lg transition hover:bg-slate-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Please wait…"
                : mode === "login"
                  ? "Sign in"
                  : "Create account"}
            </button>

          </form>

          {/* ========================================
              LOCATION INFO
          ======================================== */}

          {mode === "register" && (
            <div className="mt-5 flex gap-3 rounded-xl border border-white/35 bg-white/10 p-3.5 backdrop-blur-sm">

              <MapPin
                size={19}
                className="mt-0.5 shrink-0 text-white/90"
              />

              <p className="text-xs leading-relaxed text-white/85">
                WeatherHub can use your location to show
                weather conditions and nearby community reports.
              </p>

            </div>
          )}

        </div>

      </section>

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
      className={`relative -mb-px border-b-2 pb-3 text-sm font-semibold transition ${
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
    <div className="mb-[18px]">

      <label
        className="mb-[7px] block text-[13px] font-semibold text-white/90"
        htmlFor={props.name}
      >
        {label}
      </label>

      <div className="relative">

        {/* Icon */}

        <span className="absolute left-[13px] top-1/2 -translate-y-1/2 text-slate-800/55">
          {icon}
        </span>

        {/* Input */}

        <input
          id={props.name}
          required
          {...props}
          className="h-11 w-full rounded-xl border border-white/50 bg-white/85 py-0 pl-10 pr-10 text-sm text-slate-800 outline-none placeholder:text-slate-800/40 transition focus:border-white focus:bg-white focus:ring-4 focus:ring-white/35"
        />

        {trailing}

      </div>

    </div>
  );
}

