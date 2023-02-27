import sql from "mssql";
import { parseCategories } from "../parsers";
import { CategoryTarget } from "../types/enums";
import { Category } from "../types/types";

/**
 * DB interface: Get categories for an event
 * @param eventId 
 * @returns List of categories
 */
export const getCategories = async (eventId: number) => {
  const request = new sql.Request();
  const categories: Category[] = await request
    .input("event_id", sql.Int, eventId)
    .input("category_id", sql.Int, null)
    .execute("get_categories")
    .then(data => {
      return parseCategories(data.recordset, CategoryTarget.CLIENT);
    });
  return categories;
};

/**
 * DB interface: Get a category
 * @param categoryId 
 * @returns Category object
 */
export const getCategory = async (categoryId: number) => {
  const request = new sql.Request();
  const categories: Category[] = await request
    .input("event_id", sql.Int, null)
    .input("category_id", sql.Int, categoryId)
    .execute("get_categories")
    .then(data => {
      return parseCategories(data.recordset, CategoryTarget.CLIENT);
    });
  return categories[0];
};

/**
 * DB interface: Add new category to the database
 * @param name Name of category
 * @param eventId 
 * @param weighted 
 * @returns Newly created category
 */
export const createCategory = async (name: string, eventId: number, weighted: boolean) => {
  const request = new sql.Request();
  const category: Category = await request
    .input("name", sql.NVarChar, name)
    .input("event_id", sql.Int, eventId)
    .input("weighted", sql.Bit, weighted)
    .execute("new_category")
    .then(data => {
      return data.recordset[0];
    });
  return category;
};

/**
 * DB interface: Add user to a category
 * @param categoryId 
 * @param userId 
 * @param weight 
 * @returns Affected category
 */
export const addUserToCategory = async (categoryId: number, userId: number, weight?: number) => {
  const request = new sql.Request();
  const categories: Category[] = await request
    .input("category_id", sql.Int, categoryId)
    .input("user_id", sql.Int, userId)
    .input("weight", sql.Numeric(14), weight)
    .execute("add_user_to_category")
    .then(data => {
      return parseCategories(data.recordset, CategoryTarget.CLIENT);
    });
  return categories[0];
};

/**
 * DB interface: Rename a category
 * @param categoryId 
 * @param name New name of category
 * @returns Edited category
 */
export const renameCategory = async (categoryId: number, name: string) => {
  const request = new sql.Request();
  const category = await request
    .input("category_id", sql.Int, categoryId)
    .input("name", sql.NVarChar, name)
    .execute("rename_category")
    .then(data => {
      return data.recordset[0];
    });
  return category;
};

/**
 * DB interface: Edit a user's weight in a category
 * @param categoryId 
 * @param userId 
 * @param weight 
 * @returns Edited category
 */
export const editUserWeight = async (categoryId: number, userId: number, weight: number) => {
  const request = new sql.Request();
  const categories: Category[] = await request
    .input("category_id", sql.Int, categoryId)
    .input("user_id", sql.Int, userId)
    .input("weight", sql.Int, weight)
    .execute("edit_user_weight")
    .then(data => {
      return parseCategories(data.recordset, CategoryTarget.CLIENT);
    });
  return categories[0];
};

/**
 * DB interface: Edit category weight status (weighted or non-weighted)
 * @param categoryId 
 * @param weighted 
 * @returns Edited category
 */
export const editWeightStatus = async (categoryId: number, weighted: boolean) => {
  const request = new sql.Request();
  const categories: Category[] = await request
    .input("category_id", sql.Int, categoryId)
    .input("weighted", sql.Bit, weighted)
    .execute("edit_category_weighted_status")
    .then(data => {
      return parseCategories(data.recordset, CategoryTarget.CLIENT);
    });
  return categories[0];
};

/**
 * DB interface: Delete a category
 * @param categoryId 
 * @returns True if successful
 */
export const deleteCategory = async (categoryId: number) => {
  const request = new sql.Request();
  const success = await request
    .input("category_id", sql.Int, categoryId)
    .execute("delete_category")
    .then( () => {
      return true;
    });
  return success;
};

/**
 * DB interface: Remove a user from a category
 * @param categoryId 
 * @param userId 
 * @returns Edited category
 */
export const removeUserFromCategory = async (categoryId: number, userId: number) => {
  const request = new sql.Request();
  const categories: Category[] = await request
    .input("category_id", sql.Int, categoryId)
    .input("user_id", sql.Int, userId)
    .execute("remove_user_from_category")
    .then(data => {
      return parseCategories(data.recordset, CategoryTarget.CLIENT);
    });
  return categories[0];
};
