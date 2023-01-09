import  HTTP_STATUS  from 'http-status-codes';
import { UploadApiResponse } from 'cloudinary';
import { BadRequestError } from './../../../shared/globals/helpers/error-handler';
import { authService } from './../../../shared/services/db/auth.service';
import { IAuthDocument, ISignUpData } from './../interfaces/auth.interface';
import { signupSchema } from '@auth/schemes/singup';
import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { joiValidation } from '@root/shared/decorators/joi-validation.decorators';
import { Helpers } from '@global/helpers/helpers';
import { uploads } from '@global/helpers/cloudinary-upload';

export class SignUp {
  @joiValidation(signupSchema)
  public async create(req: Request, res: Response): Promise<void> {
    const {username, email,password,avatarColor,avatarImage} = req.body;
    const checkIfUserExist: IAuthDocument = await authService.getUserByUsernameOrEmail(username,email);
    if (checkIfUserExist) {
      throw new BadRequestError('Invalid credentials');
    }
    const authObjectId: ObjectId = new ObjectId();
    const userObjectId: ObjectId = new ObjectId();
    const uId = `${Helpers.generateRandomIntegers(12)}`;
    const authData: IAuthDocument = SignUp.prototype.singupData({
      _id: authObjectId,
      uId,
      username,
      email,
      password,
      avatarColor,

    });
    const result: UploadApiResponse = await uploads(avatarImage, `${userObjectId}`, true, true) as UploadApiResponse;
    if (!result?.public_id) {
      throw new BadRequestError('File Upload: Error occurred. Try again');
    }
    res.status(HTTP_STATUS.CREATED).json({ message: 'User created succesfully', authData});
  }
  private singupData (data: ISignUpData): IAuthDocument {
    const { _id, username, email, uId, password, avatarColor} =data;
    return {
      _id,
      uId,
      username: Helpers.firstLetterUppercase(username),
      email: Helpers.lowerCase(email),
      password,
      avatarColor,
      createdAt: new Date()
    } as IAuthDocument;
  }
}
