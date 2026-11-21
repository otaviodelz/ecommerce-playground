import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { createAgent } from "@ui-sdk/react/agent"
import { expect, test, vi } from "vitest"
import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
  Badge,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
  Button,
  Callout,
  CalloutBody,
  CalloutLabel,
  Card,
  CardBody,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  CellGrid,
  CellGridItem,
  Checkbox,
  CheckboxIndicator,
  DataList,
  DataListDetail,
  DataListItem,
  DataListTerm,
  Dialog,
  DialogBackdrop,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  Input,
  Kbd,
  Menu,
  MenuContent,
  MenuItem,
  MenuTrigger,
  NumberInput,
  NumberInputControl,
  NumberInputDecrement,
  NumberInputGroup,
  NumberInputIncrement,
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Skeleton,
  Slider,
  SliderControl,
  SliderIndicator,
  SliderThumb,
  SliderTrack,
  Spinner,
  Stack,
  Switch,
  SwitchThumb,
  Tabs,
  TabsList,
  TabsPanel,
  TabsTab,
  Textarea,
  Toggle,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  cn,
  tokens,
} from "./index"

let approve = false
const agent = createAgent({ allow: (step) => !step.confirm || approve })

const activeSnapshot = () =>
  agent.snapshot().filter((entry) => !entry.offPage && entry.component !== "more")

test("tokens expose the terminal theme values", () => {
  expect(tokens.theme).toBe("terminal")
  expect(tokens.colorScheme).toBe("dark")
  expect(tokens.colors.bg.value).toBe("#0c0c0c")
  expect(tokens.colors.accent.value).toBe("#54d483")
  expect(tokens.colors.destructive.value).toBe("#ff7b72")
  expect(tokens.radius).toBe("0")
})

test("cn merges conflicting Tailwind classes cleanly", () => {
  expect(cn("p-2 text-fg-2", false, undefined, "p-4 text-accent")).toBe("p-4 text-accent")
})

test("Button applies terminal variants, sizes, and supports render prop", async () => {
  const onClick = vi.fn()
  render(
    <Row>
      <Button variant="solid" size="sm" onClick={onClick}>
        Salvar
      </Button>
      <Button variant="accent" size="lg">
        Destaque
      </Button>
      <Button variant="destructive">Remover</Button>
      <Button variant="ghost" render={<a href="/ofertas" />}>
        Ofertas
      </Button>
    </Row>,
  )

  const save = screen.getByRole("button", { name: "Salvar" })
  expect(save.getAttribute("data-variant")).toBe("solid")
  expect(save.getAttribute("data-size")).toBe("sm")
  await userEvent.setup().click(save)
  expect(onClick).toHaveBeenCalledOnce()

  const accent = screen.getByRole("button", { name: "Destaque" })
  expect(accent.getAttribute("data-variant")).toBe("accent")
  expect(accent.getAttribute("data-size")).toBe("lg")

  const link = screen.getByRole("link", { name: "Ofertas" })
  expect(link.getAttribute("href")).toBe("/ofertas")
  expect(link.getAttribute("data-variant")).toBe("ghost")
})

test("presentational primitives render semantic markup, data attributes, and support render prop", () => {
  render(
    <Stack gap="lg">
      <Breadcrumb aria-label="Caminho">
        <BreadcrumbList>
          <BreadcrumbItem>
            <a href="/">Início</a>
            <BreadcrumbSeparator />
          </BreadcrumbItem>
          <BreadcrumbItem aria-current="page">Corrida</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Badge tone="accent" variant="solid">
        -20%
      </Badge>

      <Callout tone="accent">
        <CalloutLabel>Aviso</CalloutLabel>
        <CalloutBody>Frete grátis acima de R$ 199</CalloutBody>
      </Callout>

      <Card interactive render={<section aria-label="Cartão" />}>
        <CardHeader>
          <CardTitle>Tênis Runner</CardTitle>
          <CardDescription>Corrida</CardDescription>
        </CardHeader>
        <CardBody>
          <DataList>
            <DataListItem>
              <DataListTerm>Peso</DataListTerm>
              <DataListDetail>240g</DataListDetail>
            </DataListItem>
          </DataList>
        </CardBody>
        <CardFooter>
          <Kbd>/</Kbd>
          <Spinner size="sm" />
          <Skeleton style={{ width: "4rem" }} />
        </CardFooter>
      </Card>

      <CellGrid>
        <CellGridItem>Item 01</CellGridItem>
      </CellGrid>
    </Stack>,
  )

  expect(screen.getByText("-20%").getAttribute("data-tone")).toBe("accent")
  expect(screen.getByText("-20%").getAttribute("data-variant")).toBe("solid")
  expect(screen.getByText("Aviso").getAttribute("data-ds")).toBe("callout-label")
  expect(screen.getByRole("region", { name: "Cartão" }).getAttribute("data-interactive")).toBe("true")
  expect(screen.getByText("240g").getAttribute("data-ds")).toBe("data-list-detail")
  expect(screen.getByText("/").getAttribute("data-ds")).toBe("kbd")
  expect(screen.getByText("Item 01").getAttribute("data-ds")).toBe("cell-grid-item")
})

