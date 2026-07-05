import { useEffect, useState } from "react";
import api from "../services/api";

function Profile() {
  const [profile, setProfile] = useState({
    username: "",
    email: "",
    bio: "",
    profession: "",
    location: "",
    website: "",
    github: "",
    linkedin: "",
    twitter: "",
    profile_image: "",
    cover_image: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    api
      .get("profile/")
      .then((res) => {
        setProfile(res.data);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    setProfile((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("bio", profile.bio || "");
      formData.append("profession", profile.profession || "");
      formData.append("location", profile.location || "");
      formData.append("website", profile.website || "");
      formData.append("github", profile.github || "");
      formData.append("linkedin", profile.linkedin || "");
      formData.append("twitter", profile.twitter || "");

      if (profile.profile_image instanceof File) {
        formData.append("profile_image", profile.profile_image);
      }

      const res = await api.patch("profile/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setProfile(res.data);
      localStorage.setItem("user_email", res.data.email || res.data.username || "User");
      setMessage("✅ Profile updated successfully.");
    }
    catch (err) {
      console.error("Profile Update Error:", err);
      console.log("Status:", err.response?.status);
      console.log("Response:", err.response?.data);
      setMessage("❌ Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center mt-20 text-xl">
        Loading Profile...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-8">

      <div className="rounded-3xl overflow-hidden shadow-xl bg-white">

        <div className="h-56 bg-gradient-to-r from-blue-600 to-indigo-600" />

        <div className="-mt-16 flex flex-col items-center">

          <img
            src={
              profile.profile_image
                ? profile.profile_image.startsWith && profile.profile_image.startsWith("http")
                  ? profile.profile_image
                  : profile.profile_image instanceof File
                    ? URL.createObjectURL(profile.profile_image)
                    : `http://localhost:8000${profile.profile_image}`
                : "https://via.placeholder.com/150"
            }
            alt="Profile"
            className="w-32 h-32 rounded-full border-4 border-white object-cover"
          />

          <input
            type="file"
            name="profile_image"
            accept="image/*"
            onChange={handleChange}
            className="mt-4"
          />

          <h2 className="text-3xl font-bold mt-4">
            {profile.username}
          </h2>

          <p className="text-gray-500">
            {profile.email}
          </p>

        </div>

        <form
          onSubmit={handleSubmit}
          className="p-8 space-y-5"
        >

          <textarea
            name="bio"
            value={profile.bio || ""}
            onChange={handleChange}
            placeholder="Bio"
            className="w-full border rounded-lg p-3"
          />

          <input
            name="profession"
            value={profile.profession || ""}
            onChange={handleChange}
            placeholder="Profession"
            className="w-full border rounded-lg p-3"
          />

          <input
            name="location"
            value={profile.location || ""}
            onChange={handleChange}
            placeholder="Location"
            className="w-full border rounded-lg p-3"
          />

          <input
            name="website"
            value={profile.website || ""}
            onChange={handleChange}
            placeholder="Website"
            className="w-full border rounded-lg p-3"
          />

          <input
            name="github"
            value={profile.github || ""}
            onChange={handleChange}
            placeholder="GitHub"
            className="w-full border rounded-lg p-3"
          />

          <input
            name="linkedin"
            value={profile.linkedin || ""}
            onChange={handleChange}
            placeholder="LinkedIn"
            className="w-full border rounded-lg p-3"
          />

          <input
            name="twitter"
            value={profile.twitter || ""}
            onChange={handleChange}
            placeholder="Twitter"
            className="w-full border rounded-lg p-3"
          />

          {message && (
            <p className="text-center font-semibold">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-blue-600 text-white rounded-lg p-3 font-semibold hover:bg-blue-700"
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>

        </form>

      </div>

    </div>
  );
}

export default Profile;