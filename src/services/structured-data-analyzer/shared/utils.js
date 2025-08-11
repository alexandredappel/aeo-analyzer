"use strict";
/**
 * SHARED UTILITIES for Structured Data Analysis
 * Common helper functions used across all analysis modules
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPerformanceStatus = getPerformanceStatus;
exports.parseAndNormalizeEntities = parseAndNormalizeEntities;
exports.parseJSONLD = parseJSONLD;
exports.calculateDiversityBonus = calculateDiversityBonus;
exports.calculateSchemaScore = calculateSchemaScore;
const cheerio = __importStar(require("cheerio"));
const constants_1 = require("./constants");
/**
 * Determines performance status based on score
 */
function getPerformanceStatus(score, maxScore) {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 90)
        return 'excellent';
    if (percentage >= 70)
        return 'good';
    if (percentage >= 50)
        return 'warning';
    return 'error';
}
/**
 * NEW PARSER: Extracts and normalizes all Schema.org entities from JSON-LD scripts
 *
 * This function has a single responsibility: find all JSON-LD scripts, parse them,
 * and return a flat list of all Schema.org entities without any scoring or completeness calculation.
 *
 * @param html The HTML content to parse
 * @returns Array of normalized Schema.org entities
 */
function parseAndNormalizeEntities(html) {
    const $ = cheerio.load(html);
    const scripts = $('script[type="application/ld+json"]');
    const entities = [];
    scripts.each((_, script) => {
        try {
            const content = $(script).html();
            if (!content)
                return;
            const jsonData = JSON.parse(content);
            // Handle different JSON-LD structures
            if (Array.isArray(jsonData)) {
                // Case 1: Direct array of entities
                entities.push(...jsonData);
            }
            else if (jsonData['@graph']) {
                // Case 2: Object with @graph property containing entities
                if (Array.isArray(jsonData['@graph'])) {
                    entities.push(...jsonData['@graph']);
                }
                else {
                    entities.push(jsonData['@graph']);
                }
            }
            else {
                // Case 3: Single entity object
                entities.push(jsonData);
            }
        }
        catch (error) {
            // Robust error handling: log the error but continue processing other scripts
            console.warn('Failed to parse JSON-LD script:', error);
            // Don't throw - just skip this invalid script and continue
        }
    });
    return entities;
}
/**
 * Parses and validates JSON-LD structured data (legacy support)
 */
function parseJSONLD(html) {
    const $ = cheerio.load(html);
    const scripts = $('script[type="application/ld+json"]');
    const result = {
        scripts: [],
        validSchemas: [],
        invalidSchemas: [],
        totalScripts: scripts.length,
        schemaCompleteness: {}
    };
    scripts.each((_, script) => {
        try {
            const content = $(script).html();
            if (!content)
                return;
            const jsonData = JSON.parse(content);
            const schemas = Array.isArray(jsonData) ? jsonData : [jsonData];
            schemas.forEach(schema => {
                if (schema['@type']) {
                    const schemaType = schema['@type'];
                    result.validSchemas.push(schemaType);
                    result.scripts.push(schema);
                    // Calculate completeness for known schemas
                    if (constants_1.REQUIRED_SCHEMA_FIELDS[schemaType]) {
                        const required = constants_1.REQUIRED_SCHEMA_FIELDS[schemaType];
                        const present = required.filter(field => schema[field] !== undefined);
                        result.schemaCompleteness[schemaType] = (present.length / required.length) * 100;
                    }
                }
            });
        }
        catch (error) {
            result.invalidSchemas.push('Invalid JSON-LD');
        }
    });
    return result;
}
/**
 * Calculates schema diversity bonus
 */
function calculateDiversityBonus(schemas) {
    const uniqueSchemas = new Set(schemas);
    return uniqueSchemas.size >= constants_1.DIVERSITY_BONUS_THRESHOLD ? 2 : 0; // 2 point bonus
}
/**
 * Calculates weighted score for schema types
 */
function calculateSchemaScore(validSchemas, schemaCompleteness) {
    let weightedScore = 0;
    const processedSchemas = new Set();
    validSchemas.forEach(schemaType => {
        if (processedSchemas.has(schemaType))
            return; // Avoid double counting
        processedSchemas.add(schemaType);
        // Get weight for this schema type
        const weight = constants_1.SCHEMA_WEIGHTS[schemaType] || constants_1.UNKNOWN_SCHEMA_BONUS;
        let schemaScore = weight * 10; // Base score
        // Apply completeness multiplier
        const completeness = schemaCompleteness[schemaType] || 100;
        schemaScore *= (completeness / 100);
        weightedScore += schemaScore;
    });
    // Cap at 18 points, add diversity bonus (2 points max)
    const cappedScore = Math.min(weightedScore, 18);
    const diversityBonus = calculateDiversityBonus(validSchemas);
    return Math.min(cappedScore + diversityBonus, constants_1.MAX_SCHEMA_POINTS);
}
