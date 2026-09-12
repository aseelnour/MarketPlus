import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, LogIn, Eye, EyeOff, Sparkles } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { useLanguage } from "../hooks/useLanguage";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const { login, isLoading } = useAuth();
  const { changeLanguage, currentLanguage } = useLanguage();
  const navigate = useNavigate();
  const [error, setError] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setError("");
    const result = await login(data);

    if (result.success) {
      toast.success(t("auth.login.success"));
      navigate("/dashboard");
    } else {
      setError(result.message);
      toast.error(t("auth.login.error"));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 via-primary-950/30 to-dark-950 flex items-center justify-center p-4 relative overflow-hidden">
      { }
      <div className="absolute top-4 right-4 z-20 flex gap-2">
        <button
          onClick={() => changeLanguage("en")}
          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
            currentLanguage === "en"
              ? "bg-primary-500 text-white"
              : "bg-dark-700 text-dark-300 hover:bg-dark-600"
          }`}
        >
          EN
        </button>
        <button
          onClick={() => changeLanguage("ar")}
          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
            currentLanguage === "ar"
              ? "bg-primary-500 text-white"
              : "bg-dark-700 text-dark-300 hover:bg-dark-600"
          }`}
        >
          العربية
        </button>
      </div>

      { }
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent-purple/20 rounded-full blur-3xl animate-pulse-slow delay-1000" />
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
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-accent-purple rounded-2xl shadow-2xl shadow-primary-500/30 mb-4"
          >
            <Sparkles className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-400 via-accent-purple to-accent-pink bg-clip-text text-transparent">
            {t("app.name")}
          </h1>
          <p className="text-dark-400 mt-2">{t("auth.login.title")}</p>
        </div>

        { }
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-8 shadow-2xl shadow-primary-500/10"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                {t("auth.login.email")}
              </label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 group-focus-within:text-primary-400 transition-colors w-5 h-5" />
                <input
                  {...register("email")}
                  type="email"
                  placeholder="admin@market.com"
                  className="input-primary pl-10"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                {t("auth.login.password")}
              </label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 group-focus-within:text-primary-400 transition-colors w-5 h-5" />
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="input-primary pl-10 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-200 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.password.message}
                </p>
              )}
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {t("common.loading")}
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  {t("auth.login.submit")}
                </>
              )}
            </button>

            <p className="text-center text-dark-400 text-sm"></p>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
};
