import { useQuery } from "@tanstack/react-query";
import { ArrowDownIcon, ArrowUpIcon, ImagePlusIcon, Trash2Icon, XIcon } from "lucide-react";
import { type DragEvent, useEffect, useId, useRef, useState } from "react";
import { useFieldContext } from "@/components/forms/contexts";
import { FieldLabelText, FieldMessages, useFieldA11y } from "@/components/forms/field-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCan } from "@/features/rbac/can";
import { discardImageUpload, getUploadSettings } from "@/functions/attachments";
import { formatNumber } from "@/lib/intl";
import { cn } from "@/lib/utils";
import { m } from "@/paraglide/messages";
import { IMAGE_MAX_BYTES, IMAGE_MIME_TYPES, type UploadScope } from "../constants";
import type { ImageAsset } from "../schema";
import { UploadError, uploadImage } from "../upload";
import { CloudImage } from "./cloud-image";

/** One image in the field's value: an attachment, its alt text and its preview. */
export type FieldImage = { id: string; alt: string; preview: ImageAsset };

type Upload = { key: string; name: string; progress: number; error?: string; controller: AbortController };

export const uploadSettingsQueryOptions = () => ({
	queryKey: ["attachments", "settings"] as const,
	queryFn: () => getUploadSettings(),
	staleTime: Number.POSITIVE_INFINITY,
});

/**
 * Images for a form: upload (pick or drop, several at once, with progress and
 * cancel), reorder (buttons, or drag and drop), alt text, remove. The first image
 * is the cover. The value is FieldImage[]; the form sends ids + alt text, and the
 * item's save links them (uploads stay "pending" until then).
 *
 * `onBusyChange` reports whether uploads are in progress (the form refuses to
 * submit meanwhile). Without attachments:upload the existing images can still be
 * ordered, described and removed, but not added.
 */
