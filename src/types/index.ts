export interface Profile {
  id: string;
  full_name: string;
  role_titles: string[];
  about: string;
  tagline: string | null;
  photo_url: string | null;
  resume_url: string | null;
  github_username: string;
  email: string | null;
  location: string | null;
  updated_at: string;
}

export interface Skill {
  id: string;
  name: string;
  icon: string;
  category: string;
  level: number;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
}

export interface Certificate {
  id: string;
  title: string;
  issuer: string;
  issue_date: string | null;
  image_url: string | null;
  credential_url: string | null;
  sort_order: number;
  created_at: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  tech_stack: string[];
  live_url: string | null;
  repo_url: string | null;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  tags: string[];
  is_published: boolean;
  created_at: string;
  updated_at: string;
}