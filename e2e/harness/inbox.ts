/**
 * The harness HTTP server:
 * - `POST /emails` stands in for Resend's API. The production server runs with
 *   EMAIL_PROVIDER=resend and RESEND_BASE_URL pointing here (the SDK reads it),
 *   so emails go through the real provider code and land in this inbox.
 * - `/e2e/*` lets tests read emails, reset rate limits, look up seeded rows and tell
 *   one harness run from the next.
 */
import { randomUUID } from "node:crypto";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import type { DemoQuery } from "../../scripts/lib/demo-data.ts";
import { serveTmdb } from "./tmdb.ts"; // @parda

export type CapturedEmail = { id: string; to: string; subject: string; text: string; html: string; tag?: string };

const readJson = async (request: IncomingMessage): Promise<Record<string, unknown>> => {
	const chunks: Buffer[] = [];
	for await (const chunk of request) chunks.push(chunk as Buffer);
	const body = Buffer.concat(chunks).toString("utf8");
	return body ? (JSON.parse(body) as Record<string, unknown>) : {};
};

const send = (response: ServerResponse, status: number, body: unknown) => {
	response.writeHead(status, { "content-type": "application/json" });
	response.end(JSON.stringify(body));
};

// apps:start
const ownerOf = async (query: DemoQuery, email: string | null) => {
	const { rows } = await query(`select "id" from "user" where "email" = $1`, [email]);
	const owner = rows[0]?.id;
	if (!owner) throw new Error(`no user ${email}`);
	return owner;
};

/**
 * A user's review note, made on first ask: a body with a heading and a list, tags, and
 * shared (its token is the public page's). For the editor and the shared page's review.
 */
async function reviewNote(query: DemoQuery, email: string | null) {
	const owner = await ownerOf(query, email);
	const { rows: found } = await query(
		`select "id", "share_token" as "token" from "note" where "owner_id" = $1 and "title" = 'Review note'`,
		[owner],
	);
	if (found[0]) return found[0];
	const { rows } = await query(
		`insert into "note" ("owner_id", "title", "body", "body_text", "tags", "pinned", "share_token")
		values ($1, 'Review note', '<h2>Packing</h2><ul><li><p>Boots</p></li><li><p>A long line of text that has to wrap on a phone without pushing the page sideways</p></li></ul>', 'Packing
Boots', '{trek,review}', true, $2)
		returning "id", "share_token" as "token"`,
		[owner, randomUUID().replaceAll("-", "")],
	);
	return rows[0];
}

/** A user's review link, made on first ask, with clicks from a few places over the last days. */
async function reviewLink(query: DemoQuery, email: string | null) {
	const owner = await ownerOf(query, email);
	const { rows: found } = await query(
		`select "id", "slug" from "link" where "owner_id" = $1 and "title" = 'Review link'`,
		[owner],
	);
	if (found[0]) return found[0];
	const slug = `review-${randomUUID().slice(0, 8)}`;
	const { rows } = await query(
		`insert into "link" ("owner_id", "slug", "target", "title") values ($1, $2, 'https://example.com/a/rather/long/path?with=query', 'Review link') returning "id", "slug"`,
		[owner, slug],
	);
	const link = rows[0];
	await query(
		`insert into "link_click" ("owner_id", "link_id", "at", "referrer_host", "country", "device")
		select $1, $2, now() - (n || ' hours')::interval, (array['news.example', null, 'social.example'])[n % 3 + 1], (array['NP', 'IN', null])[n % 3 + 1], (array['mobile', 'desktop', 'tablet'])[n % 3 + 1]
		from generate_series(1, 24) as n`,
		[owner, link?.id],
	);
	return link;
}

/** Today in the app's time zone, in SQL. */
const TODAY_SQL = `(now() at time zone 'Asia/Kathmandu')::date`;

/**
 * A user's review expenses, made on first ask: three categories (one with a long name),
 * this month's and earlier months' spending in both currencies, and two budgets (one
 * over), so the dashboard's charts, budgets and list all have something to show.
 */
