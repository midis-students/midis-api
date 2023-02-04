import { parse, HTMLElement } from "node-html-parser";
import { getNodeChildren } from "../tools";

export default function ScheduleParse(html: string, full = false) {
  html = html.replace(/<!--\s*(.*?)\s*-->/g, "$1");

  const root = parse(html);
  const group = root.querySelector(".subgroupContent");
  if (group) {
    const extractDays = (nodes: HTMLElement[]) => {
      return nodes.map((node) => {
        const date = node.querySelector(".card-title")?.innerText.trim();
        const tbody = getNodeChildren(node.querySelector("tbody"));
        const table = tbody.map((tr) => {
          const children = getNodeChildren(tr);
          const data = children.map((el) => el.innerText.trim());
          if (!full) {
            data.splice(2, 1);
          }
          const [id, flow, object, cabinet, teacher] = data;
          return {
            id: +id,
            flow,
            object,
            cabinet,
            teacher,
          };
        });
        return { table, date };
      });
    };

    const firstWeek = getNodeChildren(group.childNodes[5]);
    const secondWeek = getNodeChildren(group.childNodes[9]);

    return {
      first: extractDays(firstWeek),
      second: extractDays(secondWeek),
    };
  }
}
