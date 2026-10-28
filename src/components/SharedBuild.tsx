import { Alert, Button, Group, Stack, Text, Title } from "@mantine/core";
import { useNavigate, useParams } from "react-router";

import { decodeBuild } from "../buildCode";
import { budgetLeft } from "../rules";
import { useBuildStore } from "../stores/buildStore";
import type { TalentClass } from "../types";
import Trees from "./Trees";

interface SharedBuildProps {
  klass: TalentClass;
}

// Чужой билд только на чтение: разобранное распределение живёт в самом экране
// и попадает в текущий билд только по кнопке «взять себе».
const SharedBuild = ({ klass }: SharedBuildProps) => {
  const { code = "" } = useParams();
  const setBuild = useBuildStore((state) => state.setBuild);
  const navigate = useNavigate();
  const result = decodeBuild(code, klass);

  if (!result.ok) {
    return (
      <Stack data-testid="shared-build" gap="md">
        <Title order={2}>Чужой билд</Title>
        <Alert color="red" title="Билд не открывается" data-testid="shared-build-error">
          {result.reason}
        </Alert>
      </Stack>
    );
  }

  const take = () => {
    setBuild({ ...result.build });
    navigate("/");
  };

  return (
    <Stack data-testid="shared-build" gap="md">
      <Group justify="space-between">
        <Title order={2}>Чужой билд</Title>
        <Button data-testid="take-build" onClick={take}>
          Взять себе
        </Button>
      </Group>
      <Text c="dimmed">Остаток бюджета в этом билде: {budgetLeft(klass, result.build)}</Text>
      <Trees klass={klass} build={result.build} readOnly />
    </Stack>
  );
};

export default SharedBuild;
