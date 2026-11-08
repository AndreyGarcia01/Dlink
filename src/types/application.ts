export interface Application {
  id: string;
  status: "pending" | "approved" | "rejected";
  requiresInterpreter: boolean;
  job?: {
    title: string;
    company: { name: string };
  };
  candidate?: {
    name: string;
    email: string;
    communicationPreference: string;
    candidateProfile?: { bio: string; skills: string };
  };
}
