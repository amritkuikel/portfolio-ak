import type { ProjectRecord } from "../../schema";
import { ferry } from "./ferry";
import { haat } from "./haat";
import { jaldhara } from "./jaldhara";
import { khoj } from "./khoj";
import { ledgerline } from "./ledgerline";
import { pahadUi } from "./pahad-ui";
import { sangam } from "./sangam";

/** One file per case study. Order breaks ties between projects of the same year. */
export const projects: ProjectRecord[] = [ledgerline, khoj, haat, sangam, ferry, jaldhara, pahadUi];
