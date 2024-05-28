import { Request, Response, NextFunction } from "express";
import Post from "../Models/Post";
import createError from "http-errors";
import User from "../Models/User";
import { Iuser } from "../Types/Iuser";
import {
  UserValidation,
  UserIdValidation,
} from "../Validations/UserValidation";

/**
 * Update user
 * @param userId
 * @param userModelValidation
 */
const processUpdateUser = async (
  userId: String,
  userModelValidation: Iuser
) => {
  try {
    const updateUser = await User.updateOne(
      {
        _id: userId,
      },
      {
        $set: {
          name: userModelValidation.name,
          surname: userModelValidation.surname,
        },
      }
    );
    return updateUser;
  } catch (error) {
    console.log(error);
  }
};
/**
 * add new user
 * @param userModelValidation
 */
const addUser = async (userModelValidation: Iuser) => {
  try {
    const user = new User({
      username: userModelValidation.username,
      name: userModelValidation.name,
      surname: userModelValidation.surname,
    });
    const savedUser = await user.save();

    return savedUser;
  } catch (error) {
    throw new createError.BadRequest("Bad request.");
  }
};

/**
 * Create new user
 * @param req
 * @param res
 * @param next
 */
export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userModelValidation: Iuser = await UserValidation.validateAsync(
      req.body
    );

    if (!userModelValidation) {
      return next(
        new createError.BadRequest(
          "Operation failed, invalid details provided."
        )
      );
    } else {
      const isUsernameAvailable = await User.findOne({
        username: userModelValidation.username,
      });
      if (isUsernameAvailable) {
        res.status(404).json({
          message: `Username ${userModelValidation.username} not available`,
        });
      } else {
        const newUser = await addUser(userModelValidation);
        if (newUser) {
          res.status(201).json({
            newUser,
          });
        } else {
          return next(
            res.status(400).json({
              message: "Invalid details provided.",
            })
          );
        }
      }
    }
  } catch (error) {
    if (error.isJoi === true) {
      return next(
        res.status(400).json({
          message: "Invalid details provided.",
        })
      );
    }
    next(error);
  }
};

/**
 * Upadet user
 * @param req
 * @param res
 * @param next
 */
export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userModelValidation: Iuser = await UserValidation.validateAsync(
      req.body
    );

    if (!userModelValidation) {
      return next(
        new createError.BadRequest(
          "Operation failed, invalid details provided."
        )
      );
    } else {
      const isUsernameValid = await User.findOne({
        username: userModelValidation.username,
      });
      if (!isUsernameValid) {
        res.status(404).json({
          message: `Username ${userModelValidation.username} not valid`,
        });
      } else {
        const updatedUser = await processUpdateUser(
          isUsernameValid._id,
          userModelValidation
        );
        if (updatedUser) {
          res.status(201).json({
            updatedUser,
          });
        } else {
          return next(
            res.status(400).json({
              message: "Invalid details provided.",
            })
          );
        }
      }
    }
  } catch (error) {
    if (error.isJoi === true) {
      return next(
        res.status(400).json({
          message: "Invalid details provided.",
        })
      );
    }
    next(error);
  }
};

export const getUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userIdValidation = await UserIdValidation.validateAsync(
      req.params.userId
    );

    if (!userIdValidation) {
      return next(
        new createError.BadRequest(
          "Operation failed, invalid details provided."
        )
      );
    } else {
      const userDetails = await User.findById(userIdValidation);
      if (!userDetails) {
        res.status(404).json({
          message: `User id not available`,
        });
      } else {
        res.status(200).json({
          userDetails,
        });
      }
    }
  } catch (error) {
    if (error.isJoi === true) {
      return next(
        res.status(400).json({
          message: "Invalid details provided.",
        })
      );
    }
    next(error);
  }
};

export const getAllUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userDetails = await User.find();
  console.log(userDetails);
  if (!userDetails) {
    res.status(404).json({
      message: `User id not available`,
    });
  } else {
    res.status(200).json({
      userDetails,
    });
  }
};

export const topKUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("----");
    // const getPosts = await Post.find()
    //   .select("_id title description vote createdAt updatedAt")
    //   .populate("user", "username name surname");

    const getPosts = await Post.aggregate([
      {
        $lookup: {
          from: "user",
          localField: "_id",
          foreignField: "user",
          as: "user",
        },
      },
      {
        $project: {
          _id: 0,
          title: 1,
          count: { $size: "$user" },
        },
      },
    ]);

    if (!getPosts) {
      res.status(404).json({
        message: `no post available`,
      });
    } else {
      console.log(getPosts);
      res.status(200).json(getPosts);
    }
  } catch (error) {
    if (error.isJoi === true) {
      return next(
        res.status(400).json({
          message: "Invalid details provided.",
        })
      );
    }
    next(error);
  }
};