test("an agent can inspect and operate every interactive design-system control", async () => {
  const onDelete = vi.fn()
  const onMenuAction = vi.fn()
  approve = false

  render(
    <Stack>
      <Field name="cupom">
        <FieldLabel>Cupom</FieldLabel>
        <Input mono placeholder="TERMINAL10" />
        <FieldDescription>Aplicado no checkout</FieldDescription>
        <FieldError />
      </Field>

      <Field name="notas">
        <FieldLabel>Observações</FieldLabel>
        <Textarea rows={2} />
      </Field>

      <Field>
        <FieldLabel>Quantidade</FieldLabel>
        <NumberInput defaultValue={1} min={1} max={10}>
          <NumberInputGroup>
            <NumberInputDecrement aria-label="Diminuir" />
            <NumberInputControl />
            <NumberInputIncrement aria-label="Aumentar" />
          </NumberInputGroup>
        </NumberInput>
      </Field>

      <Field>
        <FieldLabel>Ordenar por</FieldLabel>
        <Select defaultValue="relevancia">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="relevancia">Relevância</SelectItem>
            <SelectItem value="menor-preco">Menor preço</SelectItem>
            <SelectItem value="maior-desconto">Maior desconto</SelectItem>
          </SelectContent>
        </Select>
      </Field>

      <Field>
        <FieldLabel>Modo de visualização</FieldLabel>
        <SegmentedControl defaultValue="grade">
          <SegmentedControlIndicator />
          <SegmentedControlItem value="grade">Grade</SegmentedControlItem>
          <SegmentedControlItem value="lista">Lista</SegmentedControlItem>
        </SegmentedControl>
      </Field>

      <Field>
        <FieldLabel>Entrega</FieldLabel>
        <RadioGroup defaultValue="padrao">
          <label>
            <Radio value="padrao">
              <RadioIndicator />
            </Radio>
            Padrão
          </label>
          <label>
            <Radio value="expressa">
              <RadioIndicator />
            </Radio>
            Expressa
          </label>
        </RadioGroup>
      </Field>

      <label>
        <Checkbox>
          <CheckboxIndicator />
        </Checkbox>
        Embalar para presente
      </label>

      <label>
        Avisar quando voltar ao estoque
        <Switch>
          <SwitchThumb />
        </Switch>
      </label>

      <Toggle>Somente em estoque</Toggle>

      <Slider defaultValue={50} min={0} max={100}>
        <SliderControl>
          <SliderTrack>
            <SliderIndicator />
            <SliderThumb aria-label="Preço máximo" />
          </SliderTrack>
        </SliderControl>
      </Slider>

      <Tabs variant="terminal" defaultValue="detalhes">
        <TabsList aria-label="Seções do produto">
          <TabsTab value="detalhes">Detalhes</TabsTab>
          <TabsTab value="envio">Envio</TabsTab>
        </TabsList>
        <TabsPanel value="detalhes">Especificações técnicas</TabsPanel>
        <TabsPanel value="envio">Entrega em todo o Brasil</TabsPanel>
      </Tabs>

      <Accordion aria-label="Dúvidas frequentes" defaultValue={["troca"]}>
        <AccordionItem value="troca">
          <AccordionHeader>
            <AccordionTrigger>Troca grátis</AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>Até 30 dias após o recebimento.</AccordionPanel>
        </AccordionItem>
        <AccordionItem value="garantia">
          <AccordionHeader>
            <AccordionTrigger>Garantia</AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>12 meses de fábrica.</AccordionPanel>
        </AccordionItem>
      </Accordion>

      <Progress value={75}>
        <ProgressLabel>Frete grátis</ProgressLabel>
        <ProgressValue />
        <ProgressTrack>
          <ProgressIndicator />
        </ProgressTrack>
      </Progress>

      <Separator />

      <Popover>
        <PopoverTrigger>Ver políticas</PopoverTrigger>
        <PopoverContent>
          <PopoverTitle>Política de entrega</PopoverTitle>
          <p>Postagem em até 24h úteis.</p>
        </PopoverContent>
      </Popover>

      <Menu onAction={onMenuAction}>
        <MenuTrigger>Ações do pedido</MenuTrigger>
        <MenuContent>
          <MenuItem value="duplicar">Duplicar pedido</MenuItem>
          <MenuItem value="exportar">Exportar recibo</MenuItem>
        </MenuContent>
      </Menu>

      <Tooltip>
        <TooltipTrigger>Ajuda CEP</TooltipTrigger>
        <TooltipContent>Calcula prazo e estoque por região</TooltipContent>
      </Tooltip>

      <Dialog>
        <DialogTrigger>Abrir detalhes</DialogTrigger>
        <DialogBackdrop />
        <DialogContent>
          <DialogTitle>Detalhes do pedido</DialogTitle>
          <DialogDescription>Resumo completo.</DialogDescription>
          <DialogClose>Fechar janela</DialogClose>
        </DialogContent>
      </Dialog>

      <AlertDialog onOpenChange={(open, details) => {
        if (!open && details.reason === "close-press") onDelete()
      }}>
        <AlertDialogTrigger>Limpar cesta</AlertDialogTrigger>
        <AlertDialogBackdrop />
        <AlertDialogContent>
          <AlertDialogTitle>Remover todos os itens?</AlertDialogTitle>
          <AlertDialogDescription>Essa ação esvazia a cesta atual.</AlertDialogDescription>
          <AlertDialogClose>Voltar</AlertDialogClose>
          <AlertDialogClose value="confirm" data-agent-confirm="Remove todos os itens da cesta">
            Confirmar limpeza
          </AlertDialogClose>
        </AlertDialogContent>
      </AlertDialog>
    </Stack>,
  )

  const snapshot = activeSnapshot()
  for (const entry of snapshot) {
    expect(entry.label, `${entry.component} ${entry.ref} has no name`).toBeTruthy()
  }

  const labels = snapshot.map((entry) => entry.label)
  for (const expected of [
    "Cupom",
    "Observações",
    "Quantidade",
    "Ordenar por",
    "Modo de visualização",
    "Entrega",
    "Embalar para presente",
    "Avisar quando voltar ao estoque",
    "Somente em estoque",
    "Preço máximo",
    "Seções do produto",
    "Dúvidas frequentes",
  ]) {
    expect(labels, `${expected} is missing from snapshot`).toContain(expected)
  }

  const result = await agent.act({
    steps: [
      { ref: "Cupom", action: "setValue", args: ["TERM20"] },
      { ref: "Ordenar por", action: "setValue", args: ["Menor preço"] },
      { ref: "Modo de visualização", action: "setValue", args: ["Lista"] },
      { ref: "Embalar para presente", action: "setChecked", args: [true] },
      { ref: "Avisar quando voltar ao estoque", action: "setChecked", args: [true] },
      { ref: "Somente em estoque", action: "setPressed", args: [true] },
      { ref: "Seções do produto", action: "select", args: ["Envio"] },
      { ref: "Ações do pedido", action: "press", args: ["Exportar recibo"] },
    ],
  })
  expect(result.ok, result.error?.message).toBe(true)
  expect(screen.getByLabelText<HTMLInputElement>("Cupom").value).toBe("TERM20")
  expect(screen.getByText("Entrega em todo o Brasil")).toBeTruthy()
  expect(onMenuAction).toHaveBeenCalledWith("exportar", expect.any(Object))

  const confirmStep = {
    steps: [{ ref: "Limpar cesta", action: "press", args: ["Confirmar limpeza"] }],
  }
  expect((await agent.act(confirmStep)).ok).toBe(false)
  approve = true
  expect((await agent.act(confirmStep)).ok).toBe(true)
  await waitFor(() => expect(onDelete).toHaveBeenCalledOnce())
})

