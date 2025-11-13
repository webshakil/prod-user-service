// user-service/services/userService.js
import { query } from '../config/database.js';
import logger from '../utils/logger.js';

export const getUserById = async (userId) => {
  try {
    const result = await query(
      `SELECT 
        ud.user_id,
        ud.first_name,
        ud.last_name,
        ud.age,
        ud.gender,
        ud.country,
        ud.city,
        ud.timezone,
        ud.language,
        ud.registration_ip,
        ud.collected_at
       FROM votteryy_user_details ud
       WHERE ud.user_id = $1`,
      [userId]
    );

    return result.rows[0] || null;
  } catch (error) {
    logger.error('Error getting user by ID', { error: error.message, userId });
    throw error;
  }
};

export const getCompleteUserData = async (userId) => {
  try {
    const result = await query(
      `SELECT 
        ud.*,
        up.theme,
        up.email_notifications,
        up.sms_notifications,
        up.push_notifications,
        up.newsletter_subscribed,
        up.privacy_settings
       FROM votteryy_user_details ud
       LEFT JOIN votteryy_user_preferences up ON ud.user_id = up.user_id
       WHERE ud.user_id = $1`,
      [userId]
    );

    return result.rows[0] || null;
  } catch (error) {
    logger.error('Error getting complete user data', { error: error.message, userId });
    throw error;
  }
};

// ✅ NEW: Get user profile (for profile page)
// user-service/services/userService.js

// ✅ FIXED: Get email from users table, other details from votteryy_user_details
// user-service/services/userService.js

// ✅ FIXED: Get email from public.users table (column is user_email, not email)
// user-service/services/userService.js

