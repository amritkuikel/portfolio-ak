import type { PortfolioSource } from "../source";
import { fixtureSource } from "./fixture-source";

/**
 * The active content source. Swap this one line to move the portfolio from
 * demo fixtures to real data (docs/guides/portfolio.md, "Replacing the demo data").
 */
export const portfolioSource: PortfolioSource = fixtureSource;
