const LOCAL_ICON_OVERRIDES: Record<string, string> = {
  vscode: 'vscode',
  visualstudiocode: 'vscode',
  visualstudio: 'vscode',
  vs: 'vscode',
};

const ICON_ALIASES: Record<string, string> = {
  nodejs: 'nodedotjs',
  node: 'nodedotjs',
  golang: 'go',
  cplusplus: 'cplusplus',
  cpp: 'cplusplus',
  dotnet: 'dotnet',
  net: 'dotnet',
  postgres: 'postgresql',
  postgresql: 'postgresql',
  mongo: 'mongodb',
  nextjs: 'nextdotjs',
  next: 'nextdotjs',
  nuxtjs: 'nuxtdotjs',
  nuxt: 'nuxtdotjs',
  expressjs: 'express',
  vuejs: 'vuedotjs',
  vue: 'vuedotjs',
  html: 'html5',
  css: 'css3',
  tailwind: 'tailwindcss',
  tailwindcss: 'tailwindcss',
  githubactions: 'githubactions',
  github: 'github',
  git: 'git',
  photoshop: 'adobephotoshop',
  illustrator: 'adobeillustrator',
  ai: 'openai',
  vercel: 'vercel',
  vite: 'vite',
  supabase: 'supabase',
  firebase: 'firebase',
  laravel: 'laravel',
  php: 'php',
  mysql: 'mysql',
  docker: 'docker',
  figma: 'figma',
  linux: 'linux',
  ubuntu: 'ubuntu',
  windows: 'windows11',
};

export function autoIconFor(name: string): string {
  const slug = slugifyIconName(name);
  if (LOCAL_ICON_OVERRIDES[slug]) return `local:${LOCAL_ICON_OVERRIDES[slug]}`;
  return `si:${ICON_ALIASES[slug] || slug}`;
}

/** @deprecated use autoIconFor — kept so nothing else importing this breaks */
export function resolveSimpleIconSlug(name: string): string {
  const slug = slugifyIconName(name);
  return ICON_ALIASES[slug] || slug;
}

export function slugifyIconName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\+\+/g, 'plusplus')
    .replace(/#/g, 'sharp')
    .replace(/[^a-z0-9]+/g, '');
}

export function simpleIconUrl(slug: string): string {
  return `https://cdn.simpleicons.org/${slug}`;
}

export function isSimpleIcon(icon: string): boolean {
  return icon.startsWith('si:');
}

export function isLocalIcon(icon: string): boolean {
  return icon.startsWith('local:');
}