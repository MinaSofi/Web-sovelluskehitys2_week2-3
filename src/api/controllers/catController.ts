// TODO: create following functions:
// - catGetByUser - get all cats by current user id
// - catGetByBoundingBox - get all cats by bounding box coordinates (getJSON)
// - catPutAdmin - only admin can change cat owner
// - catDeleteAdmin - only admin can delete cat
// - catDelete - only owner can delete cat
// - catPut - only owner can update cat
// - catGet - get cat by id
// - catListGet - get all cats
// - catPost - create new cat

import {Request, Response, NextFunction} from 'express';
import CustomError from '../../classes/CustomError';
import {Cat} from '../../interfaces/Cat';
import catModel from '../models/catModel';
import DBMessageResponse from '../../interfaces/DBMessageResponse';
import {validationResult} from 'express-validator';
import {User} from '../../interfaces/User';

const catGetByUser = async (
  req: Request<{id: string}, {}, {}>,
  res: Response,
  next: NextFunction
) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const messages = errors
        .array()
        .map((error) => `${error.msg}: ${error.param}`)
        .join(', ');
      next(new CustomError(messages, 400));
      return;
    }

    const currentUser = req.user as User;
    if (!currentUser) {
      next(new CustomError('User not found', 404));
      return;
    }

    const cats = await catModel
      .find({'owner._id': currentUser._id})
      .select('-__v');
    res.json(cats);
  } catch (err) {
    next(err);
  }
};

const catGetByBoundingBox = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const topR = req.query.topRight as string;
    const botL = req.query.bottomLeft as string;
    const topRArr = topR.split(',');
    const botLArr = botL.split(',');
    const topNums = topRArr.map(Number);
    const botNums = botLArr.map(Number);
    const cats = await catModel.find({
      location: {
        $geoWithin: {
          $box: [
            [botNums[0], botNums[1]],
            [topNums[0], topNums[1]],
          ],
        },
      },
    });
    res.json(cats);
  } catch (err) {
    next(err);
  }
};

const catPutAdmin = async (
  req: Request<{id: string}, {}, Cat>,
  res: Response,
  next: NextFunction
) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const messages = errors
        .array()
        .map((error) => `${error.msg}: ${error.param}`)
        .join(', ');
      next(new CustomError(messages, 400));
      return;
    }

    const cat = await catModel.findById(req.params.id);
    if (!cat) {
      throw new CustomError('Cat not found', 404);
    }

    cat.owner = req.body.owner;

    if ((req.user as User).role !== 'admin') {
      throw new CustomError('Only admin can change cat owner', 403);
    } else {
      const updatedCat = await cat.save();

      if (updatedCat) {
        const response: DBMessageResponse = {
          message: 'Cat updated successfully',
          data: updatedCat,
        };
        res.json(response);
      }
    }
  } catch (error) {
    next(new CustomError('Cat update failed', 500));
  }
};

const catDeleteAdmin = async (
  req: Request<{id: string}, {}, {}>,
  res: Response,
  next: NextFunction
) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const messages = errors
        .array()
        .map((error) => `${error.msg}: ${error.param}`)
        .join(', ');
      next(new CustomError(messages, 400));
      return;
    }

    if ((req.user as User).role !== 'admin') {
      throw new CustomError('Only admin can delete cat', 403);
    } else {
      const deletedCat = await catModel.findByIdAndDelete(req.params.id);

      if (deletedCat) {
        const response: DBMessageResponse = {
          message: 'Cat deleted successfully',
          data: deletedCat,
        };
        res.json(response);
      }
    }
  } catch (error) {
    next(new CustomError('Cat delete failed', 500));
  }
};

const catDelete = async (
  req: Request<{id: string}, {}, {}>,
  res: Response,
  next: NextFunction
) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const messages = errors
        .array()
        .map((error) => `${error.msg}: ${error.param}`)
        .join(', ');
      next(new CustomError(messages, 400));
      return;
    }

    const cat = await catModel.findById(req.params.id);
    if (!cat) {
      throw new CustomError('Cat not found', 404);
    }

    if ((req.user as User)._id !== cat.owner._id) {
      throw new CustomError('Owner only', 403);
    }

    const deletedCat = await catModel.findByIdAndDelete(req.params.id);

    if (deletedCat) {
      const response: DBMessageResponse = {
        message: 'Cat deleted successfully',
        data: deletedCat,
      };
      res.json(response);
    }
  } catch (error) {
    next(new CustomError('Cat delete failed', 500));
  }
};

const catPut = async (
  req: Request<{id: string}, {}, Cat>,
  res: Response,
  next: NextFunction
) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const messages = errors
        .array()
        .map((error) => `${error.msg}: ${error.param}`)
        .join(', ');
      next(new CustomError(messages, 400));
      return;
    }

    const cat = await catModel.findById(req.params.id);
    if (!cat) {
      throw new CustomError('Cat not found', 404);
    }

    if ((req.user as User)._id !== cat.owner._id) {
      throw new CustomError('Owner only', 403);
    }

    cat.cat_name = req.body.cat_name;
    cat.weight = req.body.weight;
    cat.birthdate = req.body.birthdate;
    cat.location = req.body.location;

    const updatedCat = await cat.save();

    if (updatedCat) {
      const response: DBMessageResponse = {
        message: 'Cat updated successfully',
        data: updatedCat,
      };
      res.json(response);
    }
  } catch (error) {
    next(new CustomError('Cat update failed', 500));
  }
};

const catGet = async (
  req: Request<{id: string}, {}, {}>,
  res: Response,
  next: NextFunction
) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const messages = errors
        .array()
        .map((error) => `${error.msg}: ${error.param}`)
        .join(', ');
      next(new CustomError(messages, 400));
      return;
    }

    const cat = await catModel.findById(req.params.id).select('-__v');
    if (!cat) {
      throw new CustomError('Cat not found', 404);
      return;
    }
    res.json(cat);
  } catch (err) {
    next(err);
  }
};

const catListGet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cats = await catModel.find().select('-__v');
    if (!cats || cats.length === 0) {
      next(new CustomError('No cats found', 404));
      return;
    }
    res.json(cats);
  } catch (err) {
    next(err);
  }
};

const catPost = async (
  req: Request<{}, {}, Cat>,
  res: Response,
  next: NextFunction
) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const messages = errors
        .array()
        .map((error) => `${error.msg}: ${error.param}`)
        .join(', ');
      next(new CustomError(messages, 400));
      return;
    }

    const cat = req.body;

    const newCat = await catModel.create(cat);
    const response: DBMessageResponse = {
      message: 'Cat created successfully',
      data: newCat,
    };

    res.json(response);
  } catch (error) {
    next(new CustomError('Cat creation failed', 500));
  }
};

export {
  catGetByUser,
  catGetByBoundingBox,
  catPutAdmin,
  catDeleteAdmin,
  catDelete,
  catPut,
  catGet,
  catListGet,
  catPost,
};
