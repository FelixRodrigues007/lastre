import { useRef, useState } from "react";
import { request, type Fields } from "./api";
import { useWorkspace } from "./context";
import { csvTemplate, parseLotsCsv } from "./csv";
import { Feedback, Field, Notice, useAction } from "./ui";
export function ImportLots({ onClose }: { onClose: () => void }) {
  const { reload } = useWorkspace();
  const [rows, setRows] = useState<Fields[]>([]);
  const [fileName, setFileName] = useState("");
  const [done, setDone] = useState(false);
  const key = useRef(crypto.randomUUID());
  const action = useAction();
  const template = () => {
    const url = URL.createObjectURL(
      new Blob(["\uFEFF" + csvTemplate], { type: "text/csv;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "lastre-modelo-lotes.csv";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return (
    <section className="assets-panel assets-import">
      <div className="assets-section-head">
        <div>
          <h2>Importar lotes de uma planilha</h2>
          <p>
            Baixe o modelo, preencha e salve como CSV. Até 100 lotes por vez.
          </p>
        </div>
        <button className="assets-text-link" onClick={onClose}>
          Fechar importação
        </button>
      </div>
      <div className="assets-stack">
        <button className="assets-button" onClick={template}>
          Baixar modelo CSV
        </button>
        <Field
          label="Arquivo CSV"
          hint="Setores: mineral, energy, environment ou recycling. Datas: AAAA-MM-DD. Confira quantidades e unidades antes de importar."
        >
          <input
            type="file"
            accept=".csv,text/csv"
            disabled={action.busy}
            onChange={(e) => {
              const file = e.target.files?.[0];
              setRows([]);
              setDone(false);
              if (file)
                void action.run(async () => {
                  if (file.size > 500_000)
                    throw new Error("O arquivo deve ter no máximo 500 KB.");
                  const parsed = parseLotsCsv(await file.text());
                  setRows(parsed);
                  setFileName(file.name);
                  key.current = crypto.randomUUID();
                });
            }}
          />
        </Field>
        <Feedback error={action.error} success={action.success} />
        {rows.length > 0 && !done && (
          <>
            <Notice>
              {rows.length} lote(s) lido(s) de {fileName}. Todos serão criados
              como rascunhos. Nenhum dado será compartilhado. Se uma linha for
              inválida, nenhum lote será importado.
            </Notice>
            <div className="assets-import-preview">
              {rows.slice(0, 5).map((r, i) => (
                <p key={i}>
                  <strong>{r.name}</strong> ·{" "}
                  {r.material || "Material a informar"} · {r.quantity || "—"}{" "}
                  {r.unit}
                </p>
              ))}
              {rows.length > 5 && <p>Mais {rows.length - 5} lote(s).</p>}
            </div>
            <button
              className="assets-button assets-button--primary"
              disabled={action.busy}
              onClick={() =>
                void action.run(async () => {
                  const result = await request<{ count: number }>(
                    "/objects/import",
                    { rows, key: key.current },
                  );
                  setDone(true);
                  await reload();
                  return result;
                }, `${rows.length} lote(s) importado(s) como rascunho.`)
              }
            >
              {action.busy ? "Importando…" : `Importar ${rows.length} lote(s)`}
            </button>
          </>
        )}
      </div>
    </section>
  );
}
