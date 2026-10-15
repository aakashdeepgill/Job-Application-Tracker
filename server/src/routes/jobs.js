import { Router } from 'express';
import mongoose from 'mongoose';
import Job from '../models/Job.js';

const router = Router();
const editableFields = ['companyName', 'role', 'status', 'dateApplied', 'location', 'jobUrl', 'notes'];

router.get('/', async (_request, response, next) => {
  try {
    const jobs = await Job.find().select('-owner').sort({ dateApplied: -1, createdAt: -1 });
    response.json(jobs);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (request, response, next) => {
  try {
    const fields = Object.fromEntries(editableFields
      .filter((field) => Object.hasOwn(request.body ?? {}, field))
      .map((field) => [field, request.body[field]]));
    const job = await Job.create(fields);
    response.status(201).json(job);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (request, response, next) => {
  try {
    if (!mongoose.isValidObjectId(request.params.id)) {
      return response.status(400).json({ message: 'Invalid application id.' });
    }

    const fields = Object.fromEntries(editableFields
      .filter((field) => Object.hasOwn(request.body ?? {}, field))
      .map((field) => [field, request.body[field]]));
    const job = await Job.findByIdAndUpdate(request.params.id, fields, {
      new: true,
      runValidators: true,
    }).select('-owner');

    if (!job) return response.status(404).json({ message: 'Application not found.' });
    response.json(job);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (request, response, next) => {
  try {
    if (!mongoose.isValidObjectId(request.params.id)) {
      return response.status(400).json({ message: 'Invalid application id.' });
    }

    const job = await Job.findByIdAndDelete(request.params.id);
    if (!job) return response.status(404).json({ message: 'Application not found.' });
    response.status(204).end();
  } catch (error) {
    next(error);
  }
});

export default router;