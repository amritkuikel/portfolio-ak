/**
 * Upload rules shared by the browser (early checks, the file picker's `accept`)
 * and the server (signed `allowed_formats`, the size check after upload).
 */
export const IMAGE_FORMATS = ["jpg", "jpeg", "png", "webp", "avif", "gif"] as const;
export const IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"] as const;
export const IMAGE_MAX_BYTES = 10 * 1024 * 1024;

/** Where an upload is going: becomes part of its Cloudinary public_id ("portfolio/test-crud/<uuid>"). */
export const UPLOAD_SCOPES = ["test-crud"] as const;
export type UploadScope = (typeof UPLOAD_SCOPES)[number];

/** Images per Test CRUD item. */
export const TEST_CRUD_MAX_IMAGES = 8;
