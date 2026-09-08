"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useAuthStore } from "@/lib/store/authStore";

type LoginType = "userId" | "email";

type Errors = {
  identifier?: string;
  password?: string;
};

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();

  const [loginType, setLoginType] = useState<LoginType>("userId");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});

  // =========================
  // Validation
  // =========================

  const validate = (): boolean => {
    const e: Errors = {};

    if (!identifier.trim()) {
      e.identifier =
        loginType === "userId"
          ? "User ID is required"
          : "Email is required";
    }

    if (!password) {
      e.password = "Password is required";
    }

    setErrors(e);

    return Object.keys(e).length === 0;
  };

  // =========================
  // API Login
  // =========================

  const handleLogin = async () => {
    if (!validate()) return;

    const payload =
      loginType === "userId"
        ? { userId: identifier.trim(), password }
        : { email: identifier.trim().toLowerCase(), password };

    const result = await login(payload);

    if (result.success) {
      toast.success("Welcome back! 👋");
      if (result.role === "superAdmin") {
        router.replace("/super-admin/dashboard");
      } else if (result.role === "owner") {
        router.replace("/owner/dashboard");
      } else {
        router.replace("/user/home");
      }
    } else {
      toast.error(result.message || "Login failed");
    }
  };

  // =========================
  // Login Type Change
  // =========================

  const handleLoginTypeChange = (type: LoginType) => {
    setLoginType(type);
    setIdentifier("");
    setErrors({});
  };

  // =========================
  // JSX
  // =========================

  return (
    <div className="relative flex min-h-screen flex-1 flex-col overflow-hidden bg-background">

      {/* ================= Background Blobs ================= */}

      <div
        className="
          pointer-events-none
          absolute
          -right-15
          -top-20
          h-60
          w-60
          rounded-full
          bg-primary/10
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          -bottom-15
          -left-20
          h-50
          w-50
          rounded-full
          bg-secondary/10
        "
      />

      {/* ================= Main Content ================= */}

      <div className="relative flex min-h-screen flex-1 overflow-y-auto">

        <div
          className="
            mx-auto
            flex
            min-h-screen
            w-full
            max-w-md
            flex-col
            justify-center
            gap-6
            px-6
            py-8
          "
        >

          {/* ================= Header ================= */}

          <div className="flex flex-col items-center gap-2">

            {/* Logo */}

            <div
              className="
                mb-2
                flex
                h-20
                w-20
                items-center
                justify-center
                rounded-2xl
                bg-linear-to-br
                from-primary
                to-primary/70
                shadow-[0_0_30px_rgba(0,0,0,0.15)]
              "
            >
              <span className="text-[40px] leading-none">
                🍱
              </span>
            </div>

            {/* App Name */}

            <h1
              className="
                text-3xl
                font-bold
                tracking-[3px]
                text-foreground
              "
            >
              TFNS
            </h1>

            {/* Tagline */}

            <p
              className="
                text-base
                tracking-[0.5px]
                text-muted-foreground
              "
            >
              Premium Tiffin Management
            </p>

          </div>

          {/* ================= Login Card ================= */}

          <div
            className="
              flex
              flex-col
              gap-4
              rounded-2xl
              border
              border-border
              bg-card
              p-6
              shadow-xl
            "
          >

            {/* Card Title */}

            <div>

              <h2
                className="
                  text-2xl
                  font-bold
                  text-foreground
                "
              >
                Sign In
              </h2>

              <p
                className="
                  -mt-1
                  text-base
                  text-muted-foreground
                "
              >
                Access your tiffin dashboard
              </p>

            </div>

            {/* ================= Login Type Toggle ================= */}

            <div
              className="
                flex
                rounded-lg
                bg-muted
                p-1
              "
            >

              {/* User ID */}

              <button
                type="button"
                onClick={() => handleLoginTypeChange("userId")}
                className={`
                  flex-1
                  rounded-md
                  py-2
                  text-sm
                  font-medium
                  transition-all
                  duration-200
                  ${
                    loginType === "userId"
                      ? "bg-primary text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }
                `}
              >
                User ID
              </button>

              {/* Email */}

              <button
                type="button"
                onClick={() => handleLoginTypeChange("email")}
                className={`
                  flex-1
                  rounded-md
                  py-2
                  text-sm
                  font-medium
                  transition-all
                  duration-200
                  ${
                    loginType === "email"
                      ? "bg-primary text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }
                `}
              >
                Email
              </button>

            </div>

            {/* ================= Input Fields ================= */}

            <div className="flex flex-col gap-4">

              {/* Identifier */}

              <div className="flex flex-col gap-2">

                <label
                  className="
                    text-sm
                    font-medium
                    text-foreground
                  "
                >
                  {loginType === "userId"
                    ? "User ID"
                    : "Email Address"}
                </label>

                <input
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);

                    if (errors.identifier) {
                      setErrors((prev) => ({
                        ...prev,
                        identifier: undefined,
                      }));
                    }
                  }}
                  placeholder={
                    loginType === "userId"
                      ? "e.g. AP0001 or admin"
                      : "your@email.com"
                  }
                  type={
                    loginType === "email"
                      ? "email"
                      : "text"
                  }
                  autoCapitalize={
                    loginType === "userId"
                      ? "characters"
                      : "none"
                  }
                  className={`
                    h-11
                    w-full
                    rounded-lg
                    border
                    bg-background
                    px-3
                    text-sm
                    text-foreground
                    outline-none
                    transition-all
                    placeholder:text-muted-foreground
                    focus:ring-2
                    focus:ring-primary/20
                    ${
                      errors.identifier
                        ? "border-red-500 focus:ring-red-500/20"
                        : "border-border focus:border-primary"
                    }
                  `}
                />

                {errors.identifier && (
                  <p className="text-xs text-red-500">
                    {errors.identifier}
                  </p>
                )}

              </div>

              {/* Password */}

              <div className="flex flex-col gap-2">

                <label
                  className="
                    text-sm
                    font-medium
                    text-foreground
                  "
                >
                  Password
                </label>

                <input
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);

                    if (errors.password) {
                      setErrors((prev) => ({
                        ...prev,
                        password: undefined,
                      }));
                    }
                  }}
                  placeholder="Enter your password"
                  type="password"
                  className={`
                    h-11
                    w-full
                    rounded-lg
                    border
                    bg-background
                    px-3
                    text-sm
                    text-foreground
                    outline-none
                    transition-all
                    placeholder:text-muted-foreground
                    focus:ring-2
                    focus:ring-primary/20
                    ${
                      errors.password
                        ? "border-red-500 focus:ring-red-500/20"
                        : "border-border focus:border-primary"
                    }
                  `}
                />

                {errors.password && (
                  <p className="text-xs text-red-500">
                    {errors.password}
                  </p>
                )}

              </div>

            </div>

            {/* ================= Login Button ================= */}

            <button
              type="button"
              onClick={handleLogin}
              disabled={isLoading}
              className="
                mt-2
                h-12
                w-full
                rounded-lg
                bg-primary
                font-medium
                text-white
                shadow-sm
                transition-all
                duration-200
                hover:opacity-90
                active:scale-[0.98]
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </button>

            {/* ================= Hint ================= */}

            <p
              className="
                text-center
                text-sm
                leading-5
                text-muted-foreground
              "
            >
              Contact your service owner or admin
              <br />
              if you forgot your credentials.
            </p>

          </div>

          {/* ================= Footer ================= */}

          <p
            className="
              text-center
              text-xs
              tracking-[0.5px]
              text-muted-foreground
            "
          >
            TFNS • Tiffin Management System
          </p>

        </div>
      </div>
    </div>
  );
}