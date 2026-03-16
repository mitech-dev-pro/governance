import swaggerJSDoc from "swagger-jsdoc";
const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "ISMS Governance API",
    version: "1.0.0",
    description: "API documentation for ISMS Governance backend.",
  },
  servers: [
    {
      url: "http://localhost:3001/api/v1",
      description: "Local development server",
    },
  ],
  tags: [
    { name: "Auth", description: "Authentication and registration endpoints" },
    { name: "Users", description: "User management operations (admin only)" },
    { name: "Upload", description: "File upload and download endpoints" },
    { name: "Departments", description: "Department management endpoints" },
    { name: "Assets", description: "Asset management endpoints" },
    { name: "Audits", description: "Audit management endpoints" },
  ],
  paths: {
    "/audits": {
      get: {
        tags: ["Audits"],
        summary: "List audits",
        description: "Get all audits with filters and pagination.",
        parameters: [
          {
            name: "status",
            in: "query",
            schema: { type: "string" },
            description: "Audit status filter",
          },
          {
            name: "type",
            in: "query",
            schema: { type: "string" },
            description: "Audit type filter",
          },
          {
            name: "page",
            in: "query",
            schema: { type: "integer", default: 1 },
            description: "Page number",
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", default: 20 },
            description: "Results per page",
          },
        ],
        responses: {
          200: {
            description: "List of audits with pagination and filters",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    audits: {
                      type: "array",
                      items: { type: "object" }, // Replace with $ref if Audit schema is defined
                    },
                    pagination: {
                      type: "object",
                      properties: {
                        page: { type: "integer" },
                        limit: { type: "integer" },
                        total: { type: "integer" },
                        totalPages: { type: "integer" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Audits"],
        summary: "Create audit",
        description: "Create a new audit.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                // Define required properties for audit creation as needed
              },
            },
          },
        },
        responses: {
          201: { description: "Audit created" },
          400: { description: "Validation error" },
        },
      },
    },
    "/assets": {
      get: {
        tags: ["Assets"],
        summary: "List assets",
        description: "Get all assets with filters and pagination.",
        parameters: [
          {
            name: "type",
            in: "query",
            schema: { type: "string" },
            description: "Asset type filter",
          },
          {
            name: "classification",
            in: "query",
            schema: { type: "string" },
            description: "Classification filter",
          },
          {
            name: "status",
            in: "query",
            schema: { type: "string" },
            description: "Status filter",
          },
          {
            name: "criticality",
            in: "query",
            schema: { type: "string" },
            description: "Criticality filter",
          },
          {
            name: "search",
            in: "query",
            schema: { type: "string" },
            description: "Search term",
          },
          {
            name: "page",
            in: "query",
            schema: { type: "integer", default: 1 },
            description: "Page number",
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", default: 20 },
            description: "Results per page",
          },
        ],
        responses: {
          200: {
            description: "List of assets with pagination and filters",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    assets: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Asset" },
                    },
                    stats: { type: "object" },
                    pagination: {
                      type: "object",
                      properties: {
                        page: { type: "integer" },
                        limit: { type: "integer" },
                        total: { type: "integer" },
                        totalPages: { type: "integer" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      // POST, PUT, DELETE, GET by ID can be added here as needed
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "User login",
        description: "Authenticate user and return JWT token.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: {
                    type: "string",
                    format: "email",
                    example: "user@example.com",
                  },
                  password: {
                    type: "string",
                    format: "password",
                    example: "yourpassword",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "JWT token returned",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    token: { type: "string", example: "<jwt-token>" },
                  },
                },
              },
            },
          },
          400: { description: "Validation error" },
          401: { description: "Invalid credentials" },
        },
      },
    },
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "User registration (optional)",
        description: "Register a new user. (Enable endpoint in code to use)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password", "first_name", "last_name"],
                properties: {
                  email: {
                    type: "string",
                    format: "email",
                    example: "user@example.com",
                  },
                  password: {
                    type: "string",
                    minLength: 8,
                    example: "yourpassword",
                  },
                  first_name: { type: "string", example: "John" },
                  last_name: { type: "string", example: "Doe" },
                  department: { type: "string", example: "IT" },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "User registered" },
          400: { description: "Validation error" },
          409: { description: "Email already registered" },
        },
      },
    },
    "/users": {
      get: {
        tags: ["Users"],
        summary: "List users",
        description: "Get all users (admin only, paginated)",
        parameters: [
          {
            name: "page",
            in: "query",
            schema: { type: "integer", default: 1 },
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", default: 20 },
          },
        ],
        responses: {
          200: {
            description: "List of users",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/User" },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Users"],
        summary: "Create user",
        description: "Create a new user (admin only)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: [
                  "email",
                  "password",
                  "role",
                  "first_name",
                  "last_name",
                ],
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string", minLength: 8 },
                  role: { type: "string", enum: ["admin", "manager", "user"] },
                  first_name: { type: "string" },
                  last_name: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "User created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/User" },
              },
            },
          },
          400: { description: "Validation error" },
        },
      },
    },
    "/users/{id}": {
      get: {
        tags: ["Users"],
        summary: "Get user by ID",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "User found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/User" },
              },
            },
          },
          404: { description: "User not found" },
        },
      },
      put: {
        tags: ["Users"],
        summary: "Update user by ID",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string", minLength: 8 },
                  role: { type: "string", enum: ["admin", "manager", "user"] },
                  first_name: { type: "string" },
                  last_name: { type: "string" },
                  is_active: { type: "boolean" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "User updated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/User" },
              },
            },
          },
          400: { description: "Validation error" },
          404: { description: "User not found" },
        },
      },
      delete: {
        tags: ["Users"],
        summary: "Delete user by ID",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: { description: "User deleted" },
          404: { description: "User not found" },
        },
      },
    },
    "/health": {
      get: {
        summary: "Health check",
        description: "Returns API health status.",
        responses: {
          200: {
            description: "API is healthy",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "ok" },
                    timestamp: { type: "string", format: "date-time" },
                  },
                },
              },
            },
          },
        },
      },
    },
    // ...existing code for /auth/login, /auth/register, /users, /users/{id} ...
    "/upload": {
      post: {
        tags: ["Upload"],
        summary: "Upload a file",
        description:
          "Upload a document (asset, governance, compliance, etc.). Requires authentication.",
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  file: {
                    type: "string",
                    format: "binary",
                    description: "File to upload",
                  },
                  entity_type: {
                    type: "string",
                    description: "Related entity type (optional)",
                  },
                  entity_id: {
                    type: "string",
                    description: "Related entity ID (optional)",
                  },
                  title: {
                    type: "string",
                    description: "Document title (optional)",
                  },
                  description: {
                    type: "string",
                    description: "Document description (optional)",
                  },
                  category: {
                    type: "string",
                    description: "Document category (optional)",
                  },
                },
                required: ["file"],
              },
            },
          },
        },
        responses: {
          201: {
            description: "File uploaded successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "File uploaded successfully",
                    },
                    file: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        path: { type: "string" },
                        name: { type: "string" },
                        type: { type: "string" },
                        size: { type: "integer" },
                      },
                    },
                  },
                },
              },
            },
          },
          400: { description: "No file uploaded or invalid file type" },
          500: { description: "Server error" },
        },
      },
    },
    "/upload/{id}/download": {
      get: {
        tags: ["Upload"],
        summary: "Download a file",
        description: "Download a document by ID. Requires authentication.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: { description: "File download (binary)" },
          404: { description: "File not found" },
          500: { description: "Server error" },
        },
      },
    },
    "/departments": {
      get: {
        tags: ["Departments"],
        summary: "List departments",
        description: "Get all departments (paginated)",
        parameters: [
          {
            name: "page",
            in: "query",
            schema: { type: "integer", default: 1 },
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", default: 20 },
          },
        ],
        responses: {
          200: {
            description: "List of departments with pagination",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    departments: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Department" },
                    },
                    pagination: {
                      type: "object",
                      properties: {
                        page: { type: "integer" },
                        limit: { type: "integer" },
                        total: { type: "integer" },
                        totalPages: { type: "integer" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Departments"],
        summary: "Create department",
        description: "Create a new department",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name"],
                properties: {
                  name: { type: "string", maxLength: 100 },
                  description: { type: "string", maxLength: 255 },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Department created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Department" },
              },
            },
          },
          400: { description: "Validation error" },
        },
      },
    },
    "/departments/{id}": {
      get: {
        tags: ["Departments"],
        summary: "Get department by ID",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: {
            description: "Department found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Department" },
              },
            },
          },
          404: { description: "Department not found" },
        },
      },
      put: {
        tags: ["Departments"],
        summary: "Update department by ID",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string", maxLength: 100 },
                  description: { type: "string", maxLength: 255 },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Department updated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Department" },
              },
            },
          },
          400: { description: "Validation error" },
          404: { description: "Department not found" },
        },
      },
      delete: {
        tags: ["Departments"],
        summary: "Delete department by ID",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: { description: "Department deleted" },
          404: { description: "Department not found" },
        },
      },
    },
  },
  components: {
    schemas: {
      User: {
        type: "object",
        properties: {
          id: { type: "string" },
          email: { type: "string", format: "email" },
          role: { type: "string" },
          first_name: { type: "string" },
          last_name: { type: "string" },
          is_active: { type: "boolean" },
        },
      },
      Department: {
        type: "object",
        properties: {
          id: { type: "integer" },
          name: { type: "string" },
          description: { type: "string" },
        },
      },
    },
  },
};

const options = {
  swaggerDefinition,
  apis: [
    "./routes/*.js", // Scan all route files for JSDoc comments
  ],
};

const swaggerSpec = swaggerJSDoc(options);
export default swaggerSpec;
