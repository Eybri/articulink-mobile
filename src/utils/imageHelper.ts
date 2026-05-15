/**
 * Utility to resolve profile picture sources.
 * Handles both local asset icons (fruits) and remote Cloudinary URLs.
 */
export const getProfileSource = (profilePic: string | null | undefined) => {
  if (!profilePic) return null;

  // Local Fruit Icons
  if (profilePic === "ampalaya.jpg") return require("../../assets/icons/ampalaya.jpg");
  if (profilePic === "banana.jpg") return require("../../assets/icons/banana.jpg");
  if (profilePic === "pineapple.jpg") return require("../../assets/icons/pineapple.jpg");
  if (profilePic === "strawberry.jpg") return require("../../assets/icons/strawberry.jpg");
  if (profilePic === "ariya.png") return require("../../assets/images/ariya.png");

  // Remote URLs (Cloudinary or local file paths from picker)
  if (profilePic.startsWith("http") || profilePic.startsWith("file") || profilePic.startsWith("content")) {
    return { uri: profilePic };
  }

  return null;
};
