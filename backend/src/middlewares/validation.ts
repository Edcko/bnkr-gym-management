import { Request, Response, NextFunction } from 'express';
import { body, validationResult, param, query } from 'express-validator';

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Errores de validación',
      errors: errors.array().map(error => ({
        field: (error as any).param,
        message: error.msg
      }))
    });
  }
  return next();
};

// Validaciones para autenticación
export const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('El email debe ser válido')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
  handleValidationErrors
];

export const validateRegister = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres'),
  body('email')
    .isEmail()
    .withMessage('El email debe ser válido')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La contraseña debe contener al menos una mayúscula, una minúscula y un número'),
  body('phone')
    .optional()
    .isMobilePhone('es-MX')
    .withMessage('El teléfono debe ser válido'),
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('La fecha de nacimiento debe ser válida'),
  handleValidationErrors
];

// Validaciones para usuarios
export const validateCreateUser = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres'),
  body('email')
    .isEmail()
    .withMessage('El email debe ser válido')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La contraseña debe contener al menos una mayúscula, una minúscula y un número'),
  body('role')
    .isIn(['CLIENT', 'INSTRUCTOR', 'ADMIN'])
    .withMessage('El rol debe ser válido'),
  body('phone')
    .optional()
    .isMobilePhone('es-MX')
    .withMessage('El teléfono debe ser válido'),
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('La fecha de nacimiento debe ser válida'),
  body('address')
    .optional()
    .isLength({ max: 200 })
    .withMessage('La dirección no puede exceder 200 caracteres'),
  body('emergencyContact')
    .optional()
    .isLength({ max: 50 })
    .withMessage('El contacto de emergencia no puede exceder 50 caracteres'),
  body('emergencyPhone')
    .optional()
    .isMobilePhone('es-MX')
    .withMessage('El teléfono de emergencia debe ser válido'),
  handleValidationErrors
];

export const validateUpdateUser = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('El email debe ser válido')
    .normalizeEmail(),
  body('role')
    .optional()
    .isIn(['CLIENT', 'INSTRUCTOR', 'ADMIN'])
    .withMessage('El rol debe ser válido'),
  body('phone')
    .optional()
    .isMobilePhone('es-MX')
    .withMessage('El teléfono debe ser válido'),
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('La fecha de nacimiento debe ser válida'),
  body('address')
    .optional()
    .isLength({ max: 200 })
    .withMessage('La dirección no puede exceder 200 caracteres'),
  body('emergencyContact')
    .optional()
    .isLength({ max: 50 })
    .withMessage('El contacto de emergencia no puede exceder 50 caracteres'),
  body('emergencyPhone')
    .optional()
    .isMobilePhone('es-MX')
    .withMessage('El teléfono de emergencia debe ser válido'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('El estado activo debe ser un valor booleano'),
  handleValidationErrors
];

