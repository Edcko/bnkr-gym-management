import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/inventory - Obtener todos los items
export const getAllItems = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, category, status, stock } = req.query;
    
    const skip = (Number(page) - 1) * Number(limit);
    
    // Construir filtros
    const where: any = {};
    
    if (status) where.isActive = status === 'ACTIVE';
    if (stock === 'low') where.quantity = { lte: prisma.inventoryItem.fields.threshold };
    if (stock === 'out') where.quantity = 0;
    
    const [items, total] = await Promise.all([
      prisma.inventoryItem.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.inventoryItem.count({ where })
    ]);
    
    const totalPages = Math.ceil(total / Number(limit));
    
    res.json({
      success: true,
      data: items,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages
      }
    });
  } catch (error) {
    console.error('Error obteniendo items de inventario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// GET /api/inventory/stats - Obtener estadísticas del inventario
export const getInventoryStats = async (req: Request, res: Response) => {
  try {
    const [
      totalItems,
      activeItems,
      lowStockItems,
      outOfStockItems,
      totalValue
    ] = await Promise.all([
      prisma.inventoryItem.count(),
      prisma.inventoryItem.count({ where: { isActive: true } }),
      prisma.inventoryItem.count({
        where: {
          quantity: {
            lte: prisma.inventoryItem.fields.threshold
          }
        }
      }),
      prisma.inventoryItem.count({ where: { quantity: 0 } }),
      prisma.inventoryItem.aggregate({
        _sum: {
          price: true
        }
      })
    ]);
    
    res.json({
      success: true,
      data: {
        totalItems,
        activeItems,
        lowStockItems,
        outOfStockItems,
        totalValue: totalValue._sum.price || 0
      }
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas de inventario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// GET /api/inventory/:id - Obtener item por ID
export const getItemById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const item = await prisma.inventoryItem.findUnique({
      where: { id }
    });
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item no encontrado'
      });
    }
    
    return res.json({
      success: true,
      data: item
    });
  } catch (error) {
    console.error('Error obteniendo item:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// POST /api/inventory - Crear nuevo item
export const createItem = async (req: Request, res: Response) => {
  try {
    const { 
      name, 
      description, 
      quantity, 
      unit, 
      threshold, 
      price, 
      supplier, 
      location, 
      isActive 
    } = req.body;
    
    // Validar datos requeridos
    if (!name || !quantity || !unit || !threshold) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos'
      });
    }
    
    const item = await prisma.inventoryItem.create({
      data: {
        name,
        description,
        quantity: Number(quantity),
        unit,
        threshold: Number(threshold),
        price: price ? Number(price) : undefined,
        supplier,
        location,
        isActive: isActive !== undefined ? isActive : true
      }
    });
    
    return res.status(201).json({
      success: true,
      data: item,
      message: 'Item creado exitosamente'
    });
  } catch (error) {
    console.error('Error creando item:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// PUT /api/inventory/:id - Actualizar item existente
export const updateItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Verificar que el item existe
    const existingItem = await prisma.inventoryItem.findUnique({
      where: { id }
    });
    
    if (!existingItem) {
      return res.status(404).json({
        success: false,
        message: 'Item no encontrado'
      });
    }
    
    // Convertir números si están presentes
    if (updateData.quantity) updateData.quantity = Number(updateData.quantity);
    if (updateData.threshold) updateData.threshold = Number(updateData.threshold);
    if (updateData.price) updateData.price = Number(updateData.price);
    
    const item = await prisma.inventoryItem.update({
      where: { id },
      data: updateData
    });
    
    return res.json({
      success: true,
      data: item,
      message: 'Item actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error actualizando item:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// DELETE /api/inventory/:id - Eliminar item
export const deleteItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Verificar que el item existe
    const existingItem = await prisma.inventoryItem.findUnique({
      where: { id }
    });
    
    if (!existingItem) {
      return res.status(404).json({
        success: false,
        message: 'Item no encontrado'
      });
    }
    
    await prisma.inventoryItem.delete({
      where: { id }
    });
    
    return res.json({
      success: true,
      message: 'Item eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando item:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
}; 