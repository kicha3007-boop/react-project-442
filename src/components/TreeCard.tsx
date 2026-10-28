import { Badge, Card, Group, Title } from "@mantine/core";

import { ARROW_SIZE, gridHeight, gridVars, gridWidth, linkSegment, rowBoundary } from "../layout";
import { findTalent, rankOf, rowNeeds, spentInTree, talentState } from "../rules";
import type { Build, TalentClass, Talent, Tree } from "../types";
import TalentNode from "./TalentNode";

interface TreeCardProps {
  klass: TalentClass;
  tree: Tree;
  build: Build;
  rows: number;
  readOnly?: boolean;
  onChange?: (talent: Talent, delta: number) => void;
}

const LABEL_WIDTH = 44;

const TreeCard = ({ klass, tree, build, rows, readOnly = false, onChange }: TreeCardProps) => {
  const width = gridWidth(klass.columns);
  const height = gridHeight(rows);
  const rowNumbers = Array.from({ length: rows }, (_, row) => row);
  const markerId = `arrow-${tree.id}`;

  const links = tree.talents.flatMap((child) => {
    const base = child.requires ? findTalent(klass, child.requires) : undefined;
    return base ? [{ base, child, segment: linkSegment(base, child) }] : [];
  });

  return (
    <Card withBorder radius="md" padding="md" data-testid={`tree-${tree.id}`} className="tree">
      <Group justify="space-between" mb="sm" wrap="nowrap">
        <Title order={3} size="h4">
          {tree.name}
        </Title>
        <Badge variant="light" size="lg">
          Вложено: <span data-testid={`tree-spent-${tree.id}`}>{spentInTree(tree, build)}</span>
        </Badge>
      </Group>

      <div className="tree__grid" style={{ ...gridVars(klass.columns), width, height }}>
        {rowNumbers.map((row) => (
          <div key={row} className="tree__row" data-testid={`row-${tree.id}-${row}`}>
            {tree.talents
              .filter((talent) => talent.row === row)
              .map((talent) => (
                <TalentNode
                  key={talent.id}
                  talent={talent}
                  rank={rankOf(build, talent.id)}
                  state={talentState(klass, build, talent)}
                  readOnly={readOnly}
                  onChange={onChange}
                />
              ))}
          </div>
        ))}

        <svg className="tree__links" width={width} height={height} aria-hidden="true">
          <defs>
            <marker
              id={markerId}
              viewBox={`0 0 ${ARROW_SIZE * 2} ${ARROW_SIZE * 2}`}
              refX={ARROW_SIZE * 2}
              refY={ARROW_SIZE}
              markerWidth={ARROW_SIZE}
              markerHeight={ARROW_SIZE}
              orient="auto"
            >
              <path
                d={`M0,0 L${ARROW_SIZE * 2},${ARROW_SIZE} L0,${ARROW_SIZE * 2} z`}
                className="tree__arrow-head"
              />
            </marker>
          </defs>

          {links.map(({ base, child, segment }) => (
            <line
              key={child.id}
              data-testid={`link-${base.id}-${child.id}`}
              className="tree__link"
              {...segment}
              markerEnd={`url(#${markerId})`}
            />
          ))}

          {rowNumbers.slice(1).map((row) => {
            const y = rowBoundary(row);
            return (
              <g key={row} className="tree__boundary">
                <line x1={LABEL_WIDTH} y1={y} x2={width} y2={y} />
                <text x={0} y={y + 4} textLength={LABEL_WIDTH - 4}>
                  нужно {rowNeeds(klass, row)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </Card>
  );
};

export default TreeCard;
