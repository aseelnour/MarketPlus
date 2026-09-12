
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  User,
  Phone,
  Store,
  Eye,
  EyeOff,
  UserPlus,
} from "lucide-react";
import { useSellerAuth } from "../hooks/useSellerAuth";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { useLanguage } from "../hooks/useLanguage";

const registerSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional(),
});

type RegisterForm = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { register: registerSeller, isLoading } = useSellerAuth();
  const { changeLanguage, currentLanguage } = useLanguage();
  const navigate = useNavigate();
  const [error, setError] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setError("");

    const result = await registerSeller(data);

    if (result.success) {
      toast.success(
        t("auth.register.success") || "Account created successfully! 🎉",
      );
      navigate("/login");
    } else {
      setError(result.message);
      toast.error(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 via-emerald-950/30 to-dark-950 flex items-center justify-center p-4 relative overflow-hidden">
      { }
      <div className="absolute top-4 right-4 z-20 flex gap-2">
        <button
          onClick={() => changeLanguage("en")}
          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
            currentLanguage === "en"
              ? "bg-emerald-500 text-white"
              : "bg-dark-700 text-dark-300 hover:bg-dark-600"
          }`}
        >
          EN
        </button>
        <button
          onClick={() => changeLanguage("ar")}
          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
            currentLanguage === "ar"
              ? "bg-emerald-500 text-white"
              : "bg-dark-700 text-dark-300 hover:bg-dark-600"
          }`}
        >
          العربية
        </button>
      </div>

      { }
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-500/20 rounded-full blur-3xl animate-pulse-slow delay-1000" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        { }
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl shadow-2xl shadow-emerald-500/30 mb-4"
          >
            <Store className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
            {t("app.name") || "Market"}
          </h1>
          <p className="text-dark-400 mt-2">
            {t("auth.register.subtitle") || "Register as seller"}
          </p>
        </div>

        { }
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-8 shadow-2xl shadow-emerald-500/10"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1">
                  {t("auth.register.firstName") || "First Name"}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 w-4 h-4" />
                  <input
                    {...register("firstName")}
                    type="text"
                    placeholder="John"
                    className="input-primary pl-9 py-2 text-sm"
                  />
                </div>
                {errors.firstName && (
                  <p className="mt-1 text-xs text-red-400">
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1">
                  {t("auth.register.lastName") || "Last Name"}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 w-4 h-4" />
                  <input
                    {...register("lastName")}
                    type="text"
                    placeholder="Doe"
                    className="input-primary pl-9 py-2 text-sm"
                  />
                </div>
                {errors.lastName && (
                  <p className="mt-1 text-xs text-red-400">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1">
                {t("auth.register.email") || "Email Address"}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 w-4 h-4" />
                <input
                  {...register("email")}
                  type="email"
                  placeholder="seller@market.com"
                  className="input-primary pl-9 py-2 text-sm"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-400">
                  {errors.email.message}
                </p>
              )}
            </div>

            { }

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1">
                {t("auth.register.phone") || "Phone (Optional)"}
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 w-4 h-4" />
                <input
                  {...register("phone")}
                  type="tel"
                  placeholder="+1234567890"
                  className="input-primary pl-9 py-2 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1">
                {t("auth.register.password") || "Password"}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 w-4 h-4" />
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="input-primary pl-9 pr-10 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-200"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-400">
                  {errors.password.message}
                </p>
              )}
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-red-500/10 border border-red-500/20 rounded-lg p-2 text-red-400 text-xs"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {t("common.loading") || "Creating Account..."}
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  {t("auth.register.submit") || "Create Account"}
                </>
              )}
            </button>

            <p className="text-center text-dark-400 text-sm">
              {t("auth.register.haveAccount") || "Already have an account?"}{" "}
              <Link
                to="/login"
                className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
              >
                {t("auth.register.signIn") || "Sign In"}
              </Link>
            </p>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
};
