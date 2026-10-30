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
/**
 * A user's first Kanban board, made on first ask (columns, and a card with a label, a
 * past due date and a checklist), for the review of the board page.
 */
async function kanbanBoard(query: DemoQuery, email: string | null) {
	const { rows: users } = await query(`select "id" from "user" where "email" = $1`, [email]);
	const owner = users[0]?.id;
	if (!owner) throw new Error(`no user ${email}`);
	const { rows: boards } = await query(
		`select "id" from "kanban_board" where "owner_id" = $1 order by "created_at" limit 1`,
		[owner],
	);
	if (boards[0]) return boards[0];
	const { rows: created } = await query(
		`insert into "kanban_board" ("owner_id", "name") values ($1, 'Review board') returning "id"`,
		[owner],
	);
	const board = created[0]?.id;
	const { rows: columns } = await query(
		`insert into "kanban_column" ("owner_id", "board_id", "name", "position")
		values ($1, $2, 'To do', 'a0'), ($1, $2, 'Doing', 'a1'), ($1, $2, 'Done', 'a2') returning "id", "position"`,
		[owner, board],
	);
	const todo = columns.find((column) => column.position === "a0")?.id;
	const checklist = JSON.stringify([
		{ id: randomUUID(), text: "Read the page", done: true },
		{ id: randomUUID(), text: "Check both themes", done: false },
	]);
	await query(
		`insert into "kanban_card" ("owner_id", "board_id", "column_id", "title", "labels", "due_on", "checklist", "position")
		values ($1, $2, $3, 'Review the board', '{blue,red}', '2026-01-01', $4::jsonb, 'a0'),
		($1, $2, $3, 'A card with a long title that has to wrap inside its column without pushing the page sideways', '{}', null, '[]'::jsonb, 'a1')`,
		[owner, board, todo, checklist],
	);
	return { id: board };
}

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
// apps:end

export async function serveHarness(port: number, query: DemoQuery) {
	const emails: CapturedEmail[] = [];
	// New per start (a fresh database): tests key their saved sign-ins on it.
	const runId = randomUUID();

	const server = createServer(async (request, response) => {
		try {
			const url = new URL(request.url ?? "/", "http://harness");
			const route = `${request.method} ${url.pathname}`;

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
			// apps:start
			if (route === "GET /e2e/kanban-board")
				return send(response, 200, await kanbanBoard(query, url.searchParams.get("email")));
			if (route === "GET /e2e/note") return send(response, 200, await reviewNote(query, url.searchParams.get("email")));
			if (route === "GET /e2e/link") return send(response, 200, await reviewLink(query, url.searchParams.get("email")));
			if (route === "GET /e2e/expenses")
				return send(response, 200, await reviewExpenses(query, url.searchParams.get("email")));
			if (route === "GET /e2e/habit")
				return send(response, 200, await reviewHabit(query, url.searchParams.get("email")));
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
