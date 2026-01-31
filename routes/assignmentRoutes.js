import express from "express";
import Assignment from "../models/Assignment.js";
import Project from "../models/Project.js";
import User from "../models/User.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

/**
 * @route   POST /api/assignments
 * @desc    Assign developer to a project
 * @access  MANAGER only
 */
router.post(
  "/",
  authMiddleware,
  roleMiddleware("MANAGER"),
  async (req, res) => {
    try {
      const { developerId, projectId } = req.body;

      // 1️⃣ Check developer exists
      const developer = await User.findById(developerId);
      if (!developer || developer.role !== "DEVELOPER") {
        return res.status(400).json({ message: "Invalid developer" });
      }

      // 2️⃣ Check project exists
      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(400).json({ message: "Project not found" });
      }

      const newStartDate = project.startDate;
      const newEndDate = project.endDate;

      // 3️⃣ OVERLAP CHECK (CRITICAL LOGIC)
      const overlappingAssignment = await Assignment.findOne({
        developer: developerId,
        startDate: { $lte: newEndDate },
        endDate: { $gte: newStartDate }
      });

      if (overlappingAssignment) {
        return res.status(400).json({
          message: "Developer already assigned to another project during this period"
        });
      }

      // 4️⃣ Create assignment
      const assignment = await Assignment.create({
        developer: developerId,
        project: projectId,
        startDate: newStartDate,
        endDate: newEndDate
      });

      res.status(201).json({
        message: "Developer assigned successfully",
        assignment
      });

    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

/**
 * @route   GET /api/assignments/my
 * @desc    Developer views their assignments
 * @access  DEVELOPER only
 */
router.get(
  "/my",
  authMiddleware,
  roleMiddleware("DEVELOPER"),
  async (req, res) => {
    try {
      const assignments = await Assignment.find({
        developer: req.user.id
      })
        .populate("project", "title description startDate endDate");

      res.json(assignments);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

export default router;
