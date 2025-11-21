import { Response } from 'express';
import { AuthRequest } from '../types/express';
import { asyncHandler } from '../middleware/errorHandler';
import SectionService from '../services/sectionService';

export class SectionController {
  // GET /api/courses/:courseId/sections - Get all sections for a course
  getCourseSections = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { courseId } = req.params;
    const sections = await SectionService.getCourseSections(courseId);

    res.status(200).json({
      success: true,
      data: sections,
    });
  });

  // POST /api/courses/:courseId/sections - Create a new section
  createSection = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { courseId } = req.params;
    const { title, orderIndex } = req.body;
    const userId = req.user!.id;

    const section = await SectionService.createSection(courseId, {
      title,
      orderIndex,
      instructorId: userId,
    });

    res.status(201).json({
      success: true,
      message: 'Section created successfully',
      data: section,
    });
  });

  // PUT /api/sections/:sectionId - Update a section
  updateSection = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { sectionId } = req.params;
    const { title, orderIndex } = req.body;
    const userId = req.user!.id;

    const section = await SectionService.updateSection(sectionId, userId, {
      title,
      orderIndex,
    });

    res.status(200).json({
      success: true,
      message: 'Section updated successfully',
      data: section,
    });
  });

  // DELETE /api/sections/:sectionId - Delete a section
  deleteSection = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { sectionId } = req.params;
    const userId = req.user!.id;

    await SectionService.deleteSection(sectionId, userId);

    res.status(200).json({
      success: true,
      message: 'Section deleted successfully',
    });
  });
}

export default new SectionController();
