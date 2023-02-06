# API Documentation

## Authentication

### GET /login

#### Response
If successful: Status 200
```json
{
  "authenticated": true,
  "username": ""
}
```
If not successful: Status 401
```json
{
  "code": "PUD-001",
  "message": "No user authenticated"
}
```

### POST /login

#### Request payload
```json
{
  "usernameEmail": "",
  "password": ""
}
```

#### Response
If successful: Status 200
```json
{
  "authenticated": true,
  "username": ""
}
```
If not successful: Status 401
```json
{
  "code": "PUD-002",
  "message": "Missing credentials"
}
```
or
```json
{
  "code": "PUD-003",
  "message": "Username/email or password does not match"
}
```

### POST /logout

#### Response
If successful: Status 200
```json
{
  "msg": "Signed out successfully",
}
```

If not successful: Status 400
```json
{
  "code": "PUD-001",
  "message": "No user authenticated"
}
```

### POST /register

#### Request payload
```json
{
  "username": "",
  "firstName": "",
  "lastName?": "",
  "email": "",
  "phone": "",
  "password": ""
}
```

#### Response
If successful: Status 200
```json
{
  "id": 0,
  "username": "",
  "firstName": "",
  "lastName": "",
  "email": "",
  "phone": "",
  "created": ""
}
```
If not successful: Status 400
```json
{
  "code": "PUD-004",
  "message": "Not a valid email"
}
```