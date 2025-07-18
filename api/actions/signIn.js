import { SignInGlobalActionContext } from "gadget-server";

/**
 * @param { SignInGlobalActionContext } context
 */

export const run = async ({ params, logger, api, connections, session }) => {
  const password = params.password;
  const email = params.email;
  logger.info({ password: password }, "password???????????------------------------>");
  logger.info({ email: email }, "email???????????------------------------>");
  
  try {
    const userData = await api.internal.user.findMany({
      select: {
        password: true,
        id: true,
        roles: true // Ensure you select the roles field
      },
      filter: {
        email: { equals: email }
      }
    });

    if (!userData || userData.length === 0) {
      logger.error("No user found with the provided email.");
      return { authentication: "unregistered" };
    }

    logger.info({ userData: userData }, "userData???????????------------------------>");

    if (userData[0].password) {
      if (userData[0].password === password) {
        await session.set("user", { _link: userData[0].id });

        // Update roles
        const currentRoles = userData[0].roles || [];
        logger.info({ currentRoles: currentRoles }, "currentRoles???????????------------------------>");
        
        // Remove "unauthenticated" and add "signed-in"
        const updatedRoles = [...new Set(currentRoles.filter(role => role !== "unauthenticated").concat("signed-in"))];
        logger.info({ updatedRoles: updatedRoles }, "updatedRoles???????????------------------------>");
        
        const response = await api.internal.user.update(userData[0].id, {
          roles: updatedRoles
        });

        if (response.error) {
          logger.error("Error updating user role:", response.error);
          return { authentication: "error" };
        }

        return { authentication: "login" };
      } else {
        return { authentication: "disLogin" };
      }
    } else {
      return { authentication: "unregistered" };
    }
  } catch (error) {
    logger.error("Failed to process authentication:", error);
    return { authentication: "unregistered" };
  }
};

export const params = {
  password: {
    type: "string"
  },
  email: {
    type: "string"
  }
};