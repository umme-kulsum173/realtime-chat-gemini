import { Router } from 'express';
import { body } from 'express-validator';
import * as projectController from '../controllers/proj.controller.js';
import { authUser } from '../middleware/auth.middleware.js'; 
import Project from '../models/proj.model.js';
 // FIX: Remove authMiddleWare

const router = Router();

router.post(
    '/create',
    body('name').isString().withMessage('Name is required'), // FIX: Place validation first
    authUser,  // FIX: Use only authUser
    projectController.createProject
);

router.get('/all',
    authUser,
    projectController.getAllProject

)

 router.put('/add-user',
    authUser,
    body('projectId').isString().withMessage('Project ID is required'),
    body('users').isArray({min:1}).withMessage('Users must be an array of strings').bail()
    .custom((users) =>users.every(user => typeof user =='string')).withMessage('Each user must be string'),
    projectController.addUserToProject
 )

//  router.get('/get-project/:projectId',
//     authUser,
//     projectController.getProjectById
//  )
router.get('/get-project/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('users');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json({ project });
  } catch (err) {
    console.error('Error fetching project:', err);
    res.status(500).json({ message: 'Error fetching project', error: err.message });
  }
});

  
export default router;
