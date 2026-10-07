import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, Input, Spinner } from "../../components/ui/SharedComponents.jsx";
import { register } from "../../services/authService.js";

function Register() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await register(username, email, password);
      navigate("/login");
    } catch (registerError) {
      const backendMessage = registerError?.response?.data?.message;
      setError(backendMessage || "Registration failed. Please try again.");
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
            Join the arena
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-text-primary">Create account</h1>
          <p className="mt-2 text-sm text-text-secondary">
          Create an account to start solving problems.
          </p>

        <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm font-medium text-text-primary" htmlFor="username">
              Username
            </label>
            <Input
              id="username"
              type="text"
              autoComplete="username"
              placeholder="Choose a username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
            />
          </div>

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
              autoComplete="new-password"
              placeholder="Create a password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-text-primary" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Enter your password again"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
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
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

          <p className="mt-6 border-t border-border-subtle/80 pt-5 text-center text-sm text-text-secondary">
            Already have an account?{" "}
            <Link className="font-semibold text-accent-primary transition hover:text-text-primary" to="/login">
              Sign in
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}

export default Register;