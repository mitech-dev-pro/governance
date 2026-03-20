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
      url: "http://localhost:{port}/api/v1",
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
