import { Button, Card, Group, List, Stack, Text, TextInput, Title } from "@mantine/core";
import { useNavigate } from "react-router";

import { totalSpent, violations } from "../rules";
import { useBuildStore } from "../stores/buildStore";
import { useSavedBuilds } from "../stores/savedBuilds";
import type { TalentClass } from "../types";

interface SavedBuildsProps {
  klass: TalentClass;
}

const SavedBuilds = ({ klass }: SavedBuildsProps) => {
  const saved = useSavedBuilds((state) => state.saved);
  const rename = useSavedBuilds((state) => state.rename);
  const duplicate = useSavedBuilds((state) => state.duplicate);
  const remove = useSavedBuilds((state) => state.remove);
  const setBuild = useBuildStore((state) => state.setBuild);
  const navigate = useNavigate();
  const entries = Object.values(saved);

  const open = (id: string) => {
    const entry = saved[id];
    if (entry) {
      setBuild({ ...entry.build });
      navigate("/");
    }
  };

  return (
    <Stack data-testid="saved-builds" gap="md">
      <Title order={2}>Сохранённые билды</Title>
      {entries.length === 0 && <Text c="dimmed">Пока ничего не сохранено.</Text>}
      <List listStyleType="none" spacing="sm" styles={{ itemWrapper: { width: "100%" } }}>
        {entries.map((entry) => {
          // Запись могла остаться от другого класса: такой билд не открывается.
          const fits = violations(klass, entry.build).length === 0;
          return (
            <List.Item key={entry.id}>
              <Card withBorder radius="md" padding="sm" data-testid={`saved-build-${entry.name}`}>
                <Group justify="space-between" wrap="wrap">
                  <Group gap="sm">
                    <TextInput
                      aria-label="Имя билда"
                      value={entry.name}
                      onChange={(event) => rename(entry.id, event.currentTarget.value)}
                      data-testid={`rename-build-${entry.name}`}
                    />
                    <Text size="sm" c="dimmed">
                      Очков: {totalSpent(entry.build)}
                    </Text>
                  </Group>
                  <Group gap="xs">
                    <Button
                      data-testid={`open-build-${entry.name}`}
                      disabled={!fits}
                      onClick={() => open(entry.id)}
                    >
                      Открыть
                    </Button>
                    <Button
                      variant="default"
                      data-testid={`duplicate-build-${entry.name}`}
                      onClick={() => duplicate(entry.id)}
                    >
                      Дублировать
                    </Button>
                    <Button
                      color="red"
                      data-testid={`delete-build-${entry.name}`}
                      onClick={() => remove(entry.id)}
                    >
                      Удалить
                    </Button>
                  </Group>
                </Group>
              </Card>
            </List.Item>
          );
        })}
      </List>
    </Stack>
  );
};

export default SavedBuilds;
