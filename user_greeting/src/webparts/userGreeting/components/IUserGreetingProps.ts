// import { IUserProfile } from '../../../interfaces';
export interface IUserGreetingProps {
  userProfile: {
    displayName: string;
    role: string;
    pictureUrl: string;
  };
  greetingStyle?: React.CSSProperties;
  roleStyle?: React.CSSProperties;
  imageStyle?: React.CSSProperties;
}