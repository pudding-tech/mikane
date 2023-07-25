export type ErrorCode = {
  code: string,
  message: string,
  status: number,
  log?: boolean
}

/**
 * PUD-000: User is not logged in (401)
 */
export const PUD000: ErrorCode = {
  code: "PUD-000",
  message: "User is not logged in",
  status: 401
};

/**
 * PUD-001: No user authenticated (401)
 */
export const PUD001: ErrorCode = {
  code: "PUD-001",
  message: "No user authenticated",
  status: 401
};

/**
 * PUD-002: Missing credentials (400)
 */
export const PUD002: ErrorCode = {
  code: "PUD-002",
  message: "Missing credentials",
  status: 400
};

/**
 * PUD-003: Username/email and password does not match (401)
 */
export const PUD003: ErrorCode = {
  code: "PUD-003",
  message: "Username/email and password does not match",
  status: 401
};

/**
 * PUD-004: Not a valid email (400)
 */
export const PUD004: ErrorCode = {
  code: "PUD-004",
  message: "Not a valid email",
  status: 400
};

/**
 * PUD-005: Another event already has this name (409)
 */
export const PUD005: ErrorCode = {
  code: "PUD-005",
  message: "Another event already has this name",
  status: 409
};

/**
 * PUD-006: Event not found (404)
 */
export const PUD006: ErrorCode = {
  code: "PUD-006",
  message: "Event not found",
  status: 404
};

/**
 * PUD-007: Category not found (404)
 */
export const PUD007: ErrorCode = {
  code: "PUD-007",
  message: "Category not found",
  status: 404
};

/**
 * PUD-008: User not found (404)
 */
export const PUD008: ErrorCode = {
  code: "PUD-008",
  message: "User not found",
  status: 404
};

/**
 * PUD-009: User is already in this event (409)
 */
export const PUD009: ErrorCode = {
  code: "PUD-009",
  message: "User is already in this event",
  status: 409
};

/**
 * PUD-010: User not in event, thus cannot be added to category (400)
 */
export const PUD010: ErrorCode = {
  code: "PUD-010",
  message: "User not in event, thus cannot be added to category",
  status: 400
};

/**
 * PUD-011: User is already in this category (409)
 */
export const PUD011: ErrorCode = {
  code: "PUD-011",
  message: "User is already in this category",
  status: 409
};

/**
 * PUD-012: Weight required when adding user to weighted category (400)
 */
export const PUD012: ErrorCode = {
  code: "PUD-012",
  message: "Weight required when adding user to weighted category",
  status: 400
};

/**
 * PUD-013: Event ID must be a valid UUID (400)
 */
export const PUD013: ErrorCode = {
  code: "PUD-013",
  message: "Event ID must be a valid UUID",
  status: 400
};

/**
 * PUD-014: 'name' and/or 'private' properties not provided in body (400)
 */
export const PUD014: ErrorCode = {
  code: "PUD-014",
  message: "'name' and/or 'private' properties not provided in body",
  status: 400
};

/**
 * PUD-015: Event ID and user ID must be valid UUIDs (400)
 */
export const PUD015: ErrorCode = {
  code: "PUD-015",
  message: "Event ID and user ID must be valid UUIDs",
  status: 400
};

/**
 * PUD-016: User ID must be a valid UUID (400)
 */
export const PUD016: ErrorCode = {
  code: "PUD-016",
  message: "User ID must be a valid UUID",
  status: 400
};

/**
 * PUD-017: Username already taken (409)
 */
export const PUD017: ErrorCode = {
  code: "PUD-017",
  message: "Username already taken",
  status: 409
};

/**
 * PUD-018: Email address already taken (409)
 */
export const PUD018: ErrorCode = {
  code: "PUD-018",
  message: "Email address already taken",
  status: 409
};

/**
 * PUD-019: Phone number already taken (409)
 */
export const PUD019: ErrorCode = {
  code: "PUD-019",
  message: "Phone number already taken",
  status: 409
};

