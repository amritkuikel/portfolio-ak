// Placeholder for scripts whose tooling arrives in a later phase (see docs/PLAN.md).
// Exits 0 so aggregate commands keep working, but says clearly that nothing ran.
const [, , script = "this script", phase = "a later phase"] = process.argv;
console.log(`[not installed] "${script}" is a stub. Its tooling is added in ${phase} (docs/PLAN.md).`);
