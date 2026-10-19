/**
 * Recipe (docs/guides/recipes.md, "CSV export"; decision 0148): rows to CSV
 * (RFC 4180) and a browser download. Columns pick and label the values, so the
 * export matches what the table shows.
 *
 * Cells that a spreadsheet would run as a formula (starting with = + - @, tab
 * or carriage return) are prefixed with an apostrophe (OWASP "CSV injection").
 */
export type CsvColumn<Row> = { header: string; value: (row: Row) => string | number | boolean | null | undefined };

const FORMULA = /^[=+\-@\t\r]/;

export const csvCell = (value: string | number | boolean | null | undefined): string => {
	if (value === null || value === undefined) return "";
	let text = String(value);
	if (typeof value === "string" && FORMULA.test(text)) text = `'${text}`;
	return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};

/** The CSV text, with a header row and CRLF line ends. */
export const toCsv = <Row>(rows: ReadonlyArray<Row>, columns: ReadonlyArray<CsvColumn<Row>>): string =>
	[
		columns.map((column) => csvCell(column.header)),
		...rows.map((row) => columns.map((column) => csvCell(column.value(row)))),
	]
		.map((cells) => cells.join(","))
		.join("\r\n");

const BOM = String.fromCharCode(0xfeff);

/** Saves `csv` as `filename` (UTF-8 with a BOM, so Excel reads Devanagari correctly). */
export function downloadCsv(filename: string, csv: string) {
	const url = URL.createObjectURL(new Blob([BOM, csv], { type: "text/csv;charset=utf-8" }));
	const link = Object.assign(document.createElement("a"), { href: url, download: filename });
	document.body.append(link);
	link.click();
	link.remove();
	URL.revokeObjectURL(url);
}