// ✅ FIXED: Use correct roles table name (votteryy_user_roles)
export const getUserProfile = async (userId) => {
  try {
    const result = await query(
      `SELECT 
        ud.user_id,
        ud.first_name as user_firstname,
        ud.last_name as user_lastname,
        ud.age,
        ud.gender,
        ud.country,
        ud.city,
        ud.timezone,
        ud.language,
        ud.registration_ip,
        ud.collected_at,
        u.user_email as user_email,
        u.user_phone as user_phone,
        COALESCE(
          (SELECT json_agg(ur.role_name)
           FROM votteryy_user_roles ur
           WHERE ur.user_id = ud.user_id AND ur.is_active = true),
          '["Voter"]'::json
        ) as roles
       FROM votteryy_user_details ud
       LEFT JOIN public.users u ON ud.user_id = u.user_id
       WHERE ud.user_id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const profile = result.rows[0];
    
    return {
      profile: {
        user_id: profile.user_id,
        user_firstname: profile.user_firstname,
        user_lastname: profile.user_lastname,
        user_email: profile.user_email,
        user_phone: profile.user_phone,
        age: profile.age,
        gender: profile.gender,
        country: profile.country,
        city: profile.city,
        timezone: profile.timezone,
        language: profile.language,
        roles: profile.roles || ['Voter'],
      }
    };
  } catch (error) {
    logger.error('Error getting user profile', { error: error.message, userId });
    throw error;
  }
};
// export const getUserProfile = async (userId) => {
//   try {
//     const result = await query(
//       `SELECT 
//         ud.user_id,
//         ud.first_name as user_firstname,
//         ud.last_name as user_lastname,
//         ud.email as user_email,
//         ud.phone as user_phone,
//         ud.age,
//         ud.gender,
//         ud.country,
//         ud.city,
//         ud.timezone,
//         ud.language,
//         ud.registration_ip,
//         ud.collected_at,
//         COALESCE(
//           (SELECT json_agg(ur.role_name)
//            FROM user_roles ur
//            WHERE ur.user_id = ud.user_id AND ur.is_active = true),
//           '["Voter"]'::json
//         ) as roles
//        FROM votteryy_user_details ud
//        WHERE ud.user_id = $1`,
//       [userId]
//     );

//     if (result.rows.length === 0) {
//       return null;
//     }

//     const profile = result.rows[0];
    
//     return {
//       profile: {
//         user_id: profile.user_id,
//         user_firstname: profile.user_firstname,
//         user_lastname: profile.user_lastname,
//         user_email: profile.user_email,
//         user_phone: profile.user_phone,
//         age: profile.age,
//         gender: profile.gender,
//         country: profile.country,
//         city: profile.city,
//         timezone: profile.timezone,
//         language: profile.language,
//         roles: profile.roles || ['Voter'],
//       }
//     };
//   } catch (error) {
//     logger.error('Error getting user profile', { error: error.message, userId });
//     throw error;
//   }
// };

// ✅ NEW: Update user profile
export const updateUserProfile = async (userId, profileData) => {
  try {
    const {
      first_name,
      last_name,
      age,
      gender,
      country,
      city,
      timezone,
      language,
    } = profileData;

    const updates = [];
    const params = [];
    let paramIndex = 1;

    if (first_name !== undefined) {
      updates.push(`first_name = $${paramIndex}`);
      params.push(first_name);
      paramIndex++;
    }

    if (last_name !== undefined) {
      updates.push(`last_name = $${paramIndex}`);
      params.push(last_name);
      paramIndex++;
    }

    if (age !== undefined) {
      updates.push(`age = $${paramIndex}`);
      params.push(age);
      paramIndex++;
    }

    if (gender !== undefined) {
      updates.push(`gender = $${paramIndex}`);
      params.push(gender);
      paramIndex++;
    }

    if (country !== undefined) {
      updates.push(`country = $${paramIndex}`);
      params.push(country);
      paramIndex++;
    }

    if (city !== undefined) {
      updates.push(`city = $${paramIndex}`);
      params.push(city);
      paramIndex++;
    }

    if (timezone !== undefined) {
      updates.push(`timezone = $${paramIndex}`);
      params.push(timezone);
      paramIndex++;
    }

    if (language !== undefined) {
      updates.push(`language = $${paramIndex}`);
      params.push(language);
      paramIndex++;
    }

    if (updates.length === 0) {
      return await getUserProfile(userId);
    }

    params.push(userId);

    const result = await query(
      `UPDATE votteryy_user_details
       SET ${updates.join(', ')}
       WHERE user_id = $${paramIndex}
       RETURNING *`,
      params
    );

    logger.info('User profile updated', { userId });
    return result.rows[0];
  } catch (error) {
    logger.error('Error updating user profile', { error: error.message, userId });
    throw error;
  }
};

// ✅ NEW: Get user preferences
export const getUserPreferences = async (userId) => {
  try {
    const result = await query(
      `SELECT 
        user_id,
        theme,
        email_notifications,
        sms_notifications,
        push_notifications,
        newsletter_subscribed,
        privacy_settings,
        updated_at
       FROM votteryy_user_preferences
       WHERE user_id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      // Create default preferences if they don't exist
      const createResult = await query(
        `INSERT INTO votteryy_user_preferences (
          user_id,
          theme,
          email_notifications,
          sms_notifications,
          push_notifications,
          newsletter_subscribed,
          privacy_settings
        ) VALUES ($1, 'light', true, true, true, false, '{}')
        RETURNING *`,
        [userId]
      );
      return createResult.rows[0];
    }

    return result.rows[0];
  } catch (error) {
    logger.error('Error getting user preferences', { error: error.message, userId });
    throw error;
  }
};

// ✅ NEW: Update user preferences
export const updateUserPreferences = async (userId, preferences) => {
  try {
    const {
      theme,
      email_notifications,
      sms_notifications,
      push_notifications,
      newsletter_subscribed,
      privacy_settings,
    } = preferences;

    const updates = [];
    const params = [];
    let paramIndex = 1;

    if (theme !== undefined) {
      updates.push(`theme = $${paramIndex}`);
      params.push(theme);
      paramIndex++;
    }

    if (email_notifications !== undefined) {
      updates.push(`email_notifications = $${paramIndex}`);
      params.push(email_notifications);
      paramIndex++;
    }

    if (sms_notifications !== undefined) {
      updates.push(`sms_notifications = $${paramIndex}`);
      params.push(sms_notifications);
      paramIndex++;
    }

    if (push_notifications !== undefined) {
      updates.push(`push_notifications = $${paramIndex}`);
      params.push(push_notifications);
      paramIndex++;
    }

    if (newsletter_subscribed !== undefined) {
      updates.push(`newsletter_subscribed = $${paramIndex}`);
      params.push(newsletter_subscribed);
      paramIndex++;
    }

    if (privacy_settings !== undefined) {
      updates.push(`privacy_settings = $${paramIndex}`);
      params.push(JSON.stringify(privacy_settings));
      paramIndex++;
    }

    if (updates.length === 0) {
      return await getUserPreferences(userId);
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(userId);

    const result = await query(
      `UPDATE votteryy_user_preferences
       SET ${updates.join(', ')}
       WHERE user_id = $${paramIndex}
       RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      // If preferences don't exist, create them
      return await getUserPreferences(userId);
    }

    logger.info('User preferences updated', { userId });
    return result.rows[0];
  } catch (error) {
    logger.error('Error updating user preferences', { error: error.message, userId });
    throw error;
  }
};

export const searchUsers = async (searchQuery, limit, offset) => {
  try {
    const result = await query(
      `SELECT 
        user_id,
        first_name,
        last_name,
        age,
        gender,
        country,
        city
       FROM votteryy_user_details
       WHERE 
        LOWER(first_name) LIKE LOWER($1) OR
        LOWER(last_name) LIKE LOWER($1) OR
        LOWER(country) LIKE LOWER($1) OR
        LOWER(city) LIKE LOWER($1)
       ORDER BY collected_at DESC
       LIMIT $2 OFFSET $3`,
      [`%${searchQuery}%`, limit, offset]
    );

    return result.rows;
  } catch (error) {
    logger.error('Error searching users', { error: error.message });
    throw error;
  }
};

// ✅ NEW: Get all users with pagination and filters
export const getAllUsers = async (filters) => {
  try {
    const {
      page,
      limit,
      search,
      gender,
      country,
      ageMin,
      ageMax,
      sortBy,
      sortOrder,
    } = filters;

    const offset = (page - 1) * limit;

    // Build dynamic WHERE clause
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    // Search filter
    if (search) {
      conditions.push(`(
        LOWER(ud.first_name) LIKE LOWER($${paramIndex}) OR
        LOWER(ud.last_name) LIKE LOWER($${paramIndex}) OR
        LOWER(ud.country) LIKE LOWER($${paramIndex}) OR
        LOWER(ud.city) LIKE LOWER($${paramIndex})
      )`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Gender filter
    if (gender) {
      conditions.push(`ud.gender = $${paramIndex}`);
      params.push(gender);
      paramIndex++;
    }

    // Country filter
    if (country) {
      conditions.push(`ud.country = $${paramIndex}`);
      params.push(country);
      paramIndex++;
    }

    // Age range filter
    if (ageMin > 0 || ageMax < 150) {
      conditions.push(`ud.age BETWEEN $${paramIndex} AND $${paramIndex + 1}`);
      params.push(ageMin, ageMax);
      paramIndex += 2;
    }

    const whereClause = conditions.length > 0 
      ? `WHERE ${conditions.join(' AND ')}`
      : '';

    // Validate sortBy to prevent SQL injection
    const allowedSortFields = ['collected_at', 'first_name', 'last_name', 'age', 'country'];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'collected_at';
    const safeSortOrder = sortOrder === 'ASC' ? 'ASC' : 'DESC';

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as total
       FROM votteryy_user_details ud
       ${whereClause}`,
      params
    );

    const total = parseInt(countResult.rows[0].total);

    // Get paginated users
    params.push(limit, offset);
    const usersResult = await query(
      `SELECT 
        ud.user_id,
        ud.first_name,
        ud.last_name,
        ud.age,
        ud.gender,
        ud.country,
        ud.city,
        ud.timezone,
        ud.language,
        ud.registration_ip,
        ud.collected_at,
        up.email_notifications,
        up.newsletter_subscribed
       FROM votteryy_user_details ud
       LEFT JOIN votteryy_user_preferences up ON ud.user_id = up.user_id
       ${whereClause}
       ORDER BY ud.${safeSortBy} ${safeSortOrder}
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      params
    );

    return {
      users: usersResult.rows,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    logger.error('Error getting all users', { error: error.message });
    throw error;
  }
};

// ✅ NEW: Get user demographic analytics
export const getUserAnalytics = async () => {
  try {
    // Total users
    const totalUsersResult = await query(
      'SELECT COUNT(*) as total FROM votteryy_user_details'
    );

    // Gender distribution
    const genderDistResult = await query(
      `SELECT gender, COUNT(*) as count
       FROM votteryy_user_details
       GROUP BY gender
       ORDER BY count DESC`
    );

    // Country distribution (top 10)
    const countryDistResult = await query(
      `SELECT country, COUNT(*) as count
       FROM votteryy_user_details
       GROUP BY country
       ORDER BY count DESC
       LIMIT 10`
    );

    // Age distribution (grouped)
    const ageDistResult = await query(
      `SELECT 
        CASE 
          WHEN age BETWEEN 13 AND 17 THEN '13-17'
          WHEN age BETWEEN 18 AND 24 THEN '18-24'
          WHEN age BETWEEN 25 AND 34 THEN '25-34'
          WHEN age BETWEEN 35 AND 44 THEN '35-44'
          WHEN age BETWEEN 45 AND 54 THEN '45-54'
          WHEN age BETWEEN 55 AND 64 THEN '55-64'
          WHEN age >= 65 THEN '65+'
          ELSE 'Unknown'
        END as age_group,
        COUNT(*) as count
       FROM votteryy_user_details
       GROUP BY age_group
       ORDER BY age_group`
    );

    // Language distribution
    const languageDistResult = await query(
      `SELECT language, COUNT(*) as count
       FROM votteryy_user_details
       GROUP BY language
       ORDER BY count DESC`
    );

    // Timezone distribution (top 10)
    const timezoneDistResult = await query(
      `SELECT timezone, COUNT(*) as count
       FROM votteryy_user_details
       GROUP BY timezone
       ORDER BY count DESC
       LIMIT 10`
    );

    // Registrations over time (last 30 days)
    const registrationTrendResult = await query(
      `SELECT 
        DATE(collected_at) as date,
        COUNT(*) as count
       FROM votteryy_user_details
       WHERE collected_at >= CURRENT_DATE - INTERVAL '30 days'
       GROUP BY DATE(collected_at)
       ORDER BY date DESC`
    );

    // Average age
    const avgAgeResult = await query(
      'SELECT AVG(age)::numeric(10,2) as avg_age FROM votteryy_user_details'
    );

    return {
      totalUsers: parseInt(totalUsersResult.rows[0].total),
      averageAge: parseFloat(avgAgeResult.rows[0].avg_age) || 0,
      genderDistribution: genderDistResult.rows,
      countryDistribution: countryDistResult.rows,
      ageDistribution: ageDistResult.rows,
      languageDistribution: languageDistResult.rows,
      timezoneDistribution: timezoneDistResult.rows,
      registrationTrend: registrationTrendResult.rows,
    };
  } catch (error) {
    logger.error('Error getting user analytics', { error: error.message });
    throw error;
  }
};
//last working code 
// import { query } from '../config/database.js';
// import logger from '../utils/logger.js';

// export const getUserById = async (userId) => {
//   try {
//     const result = await query(
//       `SELECT 
//         ud.user_id,
//         ud.first_name,
//         ud.last_name,
//         ud.age,
//         ud.gender,
//         ud.country,
//         ud.city,
//         ud.timezone,
//         ud.language,
//         ud.registration_ip,
//         ud.collected_at
//        FROM votteryy_user_details ud
//        WHERE ud.user_id = $1`,
//       [userId]
//     );

//     return result.rows[0] || null;
//   } catch (error) {
//     logger.error('Error getting user by ID', { error: error.message, userId });
//     throw error;
//   }
// };

// export const getCompleteUserData = async (userId) => {
//   try {
//     const result = await query(
//       `SELECT 
//         ud.*,
//         up.theme,
//         up.email_notifications,
//         up.sms_notifications,
//         up.push_notifications,
//         up.newsletter_subscribed,
//         up.privacy_settings
//        FROM votteryy_user_details ud
//        LEFT JOIN votteryy_user_preferences up ON ud.user_id = up.user_id
//        WHERE ud.user_id = $1`,
//       [userId]
//     );

//     return result.rows[0] || null;
//   } catch (error) {
//     logger.error('Error getting complete user data', { error: error.message, userId });
//     throw error;
//   }
// };

// export const searchUsers = async (searchQuery, limit, offset) => {
//   try {
//     const result = await query(
//       `SELECT 
//         user_id,
//         first_name,
//         last_name,
//         age,
//         gender,
//         country,
//         city
//        FROM votteryy_user_details
//        WHERE 
//         LOWER(first_name) LIKE LOWER($1) OR
//         LOWER(last_name) LIKE LOWER($1) OR
//         LOWER(country) LIKE LOWER($1) OR
//         LOWER(city) LIKE LOWER($1)
//        ORDER BY collected_at DESC
//        LIMIT $2 OFFSET $3`,
//       [`%${searchQuery}%`, limit, offset]
//     );

//     return result.rows;
//   } catch (error) {
//     logger.error('Error searching users', { error: error.message });
//     throw error;
//   }
// };

// // ✅ NEW: Get all users with pagination and filters
// export const getAllUsers = async (filters) => {
//   try {
//     const {
//       page,
//       limit,
//       search,
//       gender,
//       country,
//       ageMin,
//       ageMax,
//       sortBy,
//       sortOrder,
//     } = filters;

//     const offset = (page - 1) * limit;

//     // Build dynamic WHERE clause
//     const conditions = [];
//     const params = [];
//     let paramIndex = 1;

//     // Search filter
//     if (search) {
//       conditions.push(`(
//         LOWER(ud.first_name) LIKE LOWER($${paramIndex}) OR
//         LOWER(ud.last_name) LIKE LOWER($${paramIndex}) OR
//         LOWER(ud.country) LIKE LOWER($${paramIndex}) OR
//         LOWER(ud.city) LIKE LOWER($${paramIndex})
//       )`);
//       params.push(`%${search}%`);
//       paramIndex++;
//     }

//     // Gender filter
//     if (gender) {
//       conditions.push(`ud.gender = $${paramIndex}`);
//       params.push(gender);
//       paramIndex++;
//     }

//     // Country filter
//     if (country) {
//       conditions.push(`ud.country = $${paramIndex}`);
//       params.push(country);
//       paramIndex++;
//     }

//     // Age range filter
//     if (ageMin > 0 || ageMax < 150) {
//       conditions.push(`ud.age BETWEEN $${paramIndex} AND $${paramIndex + 1}`);
//       params.push(ageMin, ageMax);
//       paramIndex += 2;
//     }

//     const whereClause = conditions.length > 0 
//       ? `WHERE ${conditions.join(' AND ')}`
//       : '';

//     // Validate sortBy to prevent SQL injection
//     const allowedSortFields = ['collected_at', 'first_name', 'last_name', 'age', 'country'];
//     const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'collected_at';
//     const safeSortOrder = sortOrder === 'ASC' ? 'ASC' : 'DESC';

//     // Get total count
//     const countResult = await query(
//       `SELECT COUNT(*) as total
//        FROM votteryy_user_details ud
//        ${whereClause}`,
//       params
//     );

//     const total = parseInt(countResult.rows[0].total);

//     // Get paginated users
//     params.push(limit, offset);
//     const usersResult = await query(
//       `SELECT 
//         ud.user_id,
//         ud.first_name,
//         ud.last_name,
//         ud.age,
//         ud.gender,
//         ud.country,
//         ud.city,
//         ud.timezone,
//         ud.language,
//         ud.registration_ip,
//         ud.collected_at,
//         up.email_notifications,
//         up.newsletter_subscribed
//        FROM votteryy_user_details ud
//        LEFT JOIN votteryy_user_preferences up ON ud.user_id = up.user_id
//        ${whereClause}
//        ORDER BY ud.${safeSortBy} ${safeSortOrder}
//        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
//       params
//     );

//     return {
//       users: usersResult.rows,
//       pagination: {
//         total,
//         page,
//         limit,
//         totalPages: Math.ceil(total / limit),
//       },
//     };
//   } catch (error) {
//     logger.error('Error getting all users', { error: error.message });
//     throw error;
//   }
// };

// // ✅ NEW: Get user demographic analytics
// export const getUserAnalytics = async () => {
//   try {
//     // Total users
//     const totalUsersResult = await query(
//       'SELECT COUNT(*) as total FROM votteryy_user_details'
//     );

//     // Gender distribution
//     const genderDistResult = await query(
//       `SELECT gender, COUNT(*) as count
//        FROM votteryy_user_details
//        GROUP BY gender
//        ORDER BY count DESC`
//     );

//     // Country distribution (top 10)
//     const countryDistResult = await query(
//       `SELECT country, COUNT(*) as count
//        FROM votteryy_user_details
//        GROUP BY country
//        ORDER BY count DESC
//        LIMIT 10`
//     );

//     // Age distribution (grouped)
//     const ageDistResult = await query(
//       `SELECT 
//         CASE 
//           WHEN age BETWEEN 13 AND 17 THEN '13-17'
//           WHEN age BETWEEN 18 AND 24 THEN '18-24'
//           WHEN age BETWEEN 25 AND 34 THEN '25-34'
//           WHEN age BETWEEN 35 AND 44 THEN '35-44'
//           WHEN age BETWEEN 45 AND 54 THEN '45-54'
//           WHEN age BETWEEN 55 AND 64 THEN '55-64'
//           WHEN age >= 65 THEN '65+'
//           ELSE 'Unknown'
//         END as age_group,
//         COUNT(*) as count
//        FROM votteryy_user_details
//        GROUP BY age_group
//        ORDER BY age_group`
//     );

//     // Language distribution
//     const languageDistResult = await query(
//       `SELECT language, COUNT(*) as count
//        FROM votteryy_user_details
//        GROUP BY language
//        ORDER BY count DESC`
//     );

//     // Timezone distribution (top 10)
//     const timezoneDistResult = await query(
//       `SELECT timezone, COUNT(*) as count
//        FROM votteryy_user_details
//        GROUP BY timezone
//        ORDER BY count DESC
//        LIMIT 10`
//     );

//     // Registrations over time (last 30 days)
//     const registrationTrendResult = await query(
//       `SELECT 
//         DATE(collected_at) as date,
//         COUNT(*) as count
//        FROM votteryy_user_details
//        WHERE collected_at >= CURRENT_DATE - INTERVAL '30 days'
//        GROUP BY DATE(collected_at)
//        ORDER BY date DESC`
//     );

//     // Average age
//     const avgAgeResult = await query(
//       'SELECT AVG(age)::numeric(10,2) as avg_age FROM votteryy_user_details'
//     );

//     return {
//       totalUsers: parseInt(totalUsersResult.rows[0].total),
//       averageAge: parseFloat(avgAgeResult.rows[0].avg_age) || 0,
//       genderDistribution: genderDistResult.rows,
//       countryDistribution: countryDistResult.rows,
//       ageDistribution: ageDistResult.rows,
//       languageDistribution: languageDistResult.rows,
//       timezoneDistribution: timezoneDistResult.rows,
//       registrationTrend: registrationTrendResult.rows,
//     };
//   } catch (error) {
//     logger.error('Error getting user analytics', { error: error.message });
//     throw error;
//   }
// };
// // import { query } from '../config/database.js';
// // import logger from '../utils/logger.js';

// // export const getUserById = async (userId) => {
// //   try {
// //     const result = await query(
// //       `SELECT user_id, user_email, user_phone, user_name, 
// //               user_firstname, user_lastname, user_picture,
// //               user_gender, user_country, user_verified, 
// //               user_banned, user_activated, user_registered
// //        FROM public.users WHERE user_id = $1`,
// //       [userId]
// //     );
// //     return result.rows.length > 0 ? result.rows[0] : null;
// //   } catch (error) {
// //     logger.error('Error fetching user', { error: error.message, userId });
// //     throw error;
// //   }
// // };

// // export const getUserProfile = async (userId) => {
// //   try {
// //     const result = await query(
// //       `SELECT user_id, first_name, last_name, age, gender, 
// //               country, city, timezone, language   
// //        FROM votteryy_user_details WHERE user_id = $1`,
// //       [userId]
// //     );
// //     return result.rows.length > 0 ? result.rows[0] : null;
// //   } catch (error) {
// //     logger.error('Error fetching profile', { error: error.message, userId });
// //     throw error;
// //   }
// // };

// // export const getUserPreferences = async (userId) => {
// //   try {
// //     const result = await query(
// //       `SELECT user_id, email_notifications, sms_notifications,
// //               push_notifications, theme, language
// //        FROM votteryy_user_preferences WHERE user_id = $1`,
// //       [userId]
// //     );
// //     return result.rows.length > 0 ? result.rows[0] : null;
// //   } catch (error) {
// //     logger.error('Error fetching preferences', { error: error.message, userId });
// //     throw error;
// //   }
// // };

// // export const updateUserProfile = async (userId, profileData) => {
// //   try {
// //     const {
// //       firstName,
// //       lastName,
// //       gender,
// //       country,
// //       city,
// //       timezone,
// //       language,
    
// //       dateOfBirth,
// //     } = profileData;

// //     const result = await query(
// //       `UPDATE votteryy_user_details 
// //        SET first_name = COALESCE($2, first_name),
// //            last_name = COALESCE($3, last_name),
// //            gender = COALESCE($4, gender),
// //            country = COALESCE($5, country),
// //            city = COALESCE($6, city),
// //            timezone = COALESCE($7, timezone),
// //            language = COALESCE($8, language)
        
// //        WHERE user_id = $1
// //        RETURNING *`,
// //       [userId, firstName, lastName, gender, country, city, timezone, language, dateOfBirth]
// //     );

// //     logger.info('Profile updated', { userId });
// //     return result.rows[0];
// //   } catch (error) {
// //     logger.error('Error updating profile', { error: error.message, userId });
// //     throw error;
// //   }
// // };

// // export const updateUserPreferences = async (userId, preferences) => {
// //   try {
// //     const {
// //       emailNotifications,
// //       smsNotifications,
// //       pushNotifications,
// //       marketingEmails,
// //       theme,
// //       language,
// //     } = preferences;

// //     const result = await query(
// //       `UPDATE votteryy_user_preferences 
// //        SET email_notifications = COALESCE($2, email_notifications),
// //            sms_notifications = COALESCE($3, sms_notifications),
// //            push_notifications = COALESCE($4, push_notifications),
// //            theme = COALESCE($5, theme),
// //            language = COALESCE($6, language)
// //        WHERE user_id = $1
// //        RETURNING *`,
// //       [userId, emailNotifications, smsNotifications, pushNotifications, marketingEmails, theme, language]
// //     );

// //     logger.info('Preferences updated', { userId });
// //     return result.rows[0];
// //   } catch (error) {
// //     logger.error('Error updating preferences', { error: error.message, userId });
// //     throw error;
// //   }
// // };

// // export const getCompleteUserData = async (userId) => {
// //   try {
// //     const user = await getUserById(userId);
// //     if (!user) return null;

// //     const profile = await getUserProfile(userId);
// //     const preferences = await getUserPreferences(userId);

// //     return {
// //       user,
// //       profile: profile || {},
// //       preferences: preferences || {},
// //     };
// //   } catch (error) {
// //     logger.error('Error getting complete user data', { error: error.message, userId });
// //     throw error;
// //   }
// // };

// // export const searchUsers = async (searchQuery, limit = 20, offset = 0) => {
// //   try {
// //     const result = await query(
// //       `SELECT user_id, user_email, user_firstname, 
// //               user_lastname, user_activated, user_verified, user_registered
// //        FROM public.users 
// //        WHERE user_email ILIKE $1 OR user_firstname ILIKE $1 OR user_lastname ILIKE $1
// //        ORDER BY user_registered DESC
// //        LIMIT $2 OFFSET $3`,
// //       [`%${searchQuery}%`, limit, offset]
// //     );
// //     return result.rows;
// //   } catch (error) {
// //     logger.error('Error searching users', { error: error.message });
// //     throw error;
// //   }
// // };
