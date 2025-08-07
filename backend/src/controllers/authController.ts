import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { asyncHandler } from '../middlewares/errorHandler';
import { AuthenticatedRequest } from '../types';

export class AuthController {
  static register = asyncHandler(async (req: Request, res: Response) => {
    const result = await AuthService.register(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: result
    });
  });

  static login = asyncHandler(async (req: Request, res: Response) => {
    const result = await AuthService.login(req.body);
    
    res.status(200).json({
      success: true,
      message: 'Inicio de sesión exitoso',
      data: result
    });
  });

  static changePassword = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user!.id;

    const result = await AuthService.changePassword(userId, currentPassword, newPassword);
    
    res.status(200).json({
      success: true,
      message: result.message,
      data: result
    });
  });

  static resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;

    const result = await AuthService.resetPassword(email);
    
    res.status(200).json({
      success: true,
      message: result.message,
      data: result
    });
  });

  static confirmResetPassword = asyncHandler(async (req: Request, res: Response) => {
    const { token, newPassword } = req.body;

    const result = await AuthService.confirmResetPassword(token, newPassword);
    
    res.status(200).json({
      success: true,
      message: result.message,
      data: result
    });
  });

  static getProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;

    const profile = await AuthService.getProfile(userId);
    
    res.status(200).json({
      success: true,
      data: profile
    });
  });

  static updateProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;

    const profile = await AuthService.updateProfile(userId, req.body);
    
    res.status(200).json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: profile
    });
  });
} 