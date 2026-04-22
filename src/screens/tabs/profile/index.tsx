import React from "react";
import { ProfileView } from "./ProfileView";
import { useProfileViewModel } from "./useProfileViewModel";

/**
 * Profile Screen Entry Point.
 */
const ProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const vm = useProfileViewModel(navigation);
    
    return <ProfileView vm={vm} navigation={navigation} />;
};

export default ProfileScreen;
