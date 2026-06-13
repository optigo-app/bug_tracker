import { useState, useEffect } from 'react';

export const useUserSession = () => {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userProfileData = localStorage.getItem('UserProfileData');
      if (userProfileData) {
        try {
          const profile = JSON.parse(userProfileData);
          setCurrentUser({
            id: profile.id,
            name: `${profile.firstname} ${profile.lastname}`.trim() || profile.id,
            role: profile.designation || 'User',
            email: profile.userid,
            ...profile
          });
        } catch (error) {
          console.error('Error parsing UserProfileData:', error);
        }
      }
    }
  }, []);

  return currentUser;
};

export const useAssignees = (open) => {
  const [assignees, setAssignees] = useState([]);

  useEffect(() => {
    if (open) {
      try {
        const taskAssigneeData = JSON.parse(localStorage.getItem('taskAssigneeData') || '[]');
        setAssignees(taskAssigneeData);
      } catch (error) {
        console.error('Error loading assignees:', error);
        setAssignees([]);
      }
    }
  }, [open]);

  return assignees;
};
