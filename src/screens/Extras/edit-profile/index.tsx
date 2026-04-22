import React from "react";
import { EditProfileView } from "./EditProfileView";
import { useEditProfileViewModel } from "./useEditProfileViewModel";

/**
 * Edit Profile Screen Entry Point.
 */
const EditProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const vm = useEditProfileViewModel(navigation);
    
    return <EditProfileView vm={vm} navigation={navigation} />;
};

export default EditProfileScreen;