export const validateChangePassword = [
  body('currentPassword')
    .isLength({ min: 6 })
    .withMessage('La contraseña actual debe tener al menos 6 caracteres'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('La nueva contraseña debe tener al menos 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La nueva contraseña debe contener al menos una mayúscula, una minúscula y un número'),
  handleValidationErrors
];

// Validaciones para clases
export const validateCreateClass = [
  body('name')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('El nombre de la clase debe tener entre 3 y 100 caracteres'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('La descripción no puede exceder 500 caracteres'),
  body('duration')
    .isInt({ min: 15, max: 180 })
    .withMessage('La duración debe estar entre 15 y 180 minutos'),
  body('maxCapacity')
    .isInt({ min: 1, max: 50 })
    .withMessage('La capacidad máxima debe estar entre 1 y 50'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('El precio debe ser un número positivo'),
  body('instructorId')
    .isString()
    .isLength({ min: 1 })
    .withMessage('El ID del instructor debe ser válido'),
  handleValidationErrors
];

export const validateUpdateClass = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('El nombre de la clase debe tener entre 3 y 100 caracteres'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('La descripción no puede exceder 500 caracteres'),
  body('duration')
    .optional()
    .isInt({ min: 15, max: 180 })
    .withMessage('La duración debe estar entre 15 y 180 minutos'),
  body('maxCapacity')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('La capacidad máxima debe estar entre 1 y 50'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El precio debe ser un número positivo'),
  handleValidationErrors
];

// Validaciones para reservas
export const validateCreateReservation = [
  body('classId')
    .isString()
    .isLength({ min: 1 })
    .withMessage('El ID de la clase debe ser válido'),
  body('startTime')
    .isISO8601()
    .withMessage('La fecha de inicio debe ser válida'),
  body('endTime')
    .isISO8601()
    .withMessage('La fecha de fin debe ser válida')
    .custom((endTime, { req }) => {
      const startTime = new Date(req.body.startTime);
      const end = new Date(endTime);
      if (end <= startTime) {
        throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
      }
      return true;
    }),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Las notas no pueden exceder 500 caracteres'),
  handleValidationErrors
];

// Validaciones para membresías
export const validateCreateMembership = [
  body('userId')
    .isString()
    .isLength({ min: 1 })
    .withMessage('El ID del usuario debe ser válido'),
  body('type')
    .isIn(['BASIC', 'PREMIUM', 'UNLIMITED'])
    .withMessage('El tipo de membresía debe ser válido'),
  body('startDate')
    .isISO8601()
    .withMessage('La fecha de inicio debe ser válida'),
  body('endDate')
    .isISO8601()
    .withMessage('La fecha de fin debe ser válida')
    .custom((endDate, { req }) => {
      const startDate = new Date(req.body.startDate);
      const end = new Date(endDate);
      if (end <= startDate) {
        throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
      }
      return true;
    }),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('El precio debe ser un número positivo'),
  handleValidationErrors
];

// Validaciones para inventario
export const validateCreateInventoryItem = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre del item debe tener entre 2 y 100 caracteres'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('La descripción no puede exceder 500 caracteres'),
  body('quantity')
    .isInt({ min: 0 })
    .withMessage('La cantidad debe ser un número entero positivo'),
  body('unit')
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('La unidad debe tener entre 1 y 20 caracteres'),
  body('threshold')
    .isInt({ min: 0 })
    .withMessage('El umbral debe ser un número entero positivo'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El precio debe ser un número positivo'),
  handleValidationErrors
];

// Validaciones para mensajes
export const validateCreateMessage = [
  body('receiverId')
    .optional()
    .isString()
    .isLength({ min: 1 })
    .withMessage('El ID del receptor debe ser válido'),
  body('content')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('El contenido debe tener entre 1 y 1000 caracteres'),
  body('type')
    .optional()
    .isIn(['TEXT', 'SYSTEM', 'NOTIFICATION'])
    .withMessage('El tipo de mensaje debe ser válido'),
  handleValidationErrors
];

// Validaciones para FAQ
export const validateCreateFAQ = [
  body('question')
    .trim()
    .isLength({ min: 10, max: 200 })
    .withMessage('La pregunta debe tener entre 10 y 200 caracteres'),
  body('answer')
    .trim()
    .isLength({ min: 20, max: 2000 })
    .withMessage('La respuesta debe tener entre 20 y 2000 caracteres'),
  body('category')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('La categoría debe tener entre 2 y 50 caracteres'),
  body('order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('El orden debe ser un número entero positivo'),
  handleValidationErrors
];

// Validaciones para parámetros de URL
export const validateIdParam = [
  param('id')
    .isString()
    .isLength({ min: 1 })
    .withMessage('El ID debe ser válido'),
  handleValidationErrors
];

// Validaciones para consultas
export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La página debe ser un número entero positivo'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('El límite debe estar entre 1 y 100'),
  query('sortBy')
    .optional()
    .isString()
    .withMessage('El campo de ordenamiento debe ser una cadena'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('El orden debe ser "asc" o "desc"'),
  handleValidationErrors
];

export const validateDateRange = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('La fecha de inicio debe ser válida'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('La fecha de fin debe ser válida')
    .custom((endDate, { req }) => {
      const startDate = req.query?.startDate;
      if (startDate && endDate) {
        const start = new Date(startDate as string);
        const end = new Date(endDate as string);
        if (end <= start) {
          throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
        }
      }
      return true;
    }),
  handleValidationErrors
]; 