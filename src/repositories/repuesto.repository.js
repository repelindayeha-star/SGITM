const prisma = require('../config/prismaClient');

async function crear({ nombre, codigo, stock, stockMinimo, precio }) {
  return prisma.repuesto.create({
    data: { nombre, codigo, stock, stockMinimo, precio },
  });
}

async function listar() {
  return prisma.repuesto.findMany({ orderBy: { nombre: 'asc' } });
}

async function buscarPorId(id) {
  return prisma.repuesto.findUnique({ where: { id } });
}

async function buscarPorCodigo(codigo) {
  return prisma.repuesto.findUnique({ where: { codigo } });
}

async function listarConStockBajo() {
  // Trae todos y filtra en JS porque Prisma no compara dos columnas directamente
  // (stock <= stockMinimo) en una sola consulta de forma portable.
  const repuestos = await prisma.repuesto.findMany();
  return repuestos.filter((r) => r.stock <= r.stockMinimo);
}

async function actualizar(id, { nombre, precio, stockMinimo }) {
  return prisma.repuesto.update({ where: { id }, data: { nombre, precio, stockMinimo } });
}

async function ajustarStock(id, cantidad) {
  // cantidad puede ser positiva (entrada) o negativa (salida)
  return prisma.repuesto.update({
    where: { id },
    data: { stock: { increment: cantidad } },
  });
}

async function eliminar(id) {
  return prisma.repuesto.delete({ where: { id } });
}

module.exports = {
  crear,
  listar,
  buscarPorId,
  buscarPorCodigo,
  listarConStockBajo,
  actualizar,
  ajustarStock,
  eliminar,
};