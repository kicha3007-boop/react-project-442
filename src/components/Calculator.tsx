import { Anchor, Button, Group, Paper, Stack, Text, TextInput } from "@mantine/core";
import { createNotificationsStore, notifications, Notifications } from "@mantine/notifications";
import { useState } from "react";

import { encodeBuild } from "../buildCode";
import { applyChange, budgetLeft, canApply } from "../rules";
import { useBuildStore, useBuildStoreApi } from "../stores/buildStore";
import { useSavedBuilds } from "../stores/savedBuilds";
import type { TalentClass, Talent } from "../types";
import Trees from "./Trees";

const REFUSAL_ID = "refusal";

interface CalculatorProps {
  klass: TalentClass;
}

const Calculator = ({ klass }: CalculatorProps) => {
  const store = useBuildStoreApi();
  const build = useBuildStore((state) => state.build);
  const reset = useBuildStore((state) => state.reset);
  const save = useSavedBuilds((state) => state.save);
  const [name, setName] = useState("");
  // Хранилище уведомлений своё у каждого экрана калькулятора: отказ живёт
  // вместе с экраном и уходит при переходе на другой.
  const [refusals] = useState(createNotificationsStore);

  const hideRefusal = () => {
    notifications.hide(REFUSAL_ID, refusals);
  };

  const showRefusal = (reason: string) => {
    const refusal = {
      id: REFUSAL_ID,
      title: "Отказ",
      message: reason,
      color: "red",
      autoClose: false as const,
      "data-testid": "refusal",
    };
    notifications.update(refusal, refusals);
    notifications.show(refusal, refusals);
  };

  const handleChange = (talent: Talent, delta: number) => {
    // Вердикт спрашивается по свежему билду из стора, до правки состояния.
    const { build: current, setBuild } = store.getState();
    const change = { talentId: talent.id, delta };
    const verdict = canApply(klass, current, change);
    if (verdict.ok) {
      setBuild(applyChange(current, change));
      hideRefusal();
    } else {
      showRefusal(verdict.reason);
    }
  };

  const handleReset = () => {
    reset();
    hideRefusal();
  };

  const handleSave = () => {
    save(name.trim(), build);
    setName("");
  };

  const shareUrl = `${window.location.origin}/build/${encodeBuild(build)}`;

  return (
    <Stack data-testid="calculator" gap="md">
      <Paper withBorder p="md" radius="md">
        <Stack gap="sm">
          <Group justify="space-between">
            <Text fw={600}>
              Осталось очков: <span data-testid="budget-left">{budgetLeft(klass, build)}</span> из{" "}
              {klass.budget}
            </Text>
            <Button variant="default" data-testid="reset-build" onClick={handleReset}>
              Сбросить билд
            </Button>
          </Group>
          <Text size="sm">
            Ссылка на билд:{" "}
            <Anchor href={shareUrl} data-testid="share-link" style={{ wordBreak: "break-all" }}>
              {shareUrl}
            </Anchor>
          </Text>
          <Group align="flex-end">
            <TextInput
              label="Имя билда"
              placeholder="Например, Огненный маг"
              value={name}
              onChange={(event) => setName(event.currentTarget.value)}
              data-testid="build-name"
            />
            <Button data-testid="save-build" disabled={name.trim() === ""} onClick={handleSave}>
              Сохранить
            </Button>
          </Group>
        </Stack>
      </Paper>

      <Text size="sm" c="dimmed">
        Левая кнопка мыши вкладывает очко, правая снимает.
      </Text>

      <Trees klass={klass} build={build} onChange={handleChange} />

      <Notifications store={refusals} position="bottom-right" />
    </Stack>
  );
};

export default Calculator;
