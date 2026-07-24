
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { FaEnvelope, FaLock, FaArrowRight, FaSpinner } from "react-icons/fa";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Get redirect path from location state or sessionStorage
  const from = location.state?.from?.pathname || sessionStorage.getItem("redirectAfterLogin") || "/";

  // Clear redirect after login if coming from session
  useEffect(() => {
    sessionStorage.removeItem("redirectAfterLogin");
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Save token and user data
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Check if there's a pending booking
      const pendingBooking = sessionStorage.getItem("pendingBooking");
      if (pendingBooking) {
        const bookingData = JSON.parse(pendingBooking);
        sessionStorage.removeItem("pendingBooking");
        sessionStorage.setItem("pendingSeats", JSON.stringify(bookingData.seats));
        navigate(`/seat-selection/${bookingData.showId}`);
        return;
      }

      // Redirect to the intended page or home
      navigate(from);
    } catch (err: any) {
      setError(err.message || "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#141414] text-white flex flex-col">
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 shadow-2xl">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
              <p className="text-gray-400 text-sm mt-2">
                Sign in to continue booking your tickets
              </p>
            </div>

            {error && (
              <div className="bg-red-600/20 border border-red-500 rounded-xl p-4 mb-6">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:border-[#f47920] focus:ring-1 focus:ring-[#f47920] transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:border-[#f47920] focus:ring-1 focus:ring-[#f47920] transition"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#f47920] hover:bg-[#d4681a] text-white font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" /> Signing In...
                  </>
                ) : (
                  <>
                    Sign In <FaArrowRight />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-400 text-sm">
                Don't have an account?{" "}
                <Link to="/register" className="text-[#f47920] hover:underline font-semibold">
                  Create one now
                </Link>
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-700 text-center">
              <p className="text-gray-500 text-xs">Demo credentials:</p>
              <p className="text-gray-500 text-xs mt-1">
                Email: <span className="text-gray-400">dagim@example.com</span> |{" "}
                Password: <span className="text-gray-400">123456</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Login;