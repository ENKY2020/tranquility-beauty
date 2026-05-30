import { Navigate, useLocation } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "../styles/auth.css";

function Login() {
  const { user, loginWithGoogle, loading } = useAuth();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/";

  if (!loading && user) {
    return <Navigate to={from} replace />;
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-logo">TB</div>

        <span className="section-kicker">Welcome back</span>

        <h1>Continue to Tranquility Beauty</h1>

        <p>
          Sign in to view your orders, continue shopping, and access your
          dashboard securely.
        </p>

        <button className="google-login-btn" onClick={loginWithGoogle}>
          <Sparkles size={18} />
          Continue with Google
        </button>

        <small>
          Admin access is only available for approved Tranquility Beauty emails.
        </small>
      </section>
    </main>
  );
}

export default Login;