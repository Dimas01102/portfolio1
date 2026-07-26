import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { Profile, Skill, Certificate } from '../types';
import Hero from '../components/Hero';
import Marquee from '../components/Marquee';
import About from '../components/About';
import Skills from '../components/Skills';
import GithubStats from '../components/GithubStats';
import Certificates from '../components/Certificates';
import Contact from '../components/Contact';
import Skeleton from '../components/Skeleton';

function HomeSkeleton() {
  return (
    <div className="container" style={{ paddingTop: 200, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Skeleton width="140px" height="14px" />
      <Skeleton width="60%" height="46px" />
      <Skeleton width="40%" height="22px" />
      <Skeleton width="90%" height="60px" />
      <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
        <Skeleton width="140px" height="46px" radius="8px" />
        <Skeleton width="120px" height="46px" radius="8px" />
      </div>
    </div>
  );
}

export default function Home() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [{ data: p }, { data: s }, { data: c }] = await Promise.all([
        supabase.from('profile').select('*').limit(1).maybeSingle(),
        supabase.from('skills').select('*').order('sort_order'),
        supabase.from('certificates').select('*').order('sort_order'),
      ]);
      setProfile(p as Profile | null);
      setSkills((s as Skill[]) || []);
      setCertificates((c as Certificate[]) || []);
      setLoading(false);
    })();
  }, []);

  if (loading) return <HomeSkeleton />;

  return (
    <>
      <Hero profile={profile} />
      <Marquee />
      <About profile={profile} />
      <Skills skills={skills} />
      {profile?.github_username && <GithubStats username={profile.github_username} />}
      <Certificates certificates={certificates} />
      <Contact profile={profile} />
    </>
  );
}
