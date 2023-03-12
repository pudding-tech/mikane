export type ErrorCode = {
  code: string,
  message: string
}

/**
 * PUD-001: No user authenticated
 */
export const PUD001: ErrorCode = {
  code: "PUD-001",
  message: "No user authenticated"
};

/**
 * PUD-002: Missing credentials
 */
export const PUD002: ErrorCode = {
  code: "PUD-002",
  message: "Missing credentials"
};

/**
 * PUD-003: Username/email and password does not match
 */
export const PUD003: ErrorCode = {
  code: "PUD-003",
  message: "Username/email and password does not match"
};

/**
 * PUD-004: Not a valid email
 */
export const PUD004: ErrorCode = {
  code: "PUD-004",
  message: "Not a valid email"
};

/**
 * PUD-005: Another event already has this name
 */
export const PUD005: ErrorCode = {
  code: "PUD-005",
  message: "Another event already has this name"
};

/**
 * PUD-006: Event does not exist
 */
export const PUD006: ErrorCode = {
  code: "PUD-006",
  message: "Event does not exist"
};

/**
 * PUD-007: Category does not exist
 */
export const PUD007: ErrorCode = {
  code: "PUD-007",
  message: "Category does not exist"
};

/**
 * PUD-008: User does not exist
 */
export const PUD008: ErrorCode = {
  code: "PUD-008",
  message: "User does not exist"
};

/**
 * PUD-009: User is already in this event
 */
export const PUD009: ErrorCode = {
  code: "PUD-009",
  message: "User is already in this event"
};

/**
 * PUD-010: User not in event, thus cannot be added to category
 */
export const PUD010: ErrorCode = {
  code: "PUD-010",
  message: "User not in event, thus cannot be added to category"
};

/**
 * PUD-011: User is already in this category
 */
export const PUD011: ErrorCode = {
  code: "PUD-011",
  message: "User is already in this category"
};

/**
 * PUD-012: Weight required when adding user to weighted category
 */
export const PUD012: ErrorCode = {
  code: "PUD-012",
  message: "Weight required when adding user to weighted category"
};

/**
 * PUD-013: Event ID must be a number
 */
export const PUD013: ErrorCode = {
  code: "PUD-013",
  message: "Event ID must be a number"
};

/**
 * PUD-014: 'name' and/or 'private' properties not provided in body
 */
export const PUD014: ErrorCode = {
  code: "PUD-014",
  message: "'name' and/or 'private' properties not provided in body"
};

/**
 * PUD-015: Event ID and user ID must be numbers
 */
export const PUD015: ErrorCode = {
  code: "PUD-015",
  message: "Event ID and user ID must be numbers"
};

/**
 * PUD-016: User ID must be a number
 */
export const PUD016: ErrorCode = {
  code: "PUD-016",
  message: "User ID must be a number"
};

/**
 * PUD-017: Username already taken
 */
export const PUD017: ErrorCode = {
  code: "PUD-017",
  message: "Username already taken"
};

/**
 * PUD-018: Email address already taken
 */
export const PUD018: ErrorCode = {
  code: "PUD-018",
  message: "Email address already taken"
};

/**
 * PUD-019: Phone number already taken
 */
export const PUD019: ErrorCode = {
  code: "PUD-019",
  message: "Phone number already taken"
};

/**
 * PUD-020: add_user_to_category
 */
export const PUD020: ErrorCode = {
  code: "PUD-020",
  message: "Something went wrong while adding user to category"
};

/**
 * PUD-021: add_user_to_event
 */
export const PUD021: ErrorCode = {
  code: "PUD-021",
  message: "Something went wrong while adding user to event"
};

/**
 * PUD-022: delete_category
 */
export const PUD022: ErrorCode = {
  code: "PUD-022",
  message: "Something went wrong while deleting category"
};

/**
 * PUD-023: delete_event
 */
export const PUD023: ErrorCode = {
  code: "PUD-023",
  message: "Something went wrong while deleting event"
};

/**
 * PUD-024: delete_expense
 */
export const PUD024: ErrorCode = {
  code: "PUD-024",
  message: "Something went wrong while deleting expense"
};

/**
 * PUD-025: delete_user
 */
export const PUD025: ErrorCode = {
  code: "PUD-025",
  message: "Something went wrong while deleting user"
};

/**
 * PUD-026: edit_category_weighted_status
 */
