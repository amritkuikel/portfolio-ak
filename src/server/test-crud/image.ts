import "@tanstack/react-start/server-only";
import { TEST_CRUD_IMAGE_MAX_BYTES, type TEST_CRUD_IMAGE_TYPES } from "@/features/test-crud/constants";
import { AppError } from "@/lib/errors";
import { formatBytes } from "@/lib/intl";
import { m } from "@/paraglide/messages";

type ImageType = (typeof TEST_CRUD_IMAGE_TYPES)[number];

export type ValidImage = { mimeType: ImageType; data: Uint8Array };

const startsWith = (bytes: Uint8Array, signature: ReadonlyArray<number>, offset = 0) =>
	signature.every((byte, index) => bytes[offset + index] === byte);

/**
 * The real type from the file's first bytes. The browser-supplied `File.type`
 * (and the extension) are user-controlled, so they are ignored.
 */
export const sniffImageType = (bytes: Uint8Array): ImageType | null => {
	if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "image/png";
	if (startsWith(bytes, [0xff, 0xd8, 0xff])) return "image/jpeg";
	// "RIFF" .... "WEBP"
	if (startsWith(bytes, [0x52, 0x49, 0x46, 0x46]) && startsWith(bytes, [0x57, 0x45, 0x42, 0x50], 8)) {
		return "image/webp";
	}
	return null;
};

const invalid = (message: string) =>
	new AppError("BAD_REQUEST", "Invalid image", { fieldErrors: { image: [message] } });

/** Size and content checks for an uploaded image; throws BAD_REQUEST with a localized field error. */
export const validateImage = async (file: File): Promise<ValidImage> => {
	if (file.size > TEST_CRUD_IMAGE_MAX_BYTES) {
		throw invalid(m.validation_file_too_large({ name: file.name, size: formatBytes(TEST_CRUD_IMAGE_MAX_BYTES) }));
	}
	const data = new Uint8Array(await file.arrayBuffer());
	const mimeType = sniffImageType(data);
	if (!mimeType) throw invalid(m.validation_file_type({ name: file.name }));
	return { mimeType, data };
};
