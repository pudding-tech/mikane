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
 * PUD-010: User not in event, cannot be added to category
 */
export const PUD010: ErrorCode = {
  code: "PUD-010",
  message: "User not in event, cannot be added to category"
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
