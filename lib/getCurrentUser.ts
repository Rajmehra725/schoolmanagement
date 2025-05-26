// lib/getCurrentUser.ts
import { auth, db } from "@/firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export const getCurrentUser = async () => {
  return new Promise<{ email: string; role: string } | null>((resolve) => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const role = userDoc.data()?.role || "student";
        resolve({ email: user.email || "", role });
      } else {
        resolve(null);
      }
    });
  });
};
