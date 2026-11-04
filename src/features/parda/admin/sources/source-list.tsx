import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowDownUpIcon } from "lucide-react";
import { lazy, Suspense, useState } from "react";
import { toast } from "sonner";
import { CrudListPage, CrudListPending } from "@/components/crud/crud-list-page";
import { NewButton } from "@/components/crud/new-button";
import { RecordLink } from "@/components/crud/record-link";
import { useCrudMutation } from "@/components/crud/use-crud-mutation";
import { StatusBadge } from "@/components/data-display/status-badge";
import type { DataTableColumn, RowAction } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCan } from "@/features/rbac/can";
import { formatNumber } from "@/lib/i18n/intl";
import { localizedValue } from "@/lib/i18n/localized";
import { m } from "@/paraglide/messages";
import { pardaAdminKeys } from "../keys";
import { ADAPTER_LABELS, SANDBOX_LABELS } from "../labels";
import { pardaAdminMutations, pardaSourcesQueryOptions } from "../queries";
import type { AdminSource } from "../schema";
import { PlaybackSwitch } from "../settings/playback-switch";

// Opens on click: its dnd-kit list loads with it, not with the page (0168).
const ReorderSourcesDialog = lazy(() =>
	import("./source-reorder-dialog").then((module) => ({ default: module.ReorderSourcesDialog })),
);

const SOURCES_TABLE_ID = "parda-sources";

const name = (row: AdminSource) => localizedValue(row.name);

const columns: ReadonlyArray<DataTableColumn<AdminSource>> = [
	{
		id: "position",
		header: m.pd_admin_col_position,
		headClassName: "w-12",
		cellClassName: "text-muted-foreground tabular-nums",
		cell: (row) => formatNumber(row.position + 1),
	},
	{
		id: "name",
		header: m.pd_admin_col_name,
		cell: (row) => (
			<RecordLink
				link={{ to: "/admin/parda/sources/$id", params: { id: row.id } }}
				permission="parda:configure"
				detail={ADAPTER_LABELS[row.adapter]()}
			>
				{name(row)}
			</RecordLink>
		),
		csv: (row) => row.name.en,
	},
	{
		id: "state",
		header: m.pd_admin_col_state,
		cell: (row) => (
			<div className="flex flex-wrap gap-1">
				<StatusBadge tone={row.enabled ? "success" : "neutral"}>
					{row.enabled ? m.pd_admin_source_enabled() : m.pd_admin_source_disabled()}
				</StatusBadge>
				{row.pinned ? <StatusBadge tone="info">{m.pd_admin_source_pinned()}</StatusBadge> : null}
			</div>
		),
		csv: (row) => (row.enabled ? "enabled" : "disabled"),
	},
	{
		id: "group",
		header: m.pd_admin_col_group,
		hideable: true,
		cell: (row) => row.cdnGroup || <span className="text-muted-foreground">{m.pd_admin_group_own()}</span>,
		csv: (row) => row.cdnGroup,
	},
	{
		id: "player",
		header: m.pd_admin_col_player,
		hideable: true,
		cell: (row) => (
			<div className="flex max-w-64 flex-wrap gap-1">
				{row.adaptive ? <Badge variant="outline">{m.pd_admin_source_adaptive()}</Badge> : null}
				{row.needsClick ? <Badge variant="outline">{m.pd_admin_source_needs_click()}</Badge> : null}
				{row.autoFallback ? null : <Badge variant="outline">{m.pd_admin_source_no_fallback()}</Badge>}
				{row.sandbox === "none" ? null : (
					<Badge variant="outline">{m.pd_admin_source_sandbox({ sandbox: SANDBOX_LABELS[row.sandbox]() })}</Badge>
				)}
			</div>
		),
	},
	{
		id: "reports",
		header: m.pd_admin_col_reports,
		hideable: true,
		cellClassName: "whitespace-nowrap tabular-nums",
		cell: (row) =>
			row.openReports === 0 ? (
				<span className="text-muted-foreground">{formatNumber(0)}</span>
			) : (
				<Link
					to="/admin/parda/reports"
					search={{ source: row.id }}
					className="underline-offset-4 hover:underline"
					aria-label={m.pd_admin_source_reports_link({
						count: formatNumber(row.openReports),
						ads: formatNumber(row.adsReports),
						name: name(row),
					})}
				>
					{m.pd_admin_source_reports({ count: formatNumber(row.openReports), ads: formatNumber(row.adsReports) })}
				</Link>
			),
		csv: (row) => row.openReports,
	},
];

/** "New source", for admins who may configure Parda. */
function NewSourceButton() {
	return (
		<NewButton to="/admin/parda/sources/new" permission="parda:configure">
			{m.pd_admin_source_new()}
		</NewButton>
	);
}

