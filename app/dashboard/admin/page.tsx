'use client';

import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { db, auth } from "@/firebase/config";
import {
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  deleteDoc,
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
  // No password here for security
};

export default function AdminDashboard() {
  // Firebase authenticated user (from auth)
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);

  // App user data (role, photoURL, etc.) from Firestore
  const [appUser, setAppUser] = useState<AppUser | null>(null);

  // All users list
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [showUsers, setShowUsers] = useState(false);

  // Editing user states
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [editUserData, setEditUserData] = useState<Partial<AppUser>>({});

  // Own password change states
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordChangeStatus, setPasswordChangeStatus] = useState<string | null>(null);

  // Fetch current Firebase user and their app data
  useEffect(() => {
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        setFirebaseUser(user);
        // Fetch this user's Firestore document by email or uid
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
  }, []);

  // Fetch all users from Firestore
  async function fetchUsers() {
    setLoadingUsers(true);
    try {
      const usersSnap = await getDocs(collection(db, "users"));
      const usersList: AppUser[] = usersSnap.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<AppUser, "id">),
      }));
      setUsers(usersList);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoadingUsers(false);
    }
  }

  // Show users panel and load users
  function handleManageUsersClick() {
    setShowUsers(true);
    fetchUsers();
  }

  // Delete user with confirmation
  async function handleDeleteUser(userId: string) {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await deleteDoc(doc(db, "users", userId));
      setUsers(users.filter((u) => u.id !== userId));
      alert("User deleted");
    } catch (error) {
      alert("Failed to delete user: " + error);
    }
  }

  // Start editing a user
  function startEditUser(user: AppUser) {
    setEditUserId(user.id);
    setEditUserData({
      email: user.email,
      role: user.role,
      photoURL: user.photoURL || "",
    });
  }

  // Cancel editing
  function cancelEdit() {
    setEditUserId(null);
    setEditUserData({});
  }

  // Save edited user (Firestore only)
  async function saveEditUser() {
    if (!editUserId) return;
    try {
      const userRef = doc(db, "users", editUserId);
      await updateDoc(userRef, {
        email: editUserData.email,
        role: editUserData.role,
        photoURL: editUserData.photoURL,
      });
      setUsers(users.map((u) => (u.id === editUserId ? { ...u, ...editUserData } as AppUser : u)));
      setEditUserId(null);
      setEditUserData({});
      alert("User updated");
    } catch (error) {
      alert("Failed to update user: " + error);
    }
  }

  // Change own password securely
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
      // Reauthenticate
      await reauthenticateWithCredential(firebaseUser, credential);
      // Update password
      await updatePassword(firebaseUser, newPassword);
      setPasswordChangeStatus("Password changed successfully!");
      setOldPassword("");
      setNewPassword("");
    } catch (error: any) {
      setPasswordChangeStatus("Failed to change password: " + error.message);
    }
  }

  if (!firebaseUser || !appUser)
    return <p className="text-center mt-10">Loading user info...</p>;

  // Count active users (for example, users with role 'user' or 'admin')
  const activeUsersCount = users.length;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Admin Profile & Welcome */}
      <div className="flex items-center space-x-4">
        {appUser.photoURL ? (
          <img
            src={appUser.photoURL}
            alt="Profile"
            className="w-16 h-16 rounded-full object-cover border-2 border-blue-600"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center text-xl font-bold text-gray-700 border-2 border-blue-600">
            {appUser.email.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <p className="text-xl font-semibold">Welcome, {appUser.email}</p>
          <p className="text-gray-600">Role: {appUser.role}</p>
          <p className="mt-1 font-semibold text-blue-600">
            Active Users: {activeUsersCount}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mb-6 space-x-4">
        <button
          onClick={handleManageUsersClick}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Manage Users
        </button>
        <button
          onClick={() => signOut(auth)}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Sign Out
        </button>
      </nav>

      {/* Users Table */}
      {showUsers && (
        <section>
          <h2 className="text-2xl font-semibold mb-4">Users List</h2>
          {loadingUsers ? (
            <p>Loading users...</p>
          ) : users.length === 0 ? (
            <p>No users found.</p>
          ) : (
            <div className="overflow-x-auto border rounded">
              <table className="min-w-full table-auto border-collapse border">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border px-4 py-2">Photo</th>
                    <th className="border px-4 py-2">Email</th>
                    <th className="border px-4 py-2">Role</th>
                    <th className="border px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) =>
                    editUserId === u.id ? (
                      <tr key={u.id} className="bg-yellow-50">
                        <td className="border px-4 py-2">
                          <input
                            type="text"
                            value={editUserData.photoURL || ""}
                            onChange={(e) =>
                              setEditUserData({ ...editUserData, photoURL: e.target.value })
                            }
                            placeholder="Photo URL"
                            className="w-full border rounded p-1"
                          />
                        </td>
                        <td className="border px-4 py-2">
                          <input
                            type="email"
                            value={editUserData.email || ""}
                            onChange={(e) =>
                              setEditUserData({ ...editUserData, email: e.target.value })
                            }
                            className="w-full border rounded p-1"
                          />
                        </td>
                        <td className="border px-4 py-2">
                          <select
                            value={editUserData.role || ""}
                            onChange={(e) =>
                              setEditUserData({ ...editUserData, role: e.target.value })
                            }
                            className="w-full border rounded p-1"
                          >
                            <option value="admin">Admin</option>
                            <option value="user">User</option>
                          </select>
                        </td>
                        <td className="border px-4 py-2 space-x-2">
                          <button
                            onClick={saveEditUser}
                            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500"
                          >
                            Cancel
                          </button>
                        </td>
                      </tr>
                    ) : (
                      <tr key={u.id}>
                        <td className="border px-4 py-2 text-center">
                          {u.photoURL ? (
                            <img
                              src={u.photoURL}
                              alt="User"
                              className="w-10 h-10 rounded-full object-cover mx-auto"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-300 mx-auto flex items-center justify-center text-sm font-bold text-gray-700">
                              {u.email.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </td>
                        <td className="border px-4 py-2">{u.email}</td>
                        <td className="border px-4 py-2 capitalize">{u.role}</td>
                        <td className="border px-4 py-2 space-x-2 text-center">
                          <button
                            onClick={() => startEditUser(u)}
                            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
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

      {/* Change Password (only for current logged in user) */}
      <section className="max-w-md p-4 border rounded space-y-3">
        <h2 className="text-xl font-semibold">Change Your Password</h2>
        <input
          type="password"
          placeholder="Old Password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          className="w-full border rounded p-2"
        />
        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full border rounded p-2"
        />
        <button
          onClick={handleChangePassword}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Change Password
        </button>
        {passwordChangeStatus && (
          <p
            className={`mt-2 ${
              passwordChangeStatus.includes("successfully")
                ? "text-green-700"
                : "text-red-700"
            }`}
          >
            {passwordChangeStatus}
          </p>
        )}
      </section>
    </div>
  );
}