/**
 * PUD-020: add_user_to_category (500)
 */
export const PUD020: ErrorCode = {
  code: "PUD-020",
  message: "Something went wrong while adding user to category",
  status: 500,
  log: true
};

/**
 * PUD-021: add_user_to_event (500)
 */
export const PUD021: ErrorCode = {
  code: "PUD-021",
  message: "Something went wrong while adding user to event",
  status: 500,
  log: true
};

/**
 * PUD-022: delete_category (500)
 */
export const PUD022: ErrorCode = {
  code: "PUD-022",
  message: "Something went wrong while deleting category",
  status: 500,
  log: true
};

/**
 * PUD-023: delete_event (500)
 */
export const PUD023: ErrorCode = {
  code: "PUD-023",
  message: "Something went wrong while deleting event",
  status: 500,
  log: true
};

/**
 * PUD-024: delete_expense (500)
 */
export const PUD024: ErrorCode = {
  code: "PUD-024",
  message: "Something went wrong while deleting expense",
  status: 500,
  log: true
};

/**
 * PUD-025: delete_user (500)
 */
export const PUD025: ErrorCode = {
  code: "PUD-025",
  message: "Something went wrong while deleting user",
  status: 500,
  log: true
};

/**
 * PUD-026: edit_category_weighted_status (500)
 */
export const PUD026: ErrorCode = {
  code: "PUD-026",
  message: "Something went wrong while editing category's weighted status",
  status: 500,
  log: true
};

/**
 * PUD-027: edit_user_weight (500)
 */
export const PUD027: ErrorCode = {
  code: "PUD-027",
  message: "Something went wrong while editing user's weight in category",
  status: 500,
  log: true
};

/**
 * PUD-028: edit_user (500)
 */
export const PUD028: ErrorCode = {
  code: "PUD-028",
  message: "Something went wrong while editing user",
  status: 500,
  log: true
};

/**
 * PUD-029: get_categories (500)
 */
export const PUD029: ErrorCode = {
  code: "PUD-029",
  message: "Something went wrong while getting categories",
  status: 500,
  log: true
};

/**
 * PUD-030: Expense amount cannot be negative (400)
 */
export const PUD030: ErrorCode = {
  code: "PUD-030",
  message: "Expense amount cannot be negative",
  status: 400
};

/**
 * PUD-031: get_events (500)
 */
export const PUD031: ErrorCode = {
  code: "PUD-031",
  message: "Something went wrong while getting events",
  status: 500,
  log: true
};

/**
 * PUD-032: get_expenses (500)
 */
export const PUD032: ErrorCode = {
  code: "PUD-032",
  message: "Something went wrong while getting expenses",
  status: 500,
  log: true
};

/**
 * PUD-033: get_user_hash (500)
 */
export const PUD033: ErrorCode = {
  code: "PUD-033",
  message: "Something went wrong while getting user's hashed password",
  status: 500,
  log: true
};

/**
 * PUD-034: get_user (500)
 */
export const PUD034: ErrorCode = {
  code: "PUD-034",
  message: "Something went wrong while getting user",
  status: 500,
  log: true
};

/**
 * PUD-035: get_users (500)
 */
export const PUD035: ErrorCode = {
  code: "PUD-035",
  message: "Something went wrong while getting users",
  status: 500,
  log: true
};

/**
 * PUD-036: new_category (500)
 */
export const PUD036: ErrorCode = {
  code: "PUD-036",
  message: "Something went wrong while creating new category",
  status: 500,
  log: true
};

/**
 * PUD-037: new_event (500)
 */
export const PUD037: ErrorCode = {
  code: "PUD-037",
  message: "Something went wrong while creating new event",
  status: 500,
  log: true
};

/**
 * PUD-038: new_user (500)
 */
export const PUD038: ErrorCode = {
  code: "PUD-038",
  message: "Something went wrong while creating new user",
  status: 500,
  log: true
};

/**
 * PUD-039: remove_user_from_category (500)
 */
