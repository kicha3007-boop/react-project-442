import { Text, Tooltip } from "@mantine/core";
import type { MouseEvent } from "react";

import type { Talent, TalentState } from "../types";

interface TalentNodeProps {
  talent: Talent;
  rank: number;
  state: TalentState;
  readOnly: boolean;
  onChange?: (talent: Talent, delta: number) => void;
}

const TalentNode = ({ talent, rank, state, readOnly, onChange }: TalentNodeProps) => {
  const rankText = `${rank}/${talent.maxRank}`;

  const handleContextMenu = (event: MouseEvent<HTMLButtonElement>) => {
    // Правая кнопка снимает очко, своё меню браузера здесь не нужно.
    event.preventDefault();
    onChange?.(talent, -1);
  };

  const label = (
    <>
      <Text size="sm" fw={700}>
        {talent.name}
      </Text>
      <Text size="xs">Ранг {rankText}</Text>
      <Text size="xs">{talent.text}</Text>
    </>
  );

  return (
    <Tooltip label={label} multiline w={240} openDelay={150} position="right" withArrow>
      <button
        type="button"
        className="talent"
        data-testid={`talent-${talent.id}`}
        data-state={state}
        disabled={readOnly}
        style={{ gridRow: 1, gridColumn: talent.col + 1 }}
        onClick={() => onChange?.(talent, 1)}
        onContextMenu={handleContextMenu}
      >
        <span className="talent__name">{talent.name}</span>
        <span className="talent__rank">{rankText}</span>
      </button>
    </Tooltip>
  );
};

export default TalentNode;