async function reviewExpenses(query: DemoQuery, email: string | null) {
	const owner = await ownerOf(query, email);
	const { rows: found } = await query(
		`select "id" from "expense_category" where "owner_id" = $1 and "name" = 'Review food'`,
		[owner],
	);
	if (found[0]) return { ok: true };
	const { rows: categories } = await query(
		`insert into "expense_category" ("owner_id", "name", "color", "icon")
		values ($1, 'Review food', 'orange', 'utensils'), ($1, 'Transport', 'blue', 'bus'),
		($1, 'A category with a rather long name that has to wrap or truncate', 'violet', 'gift')
		returning "id", "name"`,
		[owner],
	);
	const [food, transport, long] = categories.map((row) => row.id);
	await query(
		`insert into "expense_transaction" ("owner_id", "category_id", "amount_minor", "currency", "occurred_on", "note")
		select $1, (array[$2, $3, $4, null]::uuid[])[n % 4 + 1], 50000 + n * 1350, case when n % 9 = 0 then 'USD' else 'NPR' end,
			date_trunc('month', ${TODAY_SQL})::date - ((n % 6) * 31 || ' days')::interval + ((n * 3) % 25 || ' days')::interval,
			(array['Groceries', '', 'A note long enough to have to wrap or be cut on a phone screen'])[n % 3 + 1]
		from generate_series(1, 30) as n`,
		[owner, food, transport, long],
	);
	await query(
		`insert into "expense_transaction" ("owner_id", "category_id", "amount_minor", "currency", "occurred_on", "note")
		values ($1, $2, 120000, 'NPR', ${TODAY_SQL}, 'Momo')`,
		[owner, food],
	);
	await query(
		`insert into "expense_budget" ("owner_id", "category_id", "month", "currency", "amount_minor")
		values ($1, $2, date_trunc('month', ${TODAY_SQL})::date, 'NPR', 100000),
		($1, $3, date_trunc('month', ${TODAY_SQL})::date, 'NPR', 9000000)`,
		[owner, food, transport],
	);
	return { ok: true };
}

/** A user's review habit, made on first ask: twice a day on weekdays, with ninety days of check-ins and gaps. */
async function reviewHabit(query: DemoQuery, email: string | null) {
	const owner = await ownerOf(query, email);
	const { rows: found } = await query(`select "id" from "habit" where "owner_id" = $1 and "name" = 'Review habit'`, [
		owner,
	]);
	if (found[0]) return found[0];
	const { rows } = await query(
		`insert into "habit" ("owner_id", "name", "color", "days", "target", "created_at")
		values ($1, 'Review habit', 'teal', 62, 2, now() - interval '400 days') returning "id"`,
		[owner],
	);
	const habit = rows[0];
	await query(
		`insert into "habit_checkin" ("habit_id", "owner_id", "day", "count")
		select $2, $1, ${TODAY_SQL} - n, case when n % 5 = 0 then 1 else 2 end
		from generate_series(1, 380) as n where n % 7 <> 3`,
		[owner, habit?.id],
	);
	return habit;
}

/** Questions of every kind for the review form (one long label, so the pages must wrap it). */
const REVIEW_FORM_FIELDS = [
	{
		id: "freview01",
		type: "short_text",
		label: "Your name",
		help: "As you'd like to be addressed",
		required: true,
		maxLength: 80,
	},
	{
		id: "freview02",
		type: "rating",
		label: "How was the trek overall?",
		help: "",
		required: true,
		lowLabel: "Poor",
		highLabel: "Superb",
	},
	{
		id: "freview03",
		type: "single_select",
		label: "Which route did you take, and would you recommend it to someone walking it for the first time?",
		help: "",
		required: false,
		options: [
			{ id: "oroute1", label: "Annapurna Circuit" },
			{ id: "oroute2", label: "Everest Base Camp" },
			{ id: "oroute3", label: "Langtang Valley" },
		],
		display: "radio",
	},
	{
		id: "freview04",
		type: "multi_select",
		label: "What did you bring?",
		help: "",
		required: false,
		options: [
			{ id: "obring1", label: "Poles" },
			{ id: "obring2", label: "A water filter" },
			{ id: "obring3", label: "Crampons" },
		],
		maxChoices: null,
	},
	{
		id: "freview05",
		type: "number",
		label: "Days on the trail",
		help: "",
		required: false,
		min: 1,
		max: 60,
		integer: true,
	},
	{ id: "freview06", type: "date", label: "When did you start?", help: "", required: false, min: null, max: null },
	{ id: "freview07", type: "email", label: "Email", help: "", required: false },
	{ id: "freview08", type: "long_text", label: "Anything else?", help: "", required: false, maxLength: 2000 },
	{ id: "freview09", type: "consent", label: "You may quote my answers.", help: "", required: false },
	{
		id: "freview10",
		type: "single_select",
		label: "Season",
		help: "",
		required: false,
		display: "dropdown",
		options: [
			{ id: "oseas01", label: "Spring" },
			{ id: "oseas02", label: "Autumn" },
		],
	},
];

