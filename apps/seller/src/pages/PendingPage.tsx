import React from "react";
import { Link } from "react-router-dom";
import { Clock, Store, Mail } from "lucide-react";
import { motion } from "framer-motion";

export const PendingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 via-emerald-950/30 to-dark-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass rounded-2xl p-8 shadow-2xl shadow-emerald-500/10 text-center"
      >
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl shadow-2xl shadow-yellow-500/30 mb-4">
          <Clock className="w-10 h-10 text-white" />
        </div>

        <h1 className="text-2xl font-bold text-white mt-4">
          Account Pending Approval
        </h1>

        <p className="text-dark-300 mt-2">
          Your account is currently pending admin approval. You will receive an
          email once your account is verified.
        </p>

        <div className="mt-6 p-4 bg-dark-800/50 rounded-xl border border-dark-700">
          <p className="text-sm text-dark-400">
            <Mail className="w-4 h-4 inline mr-2" />
            Contact support if you have any questions
          </p>
        </div>

        <Link
          to="/login"
          className="mt-6 inline-block px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
        >
          Back to Login
        </Link>
      </motion.div>
    </div>
  );
};
