import React, { useState, useEffect } from "react";
import { FaSpinner, FaUserCog } from "react-icons/fa";

interface User {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  phone?: string;
  createdAt: string;
}

function ManageUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Failed to fetch users");
      }
      const data = await response.json();
      setUsers(data.users || []);
      setError("");
    } catch (err: any) {
      console.error("Fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === "ADMIN" ? "CUSTOMER" : "ADMIN";
    if (!confirm(`Change role of this user to ${newRole}?`)) return;
    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Failed to update role");
      }
      // Refresh the list
      await fetchUsers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin text-4xl text-[#f47920]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 text-xl">⚠️ {error}</p>
        <button
          onClick={fetchUsers}
          className="mt-4 bg-[#f47920] hover:bg-[#d4681a] text-white px-6 py-2 rounded-lg transition"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-white mb-6">Manage Users</h1>
      <div className="bg-gray-800/50 rounded-xl p-4 md:p-6 border border-gray-700 overflow-x-auto">
        {users.length === 0 ? (
          <p className="text-center text-gray-400 py-8">No users found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700 text-gray-400">
                <th className="text-left py-2 px-2">Name</th>
                <th className="text-left py-2 px-2 hidden sm:table-cell">Email</th>
                <th className="text-left py-2 px-2 hidden md:table-cell">Phone</th>
                <th className="text-left py-2 px-2">Role</th>
                <th className="text-left py-2 px-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-b border-gray-700/50">
                  <td className="py-2 px-2 text-gray-300 truncate max-w-[100px]">
                    {user.fullName}
                  </td>
                  <td className="py-2 px-2 text-gray-300 hidden sm:table-cell truncate max-w-[120px]">
                    {user.email}
                  </td>
                  <td className="py-2 px-2 text-gray-300 hidden md:table-cell">
                    {user.phone || "—"}
                  </td>
                  <td className="py-2 px-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-bold ${
                        user.role === "ADMIN" ? "bg-[#f47920]" : "bg-gray-600"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="py-2 px-2">
                    <button
                      onClick={() => toggleRole(user._id, user.role)}
                      className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded-lg text-xs flex items-center gap-1 transition"
                    >
                      <FaUserCog /> {user.role === "ADMIN" ? "Demote" : "Promote"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default ManageUsers;