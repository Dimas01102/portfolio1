const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')!;

const GEMINI_MODELS = ['gemini-3.5-flash', 'gemini-3.1-flash-lite'];

const CACHE_TTL_HOURS = 24;
const DAILY_GENERATION_LIMIT = 60; // per visitor, only counts real Gemini calls (not cache hits)
const GEMINI_TIMEOUT_MS = 20_000;

const GAMES = ['bug-hunter', 'code-output', 'fix-the-code'] as const;
type Game = (typeof GAMES)[number];

const QUESTION_COUNTS: Record<Game, number> = {
  'bug-hunter': 15,
  'code-output': 15,
  'fix-the-code': 10,
};

const LANGUAGE_POOLS: Record<Game, string[]> = {
  'bug-hunter': ['javascript', 'typescript', 'react', 'php', 'laravel', 'sql', 'html', 'css'],
  'code-output': ['javascript', 'php', 'python', 'sql', 'cpp', 'golang'],
  'fix-the-code': ['javascript', 'php', 'react', 'laravel', 'sql'],
};

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

async function db(path: string, init: RequestInit = {}) {
  return fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
}

// ---------- rate limiting (only charged for real Gemini generations) ----------
async function checkAndBumpRateLimit(visitorId: string): Promise<boolean> {
  const day = new Date().toISOString().slice(0, 10);
  const res = await db(`game_rate_limits?visitor_id=eq.${encodeURIComponent(visitorId)}&day=eq.${day}&select=count`);
  const rows = res.ok ? await res.json() : [];
  const count = rows[0]?.count ?? 0;
  if (count >= DAILY_GENERATION_LIMIT) return false;

  await db('game_rate_limits?on_conflict=visitor_id,day', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates' },
    body: JSON.stringify({ visitor_id: visitorId, day, count: count + 1 }),
  });
  return true;
}

// ---------- cache ----------
async function readCache(game: string, language: string, difficulty: string) {
  const res = await db(
    `ai_question_cache?game=eq.${game}&language=eq.${language}&difficulty=eq.${difficulty}&expires_at=gt.${encodeURIComponent(
      new Date().toISOString()
    )}&select=payload&limit=1`
  );
  if (!res.ok) return null;
  const rows = await res.json();
  return rows[0]?.payload ?? null;
}

async function writeCache(game: string, language: string, difficulty: string, payload: unknown) {
  const expiresAt = new Date(Date.now() + CACHE_TTL_HOURS * 3600 * 1000).toISOString();
  await db('ai_question_cache?on_conflict=game,language,difficulty', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates' },
    body: JSON.stringify({ game, language, difficulty, payload, expires_at: expiresAt }),
  });
}

// ---------- Gemini ----------
async function requestGemini(model: string, systemInstruction: string, prompt: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);
  try {
    return await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemInstruction }] },
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.9,
            maxOutputTokens: 4096,
            responseMimeType: 'application/json',
          },
        }),
      }
    );
  } finally {
    clearTimeout(timeout);
  }
}

function buildSystemInstruction(game: Game): string {
  return `
Kamu adalah generator soal kuis programming untuk mini-game "${game}" di sebuah portofolio developer.
Kamu HANYA mengeluarkan JSON valid sesuai skema yang diminta di pesan pengguna, tanpa markdown, tanpa komentar,
tanpa teks pembuka atau penutup apa pun.
Aturan wajib:
1. Setiap soal HARUS punya TEPAT SATU jawaban benar. Jangan pernah membuat soal ambigu atau dengan lebih dari satu jawaban valid.
2. Variasikan nama variabel, angka, dan urutan pilihan jawaban antar soal supaya tidak terasa template.
3. Soal harus valid secara teknis untuk bahasa/kategori yang diminta dan sesuai level kesulitan yang diminta.
4. Jangan menyertakan penjelasan di luar field yang diminta.
5. Keluarkan HANYA array JSON, tidak dibungkus object, tidak ada teks lain.
`.trim();
}

function buildPrompt(game: Game, language: string, difficulty: string, count: number): string {
  if (game === 'fix-the-code') {
    return `
Buat ${count} soal untuk game "Fix The Code" kategori ${language}, tingkat kesulitan ${difficulty}.
Setiap soal adalah potongan kode singkat yang punya SATU bug (syntax error atau logic error kecil dan jelas).
Kembalikan array JSON dengan setiap elemen berbentuk persis:
{
  "brokenCode": string,       // kode dengan bug, siap ditampilkan di editor
  "expectedAnswer": string,   // versi kode yang sudah diperbaiki
  "acceptableAnswers": string[], // 1-2 variasi penulisan lain yang juga dianggap benar
  "hint": string              // petunjuk singkat 1 kalimat, tanpa membocorkan jawaban penuh
}
Jangan sertakan field lain.`.trim();
  }

  const topic = game === 'bug-hunter' ? 'menemukan bug pada potongan kode' : 'menebak output yang dihasilkan potongan kode';
  return `
Buat ${count} soal pilihan ganda untuk game tentang ${topic}, kategori ${language}, tingkat kesulitan ${difficulty}.
Kembalikan array JSON dengan setiap elemen berbentuk persis:
{
  "prompt": string,          // instruksi/pertanyaan singkat
  "code": string,            // potongan kode terkait (boleh kosong string jika benar-benar tidak perlu)
  "options": [string, string, string, string], // tepat 4 pilihan, hanya 1 yang benar
  "correctIndex": number,    // index 0-3 dari jawaban yang benar
  "explanation": string      // penjelasan singkat kenapa jawaban itu benar
}
Jangan sertakan field lain.`.trim();
}

