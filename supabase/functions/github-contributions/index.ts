const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Cache-Control': 'no-store',
};

interface GraphQLDay {
  date: string;
  contributionCount: number;
  contributionLevel: 'NONE' | 'FIRST_QUARTILE' | 'SECOND_QUARTILE' | 'THIRD_QUARTILE' | 'FOURTH_QUARTILE';
}

interface GraphQLResponse {
  data?: {
    user: {
      contributionsCollection: {
        contributionCalendar: {
          totalContributions: number;
          weeks: { contributionDays: GraphQLDay[] }[];
        };
      };
    } | null;
  };
  errors?: { message: string }[];
}

const QUERY = `
  query ($login: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $login) {
      contributionsCollection(from: $from, to: $to) {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
              contributionLevel
            }
          }
        }
      }
    }
  }
`;

const LEVEL_MAP: Record<GraphQLDay['contributionLevel'], 0 | 1 | 2 | 3 | 4> = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};

// GitHub's GraphQL API tells us exactly which shading level it uses for
// each day via contributionLevel — the same value github.com's own graph
// is rendered from. No need to guess buckets ourselves.
function levelize(days: GraphQLDay[]) {
  return days.map((d) => ({
    date: d.date,
    count: d.contributionCount,
    level: LEVEL_MAP[d.contributionLevel],
  }));
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  try {
    const url = new URL(req.url);
    const username = url.searchParams.get('username');
    if (!username) {
      return new Response(JSON.stringify({ error: 'Missing "username" query param' }), {
        status: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    const token = Deno.env.get('GITHUB_TOKEN');
    if (!token) {
      return new Response(JSON.stringify({ error: 'GITHUB_TOKEN secret is not configured' }), {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    const now = new Date();
    const yearAgo = new Date(now);
    yearAgo.setUTCDate(yearAgo.getUTCDate() - 365);

    const ghRes = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: QUERY,
        variables: { login: username, from: yearAgo.toISOString(), to: now.toISOString() },
      }),
    });

    const json: GraphQLResponse = await ghRes.json();

    if (json.errors?.length) {
      return new Response(JSON.stringify({ error: json.errors[0].message }), {
        status: 502,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    const calendar = json.data?.user?.contributionsCollection.contributionCalendar;
    if (!calendar) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    const allDays = calendar.weeks.flatMap((w) => w.contributionDays);
    const days = levelize(allDays);

    return new Response(
      JSON.stringify({ total: calendar.totalContributions, days }),
      { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }
});