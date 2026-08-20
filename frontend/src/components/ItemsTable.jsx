/**
 * Tabla de items de una orden (pruebas/repuestos/mano de obra). La usan tanto la
 * vista del taller (editable) como el Portal del cliente (solo lectura, pasando
 * soloLectura=true) -- no hay dos tablas distintas para lo mismo.
 */
export default function ItemsTable({ items, soloLectura = false, onEliminar }) {
  const total = items.reduce((acc, it) => acc + Number(it.subtotal), 0);

  return (
    <>
      <table>
        <thead>
          <tr>
            <th>Tipo</th>
            <th>Descripción</th>
            <th>Cantidad</th>
            <th>Valor unit.</th>
            <th>Subtotal</th>
            {!soloLectura && <th></th>}
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr key={it.id}>
              <td><span className="pill proceso">{it.tipo.replace("_", " ")}</span></td>
              <td>{it.descripcion}</td>
              <td>{it.cantidad}</td>
              <td>${Number(it.valorUnitario).toLocaleString("es-CO")}</td>
              <td>${Number(it.subtotal).toLocaleString("es-CO")}</td>
              {!soloLectura && (
                <td>
                  <button className="btn" onClick={() => onEliminar?.(it.id)}>Eliminar</button>
                </td>
              )}
            </tr>
          ))}
          {items.length === 0 && (
            <tr><td colSpan={soloLectura ? 5 : 6} style={{ color: "var(--muted)" }}>Sin ítems todavía.</td></tr>
          )}
        </tbody>
      </table>
      <div style={{ textAlign: "right", marginTop: 14, fontSize: 15 }}>
        Total ítems: <b style={{ color: "var(--accent)" }}>${total.toLocaleString("es-CO")}</b>
      </div>
    </>
  );
}
