import type { LotListItem } from "../../lib/types";
import { ProcessSealArena } from "./ProcessSealArena";

type ProcessIdleStageProps = {
  selectedLots: LotListItem[];
};

export function ProcessIdleStage({ selectedLots }: ProcessIdleStageProps) {
  return <ProcessSealArena selectedLots={selectedLots} />;
}
