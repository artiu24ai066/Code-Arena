import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, Input, Spinner } from "../../components/ui/SharedComponents.jsx";
import { login } from "../../services/authService.js";
import { useAuth } from "../../stores/AuthContext.jsx";

function Login() {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await login(email, password);
      const token = response?.token ?? response?.accessToken;

      if (!token) {
        throw new Error("Login succeeded but no token was returned.");
      }

      authLogin(response?.user, token, response?.user?.role);
      navigate("/problems");
    } catch (loginError) {
      const backendMessage =
        loginError?.response?.data?.message ||
        loginError?.response?.data?.error ||
        loginError?.message;

      setError(backendMessage || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-12rem)] items-center justify-center bg-transparent px-4 py-10">
      <Card className="w-full max-w-md overflow-hidden border-accent-primary/20 p-0 shadow-card">
        <div className="h-1 bg-gradient-to-r from-accent-primary via-signal to-accent-secondary" />
        <div className="p-6 sm:p-8">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-accent-primary/25 bg-accent-primary/10 font-display text-lg font-bold text-accent-primary">
            {"</>"}
          </div>
          <p className="font-display text-xs font-semibold uppercase tracking-[0.22em] text-accent-primary">
            Welcome back
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-text-primary">Sign in</h1>
          <p className="mt-2 text-sm text-text-secondary">
          Sign in to continue to the platform.
          </p>

        <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm font-medium text-text-primary" htmlFor="email">
              Email
            </label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-text-primary" htmlFor="password">
              Password
            </label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          {error ? (
            <p role="alert" className="rounded-lg border border-verdict-wrong/30 bg-verdict-wrong/10 px-3 py-2.5 text-sm text-verdict-wrong">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent-primary px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-accent-primary/15 transition hover:-translate-y-0.5 hover:bg-accent-primary-hover hover:shadow-accent-primary/25 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? <Spinner className="border-white/25 border-t-white" /> : null}
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

          <p className="mt-6 border-t border-border-subtle/80 pt-5 text-center text-sm text-text-secondary">
            Don&apos;t have an account?{" "}
            <Link className="font-semibold text-accent-primary transition hover:text-text-primary" to="/register">
              Create an account
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}

export default Login;