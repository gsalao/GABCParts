import * as React from 'react';
import { IUserGreetingProps } from './IUserGreetingProps';
import styles from './UserGreeting.module.scss';

const getInitials = (displayName: string): string => {
  return displayName
    .split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase();
};

const UserGreeting: React.FC<IUserGreetingProps> = ({ userProfile }) => {
  const [imageError, setImageError] = React.useState(false);

  return (
    <div className={styles.userGreeting} aria-label={`Welcome ${userProfile.displayName}`}>
      {imageError ? (
        <div className={styles.fallbackAvatar} aria-hidden="true">
          {getInitials(userProfile.displayName)}
        </div>
      ) : (
        <img
          src={userProfile.pictureUrl}
          alt={`${userProfile.displayName}'s profile picture`}
          className={styles.profilePic}
          onError={() => setImageError(true)}
        />
      )}
      <div>
        <h2>Welcome, {userProfile.displayName}!</h2>
        {userProfile.role && <p>{userProfile.role}</p>}
      </div>
    </div>
  );
};

export default UserGreeting;