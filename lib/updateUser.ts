// lib/updateUser.ts
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/config";

export async function updateUser(email: string, data: any) {
  const docRef = doc(db, "students", email);
  await updateDoc(docRef, data);
}
