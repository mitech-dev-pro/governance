import swaggerJSDoc from "swagger-jsdoc";

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
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      User: {
        type: "object",
        properties: {
          id: { type: "string", example: "1" },
          email: { type: "string", format: "email", example: "user@example.com" },
          role: { type: "string", example: "admin" },
          first_name: { type: "string", example: "John" },
          last_name: { type: "string", example: "Doe" },
          is_active: { type: "boolean", example: true },
        },
      },
      Department: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          name: { type: "string", example: "IT" },
          description: { type: "string", example: "Information Technology" },
        },
      },
      Asset: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          name: { type: "string", example: "Server 1" },
          asset_tag: { type: "string", example: "SRV-001" },
          type: { type: "string", example: "server" },
          classification: { type: "string", example: "restricted" },
          criticality: { type: "string", example: "high" },
          status: { type: "string", example: "active" },
          owner_id: { type: "string", example: "1" },
          description: { type: "string", example: "Main application server" },
          created_at: { type: "string", format: "date-time", example: "2024-01-01T12:00:00Z" },
        },
      },
      Audit: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          type: { type: "string", example: "internal" },
          status: { type: "string", example: "planned" },
          start_date: { type: "string", format: "date", example: "2024-01-01" },
          end_date: { type: "string", format: "date", example: "2024-01-10" },
          lead_auditor_id: { type: "string", example: "2" },
          description: { type: "string", example: "Annual internal audit" },
        },
      },
      Permission: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          name: { type: "string", example: "manage_users" },
          description: { type: "string", example: "Can manage users" },
        },
      },
      Role: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          name: { type: "string", example: "admin" },
          description: { type: "string", example: "Administrator role" },
        },
      },
      Risk: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          risk_id: { type: "string", example: "RISK-001" },
          title: { type: "string", example: "Data breach" },
          risk_level: { type: "string", example: "critical" },
          risk_score: { type: "number", example: 90 },
          residual_risk_score: { type: "number", example: 40 },
          status: { type: "string", example: "identified" },
          treatment_strategy: { type: "string", example: "mitigate" },
          asset_id: { type: "integer", example: 1 },
          owner_id: { type: "string", example: "1" },
          description: { type: "string", example: "Risk of unauthorized access" },
          created_at: { type: "string", format: "date-time", example: "2024-01-01T12:00:00Z" },
        },
      },
      GovernanceItem: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          title: { type: "string", example: "Access Control Policy" },
          type: { type: "string", example: "policy" },
          status: { type: "string", example: "active" },
          category: { type: "string", example: "security" },
          owner_id: { type: "string", example: "1" },
          reviewer_id: { type: "string", example: "2" },
          description: { type: "string", example: "Policy for access control" },
          created_at: { type: "string", format: "date-time", example: "2024-01-01T12:00:00Z" },
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
                        },
                      ],
                      pagination: {
                        page: 1,
                        limit: 20,
                        total: 1,
                        totalPages: 1,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/roles": {
      get: {
        tags: ["Roles"],
        summary: "List roles",
        description: "Get all roles (paginated)",
        parameters: [
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
            description: "List of roles with pagination",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    roles: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Role" },
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
                examples: {
                  example: {
                    value: {
                      roles: [
                        {
                          id: 1,
                          name: "admin",
                          description: "Administrator role",
                        },
                      ],
                      pagination: {
                        page: 1,
                        limit: 20,
                        total: 1,
                        totalPages: 1,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/risks": {
      get: {
        tags: ["Risks"],
        summary: "List risks",
        description: "Get all risks with filters and risk matrix summary.",
        parameters: [
          {
            name: "status",
            in: "query",
            schema: { type: "string" },
            description: "Risk status filter",
          },
          {
            name: "level",
            in: "query",
            schema: { type: "string" },
            description: "Risk level filter",
          },
          {
            name: "owner",
            in: "query",
            schema: { type: "string" },
            description: "Owner ID filter",
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
            description: "List of risks and risk matrix summary",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    risks: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Risk" },
                    },
                    risk_matrix: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          likelihood: { type: "string" },
                          impact: { type: "string" },
                          count: { type: "integer" },
                        },
                      },
                    },
                  },
                },
                examples: {
                  example: {
                    value: {
                      risks: [
                        {
                          id: 1,
                          risk_id: "RISK-001",
                          title: "Data breach",
                          risk_level: "critical",
                          risk_score: 90,
                          residual_risk_score: 40,
                          status: "identified",
                          treatment_strategy: "mitigate",
                          asset_id: 1,
                          owner_id: "1",
                          description: "Risk of unauthorized access",
                          created_at: "2024-01-01T12:00:00Z",
                        },
                      ],
                      risk_matrix: [
                        { likelihood: "high", impact: "critical", count: 2 },
                      ],
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/reports/risk-report": {
      get: {
        tags: ["Reports"],
        summary: "Get risk report",
        description:
          "Returns a risk report with risk details and treatment counts.",
        responses: {
          200: { description: "Array of risk report entries" },
        },
      },
    },
    "/reports/asset-compliance": {
      get: {
        tags: ["Reports"],
        summary: "Get asset compliance report",
        description:
          "Returns an asset compliance report with linked and open risks.",
        responses: {
          200: { description: "Array of asset compliance report entries" },
        },
      },
    },
    "/reports/iso-compliance": {
      get: {
        tags: ["Reports"],
        summary: "Get ISO 27001 compliance status",
        description: "Returns ISO 27001 compliance status report.",
        responses: {
          200: { description: "ISO 27001 compliance status object" },
        },
      },
    },
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
                examples: {
                  example: {
                    value: {
                      assets: [
                        {
                          id: 1,
                          name: "Server 1",
                          asset_tag: "SRV-001",
                          type: "server",
                          classification: "restricted",
                          criticality: "high",
                          status: "active",
                          owner_id: "1",
                          description: "Main application server",
                          created_at: "2024-01-01T12:00:00Z",
                        },
                      ],
                      stats: {},
                      pagination: {
                        page: 1,
                        limit: 20,
                        total: 1,
                        totalPages: 1,
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
                examples: {
                  example: {
                    value: { token: "<jwt-token>" },
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
                examples: {
                  example: {
                    value: [
                      {
                        id: "1",
                        email: "user@example.com",
                        role: "admin",
                        first_name: "John",
                        last_name: "Doe",
                        is_active: true,
                      },
                    ],
                  },
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
                examples: {
                  example: {
                    value: {
                      departments: [
                        {
                          id: 1,
                          name: "IT",
                          description: "Information Technology",
                        },
                      ],
                      pagination: {
                        page: 1,
                        limit: 20,
                        total: 1,
                        totalPages: 1,
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
          id: { type: "string", example: "1" },
          email: {
            type: "string",
            format: "email",
            example: "user@example.com",
          },
          role: { type: "string", example: "admin" },
          first_name: { type: "string", example: "John" },
          last_name: { type: "string", example: "Doe" },
          is_active: { type: "boolean", example: true },
        },
      },
      Department: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          name: { type: "string", example: "IT" },
          description: { type: "string", example: "Information Technology" },
        },
      },
      Asset: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          name: { type: "string", example: "Server 1" },
          asset_tag: { type: "string", example: "SRV-001" },
          type: { type: "string", example: "server" },
          classification: { type: "string", example: "restricted" },
          criticality: { type: "string", example: "high" },
          status: { type: "string", example: "active" },
          owner_id: { type: "string", example: "1" },
          description: { type: "string", example: "Main application server" },
          created_at: {
            type: "string",
            format: "date-time",
            example: "2024-01-01T12:00:00Z",
          },
        },
      },
      Audit: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          type: { type: "string", example: "internal" },
          status: { type: "string", example: "planned" },
          start_date: { type: "string", format: "date", example: "2024-01-01" },
          end_date: { type: "string", format: "date", example: "2024-01-10" },
          lead_auditor_id: { type: "string", example: "2" },
          description: { type: "string", example: "Annual internal audit" },
        },
      },
      Permission: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          name: { type: "string", example: "manage_users" },
          description: { type: "string", example: "Can manage users" },
        },
      },
      Role: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          name: { type: "string", example: "admin" },
          description: { type: "string", example: "Administrator role" },
        },
      },
      Risk: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          risk_id: { type: "string", example: "RISK-001" },
          title: { type: "string", example: "Data breach" },
          risk_level: { type: "string", example: "critical" },
          risk_score: { type: "number", example: 90 },
          residual_risk_score: { type: "number", example: 40 },
          status: { type: "string", example: "identified" },
          treatment_strategy: { type: "string", example: "mitigate" },
          asset_id: { type: "integer", example: 1 },
          owner_id: { type: "string", example: "1" },
          description: {
            type: "string",
            example: "Risk of unauthorized access",
          },
          created_at: {
            type: "string",
            format: "date-time",
            example: "2024-01-01T12:00:00Z",
          },
        },
      },
      GovernanceItem: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          title: { type: "string", example: "Access Control Policy" },
          type: { type: "string", example: "policy" },
          status: { type: "string", example: "active" },
          category: { type: "string", example: "security" },
          owner_id: { type: "string", example: "1" },
          reviewer_id: { type: "string", example: "2" },
          description: { type: "string", example: "Policy for access control" },
          created_at: {
            type: "string",
            format: "date-time",
            example: "2024-01-01T12:00:00Z",
          },
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
