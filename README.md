<div align="center">
  <img src="./app/mikane/src/assets/mikane_name.svg" alt="Mikane" width="250" />
</div>
<br />

Mikane is a tool designed for calculating payments to settle shared expenses from group trips, parties, and similar activities. Whether you're on a trip, hosting a party, or sharing a flat, this application helps in managing and tracking shared expenses efficiently.

[![GitHub latest release version](https://img.shields.io/github/v/release/pudding-tech/mikane.svg)](https://github.com/pudding-tech/mikane/releases/latest)
[![pull-request](https://github.com/pudding-tech/mikane/actions/workflows/pull-request.yml/badge.svg)](https://github.com/pudding-tech/mikane/actions/workflows/pull-request.yml)
[![codecov](https://codecov.io/gh/pudding-tech/mikane/branch/develop/graph/badge.svg?token=1CWRGO5F19)](https://codecov.io/gh/pudding-tech/mikane)

## Features

- **Event Management**: Create and manage events, view a summary of all expenses.
- **Expense Tracking**: Add, edit, and delete expenses; categorize and attribute them to categories.
- **User Management**: Invite users to join events, create and manage guests for people without users.
- **Mobile Support**: Full mobile support with a responsive design and PWA capabilities for a seamless experience on any device.
- **Authentication**: Secure login and registration of users.
- **Invitations**: Send personalized email invitations to users to join events and activities.

## Installation

### Prerequisites

- Node.js v22
- Docker (for database setup in option A)

### Steps

 Clone the repository:
 ```bash
 git clone https://github.com/pudding-tech/mikane.git
 cd mikane
 ```

#### Frontend:

1. Install dependencies for the frontend:
    ```bash
    cd app/mikane
    npm install
    ```

2. Run the frontend application:
    ```bash
    cd ../../app/mikane
    npm run dev
    ```

#### Backend:

Option A:
1. Set up a postgreSQL database manually, and run db_schema and all functions against it

2. Create .env file and populate required variables

3. Install dependencies for the backend:
    ```bash
    cd server
    npm install
    ```

4. Run the backend server:
    ```bash
    cd ../server
    npm run dev
    ```

Option B - use this method if you only want to work with the frontend (database will be automatically set up, and backend will be non-editable):
1. Create .env file and populate required variables:
     - Choose `POSTGRES_USER` and `POSTGRES_PASSWORD` values for the database setup, and ensure these values are reflected in `DB_USER` and `DB_PASSWORD`, respectively.
     - The remaining database variables should be set as follows: `DB_HOST=db`, `DB_PORT=5432`, and `DB_DATABASE=mikane`.

3. Run backend and automatically create a database ready for use:
    ```bash
    docker compose up
    ```

## Usage

1. Open your browser and navigate to `http://localhost:4200`.
2. Register a new account at `http://localhost:4200/register/u`, or log in with existing credentials.
3. Create an event and start adding participants and expenses.
4. API documentation (using the OpenAPI specification) can be found at `http://localhost:3002`.

## Testing

### Frontend

To run frontend tests:
```bash
cd app/mikane
npm run test
```

### Backend

The backend has integration tests that require a database to function. However, this is automatically set up through the commands below, so no additional actions are needed.

To run backend tests:
```bash
cd server
npm run db
npm run test
```

## Contributing

If you want to contribute to Mikane, please fork the repository and submit a pull request. While this tool is mainly an in-house Puddingtech project, we are open to contributions from the community.

## License

Mikane is licensed under the GPL-3.0 License - see the [License](LICENSE) for more information.
