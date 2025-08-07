import { Request, Response } from 'express';
import { ClassService } from '../services/classService';
import { asyncHandler } from '../middlewares/errorHandler';
import { AuthenticatedRequest } from '../types';

export class ClassController {
  static createClass = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const newClass = await ClassService.createClass(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Clase creada exitosamente',
      data: newClass
    });
  });

  static getAllClasses = asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, search, sortBy, sortOrder } = req.query;
    
    const result = await ClassService.getAllClasses({
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      search: search as string,
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc'
    });
    
    res.status(200).json({
      success: true,
      data: result
    });
  });

  static getClassById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    
    const classData = await ClassService.getClassById(id);
    
    res.status(200).json({
      success: true,
      data: classData
    });
  });

  static updateClass = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    
    const updatedClass = await ClassService.updateClass(id, req.body);
    
    res.status(200).json({
      success: true,
      message: 'Clase actualizada exitosamente',
      data: updatedClass
    });
  });

  static deleteClass = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    
    const result = await ClassService.deleteClass(id);
    
    res.status(200).json({
      success: true,
      message: result.message,
      data: result
    });
  });

  static getClassesByInstructor = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { instructorId } = req.params;
    const { page, limit, sortBy, sortOrder } = req.query;
    
    const result = await ClassService.getClassesByInstructor(instructorId, {
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc'
    });
    
    res.status(200).json({
      success: true,
      data: result
    });
  });

  static getAvailableClasses = asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, search, sortBy, sortOrder } = req.query;
    
    const result = await ClassService.getAvailableClasses({
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      search: search as string,
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc'
    });
    
    res.status(200).json({
      success: true,
      data: result
    });
  });

  static getClassSchedule = asyncHandler(async (req: Request, res: Response) => {
    const { classId } = req.params;
    
    const schedule = await ClassService.getClassSchedule(classId);
    
    res.status(200).json({
      success: true,
      data: schedule
    });
  });

  static createClassSchedule = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { classId } = req.params;
    const { scheduleData } = req.body;
    
    const schedules = await ClassService.createClassSchedule(classId, scheduleData);
    
    res.status(201).json({
      success: true,
      message: 'Horarios creados exitosamente',
      data: schedules
    });
  });

  static updateClassSchedule = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { scheduleId } = req.params;
    
    const schedule = await ClassService.updateClassSchedule(scheduleId, req.body);
    
    res.status(200).json({
      success: true,
      message: 'Horario actualizado exitosamente',
      data: schedule
    });
  });

  static deleteClassSchedule = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { scheduleId } = req.params;
    
    const result = await ClassService.deleteClassSchedule(scheduleId);
    
    res.status(200).json({
      success: true,
      message: result.message,
      data: result
    });
  });

  static getClassStats = asyncHandler(async (req: Request, res: Response) => {
    const { classId } = req.params;
    
    const stats = await ClassService.getClassStats(classId);
    
    res.status(200).json({
      success: true,
      data: stats
    });
  });
} 