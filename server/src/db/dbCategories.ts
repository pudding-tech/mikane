import { pool } from "../db";
import { parseCategories } from "../parsers/parseCategories";
import { CategoryIcon, Target } from "../types/enums";
import { Category } from "../types/types";
import { ErrorExt } from "../types/errorExt";
import * as ec from "../types/errorCodes";

/**
 * DB interface: Get categories for an event
 * @param eventId 
 * @param activeUserId ID of signed-in user
 * @returns List of categories
 */
export const getCategories = async (eventId: string, activeUserId: string) => {
  const query = {
    text: "SELECT * FROM get_categories($1, null, $2);",
    values: [eventId, activeUserId]
  };
  const query2 = {
    text: "SELECT * FROM get_users_name($1, null)",
    values: [eventId]
  };

  const categories: Category[] = await Promise.all([query, query2].map(query => pool.query(query)))
    .then(data => {
      return parseCategories(data[0].rows, Target.CLIENT, data[1].rows);
    })
    .catch(err => {
      if (err.code === "P0006")
        throw new ErrorExt(ec.PUD006, err);
      else if (err.code === "P0007")
        throw new ErrorExt(ec.PUD007, err);
      else if (err.code === "P0138")
        throw new ErrorExt(ec.PUD138, err);
      else
        throw new ErrorExt(ec.PUD029, err);
    });

  return categories;
};

/**
 * DB interface: Get a category
 * @param categoryId 
 * @param activeUserId ID of signed-in user
 * @returns Category object
 */
export const getCategory = async (categoryId: string, activeUserId: string) => {
  const query = {
    text: "SELECT * FROM get_categories(null, $1, $2);",
    values: [categoryId, activeUserId]
  };
  const categories: Category[] = await pool.query(query)
    .then(data => {
      return parseCategories(data.rows, Target.CLIENT);
    })
    .catch(err => {
      if (err.code === "P0006")
        throw new ErrorExt(ec.PUD006, err);
      else if (err.code === "P0007")
        throw new ErrorExt(ec.PUD007, err);
      else if (err.code === "P0138")
        throw new ErrorExt(ec.PUD138, err);
      else
        throw new ErrorExt(ec.PUD029, err);
    });

  if (!categories.length) {
    return null;
  }
  return categories[0];
};

/**
 * DB interface: Add new category to the database
 * @param name Name of category
 * @param eventId 
 * @param weighted 
 * @param activeUserId ID of signed-in user
 * @param icon 
 * @returns Newly created category
 */
export const createCategory = async (name: string, eventId: string, weighted: boolean, activeUserId: string, icon?: CategoryIcon) => {
  const query = {
    text: "SELECT * FROM new_category($1, $2, $3, $4, $5);",
    values: [name, icon, weighted, eventId, activeUserId]
  };
  const category: Category[] = await pool.query(query)
    .then(data => {
      return parseCategories(data.rows, Target.CLIENT);
    })
    .catch(err => {
      if (err.code === "P0006")
        throw new ErrorExt(ec.PUD006, err);
      else if (err.code === "P0097")
        throw new ErrorExt(ec.PUD097, err);
      else if (err.code === "P0118")
        throw new ErrorExt(ec.PUD118, err);
      else if (err.code === "P0138")
        throw new ErrorExt(ec.PUD138, err);
      else
        throw new ErrorExt(ec.PUD036, err);
    });

  return category[0];
};

/**
 * DB interface: Add user to a category
 * @param categoryId 
 * @param userId 
 * @param activeUserId ID of signed-in user
 * @param weight 
 * @returns Affected category
 */
export const addUserToCategory = async (categoryId: string, userId: string, activeUserId: string, weight?: number) => {
  const query = {
    text: "SELECT * FROM add_user_to_category($1, $2, $3, $4);",
    values: [categoryId, userId, weight, activeUserId]
  };
  const query2 = {
    text: "SELECT * FROM get_users_name(null, $1)",
    values: [categoryId]
  };

  const categories: Category[] = await Promise.all([query, query2].map(query => pool.query(query)))
    .then(data => {
      return parseCategories(data[0].rows, Target.CLIENT, data[1].rows);
    })
    .catch(err => {
      if (err.code === "P0007")
        throw new ErrorExt(ec.PUD007, err);
      else if (err.code === "P0008")
        throw new ErrorExt(ec.PUD008, err);
      else if (err.code === "P0010")
        throw new ErrorExt(ec.PUD010, err);
      else if (err.code === "P0011")
        throw new ErrorExt(ec.PUD011, err);
      else if (err.code === "P0012")
        throw new ErrorExt(ec.PUD012, err);
      else if (err.code === "P0118")
        throw new ErrorExt(ec.PUD118, err);
      else if (err.code === "P0138")
        throw new ErrorExt(ec.PUD138, err);
      else
        throw new ErrorExt(ec.PUD020, err);
    });

  return categories[0];
};

/**
 * DB interface: Edit a category
 * @param categoryId 
 * @param activeUserId ID of signed-in user
 * @param data Data object
 * @returns Edited category
 */
