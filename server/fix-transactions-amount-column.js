var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { db } from "./db";
import { sql } from "drizzle-orm";
/**
 * This script fixes the transactions table schema to match Drizzle ORM expectations.
 * The issue: The database was created with DECIMAL(15,2) but Drizzle expects DECIMAL(18,8)
 * This causes amounts to be truncated or stored as 0.
 */
function fixTransactionsAmountColumn() {
    return __awaiter(this, void 0, void 0, function () {
        var currentSchema, amountColumn, currentPrecision, currentScale, alterError_1, updatedSchema, error_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 7, , 8]);
                    console.log('🔄 Starting transactions table schema fix...');
                    // Step 1: Check current schema
                    console.log('📋 Checking current transactions table structure...');
                    return [4 /*yield*/, db.execute(sql(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n      SELECT column_name, data_type, numeric_precision, numeric_scale\n      FROM information_schema.columns\n      WHERE table_name = 'transactions'\n      AND column_name = 'amount'\n      ORDER BY ordinal_position\n    "], ["\n      SELECT column_name, data_type, numeric_precision, numeric_scale\n      FROM information_schema.columns\n      WHERE table_name = 'transactions'\n      AND column_name = 'amount'\n      ORDER BY ordinal_position\n    "]))))];
                case 1:
                    currentSchema = _b.sent();
                    console.log('Current amount column:', currentSchema.rows);
                    amountColumn = (_a = currentSchema.rows) === null || _a === void 0 ? void 0 : _a[0];
                    if (!amountColumn) {
                        console.error('❌ Amount column not found!');
                        return [2 /*return*/];
                    }
                    currentPrecision = amountColumn.numeric_precision;
                    currentScale = amountColumn.numeric_scale;
                    console.log("Current precision: ".concat(currentPrecision, ", scale: ").concat(currentScale));
                    console.log("Expected precision: 18, scale: 8");
                    if (currentPrecision === 18 && currentScale === 8) {
                        console.log('✅ Amount column already has correct precision!');
                        return [2 /*return*/];
                    }
                    // Step 3: Alter the column to have correct precision
                    console.log('⚠️ Amount column precision is incorrect - attempting to fix...');
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 4, , 5]);
                    // First, try to alter the column directly
                    return [4 /*yield*/, db.execute(sql(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n        ALTER TABLE transactions \n        ALTER COLUMN amount TYPE DECIMAL(18,8)\n      "], ["\n        ALTER TABLE transactions \n        ALTER COLUMN amount TYPE DECIMAL(18,8)\n      "]))))];
                case 3:
                    // First, try to alter the column directly
                    _b.sent();
                    console.log('✅ Amount column precision updated to DECIMAL(18,8)');
                    return [3 /*break*/, 5];
                case 4:
                    alterError_1 = _b.sent();
                    console.error('❌ Could not alter amount column directly:', alterError_1);
                    console.log('💡 This might require recreating the table');
                    // If direct alter fails, we might need to recreate the table
                    // But this is risky, so we'll just log the error
                    throw alterError_1;
                case 5:
                    // Step 4: Verify the fix
                    console.log('\n📋 Verifying updated schema...');
                    return [4 /*yield*/, db.execute(sql(templateObject_3 || (templateObject_3 = __makeTemplateObject(["\n      SELECT column_name, data_type, numeric_precision, numeric_scale\n      FROM information_schema.columns\n      WHERE table_name = 'transactions'\n      AND column_name = 'amount'\n    "], ["\n      SELECT column_name, data_type, numeric_precision, numeric_scale\n      FROM information_schema.columns\n      WHERE table_name = 'transactions'\n      AND column_name = 'amount'\n    "]))))];
                case 6:
                    updatedSchema = _b.sent();
                    console.log('Updated amount column:', updatedSchema.rows);
                    console.log('\n✅ Migration completed successfully!');
                    return [3 /*break*/, 8];
                case 7:
                    error_1 = _b.sent();
                    console.error('❌ Error during migration:', error_1);
                    throw error_1;
                case 8: return [2 /*return*/];
            }
        });
    });
}
// Run the migration
fixTransactionsAmountColumn().catch(console.error);
var templateObject_1, templateObject_2, templateObject_3;
