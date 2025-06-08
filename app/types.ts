export interface User {
  id: string;
  name: string;
  photoURL: string; // make it required
  online: boolean;
   email: string;
  avatar: string;
  displayName: string;
  
}
export interface Message {
  id: string;
  text: string;
  uid: string;
  name: string;
  timestamp?: any;
  seen?: boolean;
  chatParticipants: string[];
  replyMessage?: any;
 // optional property jo reply wala message hold karega
}
export interface ChatHeaderProps {
  user: User;
  onBack?: () => void;
}