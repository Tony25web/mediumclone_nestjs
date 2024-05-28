
import { userType } from "./user.type";

export interface UserResponseI{
    user:userType & {token:string}
}