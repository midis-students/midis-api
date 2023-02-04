import { HTMLElement, Node } from "node-html-parser";

export function obj2query(query: object) {
  return Object.entries(query)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");
}

export function getNodeChildren(node: HTMLElement | Node) {
  return Array.from(
    node.childNodes.filter((child) => child instanceof HTMLElement)
  ) as HTMLElement[];
}
