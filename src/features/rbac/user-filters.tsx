import { ActiveFilters, chipLabel, type FilterChip } from "@/components/filters/active-filters";
import { SearchFilter, SelectFilter } from "@/components/filters/filters";
import { m } from "@/paraglide/messages";
import { roleLabel } from "./labels";
import { type RoleSummary, USER_STATUS_FILTERS, type UserSearch } from "./schema";

const STATUS_LABELS: Record<(typeof USER_STATUS_FILTERS)[number], () => string> = {
	all: m.users_status_all,
	active: m.users_status_active,
	banned: m.users_status_banned,
};

/** Role filter options: all, Admin, the baseline only, then every custom role. */
const roleOptions = (roles: ReadonlyArray<RoleSummary>) => [
	{ value: "all", label: m.users_role_all() },
	{ value: "admin", label: m.role_admin_name() },
	{ value: "user", label: m.users_role_baseline() },
	...roles.filter((role) => !role.system).map((role) => ({ value: role.key, label: roleLabel(role) })),
];

/** The users list's filter controls (inside <FilterBar>). */
export function UserFilterControls({ search, roles }: { search: UserSearch; roles: ReadonlyArray<RoleSummary> }) {
	return (
		<>
			<SearchFilter label={m.users_search_label()} value={search.q} placeholder={m.users_search_placeholder()} />
			<SelectFilter name="role" label={m.users_filter_role()} value={search.role} options={roleOptions(roles)} />
			<SelectFilter
				name="status"
				label={m.users_filter_status()}
				value={search.status}
				options={USER_STATUS_FILTERS.map((status) => ({ value: status, label: STATUS_LABELS[status]() }))}
			/>
		</>
	);
}

export const USER_FILTER_KEYS = ["q", "role", "status"] as const;
export const CLEAR_USER_FILTERS = Object.fromEntries(USER_FILTER_KEYS.map((key) => [key, undefined]));

export function userFilterChips(search: UserSearch, roles: ReadonlyArray<RoleSummary>): FilterChip[] {
	const chips: FilterChip[] = [];
	if (search.q)
		chips.push({ id: "q", label: chipLabel(m.users_search_label(), `“${search.q}”`), remove: { q: undefined } });
	if (search.role !== "all") {
		const label = roleOptions(roles).find((option) => option.value === search.role)?.label ?? search.role;
		chips.push({ id: "role", label: chipLabel(m.users_filter_role(), label), remove: { role: undefined } });
	}
	if (search.status !== "all") {
		chips.push({
			id: "status",
			label: chipLabel(m.users_filter_status(), STATUS_LABELS[search.status]()),
			remove: { status: undefined },
		});
	}
	return chips;
}

export function UserActiveFilters({ search, roles }: { search: UserSearch; roles: ReadonlyArray<RoleSummary> }) {
	return <ActiveFilters chips={userFilterChips(search, roles)} clearAll={CLEAR_USER_FILTERS} />;
}
