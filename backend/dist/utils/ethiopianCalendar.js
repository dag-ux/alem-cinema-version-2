"use strict";
// ─── Ethiopian ↔ Gregorian Calendar Utilities (Backend) ─────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.ETHIOPIAN_MONTHS = void 0;
exports.ethiopianToGregorianDate = ethiopianToGregorianDate;
exports.isEthiopianDateTodayOrFuture = isEthiopianDateTodayOrFuture;
exports.hasEthiopianDatePassed = hasEthiopianDatePassed;
exports.parseEthiopianDate = parseEthiopianDate;
exports.ETHIOPIAN_MONTHS = [
    'መስከረም', 'ጥቅምት', 'ህዳር', 'ታህሳስ', 'ጥር', 'የካቲት',
    'መጋቢት', 'ሚያዝያ', 'ግንቦት', 'ሰኔ', 'ሐምሌ', 'ነሀሴ', 'ጳጉሜ'
];
const isGregorianLeap = (y) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
/**
 * Convert Ethiopian date string "DD/MM/YYYY" → Gregorian Date object
 */
function ethiopianToGregorianDate(ethDateStr) {
    if (!ethDateStr)
        return null;
    const parts = ethDateStr.split("/");
    if (parts.length !== 3)
        return null;
    const day = parseInt(parts[0]);
    const month = parseInt(parts[1]);
    const year = parseInt(parts[2]);
    if (isNaN(day) || isNaN(month) || isNaN(year))
        return null;
    // Ethiopian year + 7 gives approximate Gregorian year
    const gregYear = year + 7;
    const newYearDay = isGregorianLeap(gregYear) ? 11 : 12;
    const newYear = new Date(gregYear, 8, newYearDay); // September 11 or 12
    const totalDays = (month - 1) * 30 + (day - 1);
    const result = new Date(newYear);
    result.setDate(result.getDate() + totalDays);
    // Set to end of day so today's shows remain bookable
    result.setHours(23, 59, 59, 999);
    return result;
}
/**
 * Check if an Ethiopian date is today or in the future
 */
function isEthiopianDateTodayOrFuture(ethDateStr) {
    const gregDate = ethiopianToGregorianDate(ethDateStr);
    if (!gregDate)
        return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // Compare only date part
    const showDateStart = new Date(gregDate);
    showDateStart.setHours(0, 0, 0, 0);
    return showDateStart >= today;
}
/**
 * Check if Ethiopian date has passed
 */
function hasEthiopianDatePassed(ethDateStr) {
    return !isEthiopianDateTodayOrFuture(ethDateStr);
}
/**
 * Parse Ethiopian date string "DD/MM/YYYY" into day, month, and year
 * (Added to fix the missing export error in booking.routes.ts)
 */
function parseEthiopianDate(dateStr) {
    if (!dateStr)
        return null;
    const parts = dateStr.split("/");
    if (parts.length !== 3)
        return null;
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    if (isNaN(day) || isNaN(month) || isNaN(year))
        return null;
    return { day, month, year };
}
