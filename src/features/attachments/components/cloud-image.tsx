import type { ImgHTMLAttributes } from "react";
import type { ImageAsset } from "../schema";

/**
 * A Cloudinary image with server-built responsive sources (src/server/attachments/images.ts).
 *
 * - "full": the whole image; width/height are its intrinsic size.
 * - "cover": cropped to 16:9 around the subject; put it in a 16:9 box.
 * - "thumb": a small square (160 px source).
 *
 * Always pass `sizes` for "full"/"cover" (how wide it's displayed) so the browser
 * downloads the right width. The width/height attributes reserve the space (no layout shift).
 */
export function CloudImage({
	image,
	variant = "full",
	sizes,
	alt,
	...props
}: {
	image: ImageAsset;
	variant?: "full" | "cover" | "thumb";
	sizes?: string;
} & Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "srcSet" | "width" | "height" | "sizes">) {
	if (variant === "thumb") {
		return <img src={image.thumb} width={160} height={160} alt={alt ?? image.alt} decoding="async" {...props} />;
	}
	const source = variant === "cover" ? image.cover : image.full;
	const [width, height] = variant === "cover" ? [1600, 900] : [image.width, image.height];
	return (
		<img
			src={source.src}
			srcSet={source.srcSet}
			sizes={sizes}
			width={width}
			height={height}
			alt={alt ?? image.alt}
			decoding="async"
			{...props}
		/>
	);
}
