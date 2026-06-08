/* eslint-disable no-unused-vars */
const { z } = require("zod");

const exportSpecsQuerySchema = z.object({
  measureYear: z.string().optional(),
  productLine: z.string().optional(),
  category: z.string().optional(),
  search: z.string().optional(),
  status: z.string().optional(),
  format: z.enum(["csv", "json"]).default("csv"),
});

const exportSingleQuerySchema = z.object({
  format: z.enum(["csv", "json"]).default("json"),
});

module.exports = {
  exportSpecsQuerySchema,
  exportSingleQuerySchema,
};
