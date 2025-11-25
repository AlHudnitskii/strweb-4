import React, { useContext } from "react";
import { AuthContext } from "../AuthContext";

function ProfilePage() {
  const { user } = useContext(AuthContext);

  if (!user) {
    return (
      <div className="container">
        <h2>Профиль</h2>
        <p>Вы не авторизованы.</p>
      </div>
    );
  }

  return (
    <div className="container profile-container">
      <h2>Мой Профиль</h2>
      <div className="profile-info">
        <p>
          <strong>ID:</strong> {user.id}
        </p>
        <p>
          <strong>Имя пользователя:</strong> {user.username}
        </p>
      </div>
    </div>
  );
}

export default ProfilePage;
