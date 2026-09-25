import { useRef, useState } from "react";
import { Button } from "../../components/ui/Button";
import { Icon } from "../../components/ui/Icon";
import { request, type Fields } from "./api";
import { useWorkspace } from "./context";
import { csvTemplate, parseLotsCsv } from "./csv";
import { sectorLabels } from "./model";
import { Dialog, Dropzone, toast } from "./overlay";
import { Feedback, Notice, Stepper, useAction } from "./ui";

/** CSV import in a DS dialog. Atomic and idempotent on the server; creates drafts only. */
export function ImportLots({ onClose }: { onClose: () => void }) {
  const { reload } = useWorkspace();
  const [rows, setRows] = useState<Fields[]>([]);
  const [fileName, setFileName] = useState("");
  const [done, setDone] = useState(false);
  const key = useRef(crypto.randomUUID());
  const action = useAction();
  const template = () => {
    const url = URL.createObjectURL(
      new Blob(["﻿" + csvTemplate], { type: "text/csv;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "lastre-modelo-lotes.csv";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const read = (file: File | null) => {
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
  };
  const submit = () =>
    void action.run(async () => {
      const result = await request<{ count: number }>("/objects/import", {
        rows,
        key: key.current,
      });
      setDone(true);
      await reload();
      toast("Importação concluída. Os lotes estão na lista como rascunho.");
      return result;
    }, `${rows.length} lote(s) importado(s) como rascunho.`);
  const stage = done ? 3 : rows.length ? 2 : fileName ? 1 : 0;

  return (
    <Dialog
      open
      onClose={onClose}
      size="lg"
      icon="upload"
      title="Importar lotes de uma planilha"
      description="Baixe o modelo, preencha e salve como CSV. Até 100 lotes por vez."
      actions={
        done ? (
          <Button onClick={onClose}>Concluir</Button>
        ) : (
          <>
            <Button variant="ghost" onClick={onClose}>
              Fechar importação
            </Button>
            <Button
              disabled={!rows.length || action.busy}
              loading={action.busy && rows.length > 0}
              startIcon={<Icon name="upload" size={16} />}
              onClick={submit}
            >
              {rows.length ? `Importar ${rows.length} lote(s)` : "Importar lotes"}
            </Button>
          </>
        )
      }
    >
      <div className="assets-import">
        <aside className="assets-import__steps">
          <Stepper
            label="Etapas da importação"
            steps={[
              {
                label: "Baixe o modelo",
                description: (
                  <button type="button" className="assets-text-link" onClick={template}>
                    <Icon name="download" size={14} /> Baixar modelo CSV
                  </button>
                ),
                state: stage > 0 ? "done" : "current",
              },
              {
                label: "Envie o arquivo",
                description: "Separador ; ou , em UTF-8.",
                state: stage > 1 ? "done" : stage === 1 ? "current" : "todo",
              },
              {
                label: "Confira e importe",
                description: "Tudo ou nada: uma linha inválida cancela a importação.",
                state: stage > 2 ? "done" : stage === 2 ? "current" : "todo",
              },
            ]}
          />
        </aside>
        <div className="assets-import__main">
          <Dropzone
            label="Arquivo CSV"
            accept=".csv,text/csv"
            disabled={action.busy}
            fileName={fileName || undefined}
            onFile={read}
            hint="Setores: mineral, energy, environment ou recycling. Datas: AAAA-MM-DD. Confira quantidades e unidades antes de importar."
          />
          <Feedback error={action.error} success={action.success} />
          {rows.length > 0 && !done && (
            <>
              <Notice tone="info" title={`${rows.length} lote(s) lido(s) de ${fileName}`}>
                Todos serão criados como rascunhos. Nenhum dado será
                compartilhado. Se uma linha for inválida, nenhum lote será
                importado.
              </Notice>
              <div className="assets-import-preview">
                <table className="assets-table">
                  <caption className="assets-sr-only">Prévia dos lotes lidos</caption>
                  <thead>
                    <tr>
                      <th scope="col">#</th>
                      <th scope="col">Lote</th>
                      <th scope="col">Setor</th>
                      <th scope="col">Material</th>
                      <th scope="col">Quantidade</th>
                      <th scope="col">Período</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.slice(0, 8).map((r, i) => (
                      <tr key={i}>
                        <td className="assets-mono">{String(i + 1).padStart(2, "0")}</td>
                        <td>
                          <strong>{r.name}</strong>
                        </td>
                        <td>{sectorLabels[r.sector] ?? r.sector}</td>
                        <td>{r.material || "Material a informar"}</td>
                        <td className="assets-mono">
                          {r.quantity || "—"} {r.unit}
                        </td>
                        <td className="assets-mono">
                          {r.periodStart || "—"} → {r.periodEnd || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {rows.length > 8 && (
                  <p className="assets-import-preview__more">
                    Mais {rows.length - 8} lote(s).
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </Dialog>
  );
}
