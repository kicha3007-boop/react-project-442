import { Alert, Container, List } from "@mantine/core";

interface StructureErrorsProps {
  errors: string[];
}

// Экран поломанной структуры: калькулятор вместо него не рисуется.
const StructureErrors = ({ errors }: StructureErrorsProps) => (
  <Container size="md" py="xl">
    <Alert color="red" title="Класс не прошёл проверку структуры">
      <List data-testid="structure-errors" spacing="xs">
        {errors.map((error, index) => (
          <List.Item key={`${index}-${error}`}>{error}</List.Item>
        ))}
      </List>
    </Alert>
  </Container>
);

export default StructureErrors;
