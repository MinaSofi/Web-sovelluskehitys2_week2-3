// TODO: user interface
import {Document} from 'mongoose';

interface User extends Document {
  user_name: string;
  email: string;
  role: 'user' | 'admin';
  password: string;
}

interface UserOutput {
  _id: string;
  user_name: string;
  email: string;
}

interface UserTest {
  user_name: string;
  email: string;
  password: string;
}

interface LoginUser extends User {
  username: string;
}

export {User, UserOutput, UserTest, LoginUser};
