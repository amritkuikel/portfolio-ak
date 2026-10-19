/**
 * pnpm new:feature <name> [--title "Projects"] [--title-ne "परियोजनाहरू"] [--no-build]
 *
 * Generates an admin CRUD feature in the Test CRUD shape (docs/guides/conventions.md,
 * "Adding a feature"): table + migration, shared schema, repository and service with a
 * PGlite test, permissions, guarded server functions (and their guard-test entry),
 * queries, admin routes with thin route files, messages in both languages, a sidebar
 * link and dashboard card, stories with their server-function mocks, and the
 * browser-review entries. The result passes every gate unchanged.
 *
 * Templates live in scripts/templates/feature (paths and contents use the tokens
 * below). Shared lists get their entries at `// @new-feature:<slot>` marker lines.
 * Finally it formats what it touched and runs a production build, which also
 * regenerates src/routeTree.gen.ts (skip with --no-build; `pnpm dev` regenerates it too).
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const templates = path.join(root, "scripts/templates/feature");

const fail = (message) => {
	console.error(`new:feature: ${message}`);
	process.exit(1);
};

// ---------------------------------------------------------------------------
// Arguments and names
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const option = (flag) => {
	const index = args.indexOf(flag);
	if (index === -1) return undefined;
	const value = args[index + 1];
	if (!value || value.startsWith("--")) fail(`${flag} needs a value`);
	args.splice(index, 2);
	return value;
};
const titleOption = option("--title");
const titleNeOption = option("--title-ne");
const build = !args.includes("--no-build");
const name = args.find((arg) => !arg.startsWith("--"));

if (!name) fail('usage: pnpm new:feature <name> [--title "Projects"] [--title-ne "…"] [--no-build]');
if (!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(name))
	fail(`"${name}" must be kebab-case, e.g. "projects" or "event-logs"`);

const words = name.split("-");
const capital = (word) => word[0].toUpperCase() + word.slice(1);
const names = {
	name,
	snake: words.join("_"),
	camel: words[0] + words.slice(1).map(capital).join(""),
	Pascal: words.map(capital).join(""),
	UPPER: words.join("_").toUpperCase(),
	Title: titleOption ?? capital(words.join(" ")),
};
// Without a Nepali name the English one is marked for translation (ne messages must differ from en).
names.TitleNe = titleNeOption ?? `${names.Title} (अनुवाद गर्नुहोस्)`;

const RESERVED = new Set([
	"admin",
	"api",
	"auth",
	"audit",
	"attachments",
	"dev",
	"new",
	"rbac",
	"roles",
	"users",
	"test-crud",
]);
if (RESERVED.has(name)) fail(`"${name}" is already used by the app`);

const read = (file) => readFileSync(path.join(root, file), "utf8");
const write = (file, content) => {
	mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
	writeFileSync(path.join(root, file), content);
};

if (existsSync(path.join(root, "src/features", name))) fail(`src/features/${name} already exists`);
if (new RegExp(`^\\s*"?${name}"?: \\[`, "m").test(read("src/features/rbac/permissions.ts"))) {
	fail(`the permission catalog already has "${name}"`);
}
const schemaDir = path.join(root, "src/server/db/schema");
for (const file of readdirSync(schemaDir)) {
	if (new RegExp(`export const ${names.camel}\\b`).test(readFileSync(path.join(schemaDir, file), "utf8"))) {
		fail(`src/server/db/schema/${file} already exports "${names.camel}"`);
	}
}

const fill = (text) =>
	text
		.replaceAll("__name__", names.name)
		.replaceAll("__snake__", names.snake)
		.replaceAll("__camel__", names.camel)
		.replaceAll("__Pascal__", names.Pascal)
		.replaceAll("__UPPER__", names.UPPER)
		.replaceAll("__Title__", names.Title);

// ---------------------------------------------------------------------------
// 1. Files from the templates
// ---------------------------------------------------------------------------

const created = [];
const walk = (dir) =>
	readdirSync(dir).flatMap((entry) => {
		const full = path.join(dir, entry);
		return statSync(full).isDirectory() ? walk(full) : [full];
	});
for (const template of walk(templates)) {
	const target = fill(path.relative(templates, template).replaceAll("\\", "/")).replace(/\.tpl$/, "");
	if (existsSync(path.join(root, target))) fail(`${target} already exists`);
	created.push(target);
}
for (const template of walk(templates)) {
	const target = fill(path.relative(templates, template).replaceAll("\\", "/")).replace(/\.tpl$/, "");
	write(target, fill(readFileSync(template, "utf8")));
}

// ---------------------------------------------------------------------------
// 2. Entries in shared lists, above each `// @new-feature:<slot>` line
// ---------------------------------------------------------------------------

const changed = new Set();
const insert = (file, slot, lines) => {
	const content = read(file);
	const marker = new RegExp(`^([\\t ]*)// @new-feature:${slot}$`, "m");
	const match = marker.exec(content);
	if (!match) fail(`${file} has no "// @new-feature:${slot}" line`);
	const indent = match[1];
	const block = lines.map((line) => (line ? `${indent}${line}` : line)).join("\n");
	write(file, `${content.slice(0, match.index)}${block}\n${content.slice(match.index)}`);
	changed.add(file);
};

const { name: n, snake: s, Pascal: P } = names;
insert("src/server/db/schema/index.ts", "schema", [`export * from "./${n}";`]);
insert("src/features/rbac/permissions.ts", "permissions", [`"${n}": ["read", "create", "update", "delete"],`]);
insert("src/features/rbac/labels.ts", "resource-labels", [`"${n}": m.perm_resource_${s},`]);
insert(
	"src/features/rbac/labels.ts",
	"permission-labels",
	["read", "create", "update", "delete"].map((action) => `"${n}:${action}": m.perm_${s}_${action},`),
);
insert("src/features/audit/schema.ts", "audit-actions", [`"${n}.delete",`]);
insert("src/features/audit/schema.ts", "audit-targets", [`"${n}",`]);
insert("src/features/audit/labels.ts", "audit-action-labels", [`"${n}.delete": m.audit_action_${s}_delete,`]);
insert("src/features/audit/labels.ts", "audit-target-labels", [`"${n}": m.audit_target_${s},`]);
insert("src/features/admin/sections.ts", "admin-sections", [
	"{",
	`\tto: "/admin/${n}",`,
	`\tlabel: m.admin_nav_${s},`,
	`\tdescription: m.${s}_description,`,
	"\ticon: FolderIcon,",
	`\tpermission: "${n}:read",`,
	"},",
]);
const sections = read("src/features/admin/sections.ts");
if (!/\bFolderIcon\b.*from "lucide-react"/.test(sections)) {
	write(
		"src/features/admin/sections.ts",
		sections.replace(/import \{ /, () => "import { FolderIcon, "),
	);
}
insert("tests/server/guarded-functions.test.ts", "guarded-functions", [
	`"${n}.ts": [`,
	`\t["list${P}", "${n}:read"],`,
	`\t["get${P}", "${n}:read"],`,
	`\t["create${P}", "${n}:create"],`,
	`\t["update${P}", "${n}:update"],`,
	`\t["delete${P}", "${n}:delete"],`,
	"],",
]);
insert("e2e/support/pages.ts", "reviewed-pages", [
	`{ route: "/admin/${n}", as: "admin" },`,
	`{ route: "/admin/${n}/new", as: "admin" },`,
]);
insert("e2e/support/pages.ts", "not-reviewed", [
	`"/admin/${n}/$id": "generated by new:feature: no seeded row to open yet (seed one, then review it)",`,
]);

// ---------------------------------------------------------------------------
// 3. Messages (appended to both files, same keys)
// ---------------------------------------------------------------------------

const { Title, TitleNe } = names;
const messages = {
	[`admin_nav_${s}`]: [Title, TitleNe],
	[`${s}_title`]: [Title, TitleNe],
	[`${s}_description`]: ["Create, edit and delete rows.", "पङ्क्तिहरू बनाउनुहोस्, सम्पादन गर्नुहोस् र मेटाउनुहोस्।"],
	[`${s}_new`]: ["New row", "नयाँ पङ्क्ति"],
	[`${s}_new_title`]: ["New row", "नयाँ पङ्क्ति"],
	[`${s}_edit_title`]: ["Edit row", "पङ्क्ति सम्पादन"],
	[`${s}_edit`]: ["Edit", "सम्पादन गर्नुहोस्"],
	[`${s}_delete`]: ["Delete", "मेटाउनुहोस्"],
	[`${s}_delete_selected`]: ["Delete selected", "छानिएका मेटाउनुहोस्"],
	[`${s}_delete_title`]: ["Delete this row?", "यो पङ्क्ति मेटाउने?"],
	[`${s}_delete_body`]: ["“{title}” will be deleted. This can't be undone.", "“{title}” मेटाइनेछ। यो फिर्ता गर्न सकिँदैन।"],
	[`${s}_bulk_delete_title`]: ["Delete {count} rows?", "{count} पङ्क्ति मेटाउने?"],
	[`${s}_bulk_delete_body`]: [
		"The selected rows will be deleted. This can't be undone.",
		"छानिएका पङ्क्तिहरू मेटाइनेछन्। यो फिर्ता गर्न सकिँदैन।",
	],
	[`${s}_confirm_delete`]: ["Delete", "मेटाउनुहोस्"],
	[`${s}_toast_created`]: ["Created.", "बनाइयो।"],
	[`${s}_toast_saved`]: ["Saved.", "सुरक्षित गरियो।"],
	[`${s}_toast_deleted`]: ["Deleted.", "मेटाइयो।"],
	[`${s}_toast_bulk_deleted`]: ["{count} rows deleted.", "{count} पङ्क्ति मेटाइए।"],
	[`${s}_toast_failed`]: ["That didn't work.", "त्यो भएन।"],
	[`${s}_empty`]: ["Nothing here yet.", "यहाँ अहिलेसम्म केही छैन।"],
	[`${s}_empty_filtered`]: ["No rows match the search.", "खोजसँग मिल्ने पङ्क्ति छैन।"],
	[`${s}_search_label`]: ["Search", "खोज्नुहोस्"],
	[`${s}_search_placeholder`]: ["Title or notes", "शीर्षक वा टिप्पणी"],
	[`${s}_col_title`]: ["Title", "शीर्षक"],
	[`${s}_col_updated`]: ["Updated", "अद्यावधिक"],
	[`${s}_field_title`]: ["Title", "शीर्षक"],
	[`${s}_field_notes`]: ["Notes", "टिप्पणी"],
	[`${s}_save`]: ["Save", "सुरक्षित गर्नुहोस्"],
	[`${s}_create`]: ["Create", "बनाउनुहोस्"],
	[`${s}_saving`]: ["Saving…", "सुरक्षित गर्दै…"],
	[`${s}_back`]: ["Back to the list", "सूचीमा फर्कनुहोस्"],
	[`perm_resource_${s}`]: [Title, TitleNe],
	[`perm_${s}_read`]: ["View rows", "पङ्क्तिहरू हेर्ने"],
	[`perm_${s}_create`]: ["Create rows", "पङ्क्तिहरू बनाउने"],
	[`perm_${s}_update`]: ["Edit rows", "पङ्क्तिहरू सम्पादन गर्ने"],
	[`perm_${s}_delete`]: ["Delete rows", "पङ्क्तिहरू मेटाउने"],
	[`audit_action_${s}_delete`]: [`${Title}: row deleted`, `${TitleNe}: पङ्क्ति मेटाइयो`],
	[`audit_target_${s}`]: [`${Title} row`, `${TitleNe} पङ्क्ति`],
};
for (const [index, locale] of ["en", "ne"].entries()) {
	const file = `messages/${locale}.json`;
	const content = read(file);
	const existing = JSON.parse(content);
	const clash = Object.keys(messages).find((key) => key in existing);
	if (clash) fail(`${file} already has "${clash}"`);
	const end = content.lastIndexOf("\n}");
	const entries = Object.entries(messages).map(
		([key, values]) => `\t${JSON.stringify(key)}: ${JSON.stringify(values[index])}`,
	);
	write(file, `${content.slice(0, end)},\n${entries.join(",\n")}${content.slice(end)}`);
	changed.add(file);
}

// ---------------------------------------------------------------------------
// 4. Migration, formatting, route tree
// ---------------------------------------------------------------------------

const run = (label, command, commandArgs, env = {}) => {
	console.log(`new:feature: ${label}`);
	const result = spawnSync(command, commandArgs, { cwd: root, stdio: "inherit", env: { ...process.env, ...env } });
	if (result.status !== 0) fail(`${label} failed`);
};
const node = process.execPath;

// drizzle-kit only diffs the schema against drizzle/ here; it never connects, so any URL will do.
run("generating the migration", node, ["node_modules/drizzle-kit/bin.cjs", "generate", "--name", names.snake], {
	DATABASE_URL: process.env.DATABASE_URL || "postgresql://user:password@localhost:5432/new_feature",
});
// drizzle/ too: drizzle-kit writes its JSON snapshots in its own style.
run("formatting", node, [
	"node_modules/@biomejs/biome/bin/biome",
	"check",
	"--write",
	...created,
	...changed,
	"drizzle",
]);
run("compiling messages", node, [
	"node_modules/@inlang/paraglide-js/bin/run.js",
	"compile",
	"--project",
	"./project.inlang",
	"--silent",
]);
if (build) {
	run("building (regenerates the route tree)", node, ["node_modules/vite/bin/vite.js", "build"], {
		VITE_APP_TITLE: process.env.VITE_APP_TITLE || "App",
		VITE_SITE_URL: process.env.VITE_SITE_URL || "http://localhost:3000",
	});
}

console.log(`
new:feature: created "${name}" (${created.length} files, ${changed.size} shared files updated).

  Admin pages   /admin/${name}, /admin/${name}/new, /admin/${name}/<id>
  Permissions   ${name}:read, :create, :update, :delete (grant them in /admin/roles/permissions)
  Next          pnpm db:migrate, then add your columns (schema, form, columns, messages)
${titleNeOption ? "" : `  Translate     the Nepali name in messages/ne.json (search for "अनुवाद गर्नुहोस्")\n`}`);
