import type { Meta, StoryObj } from "@storybook/react-vite"
import {
  Badge,
  CellGrid,
  CellGridItem,
  DataList,
  DataListDetail,
  DataListItem,
  DataListTerm,
  InfoBar,
  PageHeader,
  Row,
  Stack,
  tokens,
} from "@playground/design-system"

const meta: Meta = {
  title: "Foundations/Tokens",
  parameters: { layout: "padded" },
}

export default meta
type Story = StoryObj

export const ColorPalette: Story = {
  render: () => (
    <Stack gap="lg">
      <PageHeader>
        <Row>
          <h1>Tokens de Cor e Superfície</h1>
          <Badge tone="accent">theme: terminal</Badge>
          <Badge>radius: 0</Badge>
        </Row>
        <p className="text-fg-3">
          Mapeados para <code className="font-mono text-fg-2">--ds-*</code>,{" "}
          <code className="font-mono text-fg-2">--ui-*</code> e utilitários Tailwind v4 via{" "}
          <code className="font-mono text-fg-2">@theme inline</code>.
        </p>
        <InfoBar>Contraste AA/AAA verificado para texto (≥ 4.5:1) e controles (≥ 3:1)</InfoBar>
      </PageHeader>
      <CellGrid>
        {Object.entries(tokens.colors).map(([name, token]) => (
          <CellGridItem key={name} className="gap-2">
            <div className="h-12 border border-line" style={{ background: token.value }} aria-hidden="true" />
            <Row className="justify-between">
              <strong className="font-mono text-sm text-fg">{name}</strong>
              <span className="font-mono text-xs text-fg-3">{token.value}</span>
            </Row>
            <small className="font-mono text-xs text-fg-3">
              {token.cssVar}
              {token.uiVar ? ` · ${token.uiVar}` : ""}
            </small>
            <small className="text-xs text-fg-2">{token.role}</small>
          </CellGridItem>
        ))}
      </CellGrid>
    </Stack>
  ),
}

export const TypographyAndSpacing: Story = {
  render: () => (
    <div className="grid gap-8 md:grid-cols-2">
      <Stack gap="sm">
        <h2>Escala Tipográfica</h2>
        {tokens.typography.scale.map((item) => (
          <div key={item.name} className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line py-2.5">
            <span
              className={item.font === "mono" ? "font-mono leading-tight" : "font-sans leading-tight"}
              style={{ fontSize: `var(${item.cssVar})` }}
            >
              {item.name} — Playground
            </span>
            <span className="font-mono text-xs text-fg-3">
              {item.cssVar} ({item.value})
            </span>
          </div>
        ))}
      </Stack>

      <Stack gap="sm">
        <h2>Espaçamento e Dimensões</h2>
        {tokens.spacing.map((space) => (
          <div key={space.name} className="grid grid-cols-[7.5rem_3.5rem_1fr] items-center gap-3 font-mono text-xs">
            <span className="text-fg-2">{space.cssVar}</span>
            <span className="text-fg-3">{space.px}px</span>
            <div className="h-3 bg-accent" style={{ width: space.value }} aria-hidden="true" />
          </div>
        ))}
        <DataList className="mt-4">
          <DataListItem>
            <DataListTerm>Raio de borda</DataListTerm>
            <DataListDetail>{tokens.radius}</DataListDetail>
          </DataListItem>
          <DataListItem>
            <DataListTerm>Container máximo</DataListTerm>
            <DataListDetail>{tokens.containerMax}</DataListDetail>
          </DataListItem>
          <DataListItem>
            <DataListTerm>Color scheme</DataListTerm>
            <DataListDetail>{tokens.colorScheme}</DataListDetail>
          </DataListItem>
        </DataList>
      </Stack>
    </div>
  ),
}
