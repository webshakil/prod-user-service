import { query } from '../config/database.js';
import logger from '../utils/logger.js';

export const getUserById = async (userId) => {
  try {
    const result = await query(
      `SELECT user_id, user_email, user_phone, user_name, 
              user_firstname, user_lastname, user_picture,
              user_gender, user_country, user_verified, 
              user_banned, user_activated, user_registered
       FROM public.users WHERE user_id = $1`,
      [userId]
    );
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    logger.error('Error fetching user', { error: error.message, userId });
    throw error;
  }
};

export const getUserProfile = async (userId) => {
  try {
    const result = await query(
      `SELECT user_id, first_name, last_name, age, gender, 
              country, city, timezone, language   
       FROM votteryy_user_details WHERE user_id = $1`,
      [userId]
    );
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    logger.error('Error fetching profile', { error: error.message, userId });
    throw error;
  }
};

export const getUserPreferences = async (userId) => {
  try {
    const result = await query(
      `SELECT user_id, email_notifications, sms_notifications,
              push_notifications, theme, language
       FROM votteryy_user_preferences WHERE user_id = $1`,
      [userId]
    );
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    logger.error('Error fetching preferences', { error: error.message, userId });
    throw error;
  }
};

export const updateUserProfile = async (userId, profileData) => {
  try {
    const {
      firstName,
      lastName,
      gender,
      country,
      city,
      timezone,
      language,
    
      dateOfBirth,
    } = profileData;

    const result = await query(
      `UPDATE votteryy_user_details 
       SET first_name = COALESCE($2, first_name),
           last_name = COALESCE($3, last_name),
           gender = COALESCE($4, gender),
           country = COALESCE($5, country),
           city = COALESCE($6, city),
           timezone = COALESCE($7, timezone),
           language = COALESCE($8, language)
        
       WHERE user_id = $1
       RETURNING *`,
      [userId, firstName, lastName, gender, country, city, timezone, language, dateOfBirth]
    );

    logger.info('Profile updated', { userId });
    return result.rows[0];
  } catch (error) {
    logger.error('Error updating profile', { error: error.message, userId });
    throw error;
  }
};

export const updateUserPreferences = async (userId, preferences) => {
  try {
    const {
      emailNotifications,
      smsNotifications,
      pushNotifications,
      marketingEmails,
      theme,
      language,
    } = preferences;

    const result = await query(
      `UPDATE votteryy_user_preferences 
       SET email_notifications = COALESCE($2, email_notifications),
           sms_notifications = COALESCE($3, sms_notifications),
           push_notifications = COALESCE($4, push_notifications),
           theme = COALESCE($5, theme),
           language = COALESCE($6, language)
       WHERE user_id = $1
       RETURNING *`,
      [userId, emailNotifications, smsNotifications, pushNotifications, marketingEmails, theme, language]
    );

    logger.info('Preferences updated', { userId });
    return result.rows[0];
  } catch (error) {
    logger.error('Error updating preferences', { error: error.message, userId });
    throw error;
  }
};

export const getCompleteUserData = async (userId) => {
  try {
    const user = await getUserById(userId);
    if (!user) return null;

    const profile = await getUserProfile(userId);
    const preferences = await getUserPreferences(userId);

    return {
      user,
      profile: profile || {},
      preferences: preferences || {},
    };
  } catch (error) {
    logger.error('Error getting complete user data', { error: error.message, userId });
    throw error;
  }
};

export const searchUsers = async (searchQuery, limit = 20, offset = 0) => {
  try {
    const result = await query(
      `SELECT user_id, user_email, user_firstname, 
              user_lastname, user_activated, user_verified, user_registered
       FROM public.users 
       WHERE user_email ILIKE $1 OR user_firstname ILIKE $1 OR user_lastname ILIKE $1
       ORDER BY user_registered DESC
       LIMIT $2 OFFSET $3`,
      [`%${searchQuery}%`, limit, offset]
    );
    return result.rows;
  } catch (error) {
    logger.error('Error searching users', { error: error.message });
    throw error;
  }
};
// import { query } from '../config/database.js';
// import logger from '../utils/logger.js';
// //import logger from '../utils/logger.js';

// export const getUserById = async (userId) => {
//   try {
//     const result = await query(
//       `SELECT user_id, user_email, user_phone, user_name, 
//               user_firstname, user_lastname, user_picture,
//               user_gender, user_country, user_verified, 
//               user_banned, user_activated, user_registered
//        FROM public.users WHERE user_id = $1`,
//       [userId]
//     );
//     return result.rows.length > 0 ? result.rows[0] : null;
//   } catch (error) {
//     logger.error('Error fetching user', { error: error.message, userId });
//     throw error;
//   }
// };

