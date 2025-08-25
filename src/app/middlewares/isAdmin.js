import User from "../models/User.js";

export default async (request, response, next) => {
  try {
    const { admin: isAdmin } = await User.findByPk(request.userId);

    if (!isAdmin) {
      return response
        .status(401)
        .json({ error: "Access denied: Administrators only" });
    }
    return next();
  } catch (error) {
    return response.status(500).json({ error: "Error checking permissions" });
  }
};
