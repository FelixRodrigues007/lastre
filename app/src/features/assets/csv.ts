import type { Fields } from "./api";
import { emptyFields } from "./model";
export const csvTemplate =
  "nome;setor;material;quantidade;unidade;localizacao;responsavel;inicio;fim;descricao\nLote SC-026;mineral;Concentrado de cobre;24.6;t;Itabirito - MG;Marina Costa;2026-09-01;2026-09-10;Exemplo de cadastro\n";
/** RFC-style quoted cells, including escaped quotes and newlines. No formula evaluation. */
export function parseLotsCsv(input: string): Fields[] {
  if (input.length > 500_000)
    throw new Error("O CSV deve ter no máximo 500 mil caracteres.");
  const csv = input.replace(/^\uFEFF/, "");
  const firstLine = csv.split(/\r?\n/)[0];
  const separator = firstLine.includes(";") ? ";" : ",";
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  let closedQuote = false;
  for (let i = 0; i < csv.length; i++) {
    const c = csv[i];
    if (quoted) {
      if (c === '"' && csv[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (c === '"') {
        quoted = false;
        closedQuote = true;
      } else cell += c;
      continue;
    }
    if (c === '"' && cell === "" && !closedQuote) {
      quoted = true;
      continue;
    }
    if (c === separator) {
      row.push(cell.trim());
      cell = "";
      closedQuote = false;
      continue;
    }
    if (c === "\n" || c === "\r") {
      if (c === "\r" && csv[i + 1] === "\n") i++;
      row.push(cell.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      cell = "";
      closedQuote = false;
      continue;
    }
    if (closedQuote && c.trim())
      throw new Error(
        "Há texto depois de uma célula entre aspas. Confira o CSV.",
      );
    cell += c;
  }
  if (quoted)
    throw new Error("Há uma célula com aspas sem fechamento. Confira o CSV.");
  row.push(cell.trim());
  if (row.some(Boolean)) rows.push(row);
  const columns = rows.shift()?.map((c) => c.toLowerCase()) ?? [];
  const names: Record<string, keyof Fields> = {
    nome: "name",
    setor: "sector",
    material: "material",
    quantidade: "quantity",
    unidade: "unit",
    localizacao: "location",
    responsavel: "responsible",
    inicio: "periodStart",
    fim: "periodEnd",
    descricao: "description",
  };
  if (
    !columns.includes("nome") ||
    new Set(columns).size !== columns.length ||
    columns.some((c) => !names[c])
  )
    throw new Error(
      "Use as colunas do modelo, com nome obrigatório e sem cabeçalhos repetidos.",
    );
  if (!rows.length || rows.length > 100)
    throw new Error("Inclua entre 1 e 100 lotes por importação.");
  return rows.map((values, index) => {
    if (values.length !== columns.length)
      throw new Error(
        `Linha ${index + 2}: a quantidade de colunas difere do cabeçalho.`,
      );
    const fields = { ...emptyFields };
    columns.forEach((column, i) => {
      (fields as Record<string, string>)[names[column]] =
        column === "quantidade" ? values[i].replace(",", ".") : values[i];
    });
    if (!fields.name)
      throw new Error(`Linha ${index + 2}: informe o nome do lote.`);
    return fields;
  });
}
export function downloadJson(value: unknown, name: string) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(value, null, 2)], { type: "application/json" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
