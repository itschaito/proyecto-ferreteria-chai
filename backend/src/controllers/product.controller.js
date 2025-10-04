import { db } from "../database/database.js";
const { Product } = db;

// Obtener todos los productos
export async function getProducts(req, res) {
  try {
    const products = await Product.findAll();
    res.json(products);
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
}

// Obtener un producto por ID
export async function getProductById(req, res) {
  const { id } = req.params;
  try {
    const product = await Product.findByPk(id);
    if (!product) return res.status(404).json({ message: "Producto no encontrado" });
    res.json(product);
  } catch (error) {
    console.error("Error al obtener producto:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
}

// Crear un nuevo producto
export async function createProduct(req, res) {
  const { name, price, stock } = req.body;
  try {
    const newProduct = await Product.create({ name, price, stock });
    res.status(201).json(newProduct);
  } catch (error) {
    console.error("Error al crear producto:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
}

// Actualizar un producto
export async function updateProduct(req, res) {
  const { id } = req.params;
  const { name, price, stock } = req.body;
  try {
    const product = await Product.findByPk(id);
    if (!product) return res.status(404).json({ message: "Producto no encontrado" });

    await product.update({ name, price, stock });
    res.json(product);
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
}

// Eliminar un producto
export async function deleteProduct(req, res) {
  const { id } = req.params;
  try {
    const product = await Product.findByPk(id);
    if (!product) return res.status(404).json({ message: "Producto no encontrado" });

    await product.destroy();
    res.json({ message: "Producto eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
}