export const PUD039: ErrorCode = {
  code: "PUD-039",
  message: "Something went wrong while removing user from category",
  status: 500,
  log: true
};

/**
 * PUD-040: remove_user_from_event (500)
 */
export const PUD040: ErrorCode = {
  code: "PUD-040",
  message: "Something went wrong while removing user from event",
  status: 500,
  log: true
};

/**
 * PUD-041: rename_category (500)
 */
export const PUD041: ErrorCode = {
  code: "PUD-041",
  message: "Something went wrong while renaming category",
  status: 500,
  log: true
};

/**
 * PUD-042: change_password (500)
 */
export const PUD042: ErrorCode = {
  code: "PUD-042",
  message: "Something went wrong while changing a user's password",
  status: 500,
  log: true
};

/**
 * PUD-043: new_expense (500)
 */
export const PUD043: ErrorCode = {
  code: "PUD-043",
  message: "Something went wrong while creating new expense",
  status: 500,
  log: true
};

/**
 * PUD-044: edit_event (500)
 */
export const PUD044: ErrorCode = {
  code: "PUD-044",
  message: "Something went wrong while editing event",
  status: 500,
  log: true
};

/**
 * PUD-045: Category ID must be a valid UUID (400)
 */
export const PUD045: ErrorCode = {
  code: "PUD-045",
  message: "Category ID must be a valid UUID",
  status: 400
};

/**
 * PUD-046: 'name', 'eventId' and/or 'weighted' properties not provided in body (400)
 */
export const PUD046: ErrorCode = {
  code: "PUD-046",
  message: "'name', 'eventId' and/or 'weighted' properties not provided in body",
  status: 400
};

/**
 * PUD-047: Category ID and user ID must be valid UUIDs (400)
 */
export const PUD047: ErrorCode = {
  code: "PUD-047",
  message: "Category ID and user ID must be valid UUIDs",
  status: 400
};

/**
 * PUD-048: Weight must be a number (400)
 */
export const PUD048: ErrorCode = {
  code: "PUD-048",
  message: "Weight must be a number",
  status: 400
};

/**
 * PUD-049: Weight cannot be less than 1 (400)
 */
export const PUD049: ErrorCode = {
  code: "PUD-049",
  message: "Weight cannot be less than 1",
  status: 400
};

/**
 * PUD-050: Category name not provided (400)
 */
export const PUD050: ErrorCode = {
  code: "PUD-050",
  message: "Category name not provided",
  status: 400
};

/**
 * PUD-051: Weighted boolean not provided (400)
 */
export const PUD051: ErrorCode = {
  code: "PUD-051",
  message: "Weighted boolean not provided",
  status: 400
};

/**
 * PUD-052: 'username', 'firstName', 'email', 'phone', and/or 'password' not provided in body (400)
 */
export const PUD052: ErrorCode = {
  code: "PUD-052",
  message: "'username', 'firstName', 'email', 'phone', and/or 'password' not provided in body",
  status: 400
};

/**
 * PUD-053: Name cannot be empty (400)
 */
export const PUD053: ErrorCode = {
  code: "PUD-053",
  message: "Name cannot be empty",
  status: 400
};

/**
 * PUD-054: Error getting signed in user (500)
 */
export const PUD054: ErrorCode = {
  code: "PUD-054",
  message: "Error getting signed in user",
  status: 500,
  log: true
};

/**
 * PUD-055: Something went wrong retrieving user ID from session (500)
 */
export const PUD055: ErrorCode = {
  code: "PUD-055",
  message: "Something went wrong retrieving user ID from session",
  status: 500,
  log: true
};

/**
 * PUD-056: Expense ID must be a valid UUID (400)
 */
export const PUD056: ErrorCode = {
  code: "PUD-056",
  message: "Expense ID must be a valid UUID",
  status: 400
};

/**
 * PUD-057: 'name', 'amount', 'categoryId' and/or 'payerId' not provided in body (400)
 */
