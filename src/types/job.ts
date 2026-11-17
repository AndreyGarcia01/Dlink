export interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  workRegion: string;
  category: string;
  status: string;
  company: { name: string };
  applications?: { id: string }[];
  _count?: { applications: number }; // Usado no painel da empresa
}
