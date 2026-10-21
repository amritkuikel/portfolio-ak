import { ActiveFilters, chipLabel, type FilterChip, rangeValue } from "@/components/filters/active-filters";
import { DateRangeFilter, SearchFilter, SelectFilter } from "@/components/filters/filters";
import { isoDateInstant } from "@/lib/i18n/date-only";
import { formatDate } from "@/lib/i18n/intl";
import { m } from "@/paraglide/messages";
import { AUDIT_ACTION_LABELS, AUDIT_TARGET_LABELS } from "./labels";
import { AUDIT_ACTIONS, AUDIT_FILTER_KEYS, AUDIT_TARGETS, type AuditSearch } from "./schema";

/** The audit log's filters (inside <FilterBar>) and their chips. Keys match auditSearchSchema. */
export function AuditFilterControls({ search }: { search: AuditSearch }) {
	return (
		<>
			<SearchFilter label={m.audit_search_label()} value={search.q} placeholder={m.audit_search_placeholder()} />
			<SearchFilter
				name="actor"
				label={m.audit_filter_actor()}
				value={search.actor}
				placeholder={m.audit_actor_placeholder()}
			/>
			<SelectFilter
				name="action"
				label={m.audit_filter_action()}
				value={search.action}
				options={[
					{ value: "all", label: m.audit_action_all() },
					...AUDIT_ACTIONS.map((action) => ({ value: action, label: AUDIT_ACTION_LABELS[action]() })),
				]}
			/>
			<SelectFilter
				name="target"
				label={m.audit_filter_target()}
				value={search.target}
				options={[
					{ value: "all", label: m.audit_target_all() },
					...AUDIT_TARGETS.map((target) => ({ value: target, label: AUDIT_TARGET_LABELS[target]() })),
				]}
			/>
			<DateRangeFilter label={m.audit_filter_date()} names={["from", "to"]} value={[search.from, search.to]} />
		</>
	);
}

const day = (value: string | undefined) =>
	value === undefined ? undefined : formatDate(isoDateInstant(value), { dateStyle: "medium" });

export function auditFilterChips(search: AuditSearch): FilterChip[] {
	const chips: FilterChip[] = [];
	if (search.q) {
		chips.push({ id: "q", label: chipLabel(m.audit_search_label(), `“${search.q}”`), remove: { q: undefined } });
	}
	if (search.actor) {
		chips.push({
			id: "actor",
			label: chipLabel(m.audit_filter_actor(), `“${search.actor}”`),
			remove: { actor: undefined },
		});
	}
	if (search.action !== "all") {
		chips.push({
			id: "action",
			label: chipLabel(m.audit_filter_action(), AUDIT_ACTION_LABELS[search.action]()),
			remove: { action: undefined },
		});
	}
	if (search.target !== "all") {
		chips.push({
			id: "target",
			label: chipLabel(m.audit_filter_target(), AUDIT_TARGET_LABELS[search.target]()),
			remove: { target: undefined },
		});
	}
	const dates = rangeValue(day(search.from), day(search.to));
	if (dates) {
		chips.push({
			id: "date",
			label: chipLabel(m.audit_filter_date(), dates),
			remove: { from: undefined, to: undefined },
		});
	}
	return chips;
}

/** "Clear all": every filter back to its default (sort and page size stay). */
export const AUDIT_CLEAR_FILTERS = Object.fromEntries(AUDIT_FILTER_KEYS.map((key) => [key, undefined]));

export function AuditActiveFilters({ search }: { search: AuditSearch }) {
	return <ActiveFilters chips={auditFilterChips(search)} clearAll={AUDIT_CLEAR_FILTERS} />;
}
