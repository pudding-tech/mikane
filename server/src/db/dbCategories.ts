import { pool } from "../db";
import { parseCategories } from "../parsers/parseCategories";
import { CategoryIcon, Target } from "../types/enums";
import { Category } from "../types/types";
import { ErrorExt } from "../types/errorExt";
import * as ec from "../types/errorCodes";

/**
 * DB interface: Get categories for an event
 * @param eventId 
 * @returns List of categories
 */
export const getCategories = async (eventId: string) => {
  const query = {
    text: "SELECT * FROM get_categories($1, null);",
    values: [eventId]
  };
  const query2 = {
    text: "SELECT * FROM get_users_name($1)",
    values: [eventId]
  };

  const categories: Category[] = await Promise.all([query, query2].map(query => pool.query(query)))
    .then(data => {
      return parseCategories(data[0].rows, Target.CLIENT, data[1].rows);
    })
    .catch(err => {
      if (err.code === "P0006")
        throw new ErrorExt(ec.PUD006, err);
      if (err.code === "P0007")
        throw new ErrorExt(ec.PUD007, err);
      else
        throw new ErrorExt(ec.PUD029, err);
    });

  return categories;
};

/**
 * DB interface: Get a category
 * @param categoryId 
 * @returns Category object
 */
export const getCategory = async (categoryId: string) => {
  const query = {
    text: "SELECT * FROM get_categories(null, $1);",
    values: [categoryId]
  };
  const categories: Category[] = await pool.query(query)
    .then(data => {
      return parseCategories(data.rows, Target.CLIENT);
    })
    .catch(err => {
      if (err.code === "P0006")
        throw new ErrorExt(ec.PUD006, err);
      if (err.code === "P0007")
        throw new ErrorExt(ec.PUD007, err);
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
 * @returns Newly created category
 */
export const createCategory = async (name: string, eventId: string, weighted: boolean, icon?: CategoryIcon) => {
  const query = {
    text: "SELECT * FROM new_category($1, $2, $3, $4);",
    values: [name, icon, weighted, eventId]
  };
  const category: Category[] = await pool.query(query)
    .then(data => {
      return parseCategories(data.rows, Target.CLIENT);
    })
    .catch(err => {
      if (err.code === "P0006")
        throw new ErrorExt(ec.PUD006, err);
      if (err.code === "P0097")
        throw new ErrorExt(ec.PUD097, err);
      else
        throw new ErrorExt(ec.PUD036, err);
    });

  return category[0];
};

/**
 * DB interface: Add user to a category
 * @param categoryId 
 * @param userId 
 * @param weight 
 * @returns Affected category
 */
export const addUserToCategory = async (categoryId: string, userId: string, weight?: number) => {
  const query = {
    text: "SELECT * FROM add_user_to_category($1, $2, $3);",
    values: [categoryId, userId, weight]
  };
  const categories: Category[] = await pool.query(query)
    .then(data => {
      return parseCategories(data.rows, Target.CLIENT);
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
      else
        throw new ErrorExt(ec.PUD020, err);
    });

  return categories[0];
};

/**
 * DB interface: Edit a category
 * @param categoryId 
 * @param data Data object
 * @returns Edited category
 */
export const editCategory = async (categoryId: string, data: { name?: string, icon?: CategoryIcon }) => {
  const query = {
    text: "SELECT * FROM edit_category($1, $2, $3);",
    values: [categoryId, data.name, data.icon]
  };
  const category: Category[] = await pool.query(query)
    .then(data => {
      return parseCategories(data.rows, Target.CLIENT);
    })
    .catch(err => {
      if (err.code === "P0007")
        throw new ErrorExt(ec.PUD007, err);
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
 * @returns Edited category
 */
export const editUserWeight = async (categoryId: string, userId: string, weight: number) => {
  const query = {
    text: "SELECT * FROM edit_user_weight($1, $2, $3);",
    values: [categoryId, userId, weight]
  };
  const categories: Category[] = await pool.query(query)
    .then(data => {
      return parseCategories(data.rows, Target.CLIENT);
    })
    .catch(err => {
      if (err.code === "P0007")
        throw new ErrorExt(ec.PUD007, err);
      else
        throw new ErrorExt(ec.PUD027, err);
    });

  return categories[0];
};

/**
 * DB interface: Edit category weight status (weighted or non-weighted)
 * @param categoryId 
 * @param weighted 
 * @returns Edited category
 */
export const editWeightStatus = async (categoryId: string, weighted: boolean) => {
  const query = {
    text: "SELECT * FROM edit_category_weighted_status($1, $2);",
    values: [categoryId, weighted]
  };
  const categories: Category[] = await pool.query(query)
    .then(data => {
      return parseCategories(data.rows, Target.CLIENT);
    })
    .catch(err => {
      if (err.code === "P0007")
        throw new ErrorExt(ec.PUD007, err);
      else
        throw new ErrorExt(ec.PUD026, err);
    });

  return categories[0];
};

/**
 * DB interface: Delete a category
 * @param categoryId 
 * @returns True if successful
 */
export const deleteCategory = async (categoryId: string) => {
  const query = {
    text: "SELECT * FROM delete_category($1);",
    values: [categoryId]
  };
  const success = await pool.query(query)
    .then(() => {
      return true;
    })
    .catch(err => {
      if (err.code === "P0007")
        throw new ErrorExt(ec.PUD007, err);
      else
        throw new ErrorExt(ec.PUD022, err);
    });

  return success;
};

/**
 * DB interface: Remove a user from a category
 * @param categoryId 
 * @param userId 
 * @returns Edited category
 */
export const removeUserFromCategory = async (categoryId: string, userId: string) => {
  const query = {
    text: "SELECT * FROM remove_user_from_category($1, $2);",
    values: [categoryId, userId]
  };
  const categories: Category[] = await pool.query(query)
    .then(data => {
      return parseCategories(data.rows, Target.CLIENT);
    })
    .catch(err => {
      if (err.code === "P0007")
        throw new ErrorExt(ec.PUD007, err);
      else if (err.code === "P0008")
        throw new ErrorExt(ec.PUD008, err);
      else
        throw new ErrorExt(ec.PUD039, err);
    });

  return categories[0];
};
