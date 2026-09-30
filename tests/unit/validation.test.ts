import { afterEach, describe, expect, it } from "vitest";
import type { z } from "zod";
import {
	choice,
	choices,
	currency,
	email,
	mustAccept,
	numberRange,
	optionalText,
	password,
	passwordStrength,
	required,
	url,
} from "@/lib/validation";
import { overwriteGetLocale } from "@/paraglide/runtime";

const firstError = (schema: z.ZodType, value: unknown) => {
	const result = schema.safeParse(value);
	return result.success ? undefined : result.error.issues[0]?.message;
};

afterEach(() => {
	overwriteGetLocale(() => "en");
});

describe("text helpers", () => {
	it("required trims and rejects empty input", () => {
		expect(firstError(required(), "   ")).toBe("This field is required.");
		expect(firstError(required(), undefined)).toBe("This field is required.");
		expect(required().parse("  Sita ")).toBe("Sita");
		expect(firstError(required({ max: 3 }), "abcd")).toBe("Use at most 3 characters.");
	});

	it("optionalText allows empty strings", () => {
		expect(optionalText().parse("")).toBe("");
		expect(firstError(optionalText({ max: 2 }), "abc")).toBe("Use at most 2 characters.");
	});

	it("email", () => {
		expect(firstError(email(), "")).toBe("This field is required.");
		expect(firstError(email(), "sita@")).toBe("Enter a valid email address.");
		expect(email().parse(" sita@example.com ")).toBe("sita@example.com");
	});

	it("url accepts only http(s), optionally empty", () => {
		expect(firstError(url(), "ftp://example.com")).toMatch(/valid web address/);
		expect(firstError(url(), "javascript:alert(1)")).toMatch(/valid web address/);
		expect(url().parse("https://example.com/path")).toBe("https://example.com/path");
		expect(url({ optional: true }).parse("")).toBe("");
		expect(firstError(url({ optional: true }), "nope")).toMatch(/valid web address/);
	});
});

describe("password", () => {
	it("scores strength from 0 to 4", () => {
		expect(passwordStrength("short")).toBe(0);
		expect(passwordStrength("abcdefgh")).toBe(1);
		expect(passwordStrength("abcdefg1")).toBe(1);
		expect(passwordStrength("Abcdefg1")).toBe(2);
		expect(passwordStrength("Abcdefg1!")).toBe(3);
		expect(passwordStrength("Abcdefghij1!")).toBe(4);
	});

	it("requires length and a minimum strength", () => {
		expect(firstError(password(), "")).toBe("This field is required.");
		expect(firstError(password(), "short")).toBe("Use at least 8 characters.");
		expect(firstError(password(), "abcdefgh")).toMatch(/Make it stronger/);
		expect(password().parse("Abcdefg1")).toBe("Abcdefg1");
		expect(firstError(password({ minStrength: 4 }), "Abcdefg1")).toMatch(/Make it stronger/);
	});
});

describe("numbers", () => {
	it("numberRange", () => {
		expect(firstError(numberRange(), Number.NaN)).toBe("Enter a number.");
		expect(firstError(numberRange(), undefined)).toBe("Enter a number.");
		expect(firstError(numberRange({ min: 1 }), 0)).toBe("Must be at least 1.");
		expect(firstError(numberRange({ max: 1000 }), 1500)).toBe("Must be at most 1,000.");
		expect(firstError(numberRange({ integer: true }), 1.5)).toBe("Enter a whole number.");
		expect(numberRange({ min: 1, max: 10 }).parse(5)).toBe(5);
	});

	it("currency allows two decimals and no negatives by default", () => {
		expect(currency().parse(1234.5)).toBe(1234.5);
		expect(currency().parse(0.1 + 0.2)).toBeCloseTo(0.3);
		expect(firstError(currency(), 1.234)).toBe("Use at most 2 decimal places.");
		expect(firstError(currency(), -1)).toBe("Must be at least 0.");
		expect(firstError(currency({ max: 100 }), 101)).toBe("Must be at most 100.");
	});
});

describe("choices", () => {
	it("choice, choices and mustAccept", () => {
		expect(firstError(choice(), "")).toBe("This field is required.");
		expect(choice().parse("ktm")).toBe("ktm");
		expect(firstError(choices({ min: 2 }), ["a"])).toBe("Choose at least 2.");
		expect(choices().parse(["a"])).toEqual(["a"]);
		expect(firstError(mustAccept(), false)).toBe("You must accept this to continue.");
		expect(mustAccept().parse(true)).toBe(true);
	});
});

describe("localization", () => {
	it("reports messages in Nepali, with Nepali digits, when the locale is ne", () => {
		overwriteGetLocale(() => "ne");
		expect(firstError(required(), "")).toBe("यो विवरण आवश्यक छ।");
		expect(firstError(password(), "short")).toBe("कम्तीमा ८ अक्षर प्रयोग गर्नुहोस्।");
		expect(firstError(numberRange({ max: 1000 }), 1500)).toBe("बढीमा १,००० हुनुपर्छ।");
	});

	it("evaluates messages when validating, not when the schema is created", () => {
		const schema = required();
		expect(firstError(schema, "")).toBe("This field is required.");
		overwriteGetLocale(() => "ne");
		expect(firstError(schema, "")).toBe("यो विवरण आवश्यक छ।");
	});
});
