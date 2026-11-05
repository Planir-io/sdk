import { PlanirClient } from "../src/index.js";

declare const client: PlanirClient;

const runtime = await client.runtimes.create({
    image: "alpine:3.22", timeout: 600, onTimeout: "destroy",
});
const id: string = runtime.id;
const phase: string | undefined = runtime.observed?.phase;
const fetchedId: string = (await client.runtimes.get({ id })).id;
void [phase, fetchedId];

// @ts-expect-error An image is required.
client.runtimes.create({});
// @ts-expect-error Image references must be strings.
client.runtimes.create({ image: 123 });
// @ts-expect-error Misspelled create fields must be rejected.
client.runtimes.create({ image: "alpine:3.22", tiemout: 600 });
