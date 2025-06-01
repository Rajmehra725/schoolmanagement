'use client';

import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { db, auth } from "@/firebase/config";
import {
  collection,
  query,
  where,
  updateDoc,
  doc,
  deleteDoc,
  onSnapshot,
  getDocs,
} from "firebase/firestore";
import {
  signOut,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  User as FirebaseUser,
} from "firebase/auth";

type AppUser = {
  id: string;
  email: string;
  role: string;
  photoURL?: string;
};

export default function AdminDashboard() {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);

  const [users, setUsers] = useState<AppUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [showUsers, setShowUsers] = useState(false);

  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [editUserData, setEditUserData] = useState<Partial<AppUser>>({});

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordChangeStatus, setPasswordChangeStatus] = useState<string | null>(null);

  // Fetch current Firebase user and their app data
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setFirebaseUser(user);
        const usersSnap = await getDocs(
          query(collection(db, "users"), where("email", "==", user.email))
        );
        if (!usersSnap.empty) {
          const docSnap = usersSnap.docs[0];
          setAppUser({ id: docSnap.id, ...(docSnap.data() as Omit<AppUser, "id">) });
        }
      } else {
        setFirebaseUser(null);
        setAppUser(null);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  // Real-time listener for all users when showUsers is true
  useEffect(() => {
    if (!showUsers) return;

    setLoadingUsers(true);
    const usersQuery = collection(db, "users");
    const unsubscribe = onSnapshot(
      usersQuery,
      (snapshot) => {
        const updatedUsers: AppUser[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<AppUser, "id">),
        }));
        setUsers(updatedUsers);
        setLoadingUsers(false);
      },
      (error) => {
        console.error("Real-time user fetch error:", error);
        setLoadingUsers(false);
      }
    );

    return () => unsubscribe();
  }, [showUsers]);

  function handleManageUsersClick() {
    setShowUsers(true);
  }

  async function handleDeleteUser(userId: string) {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await deleteDoc(doc(db, "users", userId));
      alert("User deleted");
    } catch (error) {
      alert("Failed to delete user: " + error);
    }
  }

  function startEditUser(user: AppUser) {
    setEditUserId(user.id);
    setEditUserData({
      email: user.email,
      role: user.role,
      photoURL: user.photoURL || "",
    });
  }

  function cancelEdit() {
    setEditUserId(null);
    setEditUserData({});
  }

  async function saveEditUser() {
    if (!editUserId) return;
    try {
      const userRef = doc(db, "users", editUserId);
      await updateDoc(userRef, {
        email: editUserData.email,
        role: editUserData.role,
        photoURL: editUserData.photoURL,
      });
      setEditUserId(null);
      setEditUserData({});
      alert("User updated");
    } catch (error) {
      alert("Failed to update user: " + error);
    }
  }

  async function handleChangePassword() {
    setPasswordChangeStatus(null);
    if (!firebaseUser || !firebaseUser.email) {
      setPasswordChangeStatus("No authenticated user found.");
      return;
    }
    if (!oldPassword || !newPassword) {
      setPasswordChangeStatus("Please fill old and new password.");
      return;
    }
    try {
      const credential = EmailAuthProvider.credential(firebaseUser.email, oldPassword);
      await reauthenticateWithCredential(firebaseUser, credential);
      await updatePassword(firebaseUser, newPassword);
      setPasswordChangeStatus("Password changed successfully!");
      setOldPassword("");
      setNewPassword("");
    } catch (error: any) {
      setPasswordChangeStatus("Failed to change password: " + error.message);
    }
  }

  if (!firebaseUser || !appUser)
    return <p className="text-center mt-10 animate-fadeIn">Loading user info...</p>;

  const activeUsersCount = users.length;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12">
      {/* Admin Profile & Welcome */}
      <div className="flex items-center space-x-6 animate-fadeIn">
        {appUser.photoURL ? (
          <img
            src={appUser.photoURL}
            alt="Profile"
            className="w-20 h-20 rounded-full object-cover border-4 border-blue-600 shadow-lg"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center text-3xl font-bold text-gray-700 border-4 border-blue-600 shadow-lg">
            {appUser.email.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <p className="text-3xl font-extrabold tracking-wide text-gray-900">
            Welcome, {appUser.email}
          </p>
          <p className="text-gray-600 mt-1 text-lg font-semibold">Role: {appUser.role}</p>
          <p className="mt-2 font-semibold text-blue-700 text-xl">
            Active Users: {activeUsersCount}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mb-8 space-x-6">
        <button
          onClick={handleManageUsersClick}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition transform hover:scale-105"
        >
          Manage Users
        </button>
        <button
          onClick={() => signOut(auth)}
          className="px-6 py-3 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition transform hover:scale-105"
        >
          Sign Out
        </button>
      </nav>

      {/* Users Table */}
      {showUsers && (
        <section className="animate-fadeIn">
          <h2 className="text-3xl font-semibold mb-6 border-b border-gray-300 pb-2">
            Users List
          </h2>
          {loadingUsers ? (
            <p className="text-center text-lg font-medium text-gray-700">Loading users...</p>
          ) : users.length === 0 ? (
            <p className="text-center text-lg font-medium text-gray-700">No users found.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg shadow-lg border border-gray-300">
              <table className="min-w-full table-auto border-collapse border">
                <thead className="bg-blue-100 text-blue-900 uppercase tracking-wide font-semibold text-sm select-none">
                  <tr>
                    <th className="border px-6 py-3">Photo</th>
                    <th className="border px-6 py-3">Email</th>
                    <th className="border px-6 py-3">Role</th>
                    <th className="border px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) =>
                    editUserId === u.id ? (
                      <tr
                        key={u.id}
                        className="bg-yellow-50 border-t border-yellow-400 transition-all duration-300 ease-in-out"
                      >
                        <td className="border px-4 py-3">
                          <input
                            type="text"
                            value={editUserData.photoURL || ""}
                            onChange={(e) =>
                              setEditUserData({ ...editUserData, photoURL: e.target.value })
                            }
                            placeholder="Photo URL"
                            className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-400 transition"
                          />
                        </td>
                        <td className="border px-4 py-3">
                          <input
                            type="email"
                            value={editUserData.email || ""}
                            onChange={(e) =>
                              setEditUserData({ ...editUserData, email: e.target.value })
                            }
                            className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-400 transition"
                          />
                        </td>
                        <td className="border px-4 py-3">
                          <select
                            value={editUserData.role || ""}
                            onChange={(e) =>
                              setEditUserData({ ...editUserData, role: e.target.value })
                            }
                            className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-400 transition"
                          >
                            <option value="admin">Admin</option>
                            <option value="user">User</option>
                          </select>
                        </td>
                        <td className="border px-4 py-3 space-x-3 text-center">
                          <button
                            onClick={saveEditUser}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded transition transform hover:scale-105"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-1 rounded transition transform hover:scale-105"
                          >
                            Cancel
                          </button>
                        </td>
                      </tr>
                    ) : (
                      <tr
                        key={u.id}
                        className="hover:bg-blue-50 cursor-pointer transition-colors"
                      >
                        <td className="border px-6 py-4 text-center">
                          {u.photoURL ? (
                            <img
                              src={u.photoURL}
                              alt="User Photo"
                              className="w-12 h-12 rounded-full object-cover mx-auto"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center mx-auto text-gray-700 font-semibold">
                              {u.email.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </td>
                        <td className="border px-6 py-4 break-words max-w-xs">{u.email}</td>
                        <td className="border px-6 py-4 capitalize">{u.role}</td>
                        <td className="border px-6 py-4 space-x-3 text-center whitespace-nowrap">
                          <button
                            onClick={() => startEditUser(u)}
                            className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-4 py-1 rounded transition transform hover:scale-105"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded transition transform hover:scale-105"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* Password Change Section */}
      <section className="max-w-md p-6 border rounded-lg shadow-md bg-white animate-fadeIn">
        <h3 className="text-2xl font-semibold mb-4 border-b pb-2">Change Password</h3>
        <div className="space-y-4">
          <input
            type="password"
            placeholder="Old Password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className="w-full border rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full border rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          <button
            onClick={handleChangePassword}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition transform hover:scale-105"
          >
            Change Password
          </button>
          {passwordChangeStatus && (
            <p
              className={`mt-2 text-center font-semibold ${
                passwordChangeStatus.includes("successfully") ? "text-green-600" : "text-red-600"
              }`}
            >
              {passwordChangeStatus}
            </p>
          )}
        </div>
      </section>

      <style jsx>{`
        @keyframes fadeIn {
          from {opacity: 0;}
          to {opacity: 1;}
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease forwards;
        }
      `}</style>
    </div>
  );
}
