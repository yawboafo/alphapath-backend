import { Response } from 'express';
import { AuthRequest, ApiResponse } from '../types/express';
import courseService from '../services/courseService';
import { asyncHandler } from '../middleware/errorHandler';

export class CourseController {
  getAllCourses = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { category, minPrice, maxPrice } = req.query;

    const filters = {
      category: category as string | undefined,
      minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
    };

    const courses = await courseService.getAllCourses(filters);

    const response: ApiResponse = {
      success: true,
      data: { courses },
    };

    res.status(200).json(response);
  });

  getCourseById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const course = await courseService.getCourseById(id);

    const response: ApiResponse = {
      success: true,
      data: { course },
    };

    res.status(200).json(response);
  });

  getCourseLessons = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const lessons = await courseService.getCourseLessons(id);

    const response: ApiResponse = {
      success: true,
      data: { lessons },
    };

    res.status(200).json(response);
  });

  getUserCourses = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
    }

    const courses = await courseService.getUserCourses(req.user.id);

    const response: ApiResponse = {
      success: true,
      data: { courses },
    };

    res.status(200).json(response);
  });

  enrollInCourse = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
    }

    const { id } = req.params;

    await courseService.enrollInCourse(req.user.id, id);

    const response: ApiResponse = {
      success: true,
      message: 'Successfully enrolled in course',
    };

    res.status(200).json(response);
  });

  getCourseProgress = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
    }

    const { id } = req.params;

    const progress = await courseService.getCourseProgress(req.user.id, id);

    const response: ApiResponse = {
      success: true,
      data: { progress },
    };

    res.status(200).json(response);
  });

  updateLessonProgress = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
    }

    const { id } = req.params;
    const { progressPercentage, completed } = req.body;

    await courseService.updateLessonProgress(req.user.id, id, progressPercentage, completed);

    const response: ApiResponse = {
      success: true,
      message: 'Progress updated successfully',
    };

    res.status(200).json(response);
  });

  createCourse = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
    }

    const courseData = {
      ...req.body,
      instructorId: req.user.id,
    };

    const course = await courseService.createCourse(courseData);

    const response: ApiResponse = {
      success: true,
      data: { course },
      message: 'Course created successfully',
    };

    res.status(201).json(response);
  });

  updateCourse = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
    }

    const { id } = req.params;
    const course = await courseService.updateCourse(id, req.body, req.user.id);

    const response: ApiResponse = {
      success: true,
      data: { course },
      message: 'Course updated successfully',
    };

    res.status(200).json(response);
  });

  deleteCourse = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
    }

    const { id } = req.params;
    await courseService.deleteCourse(id, req.user.id);

    const response: ApiResponse = {
      success: true,
      message: 'Course deleted successfully',
    };

    res.status(200).json(response);
  });
}

export default new CourseController();