/** The list's pendingComponent: its header and a table skeleton. */
export function PardaSourcesPending() {
	return (
		<CrudListPending
			title={m.pd_admin_sources_title()}
			description={m.pd_admin_sources_description()}
			actions={<NewSourceButton />}
			columns={columns.length}
		/>
	);
}

/**
 * /admin/parda/sources (PLAN Task 65, decision 0237): the rows the watch page plays from,
 * in the order it starts from, with the kill switch above them. Enabling, pinning and
 * deleting show at once and roll back if the server refuses; "Reorder" sets the order.
 */
export function PardaSourcesPage() {
	const { data: rows } = useSuspenseQuery(pardaSourcesQueryOptions());
	const canConfigure = useCan("parda:configure");
	const [reordering, setReordering] = useState(false);
	const optimistic = { queryKey: pardaAdminKeys.sources() };

	const remove = useCrudMutation(pardaAdminMutations.deleteSources(), {
		invalidate: [pardaAdminKeys.all],
		optimistic: { ...optimistic, update: withoutRowsOf },
	});
	const setState = useCrudMutation(pardaAdminMutations.setSourceState(), {
		invalidate: [pardaAdminKeys.all],
		optimistic: {
			...optimistic,
			update: patchList((row, state: { id: string; enabled?: boolean; pinned?: boolean }) => ({ ...row, ...state })),
		},
	});
	const change = (row: AdminSource, state: { enabled?: boolean; pinned?: boolean }, done: () => string) =>
		setState.mutate({ id: row.id, ...state }, { onSuccess: () => toast.success(done()) });

	const rowActions = (row: AdminSource): RowAction[] => [
		{
			id: "edit",
			label: m.crud_edit(),
			permission: "parda:configure",
			render: (label) => (
				<Link to="/admin/parda/sources/$id" params={{ id: row.id }}>
					{label}
				</Link>
			),
		},
		{
			id: "lab",
			label: m.pd_admin_source_test(),
			permission: "parda:configure",
			render: (label) => (
				<Link to="/admin/parda/player-lab" search={{ source: row.id }}>
					{label}
				</Link>
			),
		},
		{
			id: "enable",
			label: row.enabled ? m.pd_admin_source_disable() : m.pd_admin_source_enable(),
			permission: "parda:configure",
			separated: true,
			onSelect: () =>
				change(row, { enabled: !row.enabled }, () =>
					row.enabled
						? m.pd_admin_source_disabled_toast({ name: name(row) })
						: m.pd_admin_source_enabled_toast({ name: name(row) }),
				),
		},
		{
			id: "pin",
			label: row.pinned ? m.pd_admin_source_unpin() : m.pd_admin_source_pin(),
			permission: "parda:configure",
			onSelect: () =>
				change(row, { pinned: !row.pinned }, () =>
					row.pinned
						? m.pd_admin_source_unpinned_toast({ name: name(row) })
						: m.pd_admin_source_pinned_toast({ name: name(row) }),
				),
		},
	];

	const actions = (
		<>
			{canConfigure && rows.length > 1 ? (
				<Button variant="outline" onClick={() => setReordering(true)} data-testid="parda-sources-reorder">
					<ArrowDownUpIcon aria-hidden />
					{m.pd_admin_sources_reorder()}
				</Button>
			) : null}
			<NewSourceButton />
		</>
	);

	return (
		<CrudListPage
			title={m.pd_admin_sources_title()}
			description={m.pd_admin_sources_description()}
			actions={actions}
			notice={<PlaybackSwitch />}
			tableId={SOURCES_TABLE_ID}
			list={{ rows }}
			columns={columns}
			getRowLabel={name}
			rowActions={rowActions}
			remove={{
				permission: "parda:configure",
				run: (ids) => remove.mutateAsync(ids),
				description: m.pd_admin_source_delete_body,
			}}
			empty={{ description: m.pd_admin_sources_empty(), action: <NewSourceButton /> }}
			exportName="parda-sources"
			data-testid="parda-sources-table"
		>
			{reordering ? (
				<Suspense fallback={null}>
					<ReorderSourcesDialog sources={rows} onClose={() => setReordering(false)} />
				</Suspense>
			) : null}
		</CrudListPage>
	);
}

/** The sources' query holds the whole list, not pages: these patch it as a list. */
const withoutRowsOf = (rows: AdminSource[], ids: string[]) => rows.filter((row) => !ids.includes(row.id));
const patchList =
	<V extends { id: string }>(patch: (row: AdminSource, variables: V) => AdminSource) =>
	(rows: AdminSource[], variables: V) =>
		rows.map((row) => (row.id === variables.id ? patch(row, variables) : row));
