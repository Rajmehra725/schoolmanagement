// lib/getCurrentUser.ts
import { auth, db } from "@/firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export interface CurrentUserData {
  email: string;
  role: string;
  name?: string;
  fatherName?: string;
  mobile?: string;
  phone?: string;
  photoUrl?: string;
  qualification?: string;
  resumeUrl?: string;
  subject?: string;
  [key: string]: any;  // For any other dynamic fields
}

export const getCurrentUser = async (): Promise<CurrentUserData | null> => {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Fetch user data from "users" collection
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userData = userDoc.exists() ? userDoc.data() : {};

        // Fetch teacher data from "teachers" collection
        const teacherDoc = await getDoc(doc(db, "teachers", user.uid));
        const teacherData = teacherDoc.exists() ? teacherDoc.data() : {};

        // Merge both data objects with teacherData overwriting userData when conflicts occur
        const mergedData: CurrentUserData = {
          email: user.email || "",
          role: userData.role || teacherData.role || "student",
          // spread userData first, then teacherData overrides if same keys exist
          ...userData,
          ...teacherData,
        };

        resolve(mergedData);
      } else {
        resolve(null);
      }
    });
  });
};
