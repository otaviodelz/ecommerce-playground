import type { Meta, StoryObj } from "@storybook/react-vite"
import {
  Checkbox,
  CheckboxGroup,
  CheckboxIndicator,
  Field,
  FieldLabel,
  Progress,
  ProgressIndicator,
  ProgressLabel,
  ProgressTrack,
  ProgressValue,
  Radio,
  RadioGroup,
  RadioIndicator,
  Row,
  SegmentedControl,
  SegmentedControlIndicator,
  SegmentedControlItem,
  Slider,
  SliderControl,
  SliderIndicator,
  SliderThumb,
  SliderTrack,
  SliderValue,
  Stack,
  Switch,
  SwitchThumb,
} from "@playground/design-system"
import { useState } from "react"

const meta: Meta = {
  title: "Forms/Choice Controls",
}

export default meta
type Story = StoryObj

export const CheckboxesAndSwitch: Story = {
  render: () => (
    <Stack gap="lg" className="max-w-md">
      <Field>
        <FieldLabel>Filtros de vitrine</FieldLabel>
        <CheckboxGroup defaultValue={["frete-gratis"]}>
          <label>
            <Checkbox value="frete-gratis">
              <CheckboxIndicator />
            </Checkbox>
            Frete grátis
          </label>
          <label>
            <Checkbox value="parcelamento">
              <CheckboxIndicator />
            </Checkbox>
            Até 10x sem juros
          </label>
          <label>
            <Checkbox value="retira" disabled>
              <CheckboxIndicator />
            </Checkbox>
            Retirar hoje (indisponível)
          </label>
        </CheckboxGroup>
      </Field>

      <label>
        Avisar quando voltar ao estoque
        <Switch defaultChecked>
          <SwitchThumb />
        </Switch>
      </label>
    </Stack>
  ),
}

export const RadioAndSegmented: Story = {
  render: () => (
    <Stack gap="lg" className="max-w-md">
      <Field>
        <FieldLabel>Visualização da listagem</FieldLabel>
        <SegmentedControl defaultValue="grade">
          <SegmentedControlIndicator />
          <SegmentedControlItem value="grade">Grade</SegmentedControlItem>
          <SegmentedControlItem value="lista">Lista</SegmentedControlItem>
          <SegmentedControlItem value="compacto">Compacto</SegmentedControlItem>
        </SegmentedControl>
      </Field>

      <Field>
        <FieldLabel>Modalidade de entrega</FieldLabel>
        <RadioGroup defaultValue="padrao">
          <label>
            <Radio value="padrao">
              <RadioIndicator />
            </Radio>
            Padrão (3–5 dias úteis)
          </label>
          <label>
            <Radio value="expressa">
              <RadioIndicator />
            </Radio>
            Expressa (1 dia útil)
          </label>
        </RadioGroup>
      </Field>
    </Stack>
  ),
}

export const SliderWithProgress: Story = {
  render: function SliderStory() {
    const [value, setValue] = useState(65)
    return (
      <Stack gap="md" className="max-w-md">
        <Slider value={value} onValueChange={(next) => setValue(Array.isArray(next) ? next[0] : next)} min={0} max={100}>
          <Row className="justify-between">
            <span className="font-mono text-xs text-fg-2">Progresso do frete grátis</span>
            <SliderValue />
          </Row>
          <SliderControl>
            <SliderTrack>
              <SliderIndicator />
              <SliderThumb aria-label="Percentual do frete grátis" />
            </SliderTrack>
          </SliderControl>
        </Slider>

        <Progress value={value}>
          <ProgressLabel>Meta de R$ 199</ProgressLabel>
          <ProgressValue />
          <ProgressTrack>
            <ProgressIndicator />
          </ProgressTrack>
        </Progress>
      </Stack>
    )
  },
}
