import type { PublicTestCrudCard, TestCrudDetail, TestCrudListItem } from "../../src/features/test-crud/schema";
import type { SafeHtml } from "../../src/lib/safe-html";
import type { Session } from "../../src/lib/session";

/** Fixed sample data for stories (stable values keep screenshots and a11y runs deterministic). */
export const sampleAdmin: Session = {
	user: { id: "admin-1", email: "admin@example.com", name: "Admin", role: "admin" },
};
export const sampleUser: Session = { user: { id: "user-1", email: "sita@example.com", name: "Sita", role: "user" } };

export const sampleImage = "/favicon.svg";

export const sampleItems: TestCrudListItem[] = [
	{
		id: "6f1c0a52-0b6c-4c43-9a55-1f4a6f0d0001",
		slug: "momo-kitchen",
		title: "Momo Kitchen",
		status: "published",
		price: 1250.5,
		tags: ["food", "nepal"],
		imageUrl: sampleImage,
		publishedAt: "2026-09-01T08:00:00.000Z",
		updatedAt: "2026-09-20T10:30:00.000Z",
	},
	{
		id: "6f1c0a52-0b6c-4c43-9a55-1f4a6f0d0002",
		slug: "himalayan-tea",
		title: "Himalayan Tea",
		status: "draft",
		price: 450,
		tags: ["drink"],
		imageUrl: null,
		publishedAt: null,
		updatedAt: "2026-09-18T07:15:00.000Z",
	},
	{
		id: "6f1c0a52-0b6c-4c43-9a55-1f4a6f0d0003",
		slug: "dhaka-topi",
		title: "Dhaka Topi",
		status: "published",
		price: 1800,
		tags: [],
		imageUrl: null,
		publishedAt: "2026-08-10T12:00:00.000Z",
		updatedAt: "2026-09-02T09:45:00.000Z",
	},
];

const [first] = sampleItems;
export const sampleDetail: TestCrudDetail = {
	...(first as TestCrudListItem),
	summary: "Hand-made dumplings from Kathmandu.",
	body: "<h2>Menu</h2><p>Steamed <strong>momo</strong> with tomato achar.</p>",
	phone: "+9779812345678",
	createdAt: "2026-08-30T08:00:00.000Z",
};

export const samplePublicCard: PublicTestCrudCard = {
	slug: "momo-kitchen",
	title: "Momo Kitchen",
	summary: "Hand-made dumplings from Kathmandu, steamed or fried, served with tomato achar.",
	price: 1250.5,
	tags: ["food", "nepal"],
	imageUrl: sampleImage,
	publishedAt: "2026-09-01T08:00:00.000Z",
};

export const sampleBody = sampleDetail.body as SafeHtml;
