import { Button, Container, Group, Title } from "@mantine/core";
import { Link, Navigate, Route, Routes, useLocation } from "react-router";

import type { TalentClass } from "../types";
import Calculator from "./Calculator";
import SavedBuilds from "./SavedBuilds";
import SharedBuild from "./SharedBuild";

interface AppProps {
  klass: TalentClass;
}

const App = ({ klass }: AppProps) => {
  const { pathname } = useLocation();

  return (
    <Container size="xl" py="md">
      <Group justify="space-between" mb="md">
        <Title order={1} size="h2">
          {klass.name}
        </Title>
        <Group gap="xs" component="nav">
          <Button
            component={Link}
            to="/"
            variant={pathname === "/" ? "filled" : "light"}
            data-testid="nav-calculator"
          >
            Калькулятор
          </Button>
          <Button
            component={Link}
            to="/saved"
            variant={pathname === "/saved" ? "filled" : "light"}
            data-testid="nav-saved"
          >
            Сохранённые
          </Button>
        </Group>
      </Group>

      <Routes>
        <Route path="/" element={<Calculator klass={klass} />} />
        <Route path="/saved" element={<SavedBuilds klass={klass} />} />
        <Route path="/build/:code" element={<SharedBuild klass={klass} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Container>
  );
};

export default App;
