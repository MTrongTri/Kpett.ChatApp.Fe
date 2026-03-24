import { BaseUser } from "@/types/user";

export interface UserLoginResponse extends BaseUser {
  isProfileCompleted: boolean;
}