export function AttachmentsField({
	label,
	scope,
	max,
	onBusyChange,
}: {
	label: string;
	scope: UploadScope;
	max: number;
	onBusyChange?: (busy: boolean) => void;
}) {
	const field = useFieldContext<FieldImage[]>();
	const a11y = useFieldA11y(label, { focusId: (id) => `${id}-add` });
	const canUpload = useCan("attachments:upload");
	const settings = useQuery({ ...uploadSettingsQueryOptions(), enabled: canUpload });
	const [uploads, setUploads] = useState<Upload[]>([]);
	const [announcement, setAnnouncement] = useState("");
	const [dragging, setDragging] = useState<number | null>(null);
	const [dropActive, setDropActive] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	/** Uploads made in this form session: removing one before saving deletes it at once. */
	const fresh = useRef(new Set<string>());
	const hintId = useId();

	const images = field.state.value ?? [];
	const active = uploads.filter((upload) => !upload.error).length;
	const enabled = canUpload && settings.data?.enabled === true;
	const room = max - images.length - active;

	// Cancel uploads still running when the form goes away.
	const uploadsRef = useRef(uploads);
	uploadsRef.current = uploads;
	useEffect(() => onBusyChange?.(active > 0), [active, onBusyChange]);
	useEffect(
		() => () => {
			for (const upload of uploadsRef.current) upload.controller.abort();
		},
		[],
	);

	const setImages = (next: FieldImage[]) => {
		field.handleChange(next);
		field.handleBlur();
	};
	const update = (key: string, patch: Partial<Upload>) =>
		setUploads((current) => current.map((upload) => (upload.key === key ? { ...upload, ...patch } : upload)));

	const start = (files: ReadonlyArray<File>) => {
		const accepted = files.slice(0, Math.max(0, room));
		if (files.length > accepted.length) setAnnouncement(m.attachments_field_limit({ max: formatNumber(max) }));
		for (const file of accepted) {
			const key = `${file.name}-${crypto.randomUUID()}`;
			const controller = new AbortController();
			setUploads((current) => [...current, { key, name: file.name, progress: 0, controller }]);
			uploadImage(file, scope, { signal: controller.signal, onProgress: (progress) => update(key, { progress }) })
				.then((preview) => {
					fresh.current.add(preview.id);
					setUploads((current) => current.filter((upload) => upload.key !== key));
					// Appended atomically: uploads finish in any order, close together, and a
					// value read when this upload started would drop the others.
					field.pushValue({ id: preview.id, alt: "", preview });
					field.handleBlur();
					setAnnouncement(m.attachments_field_uploaded({ name: file.name }));
				})
				.catch((error: unknown) => {
					if (error instanceof DOMException && error.name === "AbortError") {
						setUploads((current) => current.filter((upload) => upload.key !== key));
						return;
					}
					const message = error instanceof UploadError ? error.message : m.attachments_error_missing();
					update(key, { error: message });
				});
		}
	};

	const move = (from: number, to: number) => {
		if (to < 0 || to >= images.length || from === to) return;
		const next = [...images];
		const [item] = next.splice(from, 1);
		if (!item) return;
		next.splice(to, 0, item);
		setImages(next);
		setAnnouncement(m.attachments_field_moved({ n: formatNumber(to + 1) }));
	};
	const remove = (index: number) => {
		const image = images[index];
		if (!image) return;
		setImages(images.filter((_, position) => position !== index));
		// Never saved: delete now (saved images are removed by the item's save).
		if (fresh.current.delete(image.id)) void discardImageUpload({ data: { id: image.id } }).catch(() => {});
		setAnnouncement(m.attachments_field_removed());
	};
	const setAlt = (index: number, alt: string) =>
		field.handleChange(images.map((image, position) => (position === index ? { ...image, alt } : image)));

	const onDrop = (event: DragEvent<HTMLDivElement>) => {
		event.preventDefault();
		setDropActive(false);
		if (enabled && event.dataTransfer.files.length > 0) start([...event.dataTransfer.files]);
	};

	return (
		<fieldset
			className="flex min-w-0 flex-col gap-3"
			aria-describedby={a11y.describedBy(false)}
			aria-invalid={a11y.invalid || undefined}
		>
			<legend className="mb-1 font-medium text-sm">
				<FieldLabelText label={label} optional />
			</legend>

			{images.length === 0 ? <p className="text-muted-foreground text-sm">{m.attachments_field_empty()}</p> : null}
			<ol className="grid gap-3 sm:grid-cols-2">
				{images.map((image, index) => {
					const n = formatNumber(index + 1);
					return (
						<li
							key={image.id}
							className={cn("flex gap-3 rounded-md border bg-card p-2", dragging === index && "opacity-50")}
							draggable
							onDragStart={(event) => {
								setDragging(index);
								event.dataTransfer.effectAllowed = "move";
							}}
							onDragEnd={() => setDragging(null)}
							onDragOver={(event) => {
								if (dragging !== null) event.preventDefault();
							}}
							onDrop={(event) => {
								if (dragging === null) return;
								event.preventDefault();
								event.stopPropagation();
								move(dragging, index);
								setDragging(null);
							}}
						>
							<CloudImage
								image={image.preview}
								variant="thumb"
								alt=""
								className="size-20 shrink-0 rounded border object-cover"
							/>
							<div className="flex min-w-0 flex-1 flex-col gap-2">
								<div className="flex items-center justify-between gap-2">
									<span className="font-medium text-sm">{m.attachments_field_image_n({ n })}</span>
									{index === 0 ? <Badge variant="secondary">{m.attachments_field_cover()}</Badge> : null}
								</div>
								<label className="sr-only" htmlFor={`${a11y.id}-alt-${image.id}`}>
									{m.attachments_field_alt({ n })}
								</label>
								<Input
									id={`${a11y.id}-alt-${image.id}`}
									value={image.alt}
									maxLength={200}
									placeholder={m.attachments_field_alt_placeholder()}
									onChange={(event) => setAlt(index, event.target.value)}
									onBlur={field.handleBlur}
								/>
								<div className="flex gap-1">
									<Button
										type="button"
										variant="ghost"
										size="icon"
										aria-label={m.attachments_field_move_up({ n })}
										disabled={index === 0}
										onClick={() => move(index, index - 1)}
									>
										<ArrowUpIcon aria-hidden />
									</Button>
									<Button
										type="button"
										variant="ghost"
										size="icon"
										aria-label={m.attachments_field_move_down({ n })}
										disabled={index === images.length - 1}
										onClick={() => move(index, index + 1)}
									>
										<ArrowDownIcon aria-hidden />
									</Button>
									<Button
										type="button"
										variant="ghost"
										size="icon"
										className="ms-auto"
										aria-label={m.attachments_field_remove({ n })}
										onClick={() => remove(index)}
									>
										<Trash2Icon aria-hidden />
									</Button>
								</div>
							</div>
						</li>
					);
				})}
			</ol>

			{uploads.length > 0 ? (
				<ul className="flex flex-col gap-2" data-testid="uploads">
					{uploads.map((upload) => (
						<li key={upload.key} className="flex items-center gap-3 rounded-md border p-2 text-sm">
							<span className="min-w-0 flex-1 truncate">
								{upload.error ? (
									<span className="text-destructive">{`${upload.name}: ${upload.error}`}</span>
								) : (
									m.attachments_field_uploading({ name: upload.name })
								)}
							</span>
							{upload.error ? null : (
								<progress
									className="h-2 w-24 accent-primary"
									value={Math.round(upload.progress * 100)}
									max={100}
									aria-label={m.attachments_field_uploading({ name: upload.name })}
								/>
							)}
							<Button
								type="button"
								variant="ghost"
								size="icon"
								aria-label={
									upload.error ? m.attachments_field_dismiss() : m.attachments_field_cancel({ name: upload.name })
								}
								onClick={() => {
									upload.controller.abort();
									setUploads((current) => current.filter((item) => item.key !== upload.key));
								}}
							>
								<XIcon aria-hidden />
							</Button>
						</li>
					))}
				</ul>
			) : null}

			{canUpload ? (
				settings.data && !settings.data.enabled ? (
					<p className="text-muted-foreground text-sm" role="note">
						{m.attachments_error_disabled()}
					</p>
				) : (
					// biome-ignore lint/a11y/noStaticElementInteractions: drag-and-drop target; the button inside is the accessible way to add files.
					<div
						className={cn(
							"flex flex-wrap items-center gap-3 rounded-md border border-dashed p-4",
							dropActive && "border-primary bg-accent/50",
						)}
						onDragOver={(event) => {
							if (dragging !== null || !enabled) return;
							event.preventDefault();
							setDropActive(true);
						}}
						onDragLeave={() => setDropActive(false)}
						onDrop={onDrop}
					>
						<input
							ref={inputRef}
							type="file"
							accept={IMAGE_MIME_TYPES.join(",")}
							multiple
							className="sr-only"
							tabIndex={-1}
							aria-hidden
							onChange={(event) => {
								start([...(event.target.files ?? [])]);
								event.target.value = "";
							}}
						/>
						<Button
							id={`${a11y.id}-add`}
							type="button"
							variant="outline"
							disabled={!enabled || room <= 0}
							aria-describedby={hintId}
							onClick={() => inputRef.current?.click()}
						>
							<ImagePlusIcon aria-hidden />
							{m.attachments_field_add()}
						</Button>
						<span className="text-muted-foreground text-sm">{m.attachments_field_drop()}</span>
					</div>
				)
			) : null}
			<p id={hintId} className="text-muted-foreground text-xs">
				{m.attachments_field_hint({ max: `${formatNumber(IMAGE_MAX_BYTES / 1024 / 1024)} MB` })}
			</p>
			<FieldMessages descriptionId={a11y.descriptionId} errorId={a11y.errorId} errors={a11y.errors} />
			<p className="sr-only" aria-live="polite">
				{announcement}
			</p>
		</fieldset>
	);
}
