import type { Meta, StoryObj } from "@storybook/react-vite"
import {
  Badge,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
  Button,
  Card,
  CardBody,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  CellGrid,
  CellGridItem,
  DataList,
  DataListDetail,
  DataListItem,
  DataListTerm,
  Row,
  Stack,
} from "@playground/design-system"

const meta: Meta<typeof Card> = {
  title: "Data Display/Card & Lists",
  component: Card,
}

export default meta
type Story = StoryObj<typeof Card>

export const CardAndSpecs: Story = {
  render: () => (
    <Stack gap="lg" className="max-w-2xl">
      <Breadcrumb aria-label="Você está em">
        <BreadcrumbList>
          <BreadcrumbItem>
            <a href="#corrida">Corrida</a>
            <BreadcrumbSeparator />
          </BreadcrumbItem>
          <BreadcrumbItem>
            <a href="#tenis">Tênis</a>
            <BreadcrumbSeparator />
          </BreadcrumbItem>
          <BreadcrumbItem aria-current="page">Tênis Runner Pro</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <Row className="justify-between">
              <CardTitle>Tênis Runner Pro</CardTitle>
              <Badge tone="accent">-20%</Badge>
            </Row>
            <CardDescription>SKU tenis-runner · Depósito br-01</CardDescription>
          </CardHeader>
          <CardBody>
            <DataList>
              <DataListItem>
                <DataListTerm>Peso</DataListTerm>
                <DataListDetail>240g</DataListDetail>
              </DataListItem>
              <DataListItem>
                <DataListTerm>Drop</DataListTerm>
                <DataListDetail>8mm</DataListDetail>
              </DataListItem>
              <DataListItem>
                <DataListTerm>Preço</DataListTerm>
                <DataListDetail className="text-accent">R$ 399,90</DataListDetail>
              </DataListItem>
            </DataList>
          </CardBody>
          <CardFooter>
            <Button variant="solid" className="w-full">
              Adicionar à cesta
            </Button>
          </CardFooter>
        </Card>

        <Card interactive render={<a href="#categoria" />}>
          <CardHeader>
            <CardTitle>Card Interativo ›</CardTitle>
            <CardDescription>Renderizado como link via render prop</CardDescription>
          </CardHeader>
          <CardBody>
            <p className="text-fg-2">
              Hover eleva a superfície de <code className="font-mono">--ds-surface</code> para{" "}
              <code className="font-mono">--ds-surface-2</code> com borda de alto contraste.
            </p>
          </CardBody>
        </Card>
      </div>

      <CellGrid>
        {[
          { n: "01", title: "Frete grátis", desc: "Acima de R$ 199" },
          { n: "02", title: "Troca fácil", desc: "Até 30 dias" },
          { n: "03", title: "Parcelamento", desc: "10x sem juros" },
        ].map((item) => (
          <CellGridItem key={item.n}>
            <small className="font-mono text-xs text-fg-3">{item.n}</small>
            <span>{item.title}</span>
            <small className="font-mono text-xs text-fg-3">{item.desc}</small>
          </CellGridItem>
        ))}
      </CellGrid>
    </Stack>
  ),
}
