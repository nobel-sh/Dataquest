import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { EditProfileContainer, Input, SaveButton } from "./editProfile.styled";

const EditProfile = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const history = useHistory();

  const handleSave = () => {
    alert("Profile updated!");
    history.push("/");
  };

  return (
    <EditProfileContainer>
      <h2>Edit Profile</h2>
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="New Email"
      />
      <Input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="New Password"
      />
      <SaveButton onClick={handleSave}>Save</SaveButton>
    </EditProfileContainer>
  );
};

export default EditProfile;
