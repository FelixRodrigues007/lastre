import assert from "node:assert/strict";
import { test } from "node:test";
import { parseLotsCsv } from "../src/features/assets/csv.js";

test("CSV accepts quoted semicolons, embedded newlines, escaped quotes and decimal commas", () => {
  const rows = parseLotsCsv(
    '\uFEFFnome;quantidade;descricao\r\n"Lote; 01";"24,6";"Linha 1\nLinha 2 com ""aspas"""\r\n',
  );
  assert.equal(rows[0].name, "Lote; 01");
  assert.equal(rows[0].quantity, "24.6");
  assert.equal(rows[0].description, 'Linha 1\nLinha 2 com "aspas"');
  assert.equal(parseLotsCsv("nome,quantidade\nLote,7")[0].quantity, "7");
});
test("CSV rejects unterminated cells, unknown or duplicate headers, missing names and inconsistent columns", () => {
  for (const invalid of [
    "nome;nome\na;b",
    "nome;desconhecido\na;b",
    "nome;quantidade\n;4",
    "nome;quantidade\na",
    'nome\n"a',
    'nome\n"a"b',
  ])
    assert.throws(() => parseLotsCsv(invalid));
});
