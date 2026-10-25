/**
 * Server-safe entry (`gistda-sphere-react/services`): the REST web-services
 * client and route helpers, without React. Use it in Next.js route handlers
 * and server components, scripts and serverless functions.
 */
export { getTurnInstruction, ROUTE_TURN } from "@/utils/routeGuide";
export type { SphereServiceErrorCode, SphereServices } from "./client";
export { createSphereServices, SphereServiceError } from "./client";
export type * from "./types";
