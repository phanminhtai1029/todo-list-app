import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-blue-600">
                🎯 Todo-List
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Hi, {user?.username}!</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-2xl p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Welcome to Your Dashboard! 🎉
          </h1>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-blue-800 mb-3">
              Your Profile
            </h2>
            <div className="space-y-2">
              <p className="text-gray-700">
                <span className="font-semibold">Email:</span> {user?.email}
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">Username:</span>{" "}
                {user?.username}
              </p>
              {user?.full_name && (
                <p className="text-gray-700">
                  <span className="font-semibold">Full Name:</span>{" "}
                  {user.full_name}
                </p>
              )}
              <p className="text-gray-700">
                <span className="font-semibold">Account Status:</span>{" "}
                <span className="text-green-600 font-semibold">Active</span>
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">Member Since:</span>{" "}
                {new Date(user?.created_at || "").toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-green-800 mb-3">
              ✅ Authentication Working!
            </h2>
            <p className="text-gray-700 mb-4">
              Congratulations! Sprint 1 is complete. Your authentication system
              is working perfectly.
            </p>
            <div className="space-y-2 text-sm text-gray-600">
              <p>✅ User registration</p>
              <p>✅ Login with JWT</p>
              <p>✅ Password hashing</p>
              <p>✅ Protected routes</p>
              <p>✅ Token refresh</p>
              <p>✅ Logout functionality</p>
            </div>
          </div>

          <div className="mt-6 text-center space-y-4">
            <p className="text-gray-600">
              🚀 Sprint 2: Board Management Complete!
            </p>
            <button
              onClick={() => navigate("/boards")}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition transform hover:scale-105"
            >
              Go to My Boards →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
