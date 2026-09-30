// @vitest-environment jsdom
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { formValidators, useAppForm, withForm } from "@/components/forms";
import { email, required } from "@/lib/validation";

const schema = z.object({ name: required(), email: email() });

/** Resolves when the test says so, to observe the pending state. */
const deferred = () => {
	let resolve = () => {};
	const promise = new Promise<void>((done) => {
		resolve = done;
	});
	return { promise, resolve };
};

function ProfileForm({ onSubmit }: { onSubmit: (value: z.infer<typeof schema>) => Promise<void> | void }) {
	const form = useAppForm({
		defaultValues: { name: "", email: "" },
		validators: formValidators(schema),
		onSubmit: ({ value }) => onSubmit(value),
	});
	return (
		<form.AppForm>
			<form.Form>
				<form.FormErrorSummary />
				<form.AppField name="name">{(field) => <field.TextField label="Name" />}</form.AppField>
				<form.AppField name="email">{(field) => <field.EmailField label="Email" />}</form.AppField>
				<form.SubmitButton pendingLabel="Saving profile…">Save</form.SubmitButton>
			</form.Form>
		</form.AppForm>
	);
}

describe("FormErrorSummary", () => {
	it("appears after a failed submit, takes focus and links to each field", async () => {
		const user = userEvent.setup();
		render(<ProfileForm onSubmit={() => {}} />);
		expect(screen.queryByTestId("form-error-summary")).not.toBeInTheDocument();

		await user.click(screen.getByRole("button", { name: "Save" }));

		const summary = await screen.findByTestId("form-error-summary");
		expect(summary).toHaveAttribute("role", "alert");
		expect(summary).toHaveAccessibleName("Please fix the following:");
		await waitFor(() => expect(summary).toHaveFocus());

		const nameLink = screen.getByRole("link", { name: "Name: This field is required." });
		expect(screen.getByRole("link", { name: "Email: This field is required." })).toBeInTheDocument();
		await user.click(nameLink);
		expect(screen.getByLabelText("Name")).toHaveFocus();
	});

	it("disappears once the form is valid and submitted", async () => {
		const user = userEvent.setup();
		render(<ProfileForm onSubmit={() => {}} />);
		await user.click(screen.getByRole("button", { name: "Save" }));
		await screen.findByTestId("form-error-summary");
		await user.type(screen.getByLabelText("Name"), "Sita");
		await user.type(screen.getByLabelText("Email"), "sita@example.com");
		await user.click(screen.getByRole("button", { name: "Save" }));
		await waitFor(() => expect(screen.queryByTestId("form-error-summary")).not.toBeInTheDocument());
	});
});

describe("SubmitButton", () => {
	it("is disabled and shows a pending label while submitting", async () => {
		const user = userEvent.setup();
		const pending = deferred();
		render(<ProfileForm onSubmit={() => pending.promise} />);
		await user.type(screen.getByLabelText("Name"), "Sita");
		await user.type(screen.getByLabelText("Email"), "sita@example.com");
		await user.click(screen.getByRole("button", { name: "Save" }));

		const button = await screen.findByRole("button", { name: "Saving profile…" });
		expect(button).toBeDisabled();
		expect(button).toHaveAttribute("aria-busy", "true");

		pending.resolve();
		expect(await screen.findByRole("button", { name: "Save" })).toBeEnabled();
	});

	it("stays enabled when the form is invalid, so errors can be revealed", () => {
		render(<ProfileForm onSubmit={() => {}} />);
		expect(screen.getByRole("button", { name: "Save" })).toBeEnabled();
	});
});

describe("withForm", () => {
	const Section = withForm({
		defaultValues: { name: "" },
		props: { title: "Details" },
		render: function Render({ form, title }) {
			return (
				<section aria-label={title}>
					<form.AppField name="name">{(field) => <field.TextField label="Name" />}</form.AppField>
				</section>
			);
		},
	});

	function Parent() {
		const form = useAppForm({ defaultValues: { name: "Ram" } });
		return (
			<form.AppForm>
				<form.Form>
					<Section form={form} title="Details" />
				</form.Form>
			</form.AppForm>
		);
	}

	it("composes a form section from a parent form", () => {
		render(<Parent />);
		expect(screen.getByRole("region", { name: "Details" })).toBeInTheDocument();
		expect(screen.getByLabelText("Name")).toHaveValue("Ram");
	});
});