/**
 * A user's review form, made on first ask: published, with a question of every kind and
 * a few responses (one with a long answer), for the builder, the results and /f/$slug.
 */
async function reviewForm(query: DemoQuery, email: string | null) {
	const owner = await ownerOf(query, email);
	const { rows: found } = await query(
		`select "id", "slug" from "form" where "owner_id" = $1 and "title" = 'Review form'`,
		[owner],
	);
	if (found[0]) return found[0];
	const slug = randomUUID().replaceAll("-", "").slice(0, 10);
	const { rows } = await query(
		`insert into "form" ("owner_id", "slug", "title", "description", "fields", "status", "published_at")
		values ($1, $2, 'Review form', 'A few questions about your last trek, so the next one goes better.', $3::jsonb, 'published', now())
		returning "id", "slug"`,
		[owner, slug, JSON.stringify(REVIEW_FORM_FIELDS)],
	);
	const form = rows[0];
	const long =
		"A long answer that has to wrap on a phone without pushing the page sideways, because nobody writes short notes about the mountains.";
	await query(
		`insert into "form_response" ("form_id", "owner_id", "data", "submitted_at")
		select $1, $2, jsonb_build_object(
			'freview01', 'Respondent ' || n,
			'freview02', n % 5 + 1,
			'freview03', (array['oroute1', 'oroute2', 'oroute3'])[n % 3 + 1],
			'freview04', jsonb_build_array('obring1'),
			'freview05', n + 3,
			'freview09', n % 2 = 0,
			'freview08', case when n = 1 then $3 else 'Fine' end
		), now() - (n || ' hours')::interval
		from generate_series(1, 8) as n`,
		[form?.id, owner, long],
	);
	return form;
}
// apps:end

