import express from "express";
import Project from "../models/Project.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

/**
 * @route   POST /api/projects
 * @desc    Create a new project
 * @access  MANAGER only
 */
router.post(
  "/",
  authMiddleware,
  roleMiddleware("MANAGER"),
  async (req, res) => {
    try {
      const { title, description, startDate, endDate } = req.body;

      // Basic date validation
      if (new Date(startDate) > new Date(endDate)) {
        return res.status(400).json({
          message: "Start date cannot be after end date"
        });
      }

      const project = await Project.create({
        title,
        description,
        startDate,
        endDate,
        createdBy: req.user.id
      });

      res.status(201).json(project);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

/**
 * @route   GET /api/projects
 * @desc    Get all projects (manager view)
 * @access  MANAGER only
 */
router.get(
  "/",
  authMiddleware,
  roleMiddleware("MANAGER"),
  async (req, res) => {
    try {
      const projects = await Project.find()
        .populate("createdBy", "name email");

      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

/**
 * @route   GET /api/projects/my
 * @desc    Get projects assigned to logged-in developer
 * @access  DEVELOPER only
 */
router.get(
  "/my",
  authMiddleware,
  roleMiddleware("DEVELOPER"),
  async (req, res) => {
    try {
      // Projects come through assignments, not directly
      const projects = await Project.find({
        _id: {
          $in: req.assignedProjectIds || []
        }
      });

      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

export default router;