export const PUD057: ErrorCode = {
  code: "PUD-057",
  message: "'name', 'amount', 'categoryId' and/or 'payerId' not provided in body",
  status: 400
};

/**
 * PUD-058: Request body must include at least one user property (400)
 */
export const PUD058: ErrorCode = {
  code: "PUD-058",
  message: "Request body must include at least one user property",
  status: 400
};

/**
 * PUD-059: Empty strings are not allowed (400)
 */
export const PUD059: ErrorCode = {
  code: "PUD-059",
  message: "Empty strings are not allowed",
  status: 400
};

/**
 * PUD-060: Unable to sign out (500)
 */
export const PUD060: ErrorCode = {
  code: "PUD-060",
  message: "Unable to sign out",
  status: 500,
  log: true
};

/**
 * PUD-061: Something went wrong getting users, categories or expenses (500)
 */
export const PUD061: ErrorCode = {
  code: "PUD-061",
  message: "Something went wrong getting users, categories or expenses",
  status: 500,
  log: true
};

/**
 * PUD-062: User cannot pay for expense as user is not in event (400)
 */
export const PUD062: ErrorCode = {
  code: "PUD-062",
  message: "User cannot pay for expense as user is not in event",
  status: 400
};

/**
 * PUD-063: get_api_keys (500)
 */
export const PUD063: ErrorCode = {
  code: "PUD-063",
  message: "Something went wrong while getting API keys",
  status: 500,
  log: true
};

/**
 * PUD-064: new_api_key (500)
 */
export const PUD064: ErrorCode = {
  code: "PUD-064",
  message: "Something went wrong while creating new API key",
  status: 500,
  log: true
};

/**
 * PUD-065: No user authenticated and no 'Authorization' header (401)
 */
export const PUD065: ErrorCode = {
  code: "PUD-065",
  message: "No user authenticated and no 'Authorization' header",
  status: 401
};

/**
 * PUD-066: Authorization key is not correct (401)
 */
export const PUD066: ErrorCode = {
  code: "PUD-066",
  message: "Authorization key is not correct",
  status: 401
};

/**
 * PUD-067: Authorization key is outside valid time range (401)
 */
export const PUD067: ErrorCode = {
  code: "PUD-067",
  message: "Authorization key is outside valid time range",
  status: 401
};

/**
 * PUD-068: API key 'name' missing in body (400)
 */
export const PUD068: ErrorCode = {
  code: "PUD-068",
  message: "API key 'name' missing in body",
  status: 400
};

/**
 * PUD-069: Missing 'Authorization' header (401)
 */
export const PUD069: ErrorCode = {
  code: "PUD-069",
  message: "Missing 'Authorization' header",
  status: 401
};

/**
 * PUD-070: API key name already taken (409)
 */
export const PUD070: ErrorCode = {
  code: "PUD-070",
  message: "API key name already taken",
  status: 409
};

/**
 * PUD-071: get_user_id (500)
 */
export const PUD071: ErrorCode = {
  code: "PUD-071",
  message: "Something went wrong while getting user ID",
  status: 500,
  log: true
};

/**
 * PUD-072: Email not provided in body (400)
 */
export const PUD072: ErrorCode = {
  code: "PUD-072",
  message: "Email not provided in body",
  status: 400
};

/**
 * PUD-073: Cannot send email - server not configured for sending emails (400)
 */
export const PUD073: ErrorCode = {
  code: "PUD-073",
  message: " Cannot send email - server not configured for sending emails",
  status: 400
};

/**
 * PUD-074: Something went wrong while sending email (500)
 */
export const PUD074: ErrorCode = {
  code: "PUD-074",
  message: "Something went wrong while sending email",
  status: 500,
  log: true
};

/**
 * PUD-075: new_password_reset_key (500)
 */
export const PUD075: ErrorCode = {
  code: "PUD-075",
  message: "Something went wrong while creating new password reset key",
  status: 500,
  log: true
};

/**
 * PUD-076: verify_password_reset_key (500)
 */
