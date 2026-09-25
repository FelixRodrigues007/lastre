import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Inventory } from "./Inventory";
import { AdminLayout } from "./AdminLayout";

/** Imported only in Vite development; this is not an authorization mechanism. */
export function AdminPreview() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/admin/inventario"
          element={
            <AdminLayout title="Inventário">
              <Inventory />
            </AdminLayout>
          }
        />
        <Route path="*" element={<Navigate to="/admin/inventario" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
