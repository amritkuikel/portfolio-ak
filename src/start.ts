import { createStart } from "@tanstack/react-start";
import { localeFunctionMiddleware } from "@/lib/i18n/locale-middleware";

export const startInstance = createStart(() => ({
	functionMiddleware: [localeFunctionMiddleware],
}));