// export const getUserProfile = async (userId) => {
//   try {
//     const result = await query(
//       `SELECT user_id, first_name, last_name, age, gender, 
//               country, city, timezone, language, bio,
//               date_of_birth, 
//        FROM votteryy_user_details WHERE user_id = $1`,
//       [userId]
//     );
//     return result.rows.length > 0 ? result.rows[0] : null;
//   } catch (error) {
//     logger.error('Error fetching profile', { error: error.message, userId });
//     throw error;
//   }
// };

// export const getUserPreferences = async (userId) => {
//   try {
//     const result = await query(
//       `SELECT user_id, email_notifications, sms_notifications,
//               push_notifications, marketing_emails, theme, language
//        FROM votteryy_user_preferences WHERE user_id = $1`,
//       [userId]
//     );
//     return result.rows.length > 0 ? result.rows[0] : null;
//   } catch (error) {
//     logger.error('Error fetching preferences', { error: error.message, userId });
//     throw error;
//   }
// };

// export const updateUserProfile = async (userId, profileData) => {
//   try {
//     const {
//       firstName,
//       lastName,
//       gender,
//       country,
//       city,
//       timezone,
//       language,
//       bio,
//       dateOfBirth,
//     } = profileData;

//     const result = await query(
//       `UPDATE votteryy_user_details 
//        SET first_name = COALESCE($2, first_name),
//            last_name = COALESCE($3, last_name),
//            gender = COALESCE($4, gender),
//            country = COALESCE($5, country),
//            city = COALESCE($6, city),
//            timezone = COALESCE($7, timezone),
//            language = COALESCE($8, language),
//            bio = COALESCE($9, bio),
//            date_of_birth = COALESCE($10, date_of_birth),
//            updated_at = CURRENT_TIMESTAMP
//        WHERE user_id = $1
//        RETURNING *`,
//       [userId, firstName, lastName, gender, country, city, timezone, language, bio, dateOfBirth]
//     );

//     logger.info('Profile updated', { userId });
//     return result.rows[0];
//   } catch (error) {
//     logger.error('Error updating profile', { error: error.message, userId });
//     throw error;
//   }
// };

// export const updateUserPreferences = async (userId, preferences) => {
//   try {
//     const {
//       emailNotifications,
//       smsNotifications,
//       pushNotifications,
//       marketingEmails,
//       theme,
//       language,
//     } = preferences;

//     const result = await query(
//       `UPDATE votteryy_user_preferences 
//        SET email_notifications = COALESCE($2, email_notifications),
//            sms_notifications = COALESCE($3, sms_notifications),
//            push_notifications = COALESCE($4, push_notifications),
//            marketing_emails = COALESCE($5, marketing_emails),
//            theme = COALESCE($6, theme),
//            language = COALESCE($7, language),
//            updated_at = CURRENT_TIMESTAMP
//        WHERE user_id = $1
//        RETURNING *`,
//       [userId, emailNotifications, smsNotifications, pushNotifications, marketingEmails, theme, language]
//     );

//     logger.info('Preferences updated', { userId });
//     return result.rows[0];
//   } catch (error) {
//     logger.error('Error updating preferences', { error: error.message, userId });
//     throw error;
//   }
// };

// export const getCompleteUserData = async (userId) => {
//   try {
//     const user = await getUserById(userId);
//     if (!user) return null;

//     const profile = await getUserProfile(userId);
//     const preferences = await getUserPreferences(userId);

//     return {
//       user,
//       profile: profile || {},
//       preferences: preferences || {},
//     };
//   } catch (error) {
//     logger.error('Error getting complete user data', { error: error.message, userId });
//     throw error;
//   }
// };

// export const searchUsers = async (searchQuery, limit = 20, offset = 0) => {
//   try {
//     const result = await query(
//       `SELECT user_id, user_email, user_firstname, 
//               user_lastname, user_activated, user_verified, user_registered
//        FROM public.users 
//        WHERE user_email ILIKE $1 OR user_firstname ILIKE $1 OR user_lastname ILIKE $1
//        ORDER BY user_registered DESC
//        LIMIT $2 OFFSET $3`,
//       [`%${searchQuery}%`, limit, offset]
//     );
//     return result.rows;
//   } catch (error) {
//     logger.error('Error searching users', { error: error.message });
//     throw error;
//   }
// };