function extractJsonArray(text: string): unknown[] | null {
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) return parsed;
    if (parsed && Array.isArray(parsed.questions)) return parsed.questions;
    return null;
  } catch {
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) return null;
    try {
      const parsed = JSON.parse(match[0]);
      return Array.isArray(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }
}

function validateMcq(raw: unknown[], language: string, difficulty: string, count: number) {
  const out = [];
  for (const item of raw) {
    const q = item as Record<string, unknown>;
    if (typeof q.prompt !== 'string' || !q.prompt.trim()) continue;
    if (!Array.isArray(q.options) || q.options.length !== 4) continue;
    if (!q.options.every((o) => typeof o === 'string' && o.trim())) continue;
    const uniqueOptions = new Set(q.options.map((o) => String(o).trim().toLowerCase()));
    if (uniqueOptions.size !== 4) continue; // reject duplicate/ambiguous options
    const correctIndex = Number(q.correctIndex);
    if (!Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex > 3) continue;
    out.push({
      id: crypto.randomUUID(),
      prompt: q.prompt,
      code: typeof q.code === 'string' && q.code.trim() ? q.code : undefined,
      language,
      difficulty,
      options: q.options as [string, string, string, string],
      correctIndex: correctIndex as 0 | 1 | 2 | 3,
      explanation: typeof q.explanation === 'string' ? q.explanation : undefined,
    });
    if (out.length >= count) break;
  }
  return out;
}

function validateFixCode(raw: unknown[], language: string, difficulty: string, count: number) {
  const out = [];
  for (const item of raw) {
    const q = item as Record<string, unknown>;
    if (typeof q.brokenCode !== 'string' || !q.brokenCode.trim()) continue;
    if (typeof q.expectedAnswer !== 'string' || !q.expectedAnswer.trim()) continue;
    const acceptable = Array.isArray(q.acceptableAnswers)
      ? (q.acceptableAnswers as unknown[]).filter((a) => typeof a === 'string')
      : [];
    out.push({
      id: crypto.randomUUID(),
      language,
      difficulty,
      brokenCode: q.brokenCode,
      expectedAnswer: q.expectedAnswer,
      acceptableAnswers: acceptable as string[],
      hint: typeof q.hint === 'string' ? q.hint : undefined,
    });
    if (out.length >= count) break;
  }
  return out;
}

function validate(game: Game, raw: unknown[], language: string, difficulty: string, count: number) {
  return game === 'fix-the-code'
    ? validateFixCode(raw, language, difficulty, count)
    : validateMcq(raw, language, difficulty, count);
}

async function generateWithFallback(game: Game, language: string, difficulty: string) {
  const count = QUESTION_COUNTS[game];
  const systemInstruction = buildSystemInstruction(game);
  const prompt = buildPrompt(game, language, difficulty, count);

  let lastError = '';
  for (const model of GEMINI_MODELS) {
    // Up to 2 attempts per model in case the first JSON payload fails validation.
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const res = await requestGemini(model, systemInstruction, prompt);
        if (!res.ok) {
          lastError = await res.text();
          if (res.status !== 429 && res.status !== 500 && res.status !== 503) break;
          continue;
        }
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text || '').join('') || '';
        const rawArray = extractJsonArray(text);
        if (!rawArray) {
          lastError = 'Gemini tidak mengembalikan JSON array yang valid';
          continue;
        }
        const validated = validate(game, rawArray, language, difficulty, count);
        if (validated.length >= Math.max(5, Math.floor(count * 0.6))) {
          return validated;
        }
        lastError = `Hanya ${validated.length}/${count} soal lolos validasi`;
      } catch (err) {
        lastError = err instanceof Error ? err.message : String(err);
      }
    }
  }
  throw new Error(lastError || 'Semua model Gemini gagal menghasilkan soal yang valid');
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS_HEADERS });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  let body: { game?: string; language?: string; difficulty?: string; visitorId?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const game = body.game as Game;
  const language = (body.language || '').toString().trim();
  const difficulty = (body.difficulty || '').toString().trim();
  const visitorId = (body.visitorId || '').toString().trim();

  if (!GAMES.includes(game)) return json({ error: 'Game tidak dikenali' }, 400);
  if (!LANGUAGE_POOLS[game].includes(language)) return json({ error: 'Kategori bahasa tidak valid untuk game ini' }, 400);
  if (!['easy', 'medium', 'hard'].includes(difficulty)) return json({ error: 'Difficulty tidak valid' }, 400);
  if (!visitorId) return json({ error: 'visitorId wajib diisi' }, 400);

  try {
    const cached = await readCache(game, language, difficulty);
    if (cached) {
      return json({ game, language, difficulty, questions: cached, cached: true, generatedAt: new Date().toISOString() });
    }

    if (!GEMINI_API_KEY) return json({ error: 'Gemini belum dikonfigurasi di server' }, 503);

    const allowed = await checkAndBumpRateLimit(visitorId);
    if (!allowed) return json({ error: 'Batas harian pembuatan soal tercapai, coba lagi besok.' }, 429);

    const questions = await generateWithFallback(game, language, difficulty);
    await writeCache(game, language, difficulty, questions);

    return json({ game, language, difficulty, questions, cached: false, generatedAt: new Date().toISOString() });
  } catch (err) {
    console.error(err);
    return json({ error: 'Gagal membuat soal saat ini. Coba lagi sebentar.' }, 500);
  }
});