export const PUD076: ErrorCode = {
  code: "PUD-076",
  message: "Something went wrong while verifying password reset key",
  status: 500,
  log: true
};

/**
 * PUD-077: reset_password (500)
 */
export const PUD077: ErrorCode = {
  code: "PUD-077",
  message: "Something went wrong while resetting password",
  status: 500,
  log: true
};

/**
 * PUD-078: Invalid or expired password reset key (400)
 */
export const PUD078: ErrorCode = {
  code: "PUD-078",
  message: "Invalid or expired password reset key",
  status: 400
};

/**
 * PUD-079: Password cannot be empty (400)
 */
export const PUD079: ErrorCode = {
  code: "PUD-079",
  message: "Password cannot be empty",
  status: 400
};

/**
 * PUD-080: Something went wrong while getting signed in user's hashed password (500)
 */
export const PUD080: ErrorCode = {
  code: "PUD-080",
  message: "Something went wrong while getting signed in user's hashed password",
  status: 500,
  log: true
};

/**
 * PUD-081: Current password is not correct (400)
 */
export const PUD081: ErrorCode = {
  code: "PUD-081",
  message: "Current password is not correct",
  status: 400
};

/**
 * PUD-082: change_password (500)
 */
export const PUD082: ErrorCode = {
  code: "PUD-082",
  message: "Something went wrong while changing a user's password",
  status: 500,
  log: true
};

/**
 * PUD-083: Unable to invalidate sessions (500)
 */
export const PUD083: ErrorCode = {
  code: "PUD-083",
  message: "Unable to invalidate sessions",
  status: 500,
  log: true
};

/**
 * PUD-084: Expense not found (404)
 */
export const PUD084: ErrorCode = {
  code: "PUD-084",
  message: "Expense not found",
  status: 404
};

/**
 * PUD-085: Only event admins can delete event (403)
 */
export const PUD085: ErrorCode = {
  code: "PUD-085",
  message: "Only event admins can delete event",
  status: 403
};

/**
 * PUD-086: You can only delete your own expenses (unless event admin) (403)
 */
export const PUD086: ErrorCode = {
  code: "PUD-086",
  message: "You can only delete your own expenses (unless event admin)",
  status: 403
};

/**
 * PUD-087: Only event admins can edit event (403)
 */
export const PUD087: ErrorCode = {
  code: "PUD-087",
  message: "Only event admins can edit event",
  status: 403
};

/**
 * PUD-088: Amount must be a number (400)
 */
export const PUD088: ErrorCode = {
  code: "PUD-088",
  message: "Amount must be a number",
  status: 400
};

/**
 * PUD-089: Payer ID must be a valid UUID (400)
 */
export const PUD089: ErrorCode = {
  code: "PUD-089",
  message: "Payer ID must be a valid UUID",
  status: 400
};

/**
 * PUD-090: User not in event, thus cannot be added as event admin (400)
 */
export const PUD090: ErrorCode = {
  code: "PUD-090",
  message: "User not in event, thus cannot be added as event admin",
  status: 400
};

/**
 * PUD-091: User is already an admin for this event (409)
 */
export const PUD091: ErrorCode = {
  code: "PUD-091",
  message: "User is already an admin for this event",
  status: 409
};

/**
 * PUD-092: User is not an admin for this event (400)
 */
export const PUD092: ErrorCode = {
  code: "PUD-092",
  message: "User is not an admin for this event",
  status: 400
};

/**
 * PUD-093: Cannot remove admin, as the user is the only admin and all events need at least one event admin (400)
 */
export const PUD093: ErrorCode = {
  code: "PUD-093",
  message: "Cannot remove admin, as the user is the only admin and all events need at least one event admin",
  status: 400
};

/**
 * PUD-094: add_user_as_event_admin (500)
 */
export const PUD094: ErrorCode = {
  code: "PUD-094",
  message: "Something went wrong while adding user as event admin",
  status: 500,
  log: true
};

