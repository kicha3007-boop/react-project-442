import { Group } from "@mantine/core";

import { rowCount } from "../layout";
import type { Build, TalentClass, Talent } from "../types";
import TreeCard from "./TreeCard";

interface TreesProps {
  klass: TalentClass;
  build: Build;
  readOnly?: boolean;
  onChange?: (talent: Talent, delta: number) => void;
}

// Все деревья класса одним и тем же компонентом: их число приходит из данных.
const Trees = ({ klass, build, readOnly, onChange }: TreesProps) => {
  const rows = rowCount(klass);
  return (
    <Group align="flex-start" gap="md">
      {klass.trees.map((tree) => (
        <TreeCard
          key={tree.id}
          klass={klass}
          tree={tree}
          build={build}
          rows={rows}
          readOnly={readOnly}
          onChange={onChange}
        />
      ))}
    </Group>
  );
};

export default Trees;