export async function serveHarness(port: number, query: DemoQuery) {
	const emails: CapturedEmail[] = [];
	// New per start (a fresh database): tests key their saved sign-ins on it.
	const runId = randomUUID();

	const server = createServer(async (request, response) => {
		try {
			const url = new URL(request.url ?? "/", "http://harness");
			const route = `${request.method} ${url.pathname}`;

			if (serveTmdb(url, response)) return; // @parda
			if (route === "POST /emails") {
				const body = await readJson(request);
				const to = Array.isArray(body.to) ? String(body.to[0]) : String(body.to);
				const tags = Array.isArray(body.tags) ? (body.tags as Array<{ value?: string }>) : [];
				const email: CapturedEmail = {
					id: `e2e-${emails.length + 1}`,
					to: to.toLowerCase(),
					subject: String(body.subject ?? ""),
					text: String(body.text ?? ""),
					html: String(body.html ?? ""),
					...(tags[0]?.value ? { tag: tags[0].value } : {}),
				};
				emails.push(email);
				return send(response, 200, { id: email.id });
			}
			if (route === "GET /e2e/emails") {
				const to = url.searchParams.get("to")?.toLowerCase();
				return send(
					response,
					200,
					emails.filter((email) => !to || email.to === to),
				);
			}
			if (route === "GET /e2e/run") return send(response, 200, { id: runId });
			if (route === "POST /e2e/reset-rate-limits") {
				await query(`delete from "rate_limit"`);
				return send(response, 200, { ok: true });
			}
			if (route === "GET /e2e/test-crud") {
				const { rows } = await query(`select "id", "slug", "status" from "test_crud" where "slug" = $1`, [
					url.searchParams.get("slug"),
				]);
				return send(response, rows[0] ? 200 : 404, rows[0] ?? { error: "not found" });
			}
			// portfolio:start
			if (route === "GET /e2e/portfolio") {
				const table = url.searchParams.get("kind") === "post" ? "portfolio_post" : "portfolio_project";
				const { rows } = await query(`select "id", "slug", "status" from "${table}" where "slug" = $1`, [
					url.searchParams.get("slug"),
				]);
				return send(response, rows[0] ? 200 : 404, rows[0] ?? { error: "not found" });
			}
			// portfolio:end
			// taskline:start
			if (route === "GET /e2e/taskline-project") {
				// A team project's id (the old Kanban URLs redirect by id, decision 0210).
				const { rows } = await query(
					`select p."id" from "tl_project" p join "tl_workspace" w on w."id" = p."workspace_id" where w."kind" = 'team' and p."key" = $1`,
					[url.searchParams.get("key")],
				);
				return send(response, rows[0] ? 200 : 404, rows[0] ?? { error: "not found" });
			}
			if (route === "GET /e2e/taskline-sprint") {
				// A team project's sprint in a state (Task 52: the reports' review).
				const { rows } = await query(
					`select s."id" from "tl_sprint" s join "tl_project" p on p."id" = s."project_id" join "tl_workspace" w on w."id" = p."workspace_id"
					 where w."kind" = 'team' and p."key" = $1 and s."state" = $2 order by s."start_on" limit 1`,
					[url.searchParams.get("key"), url.searchParams.get("state")],
				);
				return send(response, rows[0] ? 200 : 404, rows[0] ?? { error: "not found" });
			}
			// taskline:end
			// parda:start
			if (route === "GET /e2e/parda-source") {
				const { rows } = await query(`select "id" from "pd_source" where "name"->>'en' = $1 limit 1`, [
					url.searchParams.get("name"),
				]);
				return send(response, rows[0] ? 200 : 404, rows[0] ?? { error: "not found" });
			}
			if (route === "POST /e2e/parda-rank") {
				// Task 65a: today's standings, as the daily rollup would write them ({ "Server 4": 0.9, ... }).
				const scores = (await readJson(request)) as Record<string, number>;
				await query(`delete from "pd_source_stat"`);
				for (const [name, score] of Object.entries(scores)) {
					await query(
						`insert into "pd_source_stat" ("day", "source_id", "band", "plays", "score")
						 select current_date, "id", 'all', 50, $2 from "pd_source" where "name"->>'en' = $1`,
						[name, score],
					);
				}
				return send(response, 200, { ok: true });
			}
			if (route === "GET /e2e/parda-title-fails") {
				const { rows } = await query(
					`select "source_id", "media", "tmdb_id", "failures", "skip_until" from "pd_source_title_fail"`,
				);
				return send(response, 200, rows);
			}
			if (route === "DELETE /e2e/parda-rank") {
				await query(`delete from "pd_source_stat"`);
				await query(`delete from "pd_source_title_fail"`);
				return send(response, 200, { ok: true });
			}
			// parda:end
			// apps:start
			if (route === "GET /e2e/note") return send(response, 200, await reviewNote(query, url.searchParams.get("email")));
			if (route === "GET /e2e/link") return send(response, 200, await reviewLink(query, url.searchParams.get("email")));
			if (route === "GET /e2e/expenses")
				return send(response, 200, await reviewExpenses(query, url.searchParams.get("email")));
			if (route === "GET /e2e/habit")
				return send(response, 200, await reviewHabit(query, url.searchParams.get("email")));
			if (route === "GET /e2e/form") return send(response, 200, await reviewForm(query, url.searchParams.get("email")));
			// apps:end
			return send(response, 404, { error: `no route ${route}` });
		} catch (error) {
			return send(response, 500, { error: error instanceof Error ? error.message : String(error) });
		}
	});

	await new Promise<void>((resolve, reject) => {
		server.once("error", reject);
		server.listen(port, "127.0.0.1", resolve);
	});
	return {
		close: () =>
			new Promise<void>((resolve) => {
				server.close(() => resolve());
				server.closeAllConnections();
			}),
	};
}