export const editCategory = async (categoryId: string, activeUserId: string, data: { name?: string, icon?: CategoryIcon }) => {
  const query = {
    text: "SELECT * FROM edit_category($1, $2, $3, $4);",
    values: [categoryId, data.name, data.icon, activeUserId]
  };
  const category: Category[] = await pool.query(query)
    .then(data => {
      return parseCategories(data.rows, Target.CLIENT);
    })
    .catch(err => {
      if (err.code === "P0007")
        throw new ErrorExt(ec.PUD007, err);
      else if (err.code === "P0118")
        throw new ErrorExt(ec.PUD118, err);
      else if (err.code === "P0138")
        throw new ErrorExt(ec.PUD138, err);
      else
        throw new ErrorExt(ec.PUD041, err);
    });
  return category[0];
};

/**
 * DB interface: Edit a user's weight in a category
 * @param categoryId 
 * @param userId 
 * @param weight 
 * @param activeUserId ID of signed-in user
 * @returns Edited category
 */
export const editUserWeight = async (categoryId: string, userId: string, weight: number, activeUserId: string) => {
  const query = {
    text: "SELECT * FROM edit_user_weight($1, $2, $3, $4);",
    values: [categoryId, userId, weight, activeUserId]
  };
  const categories: Category[] = await pool.query(query)
    .then(data => {
      return parseCategories(data.rows, Target.CLIENT);
    })
    .catch(err => {
      if (err.code === "P0007")
        throw new ErrorExt(ec.PUD007, err);
      else if (err.code === "P0118")
        throw new ErrorExt(ec.PUD118, err);
      else if (err.code === "P0138")
        throw new ErrorExt(ec.PUD138, err);
      else
        throw new ErrorExt(ec.PUD027, err);
    });

  return categories[0];
};

/**
 * DB interface: Edit category weight status (weighted or non-weighted)
 * @param categoryId 
 * @param weighted 
 * @param activeUserId ID of signed-in user
 * @returns Edited category
 */
export const editWeightStatus = async (categoryId: string, weighted: boolean, activeUserId: string) => {
  const query = {
    text: "SELECT * FROM edit_category_weighted_status($1, $2, $3);",
    values: [categoryId, weighted, activeUserId]
  };
  const query2 = {
    text: "SELECT * FROM get_users_name(null, $1)",
    values: [categoryId]
  };

  const categories: Category[] = await Promise.all([query, query2].map(query => pool.query(query)))
    .then(data => {
      return parseCategories(data[0].rows, Target.CLIENT, data[1].rows);
    })
    .catch(err => {
      if (err.code === "P0007")
        throw new ErrorExt(ec.PUD007, err);
      else if (err.code === "P0118")
        throw new ErrorExt(ec.PUD118, err);
      else if (err.code === "P0138")
        throw new ErrorExt(ec.PUD138, err);
      else
        throw new ErrorExt(ec.PUD026, err);
    });

  return categories[0];
};

/**
 * DB interface: Delete a category
 * @param categoryId 
 * @param activeUserId ID of signed-in user
 * @returns True if successful
 */
export const deleteCategory = async (categoryId: string, activeUserId: string) => {
  const query = {
    text: "SELECT * FROM delete_category($1, $2);",
    values: [categoryId, activeUserId]
  };
  const success = await pool.query(query)
    .then(() => {
      return true;
    })
    .catch(err => {
      if (err.code === "P0007")
        throw new ErrorExt(ec.PUD007, err);
      else if (err.code === "P0118")
        throw new ErrorExt(ec.PUD118, err);
      else if (err.code === "P0131")
        throw new ErrorExt(ec.PUD131, err);
      else if (err.code === "P0138")
        throw new ErrorExt(ec.PUD138, err);
      else
        throw new ErrorExt(ec.PUD022, err);
    });

  return success;
};

/**
 * DB interface: Remove a user from a category
 * @param categoryId 
 * @param userId 
 * @param activeUserId ID of signed-in user
 * @returns Edited category
 */
export const removeUserFromCategory = async (categoryId: string, userId: string, activeUserId: string) => {
  const query = {
    text: "SELECT * FROM remove_user_from_category($1, $2, $3);",
    values: [categoryId, userId, activeUserId]
  };
  const query2 = {
    text: "SELECT * FROM get_users_name(null, $1)",
    values: [categoryId]
  };

  const categories: Category[] = await Promise.all([query, query2].map(query => pool.query(query)))
    .then(data => {
      return parseCategories(data[0].rows, Target.CLIENT, data[1].rows);
    })
    .catch(err => {
      if (err.code === "P0007")
        throw new ErrorExt(ec.PUD007, err);
      else if (err.code === "P0008")
        throw new ErrorExt(ec.PUD008, err);
      else if (err.code === "P0118")
        throw new ErrorExt(ec.PUD118, err);
      else if (err.code === "P0138")
        throw new ErrorExt(ec.PUD138, err);
      else
        throw new ErrorExt(ec.PUD039, err);
    });

  return categories[0];
};
