import { renderElement, type PartProps } from "@ui-sdk/react/primitive"

export function DataList({ render, ...props }: PartProps<"dl">) {
  return renderElement("dl", { ...props, "data-ds": "data-list" }, render)
}

export function DataListItem({ render, ...props }: PartProps<"div">) {
  return renderElement("div", { ...props, "data-ds": "data-list-item" }, render)
}

export function DataListTerm({ render, ...props }: PartProps<"dt">) {
  return renderElement("dt", { ...props, "data-ds": "data-list-term" }, render)
}

export function DataListDetail({ render, ...props }: PartProps<"dd">) {
  return renderElement("dd", { ...props, "data-ds": "data-list-detail" }, render)
}