export const PUD026: ErrorCode = {
  code: "PUD-026",
  message: "Something went wrong while editing category's weighted status"
};

/**
 * PUD-027: edit_user_weight
 */
export const PUD027: ErrorCode = {
  code: "PUD-027",
  message: "Something went wrong while editing user's weight in category"
};

/**
 * PUD-028: edit_user
 */
export const PUD028: ErrorCode = {
  code: "PUD-028",
  message: "Something went wrong while editing user"
};

/**
 * PUD-029: get_categories
 */
export const PUD029: ErrorCode = {
  code: "PUD-029",
  message: "Something went wrong while getting categories"
};

/**
 * PUD-030: get_event_payment_data
 */
export const PUD030: ErrorCode = {
  code: "PUD-030",
  message: "Something went wrong while getting event payment data"
};

/**
 * PUD-031: get_events
 */
export const PUD031: ErrorCode = {
  code: "PUD-031",
  message: "Something went wrong while getting events"
};

/**
 * PUD-032: get_expenses
 */
export const PUD032: ErrorCode = {
  code: "PUD-032",
  message: "Something went wrong while getting expenses"
};

/**
 * PUD-033: get_user_hash
 */
export const PUD033: ErrorCode = {
  code: "PUD-033",
  message: "Something went wrong while getting user's hashed password"
};

/**
 * PUD-034: get_user
 */
export const PUD034: ErrorCode = {
  code: "PUD-034",
  message: "Something went wrong while getting user"
};

/**
 * PUD-035: get_users
 */
export const PUD035: ErrorCode = {
  code: "PUD-035",
  message: "Something went wrong while getting users"
};

/**
 * PUD-036: new_category
 */
export const PUD036: ErrorCode = {
  code: "PUD-036",
  message: "Something went wrong while creating new category"
};

/**
 * PUD-037: new_event
 */
export const PUD037: ErrorCode = {
  code: "PUD-037",
  message: "Something went wrong while creating new event"
};

/**
 * PUD-038: new_user
 */
export const PUD038: ErrorCode = {
  code: "PUD-038",
  message: "Something went wrong while creating new user"
};

/**
 * PUD-039: remove_user_from_category
 */
export const PUD039: ErrorCode = {
  code: "PUD-039",
  message: "Something went wrong while removing user from category"
};

/**
 * PUD-040: remove_user_from_event
 */
export const PUD040: ErrorCode = {
  code: "PUD-040",
  message: "Something went wrong while removing user from event"
};

/**
 * PUD-041: rename_category
 */
export const PUD041: ErrorCode = {
  code: "PUD-041",
  message: "Something went wrong while renaming category"
};

/**
 * PUD-042: reset_password
 */
export const PUD042: ErrorCode = {
  code: "PUD-042",
  message: "Something went wrong while resetting password"
};

/**
 * PUD-043: new_expense
 */
export const PUD043: ErrorCode = {
  code: "PUD-043",
  message: "Something went wrong while creating new expense"
};

/**
 * PUD-044: edit_event
 */
export const PUD044: ErrorCode = {
  code: "PUD-044",
  message: "Something went wrong while editing event"
};

/**
 * PUD-045: Category ID must be a number
 */
export const PUD045: ErrorCode = {
  code: "PUD-045",
  message: "Category ID must be a number"
};

/**
 * PUD-046: 'name', 'eventId' and/or 'weighted' properties not provided in body
 */
export const PUD046: ErrorCode = {
  code: "PUD-046",
  message: "'name', 'eventId' and/or 'weighted' properties not provided in body"
};

/**
 * PUD-047: Category ID and user ID must be numbers
 */
export const PUD047: ErrorCode = {
  code: "PUD-047",
  message: "Category ID and user ID must be numbers"
};

/**
 * PUD-048: Weight must be a number
 */
export const PUD048: ErrorCode = {
  code: "PUD-048",
  message: "Weight must be a number"
};

/**
 * PUD-049: Weight cannot be less than 1
 */
export const PUD049: ErrorCode = {
  code: "PUD-049",
  message: "Weight cannot be less than 1"
};

/**
 * PUD-050: Category name not provided
 */
export const PUD050: ErrorCode = {
  code: "PUD-050",
  message: "Category name not provided"
};

/**
 * PUD-051: Weighted boolean not provided
 */
export const PUD051: ErrorCode = {
  code: "PUD-051",
  message: "Weighted boolean not provided"
};