/**
 * PUD-095: remove_user_as_event_admin (500)
 */
export const PUD095: ErrorCode = {
  code: "PUD-095",
  message: "Something went wrong while removing user as event admin",
  status: 500,
  log: true
};

/**
 * PUD-096: Not a valid category icon (400)
 */
export const PUD096: ErrorCode = {
  code: "PUD-096",
  message: "Not a valid category icon",
  status: 400
};

/**
 * PUD-097: Another category in this event already has this name (409)
 */
export const PUD097: ErrorCode = {
  code: "PUD-097",
  message: "Another category in this event already has this name",
  status: 409
};

/**
 * PUD-098: Cannot remove user from event, as the user is the only event admin and all events need at least one event admin (400)
 */
export const PUD098: ErrorCode = {
  code: "PUD-098",
  message: "Cannot remove user from event, as the user is the only event admin and all events need at least one event admin",
  status: 400
};

/**
 * PUD-099: new_register_account_key (500)
 */
export const PUD099: ErrorCode = {
  code: "PUD-099",
  message: "Something went wrong while creating new register account key",
  status: 500,
  log: true
};

/**
 * PUD-100: verify_register_account_key (500)
 */
export const PUD100: ErrorCode = {
  code: "PUD-100",
  message: "Something went wrong while verifying register account key",
  status: 500,
  log: true
};

/**
 * PUD-101: Invalid or expired register account key (400)
 */
export const PUD101: ErrorCode = {
  code: "PUD-101",
  message: "Invalid or expired register account key",
  status: 400
};

/**
 * PUD-102: invalidate_register_account_key (500)
 */
export const PUD102: ErrorCode = {
  code: "PUD-102",
  message: "Something went wrong while invalidating register account key",
  status: 500,
  log: true
};

/**
 * PUD-103: This email is already associated with another user (400)
 */
export const PUD103: ErrorCode = {
  code: "PUD-103",
  message: "This email is already associated with another user",
  status: 400
};

/**
 * PUD-104: new_delete_account_key (500)
 */
export const PUD104: ErrorCode = {
  code: "PUD-104",
  message: "Something went wrong while creating new delete account key",
  status: 500,
  log: true
};

/**
 * PUD-105: verify_delete_account_key (500)
 */
export const PUD105: ErrorCode = {
  code: "PUD-105",
  message: "Something went wrong while verifying delete account key",
  status: 500,
  log: true
};

/**
 * PUD-106: Invalid or expired delete account key (400)
 */
export const PUD106: ErrorCode = {
  code: "PUD-106",
  message: "Invalid or expired delete account key",
  status: 400
};

/**
 * PUD-107: invalidate_delete_account_key (500)
 */
export const PUD107: ErrorCode = {
  code: "PUD-107",
  message: "Something went wrong while invalidating delete account key",
  status: 500,
  log: true
};

/**
 * PUD-108: This key is not valid for this user (400)
 */
export const PUD108: ErrorCode = {
  code: "PUD-108",
  message: "This key is not valid for this user",
  status: 400
};

/**
 * PUD-109: 'username' not provided in body (400)
 */
export const PUD109: ErrorCode = {
  code: "PUD-109",
  message: "'username' not provided in body",
  status: 400
};

/**
 * PUD-110: 'email' not provided in body (400)
 */
export const PUD110: ErrorCode = {
  code: "PUD-110",
  message: "'email' not provided in body",
  status: 400
};

/**
 * PUD-111: 'phone' not provided in body (400)
 */
export const PUD111: ErrorCode = {
  code: "PUD-111",
  message: "'phone' not provided in body",
  status: 400
};

/**
 * PUD-112: 'name' not provided in body (400)
 */
export const PUD112: ErrorCode = {
  code: "PUD-112",
  message: "'name' not provided in body",
  status: 400
};

/**
 * PUD-113: Not a valid phone number (400)
 */
export const PUD113: ErrorCode = {
  code: "PUD-113",
  message: "Not a valid phone number",
  status: 400
};
