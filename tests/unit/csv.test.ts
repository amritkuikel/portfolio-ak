import { describe, expect, it } from "vitest";
import { csvCell, toCsv } from "@/lib/csv";

describe("CSV export", () => {
	it("quotes commas, quotes and line breaks, and leaves plain values alone", () => {
		expect(csvCell("plain")).toBe("plain");
		expect(csvCell('say "hi", twice')).toBe('"say ""hi"", twice"');
		expect(csvCell("two\nlines")).toBe('"two\nlines"');
		expect(csvCell(12.5)).toBe("12.5");
		expect(csvCell(null)).toBe("");
	});

	it("neutralizes cells a spreadsheet would run as formulas", () => {
		expect(csvCell("=HYPERLINK(1)")).toBe("'=HYPERLINK(1)");
		expect(csvCell("@SUM(A1)")).toBe("'@SUM(A1)");
		expect(csvCell(-5)).toBe("-5");
	});

	it("writes a header row and one row per item, CRLF-separated", () => {
		const rows = [
			{ title: "मोमो", done: true },
			{ title: "Tea, hot", done: false },
		];
		expect(
			toCsv(rows, [
				{ header: "Title", value: (row) => row.title },
				{ header: "Done", value: (row) => row.done },
			]),
		).toBe('Title,Done\r\nमोमो,true\r\n"Tea, hot",false');
	});
});