test("keyboard interaction toggles checkbox, switch, and closes dialog returning focus", async () => {
  const user = userEvent.setup()
  render(
    <Stack>
      <label>
        <Checkbox>
          <CheckboxIndicator />
        </Checkbox>
        Aceitar termos
      </label>
      <label>
        Notificações
        <Switch>
          <SwitchThumb />
        </Switch>
      </label>
      <Dialog>
        <DialogTrigger>Configurações</DialogTrigger>
        <DialogBackdrop />
        <DialogContent>
          <DialogTitle>Preferências</DialogTitle>
          <DialogClose>Cancelar</DialogClose>
        </DialogContent>
      </Dialog>
    </Stack>,
  )

  const checkbox = screen.getByRole("checkbox", { name: "Aceitar termos" })
  checkbox.focus()
  await user.keyboard(" ")
  expect(checkbox.getAttribute("aria-checked")).toBe("true")

  const sw = screen.getByRole("switch", { name: "Notificações" })
  sw.focus()
  await user.keyboard(" ")
  expect(sw.getAttribute("aria-checked")).toBe("true")

  const trigger = screen.getByRole("button", { name: "Configurações" })
  await user.click(trigger)
  expect(await screen.findByRole("dialog", { name: "Preferências" })).toBeTruthy()
  await user.click(screen.getByRole("button", { name: "Cancelar" }))
  await waitFor(() => expect(screen.queryByRole("dialog", { name: "Preferências" })).toBeNull())
  expect(document.activeElement).toBe(trigger)
})
